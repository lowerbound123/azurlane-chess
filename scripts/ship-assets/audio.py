#!/usr/bin/env python3
"""Exact battle voice, effects and selected BGM provider for the shared downloader."""
import argparse
import contextlib
import hashlib
import json
import os
import re
import shutil
import subprocess
import sys
import tempfile
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path

from cdn import discover, fetch, Missing
from cri import extract_acb
from hca import decrypt_hca, sample_window


def validate_entry(entry):
    kind, bundle = entry['kind'], entry['bundle']
    if kind == 'voice':
        if not re.fullmatch(r'[a-zA-Z0-9_-]+', entry['id']) or not re.fullmatch(r'[0-9]{3,12}', entry['voiceId']):
            raise ValueError('Invalid voice identity')
        if entry['key'] != 'ship:' + entry['id'] or bundle != f"cue/cv-{entry['voiceId']}-battle.b":
            raise ValueError('Only the exact battle voice package is permitted')
    elif kind == 'effects':
        if entry['key'] != 'effects' or bundle != 'cue/se-battle.b':
            raise ValueError('Only common battle effects are permitted')
    elif kind == 'music':
        identity = entry.get('id')
        legacy = entry['key'] == 'music' and identity is None
        named = (isinstance(identity, str) and len(identity) <= 48
                 and re.fullmatch(r'[a-z0-9]+(?:-[a-z0-9]+)*', identity)
                 and entry['key'] == 'music:' + identity)
        if not (legacy or named) or not re.fullmatch(r'cue/bgm-[a-z0-9_-]+\.b', bundle):
            raise ValueError('Invalid selected music package')
    else:
        raise ValueError('Invalid audio kind')


def checked_bundle(cdn, row, cache):
    if not re.fullmatch(r'[a-f0-9]{32}', row.md5hash) or not 0 < row.size <= 32 * 1024 * 1024:
        raise ValueError('Invalid audio index metadata')
    destination = cache / (row.md5hash + '.b')
    def valid(data):
        return len(data) == row.size and hashlib.md5(data).hexdigest() == row.md5hash
    if destination.exists():
        data = destination.read_bytes()
        if valid(data):
            return data
    data = fetch(f'{cdn}/android/resource/{row.md5hash}')
    if not valid(data):
        raise ValueError('Audio bundle size/MD5 mismatch')
    cache.mkdir(parents=True, exist_ok=True)
    with tempfile.NamedTemporaryFile(dir=cache, delete=False) as staged:
        staged.write(data)
        temporary = Path(staged.name)
    temporary.replace(destination)
    return data


def encode_clip(clip, folder, index, kind, ffmpeg, ffprobe):
    rate, channels, samples = clip['sampleRate'], clip['channels'], clip['numSamples']
    if not 8000 <= rate <= 192000 or not 1 <= channels <= 8 or not 0 < samples <= rate * 3600:
        raise ValueError('Invalid audio waveform dimensions')
    source = folder / f'{index}.hca'
    output_rate = 48000
    destination = folder / f'{index}.webm'
    plain = decrypt_hca(clip['audio'], subkey=clip['subkey'])
    start_sample, end_sample = sample_window(plain, samples)
    source.write_bytes(plain)
    bitrate = {'voice': '32k', 'effects': '64k', 'music': '80k'}[kind]
    encoding = ['-c:a', 'libopus', '-b:a', bitrate, '-vbr', 'on', '-application', 'audio',
                '-compression_level', '10', '-ar', str(output_rate), '-f', 'webm']
    try:
        subprocess.run([ffmpeg, '-nostdin', '-hide_banner', '-v', 'error', '-xerror', '-y',
            '-i', str(source), '-af', f'atrim=start_sample={start_sample}:end_sample={end_sample},asetpts=PTS-STARTPTS', '-map_metadata', '-1',
            *encoding, str(destination)],
            check=True, capture_output=True, timeout=90)
        frames = ['-show_frames', '-show_entries', 'frame=nb_samples:stream=codec_name,sample_rate,channels:format=duration']
        probe = subprocess.run([ffprobe, '-v', 'error', '-show_streams', '-show_format', *frames, '-of', 'json', str(destination)],
            check=True, capture_output=True, timeout=30)
        info = json.loads(probe.stdout)
        streams = info['streams']
        duration = float(info['format']['duration'])
        if len(streams) != 1 or streams[0]['codec_name'] != 'opus' or int(streams[0]['sample_rate']) != output_rate or streams[0]['channels'] != channels or abs(duration - samples / rate) > .05:
            raise ValueError('Encoded audio metadata differs from source waveform')
        output_samples = sum(frame['nb_samples'] for frame in info['frames'])
        if output_samples <= 0 or abs(output_samples / output_rate - samples / rate) > 1 / output_rate:
            raise ValueError('Encoded Opus sample count differs from source duration')
    except subprocess.CalledProcessError as error:
        raise ValueError(error.stderr.decode('utf-8', 'replace').strip()) from error
    finally:
        source.unlink(missing_ok=True)
    return {'cue': clip['cue'], 'waveformId': clip['waveformId'], 'file': str(destination.resolve()),
            'duration': duration, 'sampleRate': output_rate, 'channels': channels, 'numSamples': output_samples,
            'sourceSampleRate': rate, 'sourceNumSamples': samples,
            'cueDurationMs': clip['cueDurationMs']}


def run(request, output):
    entries = request['entries']
    if not entries or len(entries) > 128 or len({entry['key'] for entry in entries}) != len(entries):
        raise ValueError('Invalid selected audio entry count')
    for entry in entries:
        validate_entry(entry)
    ffmpeg = shutil.which(os.environ.get('FFMPEG_BINARY', 'ffmpeg'))
    ffprobe = shutil.which(os.environ.get('FFPROBE_BINARY', 'ffprobe'))
    if not ffmpeg or not ffprobe:
        raise ValueError('Audio import requires ffmpeg and ffprobe (libopus encoder and HCA decoder)')
    from azlassets.versioncontrol import VersionType
    try:
        cdn, rows, versions = discover(request['client'], (VersionType.AZL, VersionType.CV))
    except Exception as error:
        return {'entries': [{'key': entry['key'], 'status': 'error', 'reason': f'discovery_failed: {error}'} for entry in entries]}
    cache = Path(request['cache']).resolve() / 'bundles'

    def process(entry):
        result = {'key': entry['key'], 'status': 'available'}
        row = rows.get(entry['bundle'])
        if row is None:
            return {**result, 'status': 'missing', 'reason': 'not_in_index'}
        try:
            data = checked_bundle(cdn, row, cache)
            folder = output / entry['key'].replace(':', '-')
            folder.mkdir(parents=True, exist_ok=True)
            clips = extract_acb(data)
            result['source'] = {'cdn': cdn, 'versions': versions,
                'bundle': {'path': entry['bundle'], 'size': row.size, 'md5hash': row.md5hash}}
            result['clips'] = [encode_clip(clip, folder, index, entry['kind'], ffmpeg, ffprobe)
                               for index, clip in enumerate(clips)]
            print(f"[audio] {entry['key']}: {len(clips)} clips verified", file=sys.stderr, flush=True)
        except Missing as error:
            result.update(status='missing', reason=str(error))
        except Exception as error:
            result.update(status='error', reason=f'{type(error).__name__}: {error}')
        return result

    with ThreadPoolExecutor(max_workers=3) as pool:
        results = list(pool.map(process, entries))
    return {'entries': results}


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--request', required=True, type=Path)
    parser.add_argument('--output', required=True, type=Path)
    args = parser.parse_args()
    args.output.mkdir(parents=True, exist_ok=True)
    with contextlib.redirect_stdout(sys.stderr):
        report = run(json.loads(args.request.read_text()), args.output.resolve())
    (args.output / 'report.json').write_text(json.dumps(report, ensure_ascii=False, indent=2) + '\n')
    print(json.dumps(report, ensure_ascii=False))


if __name__ == '__main__':
    main()
