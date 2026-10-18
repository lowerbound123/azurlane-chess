import type {Hex,ShipType} from '../../shared/game.ts';
import * as THREE from 'three';
import { hexToXY } from '../engine.ts';
export const colors = { friendly: 0x70dfd5, enemy: 0xf39179, gold: 0xedc274, purple: 0xb7a3f1, torpedoPlanned: 0xf5b84b, torpedoCandidate: 0x55d9ff };
export const vector = (h: Hex, height: number = .12) => { const p = hexToXY(h); return new THREE.Vector3(p.x, height, p.y); };
export function disposeTree(root: THREE.Object3D) {
  const geometry = new Set<THREE.BufferGeometry>(), materials = new Set<THREE.Material>(), textures = new Set<THREE.Texture>();
  root.traverse(o=>{if(!('geometry' in o)&&!('material' in o))return;const mesh=o as THREE.Mesh; if(mesh.geometry)geometry.add(mesh.geometry);for(const material of Array.isArray(mesh.material)?mesh.material:mesh.material?[mesh.material]:[]){materials.add(material);if('map' in material&&material.map instanceof THREE.Texture)textures.add(material.map);}});
  textures.forEach(t => t.dispose()); materials.forEach(m => m.dispose()); geometry.forEach(g => g.dispose());
  root.clear();
}
export function line(points: THREE.Vector3[], color: THREE.ColorRepresentation, opacity: number = 1) {
  return new THREE.Line(new THREE.BufferGeometry().setFromPoints(points), new THREE.LineBasicMaterial({ color, transparent: true, opacity, depthWrite: false }));
}
export function ring(at: THREE.Vector3, radius: number, color: THREE.ColorRepresentation, height: number = .17) {
  const points = Array.from({ length: 49 }, (_, i) => new THREE.Vector3(at.x + Math.cos(i / 48 * Math.PI * 2) * radius, height, at.z + Math.sin(i / 48 * Math.PI * 2) * radius));
  return line(points, color);
}
export function label(text: string, { color = '#70dfd5', hp = null, selected = false, width = 2.6, height = 1.05,shipType }: {color?:string;hp?:number|null;selected?:boolean;width?:number;height?:number;shipType?:ShipType} = {}) {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');if(!ctx)throw new Error('Canvas 2D 不可用');
  const font='bold 90px system-ui, sans-serif',caption=shipType?shipType.toUpperCase()+text:text;
  ctx.font=font;
  // Keep a minimum plate, then add pixels and world width together. Never use
  // fillText's maxWidth: that condenses long names instead of resizing the frame.
  canvas.width=Math.max(512,Math.ceil(ctx.measureText(caption).width+60));canvas.height=160;
  const w=canvas.width;
  ctx.fillStyle = 'rgba(7, 24, 36, .94)'; ctx.fillRect(3, 3, w-6, 154);
  ctx.strokeStyle = selected ? '#ffe29a' : color; ctx.lineWidth = selected ? 9 : 4; ctx.strokeRect(7, 7, w-14, 146);
  ctx.fillStyle = color; ctx.font = font; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(caption, w/2, hp === null ? 80 : 65);
  if (hp !== null) { const barWidth=w-60;ctx.fillStyle = '#253b49'; ctx.fillRect(30, 117, barWidth, 13); ctx.fillStyle = color; ctx.fillRect(30, 117, barWidth * Math.max(0, Math.min(1, hp)), 13); }
  const texture = new THREE.CanvasTexture(canvas); texture.colorSpace = THREE.SRGBColorSpace;
  const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: texture, depthTest: false, transparent: true }));
  sprite.scale.set(width*w/512, height, 1); sprite.renderOrder = 8; return sprite;
}

// A true camera-facing sprite: no rectangular label plate and no impact geometry.
export function damageNumber(text: string) {
  const canvas=document.createElement('canvas');canvas.width=512;canvas.height=224;
  const ctx=canvas.getContext('2d');if(!ctx)throw new Error('Canvas 2D 不可用');ctx.textAlign='center';ctx.textBaseline='middle';
  ctx.font='900 152px "Arial Black", Impact, system-ui, sans-serif';ctx.lineJoin='round';
  const value=String(text).replace(/^[−-]/,'');
  ctx.strokeStyle='#392b29';ctx.lineWidth=21;ctx.strokeText(value,256,118,460);
  ctx.strokeStyle='#fff5d7';ctx.lineWidth=11;ctx.strokeText(value,256,118,460);
  const fill=ctx.createLinearGradient(0,40,0,180);fill.addColorStop(0,'#fff28b');fill.addColorStop(.45,'#ffb22e');fill.addColorStop(1,'#ed531c');ctx.fillStyle=fill;ctx.fillText(value,256,118,460);
  const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;
  const sprite=new THREE.Sprite(new THREE.SpriteMaterial({map:texture,transparent:true,depthTest:false,depthWrite:false}));
  sprite.scale.set(1.8,.79,1);sprite.renderOrder=20;return sprite;
}
