import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import { movedPointer, pickAction, applyCameraMode } from '../src/battle-map-3d.js';
import { hexToXY, xyToHex, allHexes } from '../src/engine.js';

test('drag threshold and right click preserve semantic map operations', () => {
  assert.equal(movedPointer({ x: 0, y: 0 }, { clientX: 3, clientY: 4 }), false);
  assert.equal(movedPointer({ x: 0, y: 0 }, { clientX: 8, clientY: 0 }), true);
  const node = { index: 2, shipId: '0-1', editable: true, pos: { q: 2, r: 3 } }, ship = { id: '1-1' }, hex = { q: 3, r: 4 };
  assert.deepEqual(pickAction({ node, ship, hex, phase: 'plan', mode: 'move' }), { type: 'node', index: 2, shipId: '0-1' });
  for (const mode of ['main', 'plane', 'torp', 'mine']) assert.deepEqual(pickAction({ node, ship, hex, phase: 'plan', mode }), { type: 'hex', hex: node.pos, forceMove: false });
  assert.deepEqual(pickAction({ node, ship, hex, phase: 'plan', mode: 'move', button: 2 }), { type: 'hex', hex: node.pos, forceMove: true });
  assert.equal(pickAction({ hex, button: 1 }), null);
});

test('all 285 hex centers pick correctly after camera orbit and zoom', () => {
  const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0), ray = new THREE.Raycaster();
  for (const direction of [new THREE.Vector3(0, 32, 24), new THREE.Vector3(-25, 30, 10), new THREE.Vector3(23, 34, -16)]) {
    const camera = new THREE.OrthographicCamera(-24, 24, 20, -20, .1, 250); const target = new THREE.Vector3(16, 0, 10.5);
    camera.position.copy(target).add(direction); camera.lookAt(target); camera.zoom = 1.7; camera.updateProjectionMatrix(); camera.updateMatrixWorld();
    for (const hex of allHexes()) { const xy = hexToXY(hex), world = new THREE.Vector3(xy.x, 0, xy.y), ndc = world.clone().project(camera); ray.setFromCamera(new THREE.Vector2(ndc.x, ndc.y), camera); const result = ray.ray.intersectPlane(plane, new THREE.Vector3()); const picked = xyToHex({ x: result.x, y: result.z }); assert.equal(`${picked.q},${picked.r}`, `${hex.q},${hex.r}`); }
  }
});

test('pointy cylinder hex footprint agrees with engine orientation', () => {
  const geometry = new THREE.CylinderGeometry(1, 1, .12, 6); const positions = geometry.attributes.position;
  for (let i = 0; i < positions.count; i++) { const x = positions.getX(i), z = positions.getZ(i); if (Math.hypot(x, z) < .9) continue; const vertex = Math.round((Math.atan2(z, x) - Math.PI / 6) / (Math.PI / 3)); const angle = Math.PI / 6 + vertex * Math.PI / 3; assert.ok(Math.abs(x - Math.cos(angle)) < 1e-6 && Math.abs(z - Math.sin(angle)) < 1e-6); }
  geometry.dispose();
});

test('billboard remains ray-pickable from all allowed camera directions', () => {
  const sprite = new THREE.Sprite(new THREE.SpriteMaterial()); sprite.position.set(2, 1.36, 3); sprite.scale.set(2.35, .86, 1); sprite.updateMatrixWorld();
  const camera = new THREE.PerspectiveCamera(50, 1, .1, 100), ray = new THREE.Raycaster();
  for (const offset of [new THREE.Vector3(0, 8, 10), new THREE.Vector3(9, 6, 0), new THREE.Vector3(0, 9, -7)]) { camera.position.copy(sprite.position).add(offset); camera.lookAt(sprite.position); camera.updateMatrixWorld(); ray.setFromCamera(new THREE.Vector2(), camera); assert.equal(ray.intersectObject(sprite).length, 1); }
  sprite.material.dispose();
});


test('noneditable route label picks its actual node hex rather than offset ground', () => {
  const node = { pos: { q: 2, r: 3 }, index: 1, shipId: '0-2', editable: false }, ground = { q: 2, r: 4 };
  for (const mode of ['main', 'plane', 'torp', 'mine', 'move']) assert.deepEqual(pickAction({ node, hex: ground, mode, phase: 'plan' }), { type: 'hex', hex: node.pos, forceMove: false });
  const ship = { id: '1-2' };
  assert.deepEqual(pickAction({ ship, hex: ground, mode: 'main', phase: 'plan' }), { type: 'ship', ship });
});

test('camera mode reset restores both mouse and touch pan controls and metadata', () => {
  const controls = { mouseButtons: {}, touches: {} }, canvas = { dataset: {} };
  assert.equal(applyCameraMode(controls, canvas, true), true);
  assert.equal(controls.mouseButtons.LEFT, THREE.MOUSE.ROTATE); assert.equal(controls.touches.ONE, THREE.TOUCH.ROTATE); assert.equal(canvas.dataset.cameraMode, 'rotate');
  assert.equal(applyCameraMode(controls, canvas, false), false);
  assert.equal(controls.mouseButtons.LEFT, THREE.MOUSE.PAN); assert.equal(controls.touches.ONE, THREE.TOUCH.PAN); assert.equal(canvas.dataset.cameraMode, 'pan');
  assert.equal(applyCameraMode(null, null, false), false);
});
