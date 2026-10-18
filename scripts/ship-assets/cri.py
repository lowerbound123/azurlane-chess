"""Read only the CRI UTF/ACB/embedded AWB structures needed by selected audio.

Cue indices, waveform indices and AWB file IDs are distinct identifiers.
Unsupported layered or streaming cues fail explicitly instead of exporting a
different sound under a plausible filename.
"""
import struct

_TYPES = {0: 'B', 1: 'b', 2: 'H', 3: 'h', 4: 'I', 5: 'i', 6: 'Q', 7: 'q',
          8: 'f', 9: 'd', 10: 'I', 11: 'II'}


def read_utf(blob):
    if len(blob) < 32 or blob[:4] != b'@UTF':
        raise ValueError('Invalid UTF table')
    size, version, row_offset, string_offset, data_offset, name, count, row_size, rows = struct.unpack_from('>IHHIIIHHI', blob, 4)
    end = size + 8
    row_offset += 8
    string_offset += 8
    data_offset += 8
    if version not in (0, 1) or end > len(blob) or not 32 <= row_offset <= string_offset <= data_offset <= end:
        raise ValueError('Invalid UTF offsets')
    if rows * row_size > string_offset - row_offset or count > 1024:
        raise ValueError('UTF rows exceed table bounds')

    def string(offset):
        start = string_offset + offset
        if not string_offset <= start < data_offset:
            raise ValueError('UTF string offset outside string table')
        stop = blob.find(b'\0', start, data_offset)
        if stop < 0:
            raise ValueError('Unterminated UTF string')
        return blob[start:stop].decode('utf-8')

    def value(position, kind, limit):
        if kind not in _TYPES:
            raise ValueError('Unsupported UTF column type')
        fmt = '>' + _TYPES[kind]
        length = struct.calcsize(fmt)
        if position + length > limit:
            raise ValueError('UTF value exceeds row bounds')
        items = struct.unpack_from(fmt, blob, position)
        result = items[0]
        if kind == 10:
            result = string(result)
        elif kind == 11:
            offset, length = items
            if length == 0:
                result = b''
            elif data_offset + offset + length <= end:
                result = blob[data_offset + offset:data_offset + offset + length]
            else:
                raise ValueError('UTF data exceeds table bounds')
        return result, position + struct.calcsize(fmt)

    schema = []
    position = 32
    for _ in range(count):
        if position + 5 > row_offset:
            raise ValueError('Truncated UTF schema')
        flag, offset = struct.unpack_from('>BI', blob, position)
        position += 5
        storage, kind = flag & 0xf0, flag & 15
        constant = b'' if kind == 11 else '' if kind == 10 else 0
        if storage == 0x30:
            constant, position = value(position, kind, row_offset)
        elif storage not in (0x10, 0x50):
            raise ValueError('Unsupported UTF column storage')
        schema.append((string(offset), storage, kind, constant))
    result = []
    for index in range(rows):
        position = row_offset + index * row_size
        limit = position + row_size
        row = {}
        for column, storage, kind, constant in schema:
            if storage == 0x50:
                row[column], position = value(position, kind, limit)
            else:
                row[column] = constant
        result.append(row)
    return string(name), result


def read_awb(blob):
    if len(blob) < 16 or blob[:4] != b'AFS2':
        raise ValueError('Invalid embedded AWB')
    version, offset_size, id_size, reserved, count, alignment, subkey = struct.unpack_from('<BBBBIHH', blob, 4)
    header_size = 16 + count * id_size + (count + 1) * offset_size
    if version not in (1, 2) or offset_size not in (2, 4, 8) or id_size not in (2, 4) or not 0 < alignment <= 4096 or header_size > len(blob):
        raise ValueError('Invalid AWB header bounds')
    def integers(position, width, length):
        return [int.from_bytes(blob[position + i * width:position + (i + 1) * width], 'little') for i in range(length)]
    identifiers = integers(16, id_size, count)
    offsets = integers(16 + count * id_size, offset_size, count + 1)
    if len(set(identifiers)) != count or offsets[0] < header_size or offsets[-1] > len(blob):
        raise ValueError('Invalid AWB file table')
    result = {}
    for index, identifier in enumerate(identifiers):
        start = (offsets[index] + alignment - 1) // alignment * alignment
        stop = offsets[index + 1]
        if not header_size <= start <= stop <= len(blob):
            raise ValueError('AWB file outside bank bounds')
        result[identifier] = blob[start:stop]
    return subkey, result


def extract_acb(blob):
    _, header = read_utf(blob)
    if len(header) != 1 or not header[0].get('AwbFile'):
        raise ValueError('ACB lacks one embedded AWB bank')
    header = header[0]
    subkey, samples = read_awb(header['AwbFile'])
    tables = {name: read_utf(data)[1] for name, data in header.items()
              if name.endswith('Table') and isinstance(data, bytes) and data.startswith(b'@UTF')}

    def row(name, index):
        values = tables.get(name, [])
        if not isinstance(index, int) or not 0 <= index < len(values):
            raise ValueError(f'ACB reference outside {name}')
        return values[index]

    def pairs(data):
        if len(data) % 4:
            raise ValueError('Malformed ACB reference list')
        return struct.iter_unpack('>HH', data)

    def resolve(kind, index, depth=0):
        if depth > 16:
            raise ValueError('Cyclic ACB reference')
        if kind == 1:
            return [row('WaveformTable', index)]
        if kind == 2:
            return [wave for ref, target in pairs(row('SynthTable', index)['ReferenceItems'])
                    for wave in resolve(ref, target, depth + 1)]
        if kind == 3:
            sequence = row('SequenceTable', index)
            tracks = sequence['TrackIndex']
            if len(tracks) != sequence['NumTracks'] * 2:
                raise ValueError('Invalid ACB track references')
            waves = []
            for track, in struct.iter_unpack('>H', tracks):
                command = row('TrackEventTable', row('TrackTable', track)['EventIndex'])['Command']
                position = 0
                while position < len(command):
                    if position + 3 > len(command):
                        raise ValueError('Truncated ACB event')
                    opcode, length = struct.unpack_from('>HB', command, position)
                    position += 3
                    if position + length > len(command):
                        raise ValueError('Truncated ACB event payload')
                    if opcode == 2000:
                        if length != 4:
                            raise ValueError('Unsupported ACB note reference')
                        ref, target = struct.unpack_from('>HH', command, position)
                        waves.extend(resolve(ref, target, depth + 1))
                    elif opcode not in (0, 999):
                        raise ValueError(f'Unsupported ACB event reference opcode: {opcode}')
                    position += length
            return waves
        raise ValueError(f'Unsupported ACB cue reference type: {kind}')

    result = []
    names = set()
    for named in tables.get('CueNameTable', []):
        name = named['CueName']
        if not name or name in names:
            raise ValueError('Empty or duplicate ACB cue name')
        names.add(name)
        cue = row('CueTable', named['CueIndex'])
        waves = resolve(cue['ReferenceType'], cue['ReferenceIndex'])
        if len(waves) != 1:
            raise ValueError(f'Unsupported layered ACB cue: {name}')
        wave = waves[0]
        identifier = wave['MemoryAwbId']
        if wave['Streaming'] != 0 or wave['EncodeType'] != 2 or identifier not in samples:
            raise ValueError(f'Unsupported or missing HCA waveform: {name}')
        result.append({'cue': name, 'waveformId': identifier, 'sampleRate': wave['SamplingRate'],
                       'channels': wave['NumChannels'], 'numSamples': wave['NumSamples'],
                       'cueDurationMs': cue['Length'], 'subkey': subkey, 'audio': samples[identifier]})
    if not result:
        raise ValueError('ACB has no playable named cues')
    return result
