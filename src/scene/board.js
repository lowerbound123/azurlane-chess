import * as THREE from 'three';
import { toCR } from '../engine.js';
import { colors, vector, line, label, ring, disposeTree } from './resources.js';
const overlayColors = { reach: 0x235951, main: 0x6a4038, secondary: 0x4b5361, aa: 0x514069, air: 0x434166, sweep: 0x66563b, torp: 0x60543a };
export class Board {
  constructor(scene) { this.root = new THREE.Group(); scene.add(this.root); this.cells = new Map(); this.plans = new THREE.Group(); this.root.add(this.plans); this.nodes = []; this.signature = ''; }
  update(model) {
    if (!this.cells.size) {
      const geometry = new THREE.CylinderGeometry(.975, .975, .12, 6);
      const gridPoints = Array.from({ length: 7 }, (_, i) => new THREE.Vector3(Math.cos(Math.PI / 6 + i * Math.PI / 3), .072, Math.sin(Math.PI / 6 + i * Math.PI / 3)));
      const edgeGeometry = new THREE.BufferGeometry().setFromPoints(gridPoints), edgeMaterial = new THREE.LineBasicMaterial({ color: 0x366477, transparent: true, opacity: .6 });
      for (const cell of model.cells) {
        const g = new THREE.Group(); g.position.copy(vector(cell, 0));
        const mesh = new THREE.Mesh(geometry, new THREE.MeshStandardMaterial({ color: 0x102434, roughness: .84 })); g.add(mesh); g.add(new THREE.Line(edgeGeometry, edgeMaterial));
        const rock = new THREE.Mesh(new THREE.ConeGeometry(.82, 1.4, 5), new THREE.MeshStandardMaterial({ color: 0x738573, flatShading: true })); rock.position.y = .7; rock.rotation.y = cell.q * .71; g.add(rock);
        this.root.add(g); this.cells.set(cell.k || `${cell.q},${cell.r}`, { g, mesh, rock });
        const cr = toCR(cell);
        if (cell.r === 0 || cr.c === 0) { const text = label(cell.r === 0 ? String.fromCharCode(65 + cr.c) : String(cell.r + 1), { width: .65, height: .34, color: '#a6c3cc' }); text.position.copy(vector(cell, .05)); if (cell.r === 0) text.position.z -= 1.3; else text.position.x -= 1.3; this.root.add(text); }
      }
      const sea = new THREE.Mesh(new THREE.BoxGeometry(35.5, .55, 24), new THREE.MeshStandardMaterial({ color: 0x0b2638, roughness: .6, metalness: .2 })); sea.position.set(16, -.37, 10.5); this.root.add(sea);
    }
    for (const c of model.cells) {
      const entry = this.cells.get(c.k || `${c.q},${c.r}`); if (!entry) continue;
      const color = c.tutorial ? 0x8a743a : c.hovered ? 0x527681 : c.deploy ? 0x245d58 : c.overlay ? overlayColors[model.overlayType] || 0x235951 : !c.known ? 0x091723 : c.visible ? 0x245970 : 0x23333f;
      entry.mesh.material.color.setHex(color); entry.rock.visible = !!(c.known && c.island); entry.rock.material.color.setHex(c.visible ? 0x9aab8d : 0x48524e);
    }
    const signature = JSON.stringify([model.phase, model.mode, model.showPlans, model.previews, model.mainTargets, model.showRanges, model.overlayType, model.rays, model.airRange, model.mines]);
    if (signature === this.signature) return; this.signature = signature; disposeTree(this.plans); this.nodes = [];
    for (const mine of model.mines || []) {
      const g = new THREE.Group(); g.position.copy(vector(mine, .26));
      const mat = new THREE.MeshStandardMaterial({ color: colors.gold, metalness: .7, roughness: .35 });
      g.add(new THREE.Mesh(new THREE.IcosahedronGeometry(.23, 0), mat));
      for (const axis of ['x', 'y', 'z']) { const rod = new THREE.Mesh(new THREE.BoxGeometry(.07, .7, .07), mat); if (axis === 'x') rod.rotation.z = Math.PI / 2; if (axis === 'z') rod.rotation.x = Math.PI / 2; g.add(rod); } this.plans.add(g);
    }
    if (model.phase !== 'plan') return;
    const trace = (a, b, color) => this.plans.add(line([vector(a, .19), vector(b, .19)], color));
    const target = (h, text, color, radius = .56) => { const at = vector(h, .2); this.plans.add(ring(at, radius, color)); if (text) { const sprite = label(text, { width: .8, height: .37, color: `#${color.toString(16).padStart(6, '0')}` }); sprite.position.copy(vector(h, .45)); this.plans.add(sprite); return sprite; } };
    if (model.showPlans) {
      for (const preview of model.previews || []) {
        const nodes = preview.nodes || []; if (nodes.length > 1) this.plans.add(line(nodes.map(n => vector(n.pos, .2)), colors.friendly, preview.selected ? 1 : .4));
        nodes.slice(1).forEach((n, i) => { const sprite = target(n.pos, String(i + 1), colors.friendly, .32); sprite.renderOrder = 9; sprite.userData = { type: 'node', index: i + 1, shipId: preview.ship.id, pos: { ...n.pos }, editable: !!preview.selected }; this.nodes.push(sprite); });
        if (nodes.length > 1) { const end = label(`${preview.ship.label} · ${nodes.length - 1}/${preview.ship.cfg.speed}`, { width: 2.2, height: .4 }); end.position.copy(vector(nodes.at(-1).pos, .85)); this.plans.add(end); }
        for (const t of preview.torps || []) { trace(t.origin, t.fullEnd, 0x796a4c); trace(t.origin, t.end, colors.gold); target(t.origin, `鱼${t.window}`, colors.gold, .23); }
        for (const p of preview.planes || []) { trace(preview.ship.pos, p.target, colors.friendly); target(p.target, '航', colors.friendly); }
        if (preview.plan.sweep) target(preview.plan.sweep, '扫', colors.gold, .7);
      }
      for (const t of model.mainTargets || []) target(t.at, `×${t.count}`, colors.enemy, .7);
    }
    if (model.showRanges && model.overlayType === 'torp') for (const r of model.rays || []) { trace(r.origin, r.fullEnd, 0x796a4c); trace(r.origin, r.roundEnd, colors.gold); }
    if (model.showRanges && model.overlayType === 'air' && model.airRange) this.plans.add(ring(vector(model.airRange.origin), model.airRange.radius, colors.purple));
  }
  dispose() { disposeTree(this.root); this.root.removeFromParent(); }
}
