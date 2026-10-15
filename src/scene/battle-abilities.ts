import * as THREE from 'three';
import type {MapModel} from '../../shared/render.ts';
import {hexDist,hexToXY,xyToHex,key} from '../engine.ts';
import {AbilityVisual,type AbilityVisualKind} from './vfx/abilities.ts';
/** Builds only from already-public units and cells, never from authoritative hidden state. */
export class BattleAbilities{
 readonly root=new THREE.Group();readonly cache=new Map<string,AbilityVisual>();
 constructor(scene:THREE.Scene){scene.add(this.root);}
 update(model:MapModel){
  const seen=new Set<string>(),visible=model.cells.filter(c=>c.visible),get=(id:string,kind:AbilityVisualKind,x:number,z:number,color?:number)=>{seen.add(id);let effect=this.cache.get(id);if(!effect){effect=new AbilityVisual(kind,color);this.cache.set(id,effect);this.root.add(effect.root);}effect.root.position.set(x,.09,z);return effect;};
  for(const zone of model.zones??[]){if(zone.expires<=(model.round??0)||zone.kind==='radar'&&zone.team!==model.myTeam)continue;
   for(const cell of visible.filter(c=>hexDist(c,zone.center)<=zone.radius)){
    const xy=hexToXY(cell),id=zone.kind==='smoke'?`smoke:${key(cell)}`:`radar:${key(zone.center)}:${key(cell)}`;
    const effect=get(id,zone.kind,xy.x,xy.y,0x83e9b2);
    if(zone.kind==='radar'){const center=hexToXY(zone.center);effect.radarOffset(xy.x-center.x,xy.y-center.y,Math.sqrt(3)*(zone.radius+.55));}
   }
  }
  const providers=model.ships.filter(s=>s.hp>0&&s.escorting&&s.cfg.escort);
  for(const ship of model.ships.filter(s=>s.hp>0))if(providers.some(p=>p.id!==ship.id&&p.team===ship.team&&hexDist(xyToHex(p.xy),xyToHex(ship.xy))<=p.cfg.escort!.range))get(`escort:${ship.id}`,'escort',ship.xy.x,ship.xy.y,ship.team===model.myTeam?0x75e6d0:0xf0a48b);
  for(const plane of model.planes)if(plane.hp>0&&plane.cfg.role==='scout')get(`scout:${plane.id}`,'scout',plane.xy.x,plane.xy.y,plane.team===model.myTeam?0x8adcb4:0xe5a291);
  for(const[id,fx]of this.cache)if(!seen.has(id)){fx.dispose();this.cache.delete(id);}
 }
 seek(time:number){for(const fx of this.cache.values())fx.seek(time);}
 dispose(){for(const fx of this.cache.values())fx.dispose();this.cache.clear();this.root.removeFromParent();}
}
