import * as THREE from 'three';
import {Board} from '../scene/board.ts';
import {Units} from '../scene/units.ts';
import {Effects} from '../scene/effects.ts';
import {TacticalModels} from '../scene/tactical-models.ts';
import {hexToXY} from '../engine.ts';
import {profileFor} from '../characters/config.ts';
import {shipCharacterProfile} from '../ship-art.ts';
import {buildAbilityDemo,compileAbilityDemo,sampleAbilityDemo,type CompiledAbilityDemo} from './scenarios.ts';
/** Offline adapter: the game owns all drawing; this module only fixes the camera and clocks. */
export async function createAbilityDemoRenderer(host:HTMLElement){
 const scene=new THREE.Scene();scene.add(new THREE.HemisphereLight(0xc7ebf6,0x244255,2));const sun=new THREE.DirectionalLight(0xffeedb,2.2);sun.position.set(-12,35,15);scene.add(sun);
 const renderer=new THREE.WebGLRenderer({antialias:true,alpha:false,preserveDrawingBuffer:true});renderer.setPixelRatio(1);renderer.setSize(768,676);renderer.setClearColor(0x071724);renderer.outputColorSpace=THREE.SRGBColorSpace;host.append(renderer.domElement);
 const camera=new THREE.OrthographicCamera(-12,12,10,-10,.1,250),models=await TacticalModels.load(),board=new Board(scene,models),effects=new Effects(scene);
 let units=new Units(scene,models),viewer=-1;
 let demo:CompiledAbilityDemo;
 return {
  async load(id:string){units.dispose();units=new Units(scene,models);viewer=0;demo=compileAbilityDemo(buildAbilityDemo(id));const at=hexToXY(demo.spec.focus);camera.position.set(at.x,32,at.y+24);camera.lookAt(at.x,0,at.y);camera.updateMatrixWorld();
   const half=7.8,aspect=768/676;camera.left=-half*aspect;camera.right=half*aspect;camera.top=half;camera.bottom=-half;camera.updateProjectionMatrix();
   await Promise.all(demo.spec.game.ships.map(s=>units.characters.load(profileFor(shipCharacterProfile(s)))));return {id,duration:demo.spec.duration,fps:demo.spec.fps,width:demo.spec.width,height:demo.spec.height,posterTime:demo.spec.posterTime,name:demo.spec.name,ability:demo.spec.ability,cues:demo.spec.beats.map(b=>({start:b.start,end:b.end,round:b.round+1,title:b.title,detail:b.detail,...(b.experiment?{experiment:demo.experiments[b.experiment].label}:{})}))};},
  async seekFrame(index:number){
   if(!demo)throw new Error('请先 load');if(!Number.isInteger(index)||index<0||index>=demo.spec.duration*demo.spec.fps)throw new Error('帧号越界');
   const sample=sampleAbilityDemo(demo,index/demo.spec.fps),{model}=sample;
   const previous=sampleAbilityDemo(demo,Math.max(sample.beat.start,sample.time-1/demo.spec.fps)).model;
   if(viewer!==model.myTeam){units.dispose();units=new Units(scene,models);viewer=model.myTeam;}
   board.update(model);units.update(model);effects.update(model.visuals,[...model.ships,...model.planes]);effects.abilities.update(model);
   await Promise.all([...units.cache.values()].map(u=>u.userData.actor?.ready));
   for(const s of model.ships){const actor=units.cache.get(`ship:${s.id}`)?.userData.actor;if(!actor?.mesh||actor.profile!==profileFor(shipCharacterProfile(s)))throw new Error(`角色资源未正确加载：${s.catalogId??s.id}`);
    const before=previous.ships.find(p=>p.id===s.id),moving=before&&Math.hypot(s.xy.x-before.xy.x,s.xy.y-before.xy.y)>1e-5;
    const actions=model.visuals.actions?.filter(a=>a.shipId===s.id)??[],active=actions.findLast(a=>a.action==='dead')??actions.findLast(a=>a.action==='hit')??actions.findLast(a=>a.action==='mainFire')??actions.at(-1);
    // Clear animation mixing so a backwards seek cannot inherit the later pose.
    (actor.mesh.state as typeof actor.mesh.state & {clearTracks():void}).clearTracks();(actor.mesh.skeleton as typeof actor.mesh.skeleton & {setToSetupPose():void}).setToSetupPose();actor.mesh.state.data.defaultMix=0;
    actor.setAction(active?.action??(moving?'move':'idle'),active?.id??null,active?.age??sample.time,true);actor.seek(active?.age??sample.time);
    actor.setHeading(s.heading,false);for(let step=0;step<3;step++)actor.tick(.1,camera);
   }
   for(const p of model.planes){
    const unit=units.cache.get(`plane:${p.id}`);if(!unit)continue;
    const mother=model.ships.find(s=>s.id===p.mother)??demo.spec.game.ships.find(s=>s.id===p.mother),target=p.state==='return'?mother?.xy:hexToXY(p.target);
    if(target){let dx=target.x-p.xy.x,dy=target.y-p.xy.y;if(Math.hypot(dx,dy)<1e-7&&mother){dx=p.xy.x-mother.xy.x;dy=p.xy.y-mother.xy.y;}unit.userData.body.rotation.y=-Math.atan2(dy,dx);}
   }
   units.tick(0,camera,sample.time);
   for(const unit of units.cache.values())unit.userData.guard?.traverse(object=>{if(object instanceof THREE.Line)object.material.opacity=.65+.25*Math.sin(sample.time*4);});
   if(demo.spec.id==='bb-2'){const card=units.cache.get('ship:1-1')?.userData.card;if(card)card.position.y+=.65;}
   if(demo.spec.id==='ca-1'||demo.spec.id==='ca-2'){const card=units.cache.get('ship:0-0')?.userData.card;if(card)card.position.y+=.85;}
   effects.abilities.seek(sample.time);board.tick(sample.time);renderer.render(scene,camera);return {index,time:sample.time,round:model.round,viewer:sample.beat.viewer,experiment:demo.experiments[sample.beat.experiment??'main'].label,title:sample.beat.title,detail:sample.beat.detail,stats:sample.stats};
  },
  evidence(){return {id:demo.spec.id,initial:demo.spec.game,rounds:demo.rounds.map(r=>({events:r.events,presentation:r.presentation,game:r.game,combatStats:r.combatStats})),experiments:Object.fromEntries(Object.entries(demo.experiments).map(([id,e])=>[id,{label:e.label,initial:e.game,orders:e.orders,rounds:e.rounds.map(r=>({events:r.events,presentation:r.presentation,game:r.game}))}])),beats:demo.spec.beats};},
  dispose(){effects.dispose();units.dispose();board.dispose();models.dispose();renderer.dispose();renderer.forceContextLoss();renderer.domElement.remove();}
 };
}
