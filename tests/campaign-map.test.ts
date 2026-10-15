// @vitest-environment happy-dom
import {test,expect,vi} from 'vitest';
import * as E from '../src/engine.ts';
import * as P from '../src/planning.ts';
import * as THREE from 'three';
import type {MapModel} from '../shared/render.ts';
import type {TacticalModels} from '../src/scene/tactical-models.ts';
import * as Layout from '../src/scene/board.ts';
import type {Game,GameMap} from '../shared/game.ts';
import type {BattleWorkerAPI} from '../src/workers/battle-api.ts';
import {planeFixture,torpedoFixture} from './helpers/game-fixtures.ts';

const longMap:GameMap={width:13,height:72,islands:[],mines:[]};
function fixture(types:('dd'|'bb'|'cv')[]=['dd']):Game {
 const game=E.createGame([]);game.map=E.clone(longMap);game.ships=types.map((type,i)=>E.createShip(type,0,i,E.fromCR(5+i*3,60)));game.phase='plan';game.explored=[[],[]];return game;
}

test('long map bounds, enumeration and deployment follow map dimensions with legacy defaults',()=>{
 expect(E.inBounds(E.fromCR(12,71),longMap)).toBe(true);
 expect(E.inBounds(E.fromCR(13,71),longMap)).toBe(false);
 expect(E.inBounds(E.fromCR(0,72),longMap)).toBe(false);
 expect(E.inBounds(E.fromCR(18,14))).toBe(true);
 expect(E.inBounds(E.fromCR(19,14))).toBe(false);
 expect(E.allHexes(longMap)).toHaveLength(936);expect(E.allHexes()).toHaveLength(285);
 expect(E.deployment(0,longMap).map(E.toCR)).toEqual([69,70,71].flatMap(r=>[0,1,2].map(c=>({c,r}))));
 expect(E.deployment(1,longMap).map(E.toCR)).toEqual([0,1,2].flatMap(r=>[10,11,12].map(c=>({c,r}))));
});

test('long map routes and reachable cells retain distant legal water and reject narrow-map edges',()=>{
 const g=fixture(),s=g.ships[0],p={...E.emptyPlan(),moves:[{turn:0,forward:true}]};
 expect(E.route(s,p,g.map)).toHaveLength(2);
 expect(P.reachable(s,E.emptyPlan(),g.map).has(E.key(E.fromCR(6,60)))).toBe(true);
 s.pos=E.fromCR(12,60);s.xy=E.hexToXY(s.pos);
 expect(E.route(s,p,g.map)).toHaveLength(1);
 g.map.islands.push(E.key(E.fromCR(11,60)));expect(E.legal(g.map,E.fromCR(11,60))).toBe(false);
});

test('long map visibility updates after dimensions change on the same map object',()=>{
 const g=fixture();g.ships[0].pos=E.fromCR(5,14);g.ships[0].xy=E.hexToXY(g.ships[0].pos);g.map.height=15;
 expect(E.visibleCells(g,0).has(E.key(E.fromCR(5,15)))).toBe(false);
 g.map.height=72;expect(E.visibleCells(g,0).has(E.key(E.fromCR(5,15)))).toBe(true);
 g.ships[0].pos=E.fromCR(12,60);g.ships[0].xy=E.hexToXY(g.ships[0].pos);g.map.width=19;
 expect(E.visibleCells(g,0).has(E.key(E.fromCR(13,60)))).toBe(true);
 g.map.width=13;expect(E.visibleCells(g,0).has(E.key(E.fromCR(13,60)))).toBe(false);
 g.planes=[planeFixture('watcher',0,E.fromCR(5,71))];
 expect(E.visibleCells(g,0).has(E.key(E.fromCR(5,70)))).toBe(true);
 expect([...E.visibleCells(g,0)].some(k=>k.endsWith(',72'))).toBe(false);
});

test('long map weapon planning and validation use distant targets and map edges',()=>{
 const g=fixture(['bb','cv']),bb=g.ships[0],cv=g.ships[1],target=E.fromCR(6,60);
 expect(P.ranges(bb,E.emptyPlan(),g.map).main.has(E.key(target))).toBe(true);
 expect(P.ranges(cv,E.emptyPlan(),g.map).air.has(E.key(E.fromCR(8,62)))).toBe(true);
 expect(E.validPlan(g,bb,{...E.emptyPlan(),main:[target]}).main).toEqual([target]);
 expect(E.validPlan(g,cv,{...E.emptyPlan(),planes:[{mode:'point',target:E.fromCR(8,62)}]}).planes).toHaveLength(1);
 expect(E.validPlan(g,cv,{...E.emptyPlan(),planes:[{mode:'point',target:E.fromCR(13,60)}]}).planes).toHaveLength(0);
 const dd=E.createCatalogShip('cl-3',0,2,E.fromCR(11,60));
 expect(E.validPlan(g,dd,{...E.emptyPlan(),radar:E.fromCR(12,60)}).radar).toEqual(E.fromCR(12,60));
 expect(E.validPlan(g,dd,{...E.emptyPlan(),radar:E.fromCR(13,60)}).radar).toBeUndefined();
});

test('mission resolution permits empty enemy fleets and advances beyond round 30',()=>{
 const g=fixture();g.round=30;g.torpedoes=[torpedoFixture('long-torpedo',0,E.fromCR(5,50))];
 const result=E.resolveRound(g,{}, {termination:'mission'});
 expect(result.game.phase).toBe('plan');expect(result.game.winner).toBeNull();expect(result.game.round).toBe(31);
 expect(result.game.torpedoes).toHaveLength(1);
 expect(E.resolveRound(result.game,{}, {termination:'mission'}).game.round).toBe(32);
});

test('default fleet resolution keeps elimination and round-limit endings',()=>{
 const g=fixture();expect(E.resolveRound(g).game.winner).toBe(0);
 const enemy=E.createShip('dd',1,0,E.fromCR(5,10));g.ships.push(enemy);g.round=30;
 const result=E.resolveRound(g);expect(result.game.phase).toBe('ended');expect(result.game.round).toBe(30);expect(result.game.winner).toBe('draw');
});

test('task camera region fits nearby rows while complete long-map bounds include the final row',()=>{
 expect(typeof Layout.mapViewBounds).toBe('function');
 const full=Layout.mapViewBounds(longMap),local=Layout.mapViewBounds(longMap,{center:E.fromCR(6,60),radius:5});
 expect(full.minZ).toBeLessThan(0);expect(full.maxZ).toBeGreaterThan(106.5);
 expect(local.maxZ-local.minZ).toBeLessThan(25);expect(local.center.y).toBe(90);
 const bottom=Layout.mapViewBounds(longMap,{center:E.fromCR(6,71),radius:5});expect(bottom.maxZ).toBe(full.maxZ);
 expect(Layout.mapViewBounds()).toEqual({minX:-2,maxX:34.5,minZ:-2,maxZ:23,center:{x:15.9,y:10.5}});
});

test('the entire long board stays in front of the camera at both allowed orbit extremes',()=>{
 expect(typeof Layout.mapCameraDistance).toBe('function');
 const bounds=Layout.mapViewBounds(longMap),distance=Layout.mapCameraDistance(bounds);
 expect(Layout.mapCameraDistance(Layout.mapViewBounds())).toBe(40);
 for(const angle of [.15,Math.PI/2.65]){
  const camera=new THREE.OrthographicCamera(-150,150,150,-150,.1,Math.max(250,distance*3));
  const center=new THREE.Vector3(bounds.center.x,0,bounds.center.y);
  camera.position.copy(center).add(new THREE.Vector3(0,Math.cos(angle)*distance,Math.sin(angle)*distance));camera.lookAt(center);camera.updateMatrixWorld();
  for(const x of [bounds.minX,bounds.maxX])for(const z of [bounds.minZ,bounds.maxZ]){
   const projected=new THREE.Vector3(x,0,z).project(camera);expect(projected.z).toBeGreaterThan(-1);expect(projected.z).toBeLessThan(1);
  }
 }
});

vi.mock('comlink',()=>({expose:vi.fn()}));
test('local worker forwards mission resolution options so an empty enemy fleet keeps playing',async()=>{
 const {expose}=await import('comlink');await import('../src/workers/battle.worker.ts');
 const api=vi.mocked(expose).mock.calls[0][0] as BattleWorkerAPI;
 const result=await api.resolve({game:fixture(),plans:{},opponentPlans:{},resolution:{termination:'mission'}});
 expect(result.game.phase).toBe('plan');expect(result.game.round).toBe(2);expect(result.game.winner).toBeNull();
});


test('long map real weapons produce combat damage at distant rows',()=>{
 const g=fixture(['bb']),s=g.ships[0],enemy=E.createShip('dd',1,0,E.fromCR(7,60));g.ships.push(enemy);
 const result=E.resolveRound(g,{[s.id]:{...E.emptyPlan(),main:[enemy.pos]}},{termination:'mission'});
 expect(result.game.ships[1].hp).toBeLessThan(enemy.hp);expect(result.combatStats[s.id].damageDealt).toBeGreaterThan(0);
 const dd=E.createShip('dd',0,0,E.fromCR(5,60));
 expect(P.torpedoRays(dd,E.emptyPlan(),g.map,0).some(ray=>ray.cells.some(cell=>cell.r>60))).toBe(true);
});

test('board rebuilds cell geometry when switching between normal and long maps',()=>{
 const context={fillRect(){},strokeRect(){},fillText(){},measureText(text:string){return {width:text.length*90};}} as unknown as CanvasRenderingContext2D;
 const canvas=vi.spyOn(HTMLCanvasElement.prototype,'getContext').mockReturnValue(context);
 const board=new Layout.Board(new THREE.Scene(),{} as TacticalModels);
 const model=(map:GameMap):MapModel=>({map,cells:E.allHexes(map).map(h=>({...h,known:false,visible:false,island:false})),myTeam:0,ships:[],planes:[],torpedoes:[],mines:[],selected:'',phase:'plan',mode:'move',previews:[],mainTargets:[],rays:[],showPlans:false,showRanges:false,overlayType:'',busy:false,airRange:null,visuals:{}});
 try {
  board.update(model({width:19,height:15,islands:[],mines:[]}));expect(board.cells.size).toBe(285);
  board.update(model(longMap));expect(board.cells.size).toBe(936);
  expect(board.cells.get(E.key(E.fromCR(12,71)))?.g.position.z).toBe(106.5);
  const box=new THREE.Box3().setFromObject(board.root);expect(box.max.z).toBeGreaterThan(107);
  board.update(model({width:19,height:15,islands:[],mines:[]}));expect(board.cells.size).toBe(285);
  expect(board.cells.has(E.key(E.fromCR(12,71)))).toBe(false);
 } finally {board.dispose();canvas.mockRestore();}
});

test('AI search flights remain legal on a narrow long map when enemies are hidden',()=>{
 const g=fixture(['cv']),carrier=g.ships[0];
 const plans=E.planAI(g,0),p=plans[carrier.id];
 expect(p.planes).toHaveLength(carrier.cfg.carrier!.launch);
 for(const flight of p.planes)if(flight.mode!=='target')expect(E.inBounds(flight.target,g.map)).toBe(true);
 expect(E.route(carrier,p,g.map).every(n=>E.legal(g.map,n.pos))).toBe(true);
});
