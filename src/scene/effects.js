import * as THREE from 'three';
import { colors, vector, line, damageNumber, disposeTree } from './resources.js';
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
    const stacks = new Map();
    for (const e of visuals.effects || []) {
      // Only damage numbers. No explosion, flash, splash or hit particle meshes.
      if (!/^[−-]?\d+$/.test(String(e.text || ''))) continue;
      const spot = `${e.at.q},${e.at.r}`, lane = stacks.get(spot) || 0; stacks.set(spot,lane+1);
      const key = `e:${e.id}`; seen.add(key); let g = this.cache.get(key);
      if (g && g.userData.value !== e.text) { disposeTree(g);g.removeFromParent();this.cache.delete(key);g=null; }
      if (!g) {
        g = new THREE.Group(); const text = damageNumber(e.text); g.add(text);g.userData.text=text;g.userData.value=e.text;
        this.cache.set(key,g);this.root.add(g);
      }
      const age = Math.max(0,Math.min(1,e.age));
      g.position.copy(vector(e.at,1.5+age*.85+lane*.46));g.position.x+=(lane%2?1:-1)*Math.min(lane,.8)*.3;
      const pop = age < .16 ? .65 + age/.16*.55 : 1.2 - Math.min(1,(age-.16)/.2)*.2;
      g.userData.text.scale.set(1.8*pop,.79*pop,1);g.userData.text.material.opacity=1-Math.max(0,(age-.65)/.35);
    }
    for (const [id, g] of this.cache) if (!seen.has(id)) { disposeTree(g); g.removeFromParent(); this.cache.delete(id); }
  }
  dispose() { disposeTree(this.root); this.root.removeFromParent(); this.cache.clear(); }
}
