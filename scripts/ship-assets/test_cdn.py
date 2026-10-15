import importlib.util
import tempfile
import unittest
from pathlib import Path
from types import SimpleNamespace
from unittest.mock import patch
from urllib.error import HTTPError

spec = importlib.util.spec_from_file_location('cdn', Path(__file__).with_name('cdn.py'))
cdn = importlib.util.module_from_spec(spec)
spec.loader.exec_module(cdn)


class ProviderTests(unittest.TestCase):
    def test_exact_filter_excludes_skins_voice_live2d(self):
        self.assertEqual(cdn.exact_paths('qiye'), {'char/qiye', 'painting/qiye', 'painting/qiye_tex'})
        for invalid in ['../qiye', 'qiye/*', 'qiye/1', '']:
            with self.assertRaises(ValueError):
                cdn.exact_paths(invalid)

    def test_http_failure_distinction(self):
        for status, expected in [(404, cdn.Missing), (429, HTTPError), (500, HTTPError)]:
            with patch.object(cdn, 'urlopen', side_effect=HTTPError('https://example.com', status, 'failure', {}, None)):
                with self.assertRaises(expected):
                    cdn.fetch('https://example.com')

    def test_discovery_failure_is_never_missing(self):
        with patch.object(cdn, 'discover', side_effect=TimeoutError('timeout')):
            result = cdn.run({'ships': [{'id': 1, 'assetName': 'qiye'}]}, Path('/tmp'))
        self.assertEqual(result['ships'][0]['status'], 'error')

    def test_component_filtering_and_success(self):
        self.assertEqual(cdn.exact_paths('qiye', ['chibi']), {'char/qiye'})
        self.assertEqual(cdn.exact_paths('qiye', ['painting']), {'painting/qiye', 'painting/qiye_tex'})
        blob = b'bundle'
        row = SimpleNamespace(size=len(blob), md5hash=cdn.hashlib.md5(blob).hexdigest())
        with tempfile.TemporaryDirectory() as directory:
            for need, rows, extractor in [
                ('chibi', {'char/qiye': row}, 'extract_char'),
                ('painting', {'painting/qiye': row}, 'compose_painting'),
            ]:
                with patch.object(cdn, 'discover', return_value=('https://cdn', rows, ['version'])), patch.object(cdn, 'fetch', return_value=blob) as fetch, patch.object(cdn, extractor, return_value=['ok']), patch.object(cdn, 'painting_layers', return_value=[]):
                    report = cdn.run({'ships': [{'id': 1, 'assetName': 'qiye', 'needs': [need]}]}, Path(directory))
                self.assertEqual(report['ships'][0]['status'], 'available')
                self.assertEqual(set(report['ships'][0]['files']), {need})
                self.assertEqual(fetch.call_count, 1)
                self.assertEqual(report['source']['cdn'], 'https://cdn')

    def test_prefab_visible_face_and_ids_are_preserved(self):
        import UnityPy
        def transform(go, parent, children):
            return {'m_GameObject': {'m_PathID': go}, 'm_Father': {'m_PathID': parent}, 'm_Children': [{'m_PathID': c} for c in children], 'm_Pivot': {'x': .5, 'y': .5}, 'm_SizeDelta': {'x': 100, 'y': 100}, 'm_AnchorMin': {'x': .5, 'y': .5}, 'm_AnchorMax': {'x': .5, 'y': .5}, 'm_AnchoredPosition': {'x': 0, 'y': 0}, 'm_LocalScale': {'x': 1, 'y': 1}, 'm_LocalRotation': {'z': 0, 'w': 1}}
        rows = [(1, 'GameObject', {'m_Name': 'Z13', 'm_IsActive': True}), (2, 'GameObject', {'m_Name': 'face', 'm_IsActive': True}), (3, 'GameObject', {'m_Name': '1', 'm_IsActive': True}), (10, 'RectTransform', transform(1, 0, [20, 30])), (20, 'RectTransform', transform(2, 10, [])), (30, 'RectTransform', transform(3, 10, []))]
        for go, mesh, alpha in [(1, 1234567890123456789, 1), (2, 0, 1), (3, 0, 0)]:
            rows.append((100+go, 'MonoBehaviour', {'m_GameObject': {'m_PathID': go}, 'mMesh': {'m_PathID': mesh}, 'm_Sprite': {'m_PathID': 987654321098765432+go}, 'm_Color': {'a': alpha}, 'mRawSpriteSize': {'x':100,'y':100}}))
        objects = [SimpleNamespace(path_id=id, type=SimpleNamespace(name=kind), read_typetree=lambda t=t:t) for id,kind,t in rows]
        with patch.object(UnityPy, 'load', return_value=SimpleNamespace(objects=objects)):
            layers = cdn.painting_layers(Path('base'), 'z13')
        self.assertEqual([l['name'] for l in layers], ['Z13', 'face'])
        self.assertEqual(layers[1]['bundle'], 'paintingface/z13')
        self.assertIsInstance(layers[0]['meshId'], str)
        self.assertIsInstance(layers[1]['spriteId'], str)

    def test_prefab_layers_download_exact_dependencies_and_fail_closed(self):
        blob = b'bundle'
        row = SimpleNamespace(size=len(blob), md5hash=cdn.hashlib.md5(blob).hexdigest())
        layers = [{'name': 'qiye', 'bundle': 'painting/qiye_tex'}, {'name': 'qiye_rw', 'bundle': 'painting/qiye_rw_tex'}]
        for missing in (False, True):
            rows = {path: row for path in ['painting/qiye', 'painting/qiye_tex', 'painting/qiye_rw_tex']}
            if missing:
                del rows['painting/qiye_rw_tex']
            with tempfile.TemporaryDirectory() as directory, patch.object(cdn, 'discover', return_value=('https://cdn', rows, ['version'])), patch.object(cdn, 'fetch', return_value=blob) as fetch, patch.object(cdn, 'painting_layers', return_value=layers), patch.object(cdn, 'compose_painting', return_value='painting.png') as compose:
                report = cdn.run({'ships': [{'id': 'qiye', 'assetName': 'qiye', 'needs': ['painting']}]}, Path(directory))
                ship = report['ships'][0]
                self.assertEqual(ship['status'], 'error' if missing else 'available')
                self.assertEqual(fetch.call_count, 2 if missing else 3)
                self.assertEqual(compose.call_count, 0 if missing else 1)
                self.assertEqual(ship['composition']['layers'], layers)

    def test_retries_are_bounded_and_404_is_not_retried(self):
        with patch.object(cdn, 'urlopen', side_effect=TimeoutError()) as request:
            with self.assertRaises(TimeoutError):
                cdn.fetch('https://example.com')
            self.assertEqual(request.call_count, 3)
        with patch.object(cdn, 'urlopen', side_effect=HTTPError('https://example.com', 404, 'missing', {}, None)) as request:
            with self.assertRaises(cdn.Missing):
                cdn.fetch('https://example.com')
            self.assertEqual(request.call_count, 1)

    def test_painting_case_variation_matches_exact_base_only(self):
        from azlassets import imgrecon
        texture = SimpleNamespace(m_Name='Z13', image='texture')
        skin = SimpleNamespace(m_Name='Z13_2', image='skin')
        saved = SimpleNamespace(save=lambda _: None)
        with tempfile.TemporaryDirectory() as directory:
            with patch.object(imgrecon, 'load_mesh', return_value=['mesh']) as mesh, patch.object(imgrecon, 'load_images', return_value=[(None, skin), (None, texture)]), patch.object(imgrecon, 'recon', return_value=saved) as recon:
                cdn.extract_painting([Path('bundle')], 'z13', Path(directory)/'painting.png')
            recon.assert_called_once_with('texture', ['mesh'])
            mesh.assert_called_with('bundle', 'Z13-mesh')

    def test_missing_mesh_is_error(self):
        from azlassets import imgrecon
        texture = SimpleNamespace(m_Name='qiye', image=SimpleNamespace())
        with patch.object(imgrecon, 'load_mesh', return_value=None), patch.object(imgrecon, 'load_images', return_value=[(None, texture)]):
            with self.assertRaisesRegex(ValueError, 'Missing painting mesh'):
                cdn.extract_painting([Path('bundle')], 'qiye', Path('/tmp/unused.png'))

    def test_all_skeletons_and_atlases_are_extracted(self):
        def obj(kind, name, data=b'x'):
            return SimpleNamespace(type=SimpleNamespace(name=kind), read=lambda: SimpleNamespace(m_Name=name, m_Script=data))
        objects = [obj('TextAsset', name) for name in ['qiye.skel', 'qiye.atlas', 'shadow.skel', 'shadow.atlas', 'unrelated.txt']]
        with tempfile.TemporaryDirectory() as directory:
            files = cdn.extract_char(Path('bundle'), Path(directory), lambda _: SimpleNamespace(objects=objects))
            self.assertEqual({f['name'] for f in files}, {'qiye.skel', 'qiye.atlas', 'shadow.skel', 'shadow.atlas'})


if __name__ == '__main__':
    unittest.main()
