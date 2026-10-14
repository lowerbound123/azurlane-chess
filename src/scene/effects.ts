import type {SampledVisuals} from '../battle-visuals.ts';
import * as THREE from 'three';
import { colors, vector, line, ring, label, damageNumber, disposeTree } from './resources.ts';
export class Effects {
 root:THREE.Group;cache:Map<string,THREE.Group>;
  constructor(scene:THREE.Scene) { this.root = new THREE.Group(); scene.add(this.root); this.cache = new Map(); }
  update(visuals: Partial<SampledVisuals> = {}) {
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
    const stacks = new Map<string,number>();
    for (const e of visuals.effects || []) {
      if(e.kind.startsWith('guard')){
        const key=`g:${e.id}`;seen.add(key);let g=this.cache.get(key);
        if(!g){g=new THREE.Group();const color=e.kind==='guard-stop'?colors.gold:colors.friendly;g.add(ring(new THREE.Vector3(),.65,color,.25));const text=label(e.kind==='guard-stop'?'封锁截停':e.kind==='guard-block'?'鱼雷减伤60%':'海域封锁',{width:2.5,height:.5});text.position.y=2.5;g.add(text);this.cache.set(key,g);this.root.add(g);}
        g.position.copy(vector(e.at,0));g.scale.setScalar(1+e.age*.2);g.traverse(o=>{if(o instanceof THREE.Line||o instanceof THREE.Sprite)o.material.opacity=1-e.age*.65;});continue;
      }
      // Only damage numbers. No explosion, flash, splash or hit particle meshes.
      if (!/^[−-]?\d+$/.test(String(e.text || ''))) continue;
      const spot = `${e.at.q},${e.at.r}`, lane = stacks.get(spot) || 0; stacks.set(spot,lane+1);
      const key = `e:${e.id}`; seen.add(key); let g = this.cache.get(key);
      if (g && g.userData.value !== e.text) { disposeTree(g);g.removeFromParent();this.cache.delete(key);g=undefined; }
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
