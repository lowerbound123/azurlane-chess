import type {MapModel,RenderShip,RenderPlane} from '../../shared/render.ts';
import type {Torpedo,XY} from '../../shared/game.ts';
export interface StatusAnchor {id:string;x:number;y:number;visible:boolean}
interface UnitMetadata {statusActive?:boolean;nameTag?:THREE.Sprite;body:THREE.Group;propellers?:THREE.Object3D[];actor?:ShipCharacter;template?:string;characterProfile?:string;caption?:THREE.Group;selection?:THREE.Line;signature?:string;card?:THREE.Sprite;lastXY?:XY;returnLabel?:THREE.Sprite;guard?:THREE.Group;guardSignature?:string}
type UnitGroup=THREE.Group&{userData:UnitMetadata};
import * as THREE from 'three';
import { CharacterLibrary, ShipCharacter } from '../characters/spine.ts';
import {TacticalModels} from './tactical-models.ts';
import {AIR_ROLE_LABELS} from '../ship-definitions.ts';
import {shipCharacterProfile} from '../ship-art.ts';
import {guardArea} from './guard.ts';
import { colors, label, disposeTree, ring, line } from './resources.ts';
export class Units {
 root:THREE.Group;cache:Map<string,UnitGroup>;characters:CharacterLibrary;
  constructor(scene:THREE.Scene,private readonly models:TacticalModels) { this.root = new THREE.Group(); scene.add(this.root); this.cache = new Map(); this.characters=new CharacterLibrary(); }
  update(model:MapModel) {
    const seen = new Set();
    const entries:({kind:'ship';item:RenderShip}|{kind:'plane';item:RenderPlane}|{kind:'torpedo';item:Torpedo})[]=[...model.ships.map(item=>({kind:'ship' as const,item})),...model.planes.map(item=>({kind:'plane' as const,item})),...model.torpedoes.map(item=>({kind:'torpedo' as const,item}))];
    for(const {kind,item} of entries){
      const key = `${kind}:${item.id}`; seen.add(key); let g = this.cache.get(key);
      const color = item.team === (model.myTeam ?? 0) ? colors.friendly : colors.enemy;
      if (!g) {
        g = new THREE.Group() as UnitGroup; this.root.add(g); this.cache.set(key, g);

        const body = new THREE.Group(); g.add(body); g.userData.body = body;
        if (kind === 'ship') {
          body.add(ring(new THREE.Vector3(), .47, color, .13));
          body.add(line([new THREE.Vector3(.54,.14,-.15),new THREE.Vector3(.78,.14,0),new THREE.Vector3(.54,.14,.15)], color));
          const actor=new ShipCharacter(this.characters,item.characterProfile??shipCharacterProfile(item),color);actor.root.position.y=.3;g.add(actor.root);g.userData.actor=actor;g.userData.template=item.template;g.userData.characterProfile=item.characterProfile??shipCharacterProfile(item);
          const caption=new THREE.Group();caption.position.y=.3;g.add(caption);g.userData.caption=caption;
          const selection = ring(new THREE.Vector3(), .79, colors.gold, .14); g.add(selection); g.userData.selection = selection;
        } else if (kind === 'plane') {
          const aircraft=this.models.create('aircraft',item.cfg.role);aircraft.scale.setScalar(item.cfg.role==='scout'?.36:.45);body.add(aircraft);
          g.userData.propellers=[];aircraft.traverse(o=>{if(o.userData.animatedPropeller)g!.userData.propellers!.push(o);});
          if(item.cfg.role){const tag=label(AIR_ROLE_LABELS[item.cfg.role],{color:item.team===(model.myTeam??0)?'#70dfd5':'#f39179',width:1.1,height:.3});tag.position.y=.55;g.add(tag);g.userData.nameTag=tag;}
          body.add(ring(new THREE.Vector3(), .23, color, -.12));
        } else {
          const torp=this.models.create('torpedo');torp.scale.setScalar(.18);body.add(torp);g.userData.propellers=[];torp.traverse(o=>{if(o.userData.torpedoPropeller)g!.userData.propellers!.push(o);});
          const wake = new THREE.Mesh(new THREE.ConeGeometry(.11, .55, 3), new THREE.MeshBasicMaterial({ color: new THREE.Color(0xb8dfdd).lerp(new THREE.Color(color),.45), transparent: true, opacity: .48 })); wake.rotation.z = -Math.PI / 2; wake.position.x = -.48; body.add(wake);
        }
      }
      g.userData.statusActive=kind!=='torpedo'&&!!item.statuses?.length;
      if(kind==='plane'&&!item.cfg.role){if(g.userData.statusActive&&!g.userData.nameTag){const tag=label('飞机',{width:1.1,height:.3});tag.position.y=.55;g.add(tag);g.userData.nameTag=tag;}else if(!g.userData.statusActive&&g.userData.nameTag){disposeTree(g.userData.nameTag);g.userData.nameTag.removeFromParent();g.userData.nameTag=undefined;}}
      g.position.set(item.xy.x, kind === 'plane' ? 1.8 : kind === 'torpedo' ? .15 : 0, item.xy.y);
      if(kind === 'plane') {
        const previous=g.userData.lastXY;
        if(previous && Math.hypot(item.xy.x-previous.x,item.xy.y-previous.y)>1e-5)
          g.userData.body.rotation.y=-Math.atan2(item.xy.y-previous.y,item.xy.x-previous.x);
        else if(!previous || !model.busy) g.userData.body.rotation.y=-(item.angle ?? 0)*Math.PI/180;
        g.userData.lastXY={...item.xy};
      } else g.userData.body.rotation.y = -item.heading * Math.PI / 3;
      if (kind === 'ship') {
        if(g.userData.characterProfile!==(item.characterProfile??shipCharacterProfile(item))){
          g.userData.actor!.dispose();g.userData.actor!.root.removeFromParent();
          const actor=new ShipCharacter(this.characters,item.characterProfile??shipCharacterProfile(item),color);actor.root.position.y=.3;g.add(actor.root);g.userData.actor=actor;g.userData.template=item.template;g.userData.characterProfile=item.characterProfile??shipCharacterProfile(item);
        }
        g.userData.actor!.setHeading(item.heading,!globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches);
        const guardSignature=item.guarding?model.cells.filter(c=>c.visible).map(c=>c.k||`${c.q},${c.r}`).join(';'):'';
        if(guardSignature!==g.userData.guardSignature){if(g.userData.guard){disposeTree(g.userData.guard);g.userData.guard.removeFromParent();g.userData.guard=undefined;}if(item.guarding){const area=guardArea(item.pos,color,new Set(model.cells.filter(c=>c.visible).map(c=>c.k||`${c.q},${c.r}`)));area.position.set(-item.xy.x,0,-item.xy.y);g.add(area);g.userData.guard=area;}g.userData.guardSignature=guardSignature;}
        const selected = model.selected === item.id || item.tutorial;
        g.userData.selection!.visible = !!selected;
        const signature = `${item.template}:${item.team===(model.myTeam??0)}:${item.label}:${item.hp}:${item.cfg.hp}:${selected}`;
        if (signature !== g.userData.signature) {
          if (g.userData.card) { disposeTree(g.userData.card); g.userData.card.removeFromParent(); }
          const card = label(item.label, { color: item.team === (model.myTeam ?? 0) ? '#8eefe3' : '#ffa18c', hp: item.hp / item.cfg.hp, selected:!!selected, width: selected ? 2.6 : 2.2, height: selected ? .75 : .65,shipType:item.template }); card.center.set(.5, 0); card.position.y = 1.65; g.userData.caption!.add(card); g.userData.card = card; g.userData.signature = signature;
        }
        const actions=(model.visuals?.actions || []).filter(a=>a.shipId===item.id);
        const active=actions.findLast(a=>a.action==='dead') || actions.findLast(a=>a.action==='hit') || actions.findLast(a=>a.action==='mainFire') || actions.at(-1);
        const last=g.userData.lastXY;
        const moving=item.hp>0&&!!model.busy && last && Math.hypot(last.x-item.xy.x,last.y-item.xy.y)>.00001;
        g.userData.body.visible=item.hp>0;g.userData.caption!.visible=item.hp>0;g.userData.selection!.visible=item.hp>0&&!!selected;g.userData.statusActive=item.hp>0&&g.userData.statusActive;
        if(g.userData.guard)g.userData.guard.visible=item.hp>0;
        g.userData.actor!.setAction(item.hp<=0?'dead':active?.action || (moving?'move':'idle'),active?.id || null,active?.age || 0);
        if(active)g.userData.actor!.seek(active.age);
        g.userData.lastXY={...item.xy};
      } else if (kind === 'plane') {
        const returning = item.state === 'return';
        if (returning && !g.userData.returnLabel) { const card = label('返', { width: .5, height: .3 }); card.position.y = .35; g.add(card); g.userData.returnLabel = card; }
        if (g.userData.returnLabel) g.userData.returnLabel.visible = returning;
      }
    }
    for (const [id, g] of this.cache) if (!seen.has(id)) { g.userData.actor?.dispose(); disposeTree(g); g.removeFromParent(); this.cache.delete(id); }
  }
  tick(delta:number,camera:THREE.Camera,time?:number) { for(const g of this.cache.values()){g.userData.actor?.tick(delta,camera);for(const propeller of g.userData.propellers??[])propeller.rotation.x=time===undefined?propeller.rotation.x+delta*35*(propeller.userData.spinDirection??1):time*35*(propeller.userData.spinDirection??1);if(g.userData.guard)g.userData.guard.traverse(o=>{if(o instanceof THREE.Line)o.material.opacity=.65+.25*Math.sin(performance.now()*.004);});g.userData.caption?.quaternion.copy(camera.quaternion);if(g.userData.card)g.userData.card.position.y=g.userData.actor!.profile.labelHeight ?? 1.65;} }
  statusAnchors(camera:THREE.Camera,width:number,height:number):StatusAnchor[]{
    const result:StatusAnchor[]=[],up=new THREE.Vector3(0,1,0).applyQuaternion(camera.quaternion);
    for(const [key,g]of this.cache){if(!g.userData.statusActive)continue;const tag=g.userData.card??g.userData.nameTag;if(!tag)continue;
      const world=tag.getWorldPosition(new THREE.Vector3()),scale=tag.getWorldScale(new THREE.Vector3());world.addScaledVector(up,scale.y*(1-tag.center.y));
      const projected=world.project(camera);result.push({id:key.slice(key.indexOf(':')+1),x:(projected.x+1)*width/2,y:(1-projected.y)*height/2,visible:projected.z>=-1&&projected.z<=1&&Math.abs(projected.x)<=1&&Math.abs(projected.y)<=1});
    }return result;
  }
  dispose() { for(const g of this.cache.values())g.userData.actor?.dispose();this.characters.dispose();disposeTree(this.root); this.root.removeFromParent(); this.cache.clear(); }
}
