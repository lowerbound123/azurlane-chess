"""Decrypt CRI HCA before handing audio decoding to FFmpeg.

Cipher-table algorithm adapted from Nyagamon/HCADecoder (MIT), revision
e26b4d3a8bb450224ede3527d522c0330f7bf02b, clHCA.cpp. See HCA-LICENSE.txt.
The Azur Lane key is documented at https://www.perfare.net/archives/816.
"""
import struct

DEFAULT_KEY = 0x0002354E95356C72


def _crc_entry(value):
    value <<= 8
    for _ in range(8):
        value = ((value << 1) ^ (0x8005 if value & 0x8000 else 0)) & 0xffff
    return value


_CRC = tuple(_crc_entry(i) for i in range(256))


def checksum(data):
    value = 0
    for byte in data:
        value = ((value << 8) ^ _CRC[(value >> 8) ^ byte]) & 0xffff
    return value


def _cipher_table(kind, key):
    if kind == 0:
        return bytes(range(256))
    if kind == 1:
        values = []
        value = 0
        for _ in range(254):
            value = (value * 13 + 11) & 255
            if value in (0, 255):
                value = (value * 13 + 11) & 255
            values.append(value)
        return bytes([0, *values, 255])
    if kind != 56 or not key:
        raise ValueError(f'Unsupported HCA cipher: {kind}')

    def nibbles(seed):
        multiplier = ((seed & 1) << 3) | 5
        increment = (seed & 14) | 1
        value = seed >> 4
        result = []
        for _ in range(16):
            value = (value * multiplier + increment) & 15
            result.append(value)
        return result

    k = ((key - 1) & 0xffffffffffffffff).to_bytes(8, 'little')
    seeds = [k[1], k[1] ^ k[6], k[2] ^ k[3], k[2], k[2] ^ k[1], k[3] ^ k[4],
             k[3], k[3] ^ k[2], k[4] ^ k[5], k[4], k[4] ^ k[3], k[5] ^ k[6],
             k[5], k[5] ^ k[4], k[6] ^ k[1], k[6]]
    high = nibbles(k[0])
    combined = [high[i] << 4 | low for i, seed in enumerate(seeds) for low in nibbles(seed)]
    values = [combined[(i * 17) & 255] for i in range(1, 257)]
    return bytes([0, *(value for value in values if value not in (0, 255)), 255])


def decrypt_hca(blob, key=DEFAULT_KEY, subkey=0):
    if len(blob) < 8 or bytes(byte & 127 for byte in blob[:4]) != b'HCA\0':
        raise ValueError('Invalid or truncated HCA header')
    if subkey:
        raise ValueError('Unsupported non-zero HCA AWB subkey')
    header_size = struct.unpack_from('>H', blob, 6)[0]
    if header_size < 24 or header_size > len(blob):
        raise ValueError('Truncated HCA header')
    if checksum(blob[:header_size]):
        raise ValueError('HCA header checksum mismatch')
    output = bytearray(blob)
    output[:4] = b'HCA\0'
    position = 8
    block_size = block_count = None
    cipher_type = 0
    while position + 4 <= header_size - 2:
        tag = bytes(byte & 127 for byte in output[position:position + 4])
        output[position:position + 4] = tag
        if tag == b'pad\0':
            break
        lengths = {b'fmt\0': 16, b'comp': 16, b'dec\0': 12, b'vbr\0': 8,
                   b'ath\0': 6, b'loop': 16, b'ciph': 6, b'rva\0': 8}
        length = lengths.get(tag)
        if tag == b'comm' and position + 5 <= header_size - 2:
            length = 5 + output[position + 4]
        if length is None or position + length > header_size - 2:
            raise ValueError(f'Unsupported or truncated HCA chunk: {tag!r}')
        if tag == b'fmt\0':
            block_count = struct.unpack_from('>I', output, position + 8)[0]
        elif tag in (b'comp', b'dec\0'):
            block_size = struct.unpack_from('>H', output, position + 4)[0]
        elif tag == b'ciph':
            cipher_type = struct.unpack_from('>H', output, position + 4)[0]
            output[position + 4:position + 6] = b'\0\0'
        position += length
    if block_size is None or block_size < 8 or block_count is None:
        raise ValueError('HCA lacks a supported fixed-size frame layout')
    if header_size + block_size * block_count > len(blob):
        raise ValueError('Truncated HCA frames')
    table = _cipher_table(cipher_type, key)
    for position in range(header_size, header_size + block_size * block_count, block_size):
        frame = blob[position:position + block_size]
        if checksum(frame):
            raise ValueError('HCA frame checksum mismatch')
        if cipher_type:
            plain = bytearray(frame.translate(table))
            plain[-2:] = struct.pack('>H', checksum(plain[:-2]))
            output[position:position + block_size] = plain
    output[header_size - 2:header_size] = struct.pack('>H', checksum(output[:header_size - 2]))
    return bytes(output)


def sample_window(plain, num_samples):
    """Return the unpadded PCM window; FFmpeg's HCA decoder emits full blocks."""
    if len(plain) < 24 or plain[:4] != b'HCA\0' or plain[8:12] != b'fmt\0':
        raise ValueError('Invalid decrypted HCA sample format')
    blocks = struct.unpack_from('>I', plain, 16)[0]
    delay, padding = struct.unpack_from('>HH', plain, 20)
    end = blocks * 1024 - padding
    if num_samples <= 0 or end - delay != num_samples:
        raise ValueError('ACB sample count differs from HCA unpadded waveform')
    return delay, end
