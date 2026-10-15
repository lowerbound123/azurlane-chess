import {effectiveSpeed} from '../../shared/status.ts';
import {columnLabel} from '../map-coordinates.ts';
import {createMissionRegion} from './mission-regions.ts';
import type {Hex,XY} from '../../shared/game.ts';
import type {MapModel,MapFocusRegion} from '../../shared/render.ts';
import * as THREE from 'three';
import { oceanMaterial } from './ocean.ts';
import { islandGroups, createIsland } from './islands.ts';
import {TacticalModels} from './tactical-models.ts';
import {guardArea} from './guard.ts';
import { toCR, same,hexDist,hexToXY,type MapSize } from '../engine.ts';
import { colors, vector, line, label, ring, disposeTree } from './resources.ts';
const overlayColors:Record<string,number> = { reach: 0x235951, main: 0x6a4038, secondary: 0x4b5361, aa: 0x514069, air: 0x434166, sweep: 0x66563b, torp: 0x60543a };
// World bounds include the hex edges and coordinate labels. A task region uses
// a local view while keeping the entire board available for manual panning.
export function mapViewBounds(map:MapSize={width:19,height:15},region?:MapFocusRegion,travelCenter?:XY) {
  const full=map.width===19&&map.height===15
    ? {minX:-2,maxX:34.5,minZ:-2,maxZ:23,center:{x:15.9,y:10.5}}
    : {minX:-2,maxX:Math.sqrt(3)*(map.width-.5)+2,minZ:-2,maxZ:1.5*(map.height-1)+2,center:{x:Math.sqrt(3)*(map.width-.5)/2,y:1.5*(map.height-1)/2}};
  if(!region)return full;
  const center=travelCenter??hexToXY(region.center),radius=Math.max(1,region.radius??5);
  return {minX:Math.max(full.minX,center.x-Math.sqrt(3)*radius-2),maxX:Math.min(full.maxX,center.x+Math.sqrt(3)*radius+2),minZ:Math.max(full.minZ,center.y-1.5*radius-2),maxZ:Math.min(full.maxZ,center.y+1.5*radius+2),center};
}
export function mapCameraDistance(bounds:ReturnType<typeof mapViewBounds>){return Math.max(40,bounds.maxX-bounds.minX,bounds.maxZ-bounds.minZ);}
export class Board {
 root:THREE.Group;cells:Map<string,{g:THREE.Group;mesh:THREE.Mesh<THREE.CylinderGeometry,ReturnType<typeof oceanMaterial>>}>;plans:THREE.Group;nodes:THREE.Sprite[];signature:string;clock:{value:number};islands:THREE.Group;islandSignature:string;
 terrain=new THREE.Group();terrainSignature='';
  objectives=new THREE.Group();objectiveSignature='';

  constructor(scene:THREE.Scene,private readonly models:TacticalModels) { this.root = new THREE.Group(); scene.add(this.root); this.cells = new Map(); this.plans = new THREE.Group(); this.root.add(this.terrain,this.plans,this.objectives); this.nodes = []; this.signature = ''; this.clock = {value:0}; this.islands = new THREE.Group(); this.root.add(this.islands); this.islandSignature = '';  }
  update(model: MapModel) {
    const terrainSignature=JSON.stringify([model.map,model.cells.map(c=>c.k||`${c.q},${c.r}`)]);
    if (terrainSignature!==this.terrainSignature) {
      this.terrainSignature=terrainSignature;disposeTree(this.terrain);this.cells.clear();
      this.signature='';
      const geometry = new THREE.CylinderGeometry(1, 1, .12, 6);
      const gridPoints = Array.from({ length: 7 }, (_, i) => new THREE.Vector3(Math.cos(Math.PI / 6 + i * Math.PI / 3), .072, Math.sin(Math.PI / 6 + i * Math.PI / 3)));
      const edgeGeometry = new THREE.BufferGeometry().setFromPoints(gridPoints), edgeMaterial = new THREE.LineBasicMaterial({ color: 0x366477, transparent: true, opacity: .13 });
      for (const cell of model.cells) {
        const g = new THREE.Group(); g.position.copy(vector(cell, 0));
        const mesh = new THREE.Mesh(geometry, oceanMaterial(this.clock)); g.add(mesh); g.add(new THREE.Line(edgeGeometry, edgeMaterial));
        this.terrain.add(g); this.cells.set(cell.k || `${cell.q},${cell.r}`, { g, mesh });
        const cr = toCR(cell);
        if (cell.r === 0 || cr.c === 0) { const text = label(cell.r === 0 ? columnLabel(cr.c) : String(cell.r + 1), { width: .65, height: .34, color: '#a6c3cc' }); text.position.copy(vector(cell, .05)); if (cell.r === 0) text.position.z -= 1.3; else text.position.x -= 1.3; this.terrain.add(text); }
      }
      const bounds=mapViewBounds(model.map),legacy=!model.map||model.map.width===19&&model.map.height===15;
      const sea = new THREE.Mesh(new THREE.BoxGeometry(legacy?35.5:bounds.maxX-bounds.minX, .55, legacy?24:bounds.maxZ-bounds.minZ), oceanMaterial(this.clock, 0x287ead)); sea.position.set(legacy?16:(bounds.minX+bounds.maxX)/2, -.37, legacy?10.5:(bounds.minZ+bounds.maxZ)/2); this.terrain.add(sea);
    }
    for (const c of model.cells) {
      const entry = this.cells.get(c.k || `${c.q},${c.r}`); if (!entry) continue;
      const color = c.tutorial ? 0x8a743a : c.hovered ? 0x527681 : c.deploy ? 0x245d58 : c.overlay ? overlayColors[model.overlayType] || 0x235951 : !c.known ? 0x091723 : c.visible ? 0x2986b4 : 0x233c50;
      entry.mesh.material.uniforms.tint.value.setHex(color); entry.mesh.material.uniforms.strength.value = c.visible ? 1 : 0;
    }
    const islands = model.cells.filter(c=>c.known&&c.island);
    const islandSignature = islands.map(c=>`${c.q},${c.r}:${+!!c.visible}`).join(';');
    if (islandSignature !== this.islandSignature) { this.islandSignature = islandSignature; disposeTree(this.islands); for (const cells of islandGroups(islands)) this.islands.add(createIsland(cells)); }
    const objectiveSignature=JSON.stringify([model.domination,model.regions,model.myTeam,model.map]);
    if(objectiveSignature!==this.objectiveSignature){
      this.objectiveSignature=objectiveSignature;disposeTree(this.objectives);
      for(const region of model.regions??[])this.objectives.add(createMissionRegion(region));
      for(const point of model.domination?.points??[]){
        const group=new THREE.Group();group.userData.capturePoint=point.id;
        const color=point.contested?colors.gold:point.owner===null?0xaac5d4:point.owner===model.myTeam?colors.friendly:colors.enemy;
        // The outline comes only from public hex geometry. Unknown terrain does
        // not change it, so an objective cannot reveal islands through fog.
        const edges=new Map<string,[THREE.Vector3,THREE.Vector3]>();
        for(const cell of model.cells.filter(c=>hexDist(c,point.center)<=point.radius)){
          const center=vector(cell,.21);
          const vertices=Array.from({length:6},(_,i)=>new THREE.Vector3(center.x+Math.cos(Math.PI/6+i*Math.PI/3),.21,center.z+Math.sin(Math.PI/6+i*Math.PI/3)));
          for(let i=0;i<6;i++){
            const a=vertices[i],b=vertices[(i+1)%6];
            const key=[`${a.x.toFixed(5)},${a.z.toFixed(5)}`,`${b.x.toFixed(5)},${b.z.toFixed(5)}`].sort().join('|');
            if(edges.has(key))edges.delete(key);else edges.set(key,[a,b]);
          }
        }
        const boundary=new THREE.LineSegments(new THREE.BufferGeometry().setFromPoints([...edges.values()].flat()),new THREE.LineBasicMaterial({color,transparent:true,opacity:.9,depthWrite:false}));
        group.add(boundary,ring(vector(point.center,.22),.48,color,.22));
        const status=point.contested?'争夺中':point.progress?`${point.progress}%`:point.owner===null?'中立':point.owner===model.myTeam?'我方':'敌方';
        const tag=label(`${point.id} · ${status}`,{width:2.2,height:.48,color:`#${color.toString(16).padStart(6,'0')}`});tag.position.copy(vector(point.center,.8));group.add(tag);
        this.objectives.add(group);
      }
    }
    const signature = JSON.stringify([model.phase, model.mode, model.showPlans, model.previews, model.mainTargets, model.showRanges, model.overlayType, model.rays, model.airRange, model.mines,model.zones,model.round,model.cells.filter(c=>c.visible).map(c=>[c.q,c.r]),model.cells.filter(c=>c.tutorial).map(c=>[c.q,c.r])]);
    if (signature === this.signature) return; this.signature = signature; disposeTree(this.plans); this.nodes = [];
    for(const c of model.cells.filter(c=>c.tutorial)){this.plans.add(ring(vector(c,.23),.64,colors.gold,.07));const tag=label('目标',{width:1,height:.43,color:'#f1ce86'});tag.position.copy(vector(c,.65));this.plans.add(tag);}
    for (const mine of (model.mines || []).filter(m=>model.cells.some(c=>c.known&&c.q===m.q&&c.r===m.r))) {
      const g = new THREE.Group();g.userData.mine=true; g.position.copy(vector(mine, .26));
      g.add(this.models.create('mine'));if((mine.armedRound??0)>(model.round??0)){g.add(ring(new THREE.Vector3(),.45,0x95a3b8,.06));const tag=label('未武装',{width:.9,height:.3});tag.position.y=.6;g.add(tag);}this.plans.add(g);
    }
    const zoneCells=(at:Hex,radius:number,color:number,opacity=.17)=>{for(const c of model.cells.filter(c=>hexDist(c,at)<=radius)){const fill=new THREE.Mesh(new THREE.CircleGeometry(.94,6),new THREE.MeshBasicMaterial({color,transparent:true,opacity,side:THREE.DoubleSide,depthWrite:false}));fill.rotation.x=-Math.PI/2;fill.rotation.z=Math.PI/6;fill.position.copy(vector(c,.17));this.plans.add(fill);}};
    // Persistent smoke/radar are owned by BattleAbilities, avoiding duplicate flat overlays.
    if (model.phase !== 'plan') return;
    const trace = (a: Hex, b: Hex, color: number) => this.plans.add(line([vector(a, .19), vector(b, .19)], color));
    const target = (h: Hex, text: string, color: number, radius: number = .56) => { const at = vector(h, .2); this.plans.add(ring(at, radius, color)); if (text) { const sprite = label(text, { width: .8, height: .37, color: `#${color.toString(16).padStart(6, '0')}` }); sprite.position.copy(vector(h, .45)); this.plans.add(sprite); return sprite; } };
    if (model.showPlans) {
      for (const preview of model.previews || []) {
        const nodes = preview.nodes || []; if (nodes.length > 1) this.plans.add(line(nodes.map(n => vector(n.pos, .2)), colors.friendly, preview.selected ? 1 : .4));
        nodes.slice(1).forEach((n, i) => { const sprite = target(n.pos, String(i + 1), colors.friendly, .32); sprite!.renderOrder = 9; sprite!.userData = { type: 'node', index: i + 1, shipId: preview.ship.id, pos: { ...n.pos }, editable: !!preview.selected }; this.nodes.push(sprite!); });
        if (nodes.length > 1) { const end = label(`${preview.ship.label} · ${nodes.length - 1}/${effectiveSpeed(preview.ship,model.round)}`, { width: 2.2, height: .4 }); end.position.copy(vector(nodes.at(-1)!.pos, .85)); this.plans.add(end); }
        for (const t of preview.torps || []) { this.plans.add(line([vector(t.origin,.22),vector(t.fullEnd,.22)],colors.torpedoPlanned,.3)); trace(t.origin, t.end, colors.torpedoPlanned); target(t.origin, `鱼${t.window}`, colors.torpedoPlanned, .23); }
        for (const p of preview.planes || []) { trace(preview.ship.pos, p.target, colors.friendly); target(p.target, '航', colors.friendly); }
        if(preview.plan.smoke)zoneCells(preview.ship.pos,1,0xc4cbd2,.25);
        if(preview.plan.radar)zoneCells(preview.plan.radar,1,0x70f5ac,.25);
        if(preview.plan.escort)this.plans.add(guardArea(nodes.at(-1)!.pos,0x63b8ee,new Set(model.cells.filter(c=>c.known).map(c=>c.k||`${c.q},${c.r}`))));
        for(const k of preview.plan.mineSteps??[])if(nodes[k])target(nodes[k-1].pos,'雷',colors.gold,.5);
        if(preview.ship.cfg.main?.blast)for(const h of preview.plan.main)zoneCells(h,preview.ship.cfg.main.blast,colors.enemy,.2);
        if(preview.plan.guard)this.plans.add(guardArea(preview.ship.pos,colors.gold,new Set(model.cells.filter(c=>c.known).map(c=>c.k||`${c.q},${c.r}`))));
        if (preview.plan.sweep) target(preview.plan.sweep, '扫', colors.gold, .7);
      }
      for (const t of model.mainTargets || []) target(t.at, `×${t.count}`, colors.enemy, .7);
    }
    if (model.showRanges && model.overlayType === 'torp') for (const r of model.rays || []) {
      if(model.showPlans && model.previews.some(preview=>preview.torps.some(t=>same(t.origin,r.origin)&&same(t.fullEnd,r.fullEnd))))continue;
      const hint=new THREE.Line(new THREE.BufferGeometry().setFromPoints([vector(r.origin,.25),vector(r.fullEnd,.25)]),new THREE.LineDashedMaterial({color:colors.torpedoCandidate,dashSize:.24,gapSize:.17,transparent:true,opacity:.75,depthWrite:false}));
      hint.computeLineDistances();this.plans.add(hint);
    }
    if (model.showRanges && model.overlayType === 'air' && model.airRange) this.plans.add(ring(vector(model.airRange.origin), model.airRange.radius, colors.purple));
  }
  tick(seconds: number) { this.clock.value = seconds; }
  dispose() { disposeTree(this.root); this.root.removeFromParent(); }
}
