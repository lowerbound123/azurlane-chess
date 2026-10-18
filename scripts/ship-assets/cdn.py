#!/usr/bin/env python3
"""Narrow official CDN provider. stdout is one machine-readable JSON report."""
import argparse
import contextlib
import hashlib
import json
import re
import sys
from pathlib import Path
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen


class Missing(Exception):
    pass


def exact_paths(base, needs=None):
    if not re.fullmatch(r'[a-zA-Z0-9_-]+', base):
        raise ValueError('Invalid assetName')
    needs = {'painting', 'chibi'} if needs is None else set(needs)
    if not needs or needs - {'painting', 'chibi'}:
        raise ValueError('needs must contain painting and/or chibi')
    paths = set()
    if 'chibi' in needs:
        paths.add(f'char/{base}')
    if 'painting' in needs:
        paths.update((f'painting/{base}', f'painting/{base}_tex'))
    return paths


def retry_network(operation):
    for attempt in range(3):
        try:
            return operation()
        except HTTPError as error:
            if error.code == 404:
                raise Missing('http_404') from error
            if error.code < 500:
                raise
            if attempt == 2:
                raise
        except (TimeoutError, ConnectionError, URLError):
            if attempt == 2:
                raise


def fetch(url):
    def request():
        with urlopen(Request(url, headers={'User-Agent': 'AzurLane-ShipAssets/1.0'}), timeout=30) as response:
            return response.read()
    return retry_network(request)


def gate_versions(config):
    # Upstream recv_bytes loops forever on EOF; preserve its framing but fail closed.
    from azlassets import protobuf as pb
    with pb.ConnectionSocket() as connection:
        connection.settimeout(20)
        connection.connect((config.gateip, config.gateport))
        connection.send_command(10800, 0, state=21, platform='0')
        def receive(size):
            data = b''
            while len(data) < size:
                chunk = connection.recv(size - len(data))
                if not chunk:
                    raise ConnectionError('Gate closed before complete response')
                data += chunk
            return data
        size, command, index = pb.deserialize_header(receive(pb.ADV_HEADER_LEN))
        if size > 1048576:
            raise ValueError('Oversized gate response')
        result = pb.deserialize_pb(command, index, receive(size))
        if result is None:
            raise ConnectionError('Empty gate response')
        return list(result.pb.version)


def discover(client, version_types=None):
    from azlassets.config import load_client_config
    from azlassets.classes import Client
    from azlassets.versioncontrol import parse_version_string, parse_hash_rows, VersionType
    config = load_client_config(Client[client])
    version_types = (VersionType.AZL, VersionType.PAINTING) if version_types is None else tuple(version_types)
    prefixes = tuple(f'${kind.hashname}$' for kind in version_types)
    rows = {}
    versions = []
    discovered = set()
    for raw in retry_network(lambda: gate_versions(config)):
        if not raw.startswith(prefixes):
            continue
        version = parse_version_string(raw.strip())
        if version.version_type not in version_types:
            continue
        # Modern CDN hashfiles use the complete $-delimited version string.
        data = fetch(f'{config.cdnurl}/android/hash/{version.rawstring}')
        for row in parse_hash_rows(data.decode('utf-8-sig')):
            rows[row.filepath.lower()] = row
        versions.append(raw)
        discovered.add(version.version_type)
    absent = set(version_types) - discovered
    if absent:
        raise RuntimeError('Missing requested resource hashfiles: ' + ', '.join(sorted(kind.name for kind in absent)))
    if not versions or not rows:
        raise RuntimeError('No requested resource hashfiles in gate response')
    return config.cdnurl, rows, versions


def extract_char(bundle, destination, loader=None):
    if loader is None:
        import UnityPy
        loader = UnityPy.load
    destination.mkdir(parents=True, exist_ok=True)
    files = []
    for obj in loader(str(bundle)).objects:
        kind = obj.type.name
        if kind not in ('TextAsset', 'Texture2D'):
            continue
        data = obj.read()
        name = data.m_Name
        if Path(name).name != name or name in ('', '.', '..'):
            raise ValueError('Unsafe embedded asset name')
        if kind == 'TextAsset':
            if not name.endswith(('.skel', '.atlas')):
                continue
            payload = data.m_Script
            if isinstance(payload, str):
                payload = payload.encode('utf-8', 'surrogateescape')
            target = destination / name
            target.write_bytes(payload)
        else:
            target = destination / (name if name.endswith('.png') else name + '.png')
            data.image.save(target)
        files.append({'name': target.name, 'path': str(target.resolve())})
    if not any(file['name'].endswith('.skel') for file in files) or not any(file['name'].endswith('.atlas') for file in files):
        raise ValueError('Bundle lacks skeleton or atlas')
    return files


def painting_layers(bundle, base):
    """Read only base-prefab mesh Images, preserving Unity child draw order."""
    import UnityPy
    from azlassets import imgrecon  # configures stripped Unity version fallback
    objects = {}
    for obj in UnityPy.load(str(bundle)).objects:
        if obj.type.name in ('GameObject', 'RectTransform', 'MonoBehaviour'):
            objects[obj.path_id] = (obj.type.name, obj.read_typetree())
    transforms = {key: value for key, (kind, value) in objects.items() if kind == 'RectTransform'}
    images = {}
    for _, (kind, value) in objects.items():
        if kind == 'MonoBehaviour' and (value.get('mMesh', {}).get('m_PathID') or value.get('m_Sprite', {}).get('m_PathID')):
            images[value['m_GameObject']['m_PathID']] = value
    layers = []
    roots = [(key, value) for key, value in transforms.items() if value['m_Father']['m_PathID'] == 0]
    if len(roots) != 1:
        raise ValueError('Painting prefab has no unique root transform')
    def walk(key, parent=None):
        if key not in transforms:
            return
        transform = transforms[key]
        go = objects[transform['m_GameObject']['m_PathID']][1]
        if not go.get('m_IsActive', True):
            return
        pivot = transform['m_Pivot']
        if parent is None:
            size = transform['m_SizeDelta']; position = {'x': 0.0, 'y': 0.0}; scale = {'x': 1.0, 'y': 1.0}
        else:
            psize, ppos, pscale, ppivot = parent
            size = {}; position = {}; scale = {}
            for axis in ('x', 'y'):
                amin = transform['m_AnchorMin'][axis]; amax = transform['m_AnchorMax'][axis]
                size[axis] = psize[axis] * (amax - amin) + transform['m_SizeDelta'][axis]
                position[axis] = ppos[axis] + ((amin + (amax - amin) * pivot[axis] - ppivot[axis]) * psize[axis] + transform['m_AnchoredPosition'][axis]) * pscale[axis]
                scale[axis] = pscale[axis] * transform['m_LocalScale'][axis]
        rotation = transform['m_LocalRotation']
        image = images.get(transform['m_GameObject']['m_PathID'])
        if image and (not image.get('m_Enabled', 1) or image.get('m_Color', {}).get('a', 1) == 0):
            image = None
        if image:
            if abs(rotation['z']) > 0.0001 or abs(rotation['w'] - 1) > 0.0001:
                raise ValueError('Unsupported rotated painting layer')
            name = go['m_Name']
            # Names originate in this exact base prefab, not a prefix index search.
            sprite_only = not image.get('mMesh', {}).get('m_PathID')
            if sprite_only and name.casefold() != 'face':
                raise ValueError('Unexpected ordinary painting Sprite: ' + name)
            if not sprite_only and not re.fullmatch(re.escape(base) + r'(?:_[a-zA-Z]+[a-zA-Z0-9]*)*', name, re.IGNORECASE):
                raise ValueError('Unexpected non-base prefab texture: ' + name)
            layers.append({'name': name, 'bundle': ('paintingface/' + base.lower()) if sprite_only else ('painting/' + name.lower() + '_tex'), 'position': position, 'size': size, 'scale': scale, 'pivot': pivot, 'rawSize': image.get('mRawSpriteSize'), 'kind': 'sprite' if sprite_only else 'mesh', 'spriteId': str(image['m_Sprite']['m_PathID']), 'meshId': str(image['mMesh']['m_PathID']) if image.get('mMesh', {}).get('m_PathID') else None})
        for child in transform['m_Children']:
            walk(child['m_PathID'], (size, position, scale, pivot))
    walk(roots[0][0])
    if not layers:
        raise ValueError('No mesh Images in painting prefab')
    return layers


def compose_painting(layers, local, destination):
    from PIL import Image
    from azlassets import imgrecon
    rendered = []
    for layer in layers:
        bundle = local[layer['bundle']]
        if layer.get('kind') == 'sprite':
            import UnityPy
            sprites = [obj.read() for obj in UnityPy.load(str(bundle)).objects if obj.type.name == 'Sprite' and str(obj.path_id) == layer['spriteId']]
            if len(sprites) != 1:
                raise ValueError('Missing exact default face Sprite')
            canvas = sprites[0].image.convert('RGBA')
        else:
            textures = [texture for _, texture in imgrecon.load_images(str(bundle)) if texture.m_Name.casefold() == layer['name'].casefold()]
            if len(textures) != 1:
                raise ValueError('Missing or ambiguous layer texture: ' + layer['name'])
            texture = textures[0]
            mesh = imgrecon.load_mesh(str(bundle), texture.m_Name + '-mesh')
            if not mesh:
                raise ValueError('Missing painting layer mesh: ' + layer['name'])
            restored = imgrecon.recon(texture.image, mesh)
            raw = layer['rawSize']
            if not raw or raw['x'] <= 0 or raw['y'] <= 0:
                raise ValueError('Missing raw painting layer size')
            # imgrecon removes the unused bottom rows; retain the prefab raw canvas.
            vertices = [list(map(float, line.split()[1:])) for line in mesh if line.startswith('v ')]
            top = round(raw['y'] - 1 - max(vertex[1] for vertex in vertices))
            canvas = Image.new('RGBA', (round(raw['x']), round(raw['y'])))
            canvas.alpha_composite(restored.convert('RGBA'), (0, top))
        width = round(layer['size']['x'] * layer['scale']['x'])
        height = round(layer['size']['y'] * layer['scale']['y'])
        if width <= 0 or height <= 0 or width * height > 100_000_000:
            raise ValueError('Invalid painting layer dimensions')
        canvas = canvas.resize((width, height), Image.Resampling.LANCZOS)
        left = layer['position']['x'] - layer['pivot']['x'] * width
        top = -layer['position']['y'] - (1 - layer['pivot']['y']) * height
        rendered.append((canvas, round(left), round(top)))
    left = min(x for _, x, _ in rendered); top = min(y for _, _, y in rendered)
    right = max(x + image.width for image, x, _ in rendered); bottom = max(y + image.height for image, _, y in rendered)
    if (right-left)*(bottom-top) > 100_000_000:
        raise ValueError('Oversized composite painting')
    output = Image.new('RGBA', (right-left, bottom-top))
    for image, x, y in rendered:
        output.alpha_composite(image, (x-left, y-top))
    destination.parent.mkdir(parents=True, exist_ok=True)
    output.save(destination)
    return str(destination.resolve())


def extract_painting(bundles, base, destination):
    from azlassets import imgrecon
    images = []
    mesh = None
    for bundle in bundles:
        images.extend(texture for _, texture in imgrecon.load_images(str(bundle)) if texture.m_Name.casefold() == base.casefold())
    if not images:
        raise ValueError('No exact base painting texture')
    if len(images) != 1:
        raise ValueError('Ambiguous exact base painting textures')
    # Official bundle paths are normalized independently of embedded Unity names.
    # Match the complete name case-insensitively, never a skin-name prefix.
    for bundle in bundles:
        mesh = mesh or imgrecon.load_mesh(str(bundle), images[0].m_Name + '-mesh')
    image = images[0].image
    if not mesh:
        raise ValueError('Missing painting mesh: cannot prove texture is a complete painting')
    image = imgrecon.recon(image, mesh)
    destination.parent.mkdir(parents=True, exist_ok=True)
    image.save(destination)
    return str(destination.resolve())


def run(request, output):
    client = request.get('client', 'EN')
    ships = request['ships']
    for ship in ships:
        exact_paths(ship['assetName'], ship.get('needs'))
        if not re.fullmatch(r'[a-zA-Z0-9_-]+', str(ship['id'])):
            raise ValueError('Invalid ship id')
    report = {'schemaVersion': 1, 'client': client, 'ships': [], 'errors': []}
    try:
        cdn, rows, versions = discover(client)
        report['versions'] = versions
        report['source'] = {'cdn': cdn, 'versions': versions}
    except Exception as error:
        # Missing metadata is a provider failure, never evidence a ship is absent.
        report['errors'].append({'stage': 'discovery', 'reason': str(error), 'type': type(error).__name__})
        for ship in ships:
            report['ships'].append({**ship, 'status': 'error', 'reason': 'discovery_failed', 'files': {}})
        return report
    for ship in ships:
        base = ship['assetName']
        result = {**ship, 'status': 'available', 'files': {}, 'assets': {}}
        needs = ship.get('needs', ['painting', 'chibi'])
        paths = exact_paths(base, needs)
        local = {}
        folder = output / str(ship['id'])
        queue = sorted(paths)
        layers = None
        for path in queue:
            row = rows.get(path.lower())
            if row is None:
                result['assets'][path] = {'status': 'missing', 'reason': 'not_in_index'}
                continue
            try:
                blob = fetch(f'{cdn}/android/resource/{row.md5hash}')
                if len(blob) != row.size or hashlib.md5(blob).hexdigest().lower() != row.md5hash.lower():
                    raise ValueError('Bundle size/hash mismatch')
                target = folder / 'bundles' / path
                target.parent.mkdir(parents=True, exist_ok=True)
                target.write_bytes(blob)
                local[path.lower()] = target
                if path.lower() == f'painting/{base}'.lower():
                    layers = painting_layers(target, base)
                    result['composition'] = {'revision': 2, 'layers': layers}
                    for layer in layers:
                        if layer['bundle'] not in {item.lower() for item in queue}:
                            queue.append(layer['bundle'])
                result['assets'][path] = {'status': 'available', 'hash': row.md5hash}
            except Missing as error:
                result['assets'][path] = {'status': 'missing', 'reason': str(error)}
            except Exception as error:
                result['assets'][path] = {'status': 'error', 'reason': str(error)}
        for kind in ('char' if need == 'chibi' else need for need in needs):
            try:
                if kind == 'char' and f'char/{base}'.lower() in local:
                    result['files']['chibi'] = extract_char(local[f'char/{base}'.lower()], folder / 'chibi')
                elif kind == 'painting' and any(path.startswith('painting/') for path in local):
                    if layers is None:
                        raise ValueError('Missing base prefab: cannot prove painting dependencies complete')
                    if any(layer['bundle'] not in local for layer in layers):
                        raise ValueError('Missing required prefab painting layer')
                    result['files']['painting'] = compose_painting(layers, local, folder / 'painting.png')
            except Exception as error:
                result['assets'][kind + ':extract'] = {'status': 'error', 'reason': str(error)}
        states = [asset['status'] for asset in result['assets'].values()]
        if 'error' in states:
            result['status'] = 'error'
        elif any(not result['files'].get(need) for need in needs):
            result['status'] = 'missing'
        report['ships'].append(result)
    return report


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--request', required=True, type=Path)
    parser.add_argument('--output', required=True, type=Path)
    args = parser.parse_args()
    # Upstream diagnostic print() must never corrupt the JSON protocol.
    with contextlib.redirect_stdout(sys.stderr):
        report = run(json.loads(args.request.read_text()), args.output.resolve())
    args.output.mkdir(parents=True, exist_ok=True)
    (args.output / 'report.json').write_text(json.dumps(report, ensure_ascii=False, indent=2) + '\n')
    print(json.dumps(report, ensure_ascii=False))


if __name__ == '__main__':
    main()
