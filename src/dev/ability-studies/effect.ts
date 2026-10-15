import * as T from 'three';
import {ExplosionStudy} from '../../scene/vfx/explosions.ts';
import {AbilityVisual,disposeVisual} from '../../scene/vfx/abilities.ts';
import {ABILITY_STUDIES,type AbilityKind} from './catalog.ts';
export {ABILITY_STUDIES,SHIP_EFFECT_AUDIT,type AbilityKind} from './catalog.ts';
/** Selected previews use the same visual primitives as the battle renderer. */
export class AbilityStudy{
 readonly root=new T.Group();readonly clock={value:0};readonly duration=8;
 private updates:((time:number)=>void)[]=[];
 constructor(readonly kind:AbilityKind){
  this.root.name=`AbilityStudy_${kind}`;
  const reference=new T.Mesh(new T.BoxGeometry(1.1,.16,.32),new T.MeshBasicMaterial({color:0x839fa7}));reference.position.set(-1.8,.1,0);this.root.add(reference);
  const add=(effect:AbilityVisual,x=0,z=0)=>{effect.root.position.set(x,0,z);this.root.add(effect.root);this.updates.push(t=>effect.seek(t));};
  if(kind==='smoke'||kind==='radar'){
   if(kind==='smoke')reference.position.x=0;
   for(let i=0;i<7;i++){const x=i?Math.cos((i-1)*Math.PI/3)*Math.sqrt(3):0,z=i?Math.sin((i-1)*Math.PI/3)*Math.sqrt(3):0,fx=new AbilityVisual(kind,0x8ae5b6);fx.radarOffset(x,z,2.68);add(fx,x,z);}
  }else if(kind==='escort'){const ally=reference.clone();ally.position.x=.5;this.root.add(ally);add(new AbilityVisual('escort'),.5);}
  else if(kind==='scout'){const aircraft=new T.Mesh(new T.BoxGeometry(.12,.04,.7),new T.MeshBasicMaterial({color:0xb6d9c4}));aircraft.position.y=1.8;this.root.add(aircraft);const fx=new AbilityVisual('scout');add(fx);this.updates.push(t=>{aircraft.position.x=fx.root.position.x=-1.6+t*.4;});}
  else if(kind==='fighter'){
   const positions=[new T.Vector3(-1,1.8,0),new T.Vector3(1,1.8,0)];for(const [i,pos]of positions.entries()){const aircraft=new T.Mesh(new T.BoxGeometry(.12,.04,.6),new T.MeshBasicMaterial({color:i?0xe79f88:0xa6c3d6}));aircraft.position.copy(pos);this.root.add(aircraft);}
   const bullet=new T.Mesh(new T.SphereGeometry(.055,8,6),new T.MeshBasicMaterial({color:0xffdda5}));this.root.add(bullet);this.updates.push(t=>{const p=(t-2.15)/.45;bullet.visible=p>=0&&p<1;bullet.position.copy(positions[0]).lerp(positions[1],Math.max(0,Math.min(1,p)));});
  }else{
   const fx=new ExplosionStudy('bomb');fx.root.position.set(1,0,0);fx.root.scale.setScalar(.8);this.root.add(fx.root);this.updates.push(t=>fx.seek(t-2.15));
   if(kind==='heavyShell'){const blast=new AbilityVisual('heavyShell');blast.root.position.x=1;this.root.add(blast.root);this.updates.push(t=>{blast.root.visible=t>=2.15&&t<3.45;blast.seek(t-2.15);});}
   const shell=new T.Mesh(new T.SphereGeometry(.08,8,6),new T.MeshBasicMaterial({color:kind==='heavyStrike'?0x61747e:0xffd7a0}));this.root.add(shell);this.updates.push(t=>{const p=Math.max(0,Math.min(1,(t-1)/1.15));shell.visible=t>=1&&t<2.15;shell.position.set(kind==='heavyStrike'?1:-1.8+p*2.8,kind==='heavyStrike'?1.8*(1-p*p):Math.sin(p*Math.PI)*1.6,0);});
  }
  this.seek(0);
 }
 seek(time:number){const t=Number.isFinite(time)?time:-1;this.clock.value=t;this.root.visible=t>=0&&t<this.duration;for(const update of this.updates)update(Math.max(0,t));}
 dispose(){disposeVisual(this.root);this.updates=[];}
}
