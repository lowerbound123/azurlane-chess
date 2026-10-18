import {describe,it,expect} from 'vitest';
import {createHistoricalBattle,resolveHistoricalRound,HISTORICAL_BATTLES} from '../src/history/index.ts';
import {historicalEnemyPlans,historicalFriendlyPlans} from '../src/history/ai.ts';
import {allHexes,createShip,emptyPlan,fromCR,hexToXY,hexDist,key,legal,observe,route,resolveRound,visibleCells} from '../src/engine.ts';
import {planeForSlot} from '../src/ship-definitions.ts';
import {historicalWeapons} from '../src/history/weapons.ts';
import {createHistoricalStorage} from '../src/history/storage.ts';
import type {HistoricalSave} from '../shared/history.ts';

function place(save:HistoricalSave,id:string,c:number,r:number){
 const ship=save.game.ships.find(s=>s.id===id)!;ship.pos=fromCR(c,r);ship.xy=hexToXY(ship.pos);return ship;
}
function airThreat(save:HistoricalSave,returning=false){
 const enemy=save.game.ships.find(s=>s.id==='1-0')!,mother=place(save,'0-0',12,7);
 save.game.planes.push({id:'p0',kind:'plane',team:0,mother:mother.id,slot:0,hp:3,cfg:structuredClone(planeForSlot(mother.cfg,0)),xy:hexToXY(fromCR(9,7)),mode:'target',target:{...enemy.pos},targetId:enemy.id,tracking:true,state:returning?'return':'outbound',traveled:1,waypoints:[]});save.game.nextId=1;
}
describe('historical tactical behavior',()=>{
 it('Samar heavy guns support the carrier pursuit when no destroyer is an immediate threat',()=>{
  const s=createHistoricalBattle('samar'),p=historicalEnemyPlans(s.game,s.state);
  expect(p['1-0'].main[0]).toEqual(fromCR(9,4));
 });
 it('Narvik mobile harbor guard enters the port instead of stopping at a nearby contact',()=>{
  const s=createHistoricalBattle('narvik');place(s,'1-1',13,12);place(s,'0-1',13,14);
  const ship=s.game.ships.find(s=>s.id==='1-1')!,p=historicalEnemyPlans(s.game,s.state);
  const end=route(ship,p[ship.id],s.game.map).at(-1)!.pos;
  const port=HISTORICAL_BATTLES.find(x=>x.id==='narvik')!.regions.find(x=>x.id==='port')!;
  expect(port.cells.map(key)).toContain(key(end));
 });
 it('Narvik damaged fixed ambush ships keep their positions',()=>{
  const s=createHistoricalBattle('narvik'),p=historicalEnemyPlans(s.game,s.state);
  expect(p['1-0'].moves).toEqual([]);expect(p['1-2'].moves).toEqual([]);
 });
 it('Prince of Wales moves across the escape route even when already in gun range',()=>{
  const s=createHistoricalBattle('denmark-strait');place(s,'0-0',13,6);const wales=place(s,'1-1',13,8);wales.heading=3;
  const p=historicalEnemyPlans(s.game,s.state),end=route(wales,p[wales.id],s.game.map).at(-1)!.pos;
  expect(p[wales.id].moves.length).toBeGreaterThan(0);
  expect(hexDist(end,fromCR(2,12))).toBeLessThan(hexDist(wales.pos,fromCR(2,12)));
 });
 it('Spee keeps making progress toward extraction after committing to retreat',()=>{
  const s=createHistoricalBattle('river-plate');s.state.stage='retreat';const ship=s.game.ships.find(s=>s.id==='1-0')!;
  const p=historicalEnemyPlans(s.game,s.state),end=route(ship,p[ship.id],s.game.map).at(-1)!.pos;
  expect(hexDist(end,fromCR(1,15))).toBeLessThan(hexDist(ship.pos,fromCR(1,15)));
 });
 it('Midway carriers sail a coherent patrol rather than remaining anchored',()=>{
  const s=createHistoricalBattle('midway'),p=historicalEnemyPlans(s.game,s.state);
  expect(Object.values(p).filter(p=>p.moves.some(m=>m.forward))).toHaveLength(4);
  const out=resolveHistoricalRound(s.game,s.state,{});
  expect(out.events.some(e=>e.text.includes('碰撞'))).toBe(false);
 });
 it('reserves a launch slot for air defense against a visible incoming strike',()=>{
  const s=createHistoricalBattle('midway');s.game.round=5;s.state.lastResolvedRound=4;airThreat(s);
  const ship=s.game.ships.find(s=>s.id==='1-0')!,p=historicalEnemyPlans(s.game,s.state)[ship.id];
  expect(p.planes.some(o=>planeForSlot(ship.cfg,o.slot!).role==='fighter')).toBe(true);
  expect(p.planes.some(o=>planeForSlot(ship.cfg,o.slot!).damage>0)).toBe(true);
  expect(p.planes).toHaveLength(2);
 });
 it('returning aircraft alone do not trigger a defensive fighter launch',()=>{
  const s=createHistoricalBattle('midway');s.game.round=5;s.state.lastResolvedRound=4;airThreat(s,true);
  const ship=s.game.ships.find(s=>s.id==='1-0')!;ship.airReady[0]=ship.airReady[1]=20;
  expect(historicalEnemyPlans(s.game,s.state)[ship.id].planes.some(o=>planeForSlot(ship.cfg,o.slot!).role==='fighter')).toBe(false);
 });
 it('expired contact positions no longer pull surface ships toward obsolete sightings',()=>{
  const s=createHistoricalBattle('river-plate');s.game.round=12;s.state.lastResolvedRound=11;
  for(const ship of s.game.ships.filter(s=>s.team===0))place(s,ship.id,20,16);
  s.state.contacts['1:0-0']={at:fromCR(10,5),heading:0,round:1};const a=historicalEnemyPlans(s.game,s.state);
  s.state.contacts['1:0-0']={at:fromCR(1,12),heading:3,round:1};expect(historicalEnemyPlans(s.game,s.state)).toEqual(a);
 });
 it('convoy carriers conserve smoke while already covered by active smoke',()=>{
  const s=createHistoricalBattle('samar'),ship=s.game.ships.find(s=>s.id==='0-3')!;
  s.game.zones=[{kind:'smoke',team:0,center:{...ship.pos},radius:1,expires:3}];
  expect(historicalFriendlyPlans(s.game,s.state)[ship.id].smoke).not.toBe(true);
 });
 it('an exposed convoy changes its predictable bearing while continuing toward the exit',()=>{
  const s=createHistoricalBattle('samar'),ship=s.game.ships.find(s=>s.id==='0-3')!;
  const plan=historicalFriendlyPlans(s.game,s.state)[ship.id],end=route(ship,plan,s.game.map).at(-1)!.pos;
  expect(end).not.toEqual(fromCR(10,6));
  expect(end.r).toBeGreaterThan(ship.pos.r);
 });
 it('evades a visible torpedo that will reach a stationary ship later this round',()=>{
  const s=createHistoricalBattle('river-plate');s.game.round=2;s.state.lastResolvedRound=1;
  const ship=place(s,'1-0',10,8);ship.heading=0;place(s,'0-0',14,8);
  s.game.ships.filter(s=>s.id==='0-1'||s.id==='0-2').forEach(s=>s.hp=0);
  s.game.torpedoes=[{id:'t0',kind:'torpedo',team:0,owner:'0-0',xy:hexToXY({q:ship.pos.q,r:ship.pos.r-4}),heading:1,age:.1,launched:1,birth:0,armed:true,cfg:{speed:4,damage:45,life:3,reserve:2,max:2}}];s.game.nextId=1;
  expect(observe(s.game,1).torpedoes).toHaveLength(1);
  const p=historicalEnemyPlans(s.game,s.state);expect(p[ship.id].moves.some(m=>m.forward)).toBe(true);
  const out=resolveRound(s.game,p,{termination:'mission'});
  expect(out.events.some(e=>e.text.startsWith(ship.label)&&e.text.includes('鱼雷'))).toBe(false);
 });
 it('enemy orders ignore private convoy choices and the other teams contacts',()=>{
  const s=createHistoricalBattle('samar'),a=historicalEnemyPlans(s.game,s.state);
  s.state.convoyRoute='east';s.state.convoyWait=true;s.state.contacts['0:1-0']={at:fromCR(10,20),heading:3,round:1};
  expect(historicalEnemyPlans(s.game,s.state)).toEqual(a);
 });
 it('does not fire a torpedo through a friendly route crossing its future lane',()=>{
  const ship=createShip('dd',1,0,{q:5,r:5});ship.heading=0;
  const ally=createShip('cv',1,1,{q:4,r:7});ally.cfg.speed=2;ally.heading=0;
  const enemy=createShip('bb',0,0,{q:5,r:8});
  const v={round:1,map:{width:20,height:15,islands:[],mines:[]},ships:[ship,ally,enemy],torpedoes:[],planes:[]};
  const plans={[ally.id]:{...emptyPlan(),moves:[{turn:0,forward:true},{turn:0,forward:true}]}};
  const p=historicalWeapons(v,ship,emptyPlan(),{role:'ambush',range:0,targetId:enemy.id},{plans,damage:new Map(),contacts:[]});
  expect(p.torps.some(t=>t.dir===1)).toBe(false);
 });
 it('air defense does not read the hidden destination of a visible hostile plane',()=>{
  const s=createHistoricalBattle('midway');s.game.round=5;s.state.lastResolvedRound=4;airThreat(s);
  const before=historicalEnemyPlans(s.game,s.state);s.game.planes[0].target=fromCR(0,20);s.game.planes[0].targetId='1-3';
  expect(historicalEnemyPlans(s.game,s.state)).toEqual(before);
 });
 it.each(HISTORICAL_BATTLES.map(d=>d.id))('%s ignores unseen opposing position and hull truth',id=>{
  const s=createHistoricalBattle(id),v=observe(s.game,1),hidden=s.game.ships.find(t=>t.team===0&&!v.ships.some(x=>x.id===t.id))!;
  expect(hidden).toBeDefined();const a=historicalEnemyPlans(s.game,s.state),visible=visibleCells(s.game,1);
  const other=allHexes(s.game.map).find(h=>legal(s.game.map,h)&&!visible.has(key(h))&&key(h)!==key(hidden.pos))!;
  hidden.pos=other;hidden.xy=hexToXY(other);hidden.hp=1;
  expect(observe(s.game,1)).toEqual(v);expect(historicalEnemyPlans(s.game,s.state)).toEqual(a);
 });
 it.each(HISTORICAL_BATTLES.map(d=>d.id))('%s planning is pure and survives a save round trip',id=>{
  const s=createHistoricalBattle(id),before=structuredClone(s),a=historicalEnemyPlans(s.game,s.state);
  expect(s).toEqual(before);const data=new Map<string,string>();
  const store=createHistoricalStorage({getItem:k=>data.get(k)??null,setItem:(k,v)=>{data.set(k,v);}});
  expect(store.write(s)).toEqual({ok:true});const loaded=store.read(id);expect(loaded.kind).toBe('resume');
  if(loaded.kind==='resume')expect(historicalEnemyPlans(loaded.save.game,loaded.save.state)).toEqual(a);
 });
});
