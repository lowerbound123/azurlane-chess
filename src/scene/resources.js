import * as THREE from 'three';
import { hexToXY } from '../engine.js';
export const colors = { friendly: 0x70dfd5, enemy: 0xf39179, gold: 0xedc274, purple: 0xb7a3f1 };
export const vector = (h, height = .12) => { const p = hexToXY(h); return new THREE.Vector3(p.x, height, p.y); };
export function disposeTree(root) {
  const geometry = new Set(), materials = new Set(), textures = new Set();
  root.traverse(o => { if (o.geometry) geometry.add(o.geometry); for (const m of Array.isArray(o.material) ? o.material : o.material ? [o.material] : []) { materials.add(m); if (m.map) textures.add(m.map); } });
  textures.forEach(t => t.dispose()); materials.forEach(m => m.dispose()); geometry.forEach(g => g.dispose());
  root.clear();
}
export function line(points, color, opacity = 1) {
  return new THREE.Line(new THREE.BufferGeometry().setFromPoints(points), new THREE.LineBasicMaterial({ color, transparent: true, opacity, depthWrite: false }));
}
export function ring(at, radius, color, height = .17) {
  const points = Array.from({ length: 49 }, (_, i) => new THREE.Vector3(at.x + Math.cos(i / 48 * Math.PI * 2) * radius, height, at.z + Math.sin(i / 48 * Math.PI * 2) * radius));
  return line(points, color);
}
export function label(text, { color = '#70dfd5', hp = null, selected = false, width = 2.6, height = 1.05 } = {}) {
  const canvas = document.createElement('canvas'); canvas.width = 512; canvas.height = 160;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = 'rgba(7, 24, 36, .94)'; ctx.fillRect(3, 3, 506, 154);
  ctx.strokeStyle = selected ? '#ffe29a' : color; ctx.lineWidth = selected ? 9 : 4; ctx.strokeRect(7, 7, 498, 146);
  ctx.fillStyle = color; ctx.font = 'bold 90px system-ui, sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(text, 256, hp === null ? 80 : 65, 476);
  if (hp !== null) { ctx.fillStyle = '#253b49'; ctx.fillRect(30, 117, 452, 13); ctx.fillStyle = color; ctx.fillRect(30, 117, 452 * Math.max(0, Math.min(1, hp)), 13); }
  const texture = new THREE.CanvasTexture(canvas); texture.colorSpace = THREE.SRGBColorSpace;
  const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: texture, depthTest: false, transparent: true }));
  sprite.scale.set(width, height, 1); sprite.renderOrder = 8; return sprite;
}
