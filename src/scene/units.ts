import type {MapModel,RenderShip,RenderPlane} from '../../shared/render.ts';
import type {Torpedo,XY} from '../../shared/game.ts';
interface UnitMetadata {body:THREE.Group;actor?:ShipCharacter;template?:string;caption?:THREE.Group;selection?:THREE.Line;signature?:string;card?:THREE.Sprite;lastXY?:XY;returnLabel?:THREE.Sprite;guard?:THREE.Group;guardSignature?:string}
type UnitGroup=THREE.Group&{userData:UnitMetadata};
import * as THREE from 'three';
import { CharacterLibrary, ShipCharacter } from '../characters/spine.ts';
import {TacticalModels} from './tactical-models.ts';
import {AIR_ROLE_LABELS} from '../ship-definitions.ts';
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
          const actor=new ShipCharacter(this.characters,item.template,color);actor.root.position.y=.3;g.add(actor.root);g.userData.actor=actor;g.userData.template=item.template;
          const caption=new THREE.Group();caption.position.y=.3;g.add(caption);g.userData.caption=caption;
          const selection = ring(new THREE.Vector3(), .79, colors.gold, .14); g.add(selection); g.userData.selection = selection;
        } else if (kind === 'plane') {
          const aircraft=this.models.create('aircraft');aircraft.scale.setScalar(item.cfg.role==='heavy'?1.1:item.cfg.role==='scout'?.72:.9);body.add(aircraft);if(item.cfg.role){const tag=label(AIR_ROLE_LABELS[item.cfg.role],{width:1.1,height:.3});tag.position.y=.55;g.add(tag);}
          body.add(ring(new THREE.Vector3(), .23, color, -.12));
        } else {
          const mat = new THREE.MeshStandardMaterial({ color, roughness: .4, metalness: .3, flatShading: true });
          const torp = new THREE.Mesh(new THREE.CylinderGeometry(.065, .065, .5, 6), mat); torp.rotation.z = Math.PI / 2; body.add(torp);
          const wake = new THREE.Mesh(new THREE.ConeGeometry(.11, .55, 3), new THREE.MeshBasicMaterial({ color: 0xb8dfdd, transparent: true, opacity: .48 })); wake.rotation.z = -Math.PI / 2; wake.position.x = -.48; body.add(wake);
        }
      }
      g.position.set(item.xy.x, kind === 'plane' ? 1.8 : kind === 'torpedo' ? .15 : 0, item.xy.y);
      if(kind === 'plane') {
        const previous=g.userData.lastXY;
        if(previous && Math.hypot(item.xy.x-previous.x,item.xy.y-previous.y)>1e-5)
          g.userData.body.rotation.y=-Math.atan2(item.xy.y-previous.y,item.xy.x-previous.x);
        else if(!previous || !model.busy) g.userData.body.rotation.y=-(item.angle ?? 0)*Math.PI/180;
        g.userData.lastXY={...item.xy};
      } else g.userData.body.rotation.y = -item.heading * Math.PI / 3;
      if (kind === 'ship') {
        if(g.userData.template!==item.template){
          g.userData.actor!.dispose();g.userData.actor!.root.removeFromParent();
          const actor=new ShipCharacter(this.characters,item.template,color);actor.root.position.y=.3;g.add(actor.root);g.userData.actor=actor;g.userData.template=item.template;
        }
        const guardSignature=(item.guarding||item.escorting)?model.cells.filter(c=>c.visible).map(c=>c.k||`${c.q},${c.r}`).join(';'):'';
        if(guardSignature!==g.userData.guardSignature){if(g.userData.guard){disposeTree(g.userData.guard);g.userData.guard.removeFromParent();g.userData.guard=undefined;}if(item.guarding||item.escorting){const area=guardArea(item.pos,item.escorting?0x63b8ee:color,new Set(model.cells.filter(c=>c.visible).map(c=>c.k||`${c.q},${c.r}`)));area.position.set(-item.xy.x,0,-item.xy.y);g.add(area);g.userData.guard=area;}g.userData.guardSignature=guardSignature;}
        const selected = model.selected === item.id || item.tutorial;
        g.userData.selection!.visible = !!selected;
        const signature = `${item.label}:${item.hp}:${item.cfg.hp}:${selected}`;
        if (signature !== g.userData.signature) {
          if (g.userData.card) { disposeTree(g.userData.card); g.userData.card.removeFromParent(); }
          const card = label(item.label, { color: item.team === (model.myTeam ?? 0) ? '#8eefe3' : '#ffa18c', hp: item.hp / item.cfg.hp, selected:!!selected, width: selected ? 2.6 : 2.2, height: selected ? .75 : .65 }); card.center.set(.5, 0); card.position.y = 1.65; g.userData.caption!.add(card); g.userData.card = card; g.userData.signature = signature;
        }
        const actions=(model.visuals?.actions || []).filter(a=>a.shipId===item.id);
        const active=actions.findLast(a=>a.action==='hit') || actions.at(-1);
        const last=g.userData.lastXY;
        const moving=!!model.busy && last && Math.hypot(last.x-item.xy.x,last.y-item.xy.y)>.00001;
        g.userData.actor!.setAction(active?.action || (moving?'move':'idle'),active?.id || null,active?.age || 0);
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
  tick(delta:number,camera:THREE.Camera) { for(const g of this.cache.values()){g.userData.actor?.tick(delta,camera);const propeller=g.userData.body.getObjectByName('Propeller');if(propeller)propeller.rotation.x+=delta*35;if(g.userData.guard)g.userData.guard.traverse(o=>{if(o instanceof THREE.Line)o.material.opacity=.65+.25*Math.sin(performance.now()*.004);});g.userData.caption?.quaternion.copy(camera.quaternion);if(g.userData.card)g.userData.card.position.y=g.userData.actor!.profile.labelHeight ?? 1.65;} }
  dispose() { for(const g of this.cache.values())g.userData.actor?.dispose();this.characters.dispose();disposeTree(this.root); this.root.removeFromParent(); this.cache.clear(); }
}
