import {test,expect} from 'vitest';
import * as E from '../src/engine.ts';
import * as C from '../src/campaign/index.ts';
import type {Game} from '../shared/game.ts';
import type {CampaignFixture} from '../shared/campaign.ts';
import {createCampaignStorage} from '../src/campaign/storage.ts';

const transit=(before:Game,next:CampaignFixture)=>C.buildCampaignTransit(before,next,{from:E.fromCR(6,65),to:E.fromCR(6,60)});
const visible=(frame:import('../shared/game.ts').BattleFrame,id:string)=>frame.visibleShipIdsByTeam?.[0].includes(id);

test('automatic sailing starts at the settled position and traverses water without teleporting or changing a surviving identity',()=>{
 const state=C.createCampaignState(),f=C.createCampaignFixture(state);
 const result=E.resolveRound(f.game,C.campaignReferencePlans(state,f.game),{termination:'mission'});
 const target=C.createCampaignFixture({...state,checkpoint:1}),snapshot=structuredClone(result.game),built=transit(result.game,target);
 expect(result.game).toEqual(snapshot);
 expect(built.frames[0].ships.find(s=>s.catalogId==='dd-2')?.xy).toEqual(result.game.ships[0].xy);
 expect(built.fixture.game.ships[0].id).toBe(result.game.ships[0].id);
 expect(built.frames.at(-1)?.ships.find(s=>s.id===built.fixture.selected)?.xy).toEqual(built.fixture.game.ships[0].xy);
 const moving=built.frames.map(f=>f.ships.find(s=>s.catalogId==='dd-2')!);
 expect(moving.some(s=>!E.same(s.pos,snapshot.ships[0].pos))).toBe(true);
 for(let i=1;i<moving.length;i++){
  expect(E.hexDist(moving[i-1].pos,moving[i].pos)).toBeLessThanOrEqual(1);
  expect(E.legal(snapshot.map,moving[i].pos)).toBe(true);
  expect(moving[i].catalogId).toBe('dd-2');
 }
});

test('a reinforcement is seen in existing vision before it contributes any new vision',()=>{
 const previous={...C.createCampaignState(),chapter:1,checkpoint:1},before=C.createCampaignFixture(previous).game;
 before.ships.filter(s=>s.team===1).forEach(s=>s.hp=0);
 const built=transit(before,C.createCampaignFixture({...previous,chapter:2,checkpoint:0}));
 const reinforcement=built.fixture.game.ships.find(s=>s.catalogId==='cl-2')!;
 const contact=built.frames.findIndex(f=>f.ships.some(s=>s.id===reinforcement.id));
 expect(contact).toBeGreaterThan(0);
 const first=built.frames[contact],old=built.frames[contact-1],ship=first.ships.find(s=>s.id===reinforcement.id)!;
 expect(old.visible).toContain(E.key(ship.pos));
 expect(new Set(first.visible)).toEqual(new Set(old.visible));
 expect(built.frames.slice(contact+1).some(f=>f.visible.some(cell=>!first.visible.includes(cell)))).toBe(true);
 expect(built.frames[0].explored).toEqual(before.explored[0]);
});

test('new enemy contacts travel from outside current vision through its boundary',()=>{
 const state={...C.createCampaignState(),chapter:2,checkpoint:0},before=C.createCampaignFixture(state).game;
 const built=transit(before,C.createCampaignFixture({...state,checkpoint:1}));
 for(const enemy of built.fixture.game.ships.filter(s=>s.team===1)){
  const contact=built.frames.findIndex(f=>visible(f,enemy.id));
  expect(contact).toBeGreaterThan(0);
  const prior=built.frames[contact-1],at=built.frames[contact];
  const from=prior.ships.find(s=>s.id===enemy.id)!,to=at.ships.find(s=>s.id===enemy.id)!;
  expect(from).toBeTruthy();expect(visible(prior,enemy.id)).toBe(false);
  expect(E.hexDist(from.pos,to.pos)).toBeLessThanOrEqual(1);
  expect(prior.visible).not.toContain(E.key(from.pos));
  expect(at.visible).toContain(E.key(to.pos));
 }
});

test('automatic sailing resolves crossed destinations without colliding or cutting through islands',()=>{
 const base=C.createCampaignFixture({...C.createCampaignState(),chapter:2}),before=structuredClone(base.game);
 const friends=base.game.ships.filter(s=>s.team===0);
 const a={...friends[0].pos},b={...friends[1].pos};friends[0].pos=b;friends[0].xy=E.hexToXY(b);friends[1].pos=a;friends[1].xy=E.hexToXY(a);
 const built=transit(before,base);
 for(const f of built.frames){
  const ships=f.ships.filter(s=>s.team===0);
  expect(new Set(ships.map(s=>E.key(s.pos))).size).toBe(ships.length);
  expect(ships.every(s=>E.legal(before.map,s.pos))).toBe(true);
 }
 expect(built.fixture.game.ships.map(s=>s.pos)).toEqual(base.game.ships.map(s=>s.pos));
});

test('a one-cell handoff turns in place instead of sailing a loop to regain its heading',()=>{
 const state=C.createCampaignState(),base=C.createCampaignFixture(state),ship=base.game.ships[0];
 base.game.map.islands=[];ship.pos=E.fromCR(5,50);ship.xy=E.hexToXY(ship.pos);ship.heading=3;
 const target=E.clone(base);target.game.ships[0].pos=E.add(ship.pos,0);target.game.ships[0].xy=E.hexToXY(target.game.ships[0].pos);
 const built=transit(base.game,target);let sailed=0;
 for(let i=1;i<built.frames.length;i++){
  const a=built.frames[i-1].ships.find(s=>s.id===ship.id)!,b=built.frames[i].ships.find(s=>s.id===ship.id)!;
  sailed+=Math.hypot(b.xy.x-a.xy.x,b.xy.y-a.xy.y)/Math.sqrt(3);
 }
 expect(sailed).toBeCloseTo(1,8);
 expect(built.frames.at(-1)!.ships.find(s=>s.id===ship.id)!.heading).toBe(3);
});

test('all checkpoint camera anchors progress north rather than resetting within a chapter',()=>{
 let row=Infinity;
 for(const [chapter,definition] of C.CAMPAIGN_CHAPTERS.entries())for(const checkpoint of definition.checkpoints.keys()){
  const focus=C.campaignFocus({...C.createCampaignState(),chapter,checkpoint});
  expect(focus.r,definition.checkpoints[checkpoint].id).toBeLessThan(row);row=focus.r;
 }
});

test('a leading ship clears a narrow northbound lane before the ship queued behind it',()=>{
 const base=C.createCampaignFixture({...C.createCampaignState(),chapter:2}),[rear,lead]=base.game.ships;
 const lane=new Set([50,51,52,53,54].map(r=>E.key(E.fromCR(6,r))));
 base.game.map.islands=E.allHexes(base.game.map).filter(h=>!lane.has(E.key(h))).map(E.key);
 for(const [ship,row] of [[rear,54],[lead,53]] as const){ship.pos=E.fromCR(6,row);ship.xy=E.hexToXY(ship.pos);ship.heading=5;}
 const target=E.clone(base);target.game.ships[0].pos=E.fromCR(6,51);target.game.ships[1].pos=E.fromCR(6,50);
 for(const ship of target.game.ships)ship.xy=E.hexToXY(ship.pos);
 const built=transit(base.game,target);
 for(let i=1;i<built.frames.length;i++)for(const ship of built.frames[i].ships){
  const before=built.frames[i-1].ships.find(s=>s.id===ship.id)!;
  expect(ship.xy.y).toBeLessThanOrEqual(before.xy.y+1e-8);
 }
 expect(built.fixture.game.ships.map(s=>s.pos.r)).toEqual([51,50]);
});

test('finishing smoke training late cannot reveal the next radar target before its smoke becomes active',()=>{
 let state={...C.createCampaignState(),chapter:6},game=C.createCampaignFixture(state).game;
 for(let i=0;i<15&&state.status==='playing';i++){
  const plans={...C.campaignOrders(state,game),...(i<8?{}:C.campaignReferencePlans(state,game))};
  const result=E.resolveRound(game,plans,{termination:'mission'});
  state=C.evaluateCampaignRound(state,game,plans,result);game=result.game;
 }
 expect(state.status).toBe('checkpoint-complete');expect(game.round).toBeGreaterThan(8);
 const built=transit(game,C.createCampaignFixture(C.advanceCampaign(state))),last=built.frames.at(-1)!;
 const enemy=built.fixture.game.ships.find(s=>s.team===1)!;
 expect(E.shipVisible(built.fixture.game,enemy,0)).toBe(false);
 expect(visible(last,enemy.id)).toBe(false);
 expect(last.round).toBe(built.fixture.game.round);
 expect(new Set(last.visible)).toEqual(E.visibleCells(built.fixture.game,0));
});

test('incoming torpedoes keep their ship attribution after the guard lesson fleet is remapped',()=>{
 const state={...C.createCampaignState(),chapter:7},target=C.createCampaignFixture(state);
 const built=transit(C.createCampaignFixture({...state,chapter:6,checkpoint:1}).game,target),game=built.fixture.game;
 const owner=game.ships.find(s=>s.id===game.torpedoes[0].owner);
 expect(owner).toBeTruthy();expect(owner?.team).toBe(1);
 const result=E.resolveRound(game,{...C.campaignOrders(state,game),...C.campaignReferencePlans(state,game)},{termination:'mission'});
 const ally=game.ships.find(s=>s.catalogId==='ca-1'&&s.team===0)!;
 expect(result.combatStats[ally.id].damageBySource.torpedo.taken).toBeGreaterThan(0);
 expect(result.combatStats[ally.id].damageTaken.environment).toBe(0);
 expect(result.combatStats[owner!.id].damageBySource.torpedo.dealt).toBe(result.combatStats[ally.id].damageBySource.torpedo.taken);
});

test('entering the larger aircraft sea area gradually widens the camera framing',()=>{
 const state={...C.createCampaignState(),chapter:7,checkpoint:2},before=C.createCampaignFixture(state).game;
 const built=C.buildCampaignTransit(before,C.createCampaignFixture({...state,chapter:8,checkpoint:0}),{from:C.campaignFocus(state),to:C.campaignFocus({...state,chapter:8}),fromRadius:5,toRadius:8});
 expect(built.frames[0].cameraFocus.radius).toBe(5);
 expect(built.frames.at(-1)?.cameraFocus.radius).toBe(8);
 expect(built.frames.some(f=>f.cameraFocus.radius!>5&&f.cameraFocus.radius!<8)).toBe(true);
});

test('every checkpoint remains playable after continuous sailing, with ordered reinforcement discovery and valid saves',()=>{
 let state=C.createCampaignState(),fixture=C.createCampaignFixture(state),count=0;
 const storage=createCampaignStorage({getItem:()=>null,setItem:()=>{}});
 while(state.status!=='complete'){
  const id=C.campaignCheckpoint(state).id;fixture.game.phase='plan';
  for(let round=0;round<35&&state.status==='playing';round++){
   const orders={...C.campaignOrders(state,fixture.game),...C.campaignReferencePlans(state,fixture.game)};
   const result=E.resolveRound(fixture.game,orders,{termination:state.chapter===9?'fleet':'mission'});
   state=C.evaluateCampaignRound(state,fixture.game,orders,result);fixture.game=result.game;
  }
  expect(state.status,id+': '+JSON.stringify(state.evidence)).toBe('checkpoint-complete');count++;
  const next=C.advanceCampaign(state);if(next.status==='complete')break;
  const before=fixture.game,built=C.buildCampaignTransit(before,C.createCampaignFixture(next),{from:C.campaignFocus(state),to:C.campaignFocus(next)});
  for(const ally of built.fixture.game.ships.filter(s=>s.team===0)){
   const previous=before.ships.find(s=>s.team===0&&s.catalogId===ally.catalogId);
   if(previous){
    expect(ally.id).toBe(previous.id);
    expect(ally.pos.r,id+' hands '+ally.catalogId+' back to the south').toBeLessThanOrEqual(previous.pos.r);
    continue;
   }
   const index=built.frames.findIndex(f=>f.ships.some(s=>s.id===ally.id));
   expect(index,id+' discovers '+ally.catalogId).toBeGreaterThan(0);
   const contact=built.frames[index],prior=built.frames[index-1];
   expect(prior.visible).toContain(E.key(contact.ships.find(s=>s.id===ally.id)!.pos));
   expect(new Set(contact.visible),id+' must delay reinforcement vision').toEqual(new Set(prior.visible));
  }
  for(let i=1;i<built.frames.length;i++)for(const ship of built.frames[i].ships){
   const prior=built.frames[i-1].ships.find(s=>s.id===ship.id);
   if(prior){
    expect(E.hexDist(prior.pos,ship.pos),id+' teleport '+ship.id).toBeLessThanOrEqual(1);expect(ship.catalogId).toBe(prior.catalogId);
    if(built.fixture.game.ships.some(s=>s.id===ship.id&&s.team===0)&&before.ships.some(s=>s.id===ship.id&&s.team===0))
     expect(ship.xy.y,id+' backtracks '+ship.catalogId).toBeLessThanOrEqual(prior.xy.y+1e-8);
   }
   expect(E.legal(before.map,ship.pos),id+' land '+ship.id).toBe(true);
  }
  expect(storage.write({state:next,...built.fixture}).ok,id+' saved handoff').toBe(true);
  fixture=built.fixture;state=next;
 }
 expect(count).toBe(28);
},20000);

test('automatic sailing uses normal ship speed with continuous substeps',()=>{
 const state=C.createCampaignState(),fixture=C.createCampaignFixture(state);
 const built=transit(fixture.game,C.createCampaignFixture({...state,checkpoint:1}));
 const id=fixture.selected,speed=fixture.game.ships.find(s=>s.id===id)!.cfg.speed;
 let distance=0;
 for(let i=1;i<built.frames.length;i++){
  const a=built.frames[i-1].ships.find(s=>s.id===id),b=built.frames[i].ships.find(s=>s.id===id);
  if(!a||!b)continue;
  const step=Math.hypot(a.xy.x-b.xy.x,a.xy.y-b.xy.y);distance+=step;
  expect(step).toBeLessThanOrEqual(Math.sqrt(3)*speed*.1+1e-8);
 }
 expect(distance).toBeGreaterThan(Math.sqrt(3));
});
