import * as THREE from 'three';
import { colors, vector, line, label, disposeTree } from './resources.js';
export class Effects {
  constructor(scene) { this.root = new THREE.Group(); scene.add(this.root); this.cache = new Map(); }
  update(visuals = {}) {
    const seen = new Set();
    for (const p of visuals.projectiles || []) {
      const key = `p:${p.id}`; seen.add(key); let g = this.cache.get(key);
      if (!g) {
        g = new THREE.Group(); const color = p.kind === 'aa' ? colors.purple : colors.gold;
        const ball = new THREE.Mesh(new THREE.SphereGeometry(p.kind === 'main' ? .12 : .07, 6, 4), new THREE.MeshBasicMaterial({ color })); g.add(ball); g.userData.ball = ball;
        const trail = line([], color); g.add(trail); g.userData.trail = trail; this.cache.set(key, g); this.root.add(g);
      }
      g.userData.ball.visible = !!p.position;
      if (p.position) g.userData.ball.position.set(p.position.x, p.position.y + .12, p.position.z);
      g.userData.trail.geometry.dispose(); g.userData.trail.geometry = new THREE.BufferGeometry().setFromPoints((p.trail || []).map(v => new THREE.Vector3(v.x, v.y + .12, v.z)));
    }
    for (const e of visuals.effects || []) {
      const key = `e:${e.id}`; seen.add(key); let g = this.cache.get(key);
      if (!g) {
        g = new THREE.Group(); g.position.copy(vector(e.at, .3));
        const burst = new THREE.Mesh(new THREE.IcosahedronGeometry(.4, 0), new THREE.MeshBasicMaterial({ color: /splash|miss/.test(e.kind) ? 0xb8ecff : 0xffbc76, transparent: true, opacity: .8, wireframe: false })); g.add(burst); g.userData.burst = burst;
        if (e.text) { const text = label(String(e.text), { color: '#ffe2b4', width: 1.5, height: .53 }); text.position.y = 1.3; g.add(text); g.userData.text = text; }
        this.cache.set(key, g); this.root.add(g);
      }
      const age = Math.max(0, Math.min(1, e.age)); g.userData.burst.scale.setScalar(.4 + age * 2.5); g.userData.burst.material.opacity = .8 * (1 - age);
      if (g.userData.text) { g.userData.text.position.y = 1.1 + age; g.userData.text.material.opacity = 1 - age; }
    }
    for (const [id, g] of this.cache) if (!seen.has(id)) { disposeTree(g); g.removeFromParent(); this.cache.delete(id); }
  }
  dispose() { disposeTree(this.root); this.root.removeFromParent(); this.cache.clear(); }
}
