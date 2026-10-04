import * as THREE from 'three';
import { colors, label, disposeTree, ring } from './resources.js';
export class Units {
  constructor(scene) { this.root = new THREE.Group(); scene.add(this.root); this.cache = new Map(); this.picks = []; }
  update(model) {
    const seen = new Set(); this.picks = [];
    for (const [kind, list] of [['ship', model.ships], ['plane', model.planes], ['torpedo', model.torpedoes]]) for (const item of list || []) {
      const key = `${kind}:${item.id}`; seen.add(key); let g = this.cache.get(key);
      const color = item.team === 0 ? colors.friendly : colors.enemy;
      if (!g) {
        g = new THREE.Group(); this.root.add(g); this.cache.set(key, g);
        const mat = new THREE.MeshStandardMaterial({ color, roughness: .4, metalness: .3, flatShading: true });
        const body = new THREE.Group(); g.add(body); g.userData.body = body;
        if (kind === 'ship') {
          const hull = new THREE.Mesh(new THREE.CylinderGeometry(.53, .4, .22, 6), mat); hull.position.y = .19; body.add(hull);
          const arrow = new THREE.Mesh(new THREE.ConeGeometry(.17, .45, 3), mat); arrow.rotation.z = -Math.PI / 2; arrow.position.set(.77, .24, 0); body.add(arrow);
          const mast = new THREE.Mesh(new THREE.BoxGeometry(.055, 1.12, .055), mat); mast.position.y = .75; g.add(mast);
          const selection = ring(new THREE.Vector3(), .79, colors.gold, .14); g.add(selection); g.userData.selection = selection;
        } else if (kind === 'plane') {
          body.add(new THREE.Mesh(new THREE.BoxGeometry(.72, .13, .16), mat));
          const wing = new THREE.Mesh(new THREE.BoxGeometry(.2, .055, .85), mat); body.add(wing);
          const tail = new THREE.Mesh(new THREE.BoxGeometry(.12, .1, .35), mat); tail.position.x = -.28; body.add(tail);
        } else {
          const torp = new THREE.Mesh(new THREE.CylinderGeometry(.065, .065, .5, 6), mat); torp.rotation.z = Math.PI / 2; body.add(torp);
          const wake = new THREE.Mesh(new THREE.ConeGeometry(.11, .55, 3), new THREE.MeshBasicMaterial({ color: 0xb8dfdd, transparent: true, opacity: .48 })); wake.rotation.z = -Math.PI / 2; wake.position.x = -.48; body.add(wake);
        }
      }
      g.position.set(item.xy.x, kind === 'plane' ? 1.8 : kind === 'torpedo' ? .15 : 0, item.xy.y);
      g.userData.body.rotation.y = -(kind === 'plane' ? item.angle || 0 : (item.heading || 0) * 60) * Math.PI / 180;
      if (kind === 'ship') {
        const selected = model.selected === item.id || item.tutorial;
        g.userData.selection.visible = selected;
        const signature = `${item.label}:${item.hp}:${item.cfg.hp}:${selected}`;
        if (signature !== g.userData.signature) {
          if (g.userData.card) { disposeTree(g.userData.card); g.userData.card.removeFromParent(); }
          const card = label(item.label, { color: item.team === 0 ? '#8eefe3' : '#ffa18c', hp: item.hp / item.cfg.hp, selected, width: selected ? 3 : 2.6, height: selected ? 1.2 : 1.05 }); card.center.set(.5, 0); card.position.y = .93; g.add(card); g.userData.card = card; g.userData.signature = signature;
        }
        g.userData.card.userData = { type: 'ship', ship: item }; this.picks.push(g.userData.card);
        for (const child of g.userData.body.children) { child.userData = { type: 'ship', ship: item }; this.picks.push(child); }
      } else if (kind === 'plane') {
        const returning = item.state === 'return';
        if (returning && !g.userData.returnLabel) { const card = label('返', { width: .5, height: .3 }); card.position.y = .35; g.add(card); g.userData.returnLabel = card; }
        if (g.userData.returnLabel) g.userData.returnLabel.visible = returning;
      }
    }
    for (const [id, g] of this.cache) if (!seen.has(id)) { disposeTree(g); g.removeFromParent(); this.cache.delete(id); }
  }
  dispose() { disposeTree(this.root); this.root.removeFromParent(); this.cache.clear(); }
}
