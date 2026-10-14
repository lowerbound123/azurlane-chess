import type {CampaignState,CampaignFixture} from '../../shared/campaign.ts';
import type {Game,Ship,Plans,Plan,Hex,Move,RoundResult} from '../../shared/game.ts';
import * as E from '../engine.ts';
import {SHIP_DEFINITIONS as D,planeForSlot,AIRCRAFT} from '../ship-definitions.ts';
import {CAMPAIGN_CHAPTERS,campaignCheckpoint} from './content.ts';
import {campaignMap} from './map.ts';
const H=E.fromCR,empty=E.emptyPlan;
const yByChapter=[70,65,60,55,49,42,35,28,19,8];
export const RECOMMENDED_CAMPAIGN_FLEET=['dd-2','cl-3','ca-1','bb-1','cv-3'];
export function createCampaignState():CampaignState{return{version:1,chapter:0,checkpoint:0,status:'playing',completed:[],hintLevel:0,attempts:0,evidence:{}}}
function place(s:Ship,pos:Hex,heading=0){s.pos={...pos};s.xy=E.hexToXY(pos);s.heading=heading;return s}
const offset=(p:Hex,q:number,r:number):Hex=>({q:p.q+q,r:p.r+r});
function roster(state:CampaignState):string[]{
 const id=campaignCheckpoint(state).id,c=state.chapter;
 if(c===0||c===1)return['dd-2'];
 if(c<=3)return['dd-2','cl-2'];
 if(c===4)return['dd-1','cl-2'];
 if(c===5)return['dd-1','cl-2',id==='musashi'?'bb-2':id==='richelieu'?'bb-3':'bb-1'];
 if(c===6)return['dd-3','cl-3','bb-1'];
 if(c===7)return['dd-3','cl-3','bb-1',id==='escort'?'ca-2':id==='advance-salvo'?'ca-3':'ca-1'];
 return['dd-3',id==='aa'?'cl-1':'cl-3','bb-1','ca-1',id==='fighter'?'cv-2':id==='heavy'?'cv-1':'cv-3'];
}
export function createCampaignFixture(state:CampaignState,fleet?:string[]):CampaignFixture{
 const id=campaignCheckpoint(state).id,y=yByChapter[state.chapter]??70;
 const ids=state.chapter===9?(fleet??RECOMMENDED_CAMPAIGN_FLEET):roster(state);
 if(state.chapter===9&&(ids.length!==5||new Set(ids).size!==5||ids.some(k=>!D[k])||ids.filter(k=>D[k].role==='front').length!==3))throw new Error('终章编队需要五艘不同舰船：3 前排＋2 后排。');
 const g:Game={ruleset:'fleet-v1',seed:20261014,round:1,map:campaignMap(),ships:[],torpedoes:[],planes:[],nextId:0,log:[],winner:null,phase:state.chapter===9?'deploy':'plan',explored:[[],[]],zones:[]};
 const spots=[H(3,y+1),H(10,y+1),H(3,y+3),H(10,y+3),H(6,y+4)];
 ids.forEach((k,i)=>g.ships.push(E.createCatalogShip(k,0,i,spots[i])));
 const get=(k:string)=>g.ships.find(s=>s.catalogId===k&&s.team===0)!;
 const actor=g.ships[0];
 const target=(pos:Hex,hp=1,catalog='ca-1')=>{
  const s=E.createCatalogShip(catalog,1,g.ships.filter(s=>s.team===1).length,pos);
  // Dedicated unarmed training hulls: only enemy training stats change.
  delete s.cfg.secondary;delete s.cfg.main;delete s.cfg.torpedo;delete s.cfg.carrier;delete s.cfg.aa;delete s.cfg.guard;delete s.cfg.contactSweep;
  s.hp=hp;s.cfg.hp=hp;s.label=`训练靶舰（${hp} HP，无武装）`;s.torps=0;s.airReady=[];s.airHP=[];g.ships.push(s);return s;
 };
 const at=H(5,y),north=offset(at,0,-5);
 if(id==='forward')place(actor,H(7,70),5);
 if(id==='turn')place(actor,H(6,70),0);
 if(id==='exit')place(actor,H(7,70),0);
 if(id==='secondary'){place(actor,H(5,66),5);target(H(9,64));}
 if(id==='memory'){place(actor,H(3,63),0);place(target(H(8,62)),H(8,62),1);}
 if(id==='rendezvous'){place(actor,H(4,61),5);place(get('cl-2'),H(8,61),5);}
 if(id==='split'){place(get('cl-2'),at);target(offset(at,2,0),D['cl-2'].secondary!.damage);target(offset(at,0,-2),D['cl-2'].secondary!.damage);place(actor,H(1,y+2));}
 if(id.startsWith('torpedo-')){
  place(actor,id==='torpedo-persist'?H(2,y):H(5,y),5);place(get('cl-2'),H(1,y+2));const a=actor.pos;
  if(id==='torpedo-start')target(offset(a,3,0),D['dd-2'].torpedo!.damage);
  if(id==='torpedo-node'){const end=E.add(a,5);place(target(offset(end,3,-1),D['dd-2'].torpedo!.damage),offset(end,3,-1),1)}
  if(id==='torpedo-spread'){target(offset(a,3,0),D['dd-2'].torpedo!.damage);target(offset(a,0,-3),D['dd-2'].torpedo!.damage)}
  if(id==='torpedo-persist')target(offset(a,7,0),D['dd-2'].torpedo!.damage);
 }
 if(id==='contact-sweep'){place(actor,at);g.map.mines=[E.add(at,0)];}
 if(id==='remote-sweep'){place(get('cl-2'),at);g.map.mines=[offset(at,2,0)];}
 if(id==='lay-mine'){place(actor,at,0);place(get('cl-2'),H(11,y+2));place(target(offset(at,-3,0),D['dd-1'].minelayer!.damage),offset(at,-3,0),0);}
 if(id==='north-carolina'){
  place(get('bb-1'),at);target(north,D['bb-1'].main!.damage);target(offset(at,3,-5),D['bb-1'].main!.damage*D['bb-1'].main!.shots);
 }
 if(id==='musashi'){place(get('bb-2'),at);const cfg=D['bb-2'].main!;target(north,cfg.damage*cfg.centerMultiplier!);target(offset(north,1,0),cfg.damage);target(offset(north,0,-1),cfg.damage);}
 if(id==='richelieu'){place(get('bb-3'),at);place(target(north,D['bb-3'].main!.damage*4),north,0);}
 if(id==='smoke'){place(actor,at);target(offset(at,3,0),120);}
 if(id==='radar'){place(get('cl-3'),at);place(get('bb-1'),offset(at,0,2));const enemy=target(offset(at,4,0),D['bb-1'].main!.damage);g.zones=[{kind:'smoke',team:1,center:{...enemy.pos},radius:1,expires:8}];}
 if(id==='guard'){
  const a=place(get('ca-1'),at);const mover=place(target(offset(at,-3,0),200),offset(at,-3,0),0);
  const battery=target(offset(at,0,-5),200,'bb-1');battery.cfg.main=structuredClone(D['bb-3'].main);battery.label=`训练炮台（200 HP，主炮单发 ${battery.cfg.main!.damage}）`;
  g.torpedoes=[{id:'incoming-torpedo',kind:'torpedo',team:1,owner:mover.id,xy:E.hexToXY(offset(at,3,0)),heading:3,age:0,launched:0,birth:0,armed:true,cfg:structuredClone(D['dd-2'].torpedo!)}];
 }
 if(id==='escort'){
  place(get('ca-2'),at);place(get('bb-1'),E.add(at,0));const battery=target(offset(at,0,-5),200,'bb-1');battery.cfg.main=structuredClone(D['bb-3'].main);battery.label=`训练炮台（200 HP，主炮单发 ${battery.cfg.main!.damage}）`;
 }
 if(id==='advance-salvo'){place(get('ca-3'),H(3,y));place(get('cl-3'),H(1,y+2));target(H(8,y),D['ca-3'].secondary!.damage*2);}
 if(['scout','bomber','heavy','fighter','aa'].includes(id)){
  const carrier=g.ships.find(s=>s.team===0&&s.cfg.carrier)!;place(carrier,H(6,y+2),3);
  // Support hulls stay south of the flight corridor.
  place(actor,H(1,y+4));place(g.ships[1],H(11,y+4));place(get('bb-1'),H(2,y+3));place(get('ca-1'),H(10,y+3));
  if(id==='scout')target(offset(carrier.pos,0,-8),100);
  if(id==='bomber'||id==='heavy')target(offset(carrier.pos,0,-5),id==='heavy'?AIRCRAFT.heavy.damage:AIRCRAFT.bomber.damage);
  if(id==='aa'||id==='fighter'){
   if(id==='aa')place(get('cl-1'),offset(carrier.pos,0,-4));
   const enemy=target(offset(carrier.pos,0,-9),200,'cv-1');enemy.cfg.carrier={...structuredClone(D['cv-3'].carrier!),slots:[structuredClone(AIRCRAFT.bomber)],stock:1};enemy.airReady=[1];enemy.airHP=[AIRCRAFT.bomber.hp];enemy.label='训练航母（200 HP，仅一架普通轰炸机）';
  }
 }
 if(id==='final'){
  g.ships.forEach((s,i)=>place(s,H(2+i*2,8+(i>2?2:0)),5));
  ['dd-2','cl-3','ca-1','bb-1','cv-3'].forEach((k,i)=>{const s=E.createCatalogShip(k,1,i,H(2+i*2,i>2?0:4));s.hp=Math.round(s.cfg.hp*.6);s.label+=`（训练耐久 ${s.hp}）`;g.ships.push(s)});
 }
 E.updateExploration(g);
 return{game:g,plans:{},selected:(id==='split'||id==='remote-sweep')?get('cl-2').id:state.chapter===5?g.ships.find(s=>s.team===0&&s.cfg.main)!.id:state.chapter===7?g.ships.find(s=>s.team===0&&s.template==='ca')!.id:state.chapter===8?g.ships.find(s=>s.team===0&&s.cfg.carrier)!.id:actor.id};
}

/** A heading-aware route, avoiding friendly hulls; chooses a best partial route if distant. */
function navigate(game:Game,s:Ship,goal:Hex):Move[]{
 const blocked=new Set(game.ships.filter(a=>a.id!==s.id&&E.alive(a)).map(a=>E.key(a.pos)));
 type Node={pos:Hex;heading:number;moves:Move[]};
 const queue:Node[]=[{pos:s.pos,heading:s.heading,moves:[]}],seen=new Set<string>();let best=queue[0];
 for(let i=0;i<queue.length;i++){
  const a=queue[i];if(E.hexDist(a.pos,goal)<E.hexDist(best.pos,goal))best=a;
  if(E.same(a.pos,goal))return a.moves;if(a.moves.length>=s.cfg.speed)continue;
  for(const turn of[0,-1,1])for(const forward of[true,false]){
   const heading=E.mod(a.heading+turn),pos=forward?E.add(a.pos,heading):a.pos,k=`${E.key(pos)}:${heading}`;
   if(!E.legal(game.map,pos)||blocked.has(E.key(pos))||seen.has(k))continue;seen.add(k);queue.push({pos,heading,moves:[...a.moves,{turn,forward}]});
  }
 }
 return best.moves;
}
export function campaignOrders(state:CampaignState,game:Game):Plans{
 if(state.chapter===9){
  const view=E.observe(game,1),plans=E.planAI(view,1);
  // The blockade holds its defensive stations, making decisions only from its own contact picture.
  for(const s of view.ships.filter(s=>s.team===1)){plans[s.id].moves=[];plans[s.id].torps=plans[s.id].torps.filter(t=>t.window===0);}
  return plans;
 }
 const id=campaignCheckpoint(state).id,enemies=game.ships.filter(s=>s.team===1&&E.alive(s)),plans:Plans={};
 for(const s of enemies)plans[s.id]=empty();
 const first=enemies[0];if(!first)return plans;
 if(id==='memory'&&game.round===1)plans[first.id].moves=[{turn:0,forward:true},{turn:0,forward:true}];
 if(id==='torpedo-node'&&game.round===1)plans[first.id].moves=[{turn:0,forward:true}];
 if(id==='lay-mine'&&game.round>=2)plans[first.id].moves=Array.from({length:3},()=>({turn:0,forward:true}));
 if(id==='richelieu')plans[first.id].moves=[{turn:0,forward:true}];
 if(id==='guard'){
  plans[first.id].moves=Array.from({length:3},()=>({turn:0,forward:true}));
  const battery=enemies.find(s=>s.cfg.main),victim=game.ships.find(s=>s.catalogId==='ca-1'&&s.team===0)!;
  if(battery&&game.round===1)plans[battery.id].main=[{...victim.pos}];
 }
 if(id==='escort'&&game.round===1){const victim=game.ships.find(s=>s.team===0&&s.catalogId==='bb-1')!;plans[first.id].main=[{...victim.pos}];}
 if((id==='aa'||id==='fighter')&&game.round===1){const carrier=game.ships.find(s=>s.team===0&&s.cfg.carrier)!;plans[first.id].planes=[{mode:'point',target:{...carrier.pos},slot:0}];}
 return plans;
}
export function campaignReferencePlans(state:CampaignState,game:Game):Plans{
 if(state.chapter===9)return E.planAI(E.observe(game,0),0);
 const id=campaignCheckpoint(state).id,plans:Plans={};for(const s of game.ships.filter(s=>s.team===0&&E.alive(s)))plans[s.id]=empty();
 const friends=game.ships.filter(s=>s.team===0),actor=friends[0],enemies=game.ships.filter(s=>s.team===1&&E.alive(s)),first=enemies[0];
 const by=(k:string)=>friends.find(s=>s.catalogId===k)!,p=(s:Ship)=>plans[s.id];
 if(['forward','turn','exit'].includes(id))p(actor).moves=navigate(game,actor,id==='forward'?H(7,69):id==='turn'?H(7,68):H(6,68));
 if(id==='secondary'||id==='memory'){
  if(id==='memory'&&game.round===1)return plans;
  if(first){const visible=E.observe(game,0).ships.find(s=>s.id===first.id);p(actor).moves=navigate(game,actor,visible?.pos??H(9,65));}
 }
 if(id==='rendezvous'){p(actor).moves=navigate(game,actor,H(4,59));p(by('cl-2')).moves=navigate(game,by('cl-2'),H(8,59));}
 if(id==='torpedo-start'&&!game.torpedoes.some(t=>t.team===0)&&actor.torps>0)p(actor).torps=[{window:0,dir:0}];
 if(id==='torpedo-node'&&!game.torpedoes.some(t=>t.team===0)&&actor.torps>0){p(actor).moves=[{turn:0,forward:true}];p(actor).torps=[{window:1,dir:0}];}
 if(id==='torpedo-spread'&&!game.torpedoes.some(t=>t.team===0)&&actor.torps>=2)p(actor).torps=[{window:0,dir:0},{window:0,dir:4}];
 if(id==='torpedo-persist'&&!game.torpedoes.some(t=>t.team===0)&&actor.torps>0)p(actor).torps=[{window:0,dir:0}];
 if(id==='contact-sweep')p(actor).moves=[{turn:0,forward:true}];
 if(id==='remote-sweep')p(by('cl-2')).sweep=game.map.mines[0]??null;
 if(id==='lay-mine'&&game.round===1){p(actor).moves=[{turn:0,forward:true},{turn:0,forward:true}];p(actor).mineSteps=[1];}
 if(id==='north-carolina'&&first){const s=by('bb-1');if(s.mainReady<=game.round)p(s).main=Array.from({length:state.evidence.firstShot?s.cfg.main!.shots:1},()=>({...first.pos}));}
 if(id==='musashi'&&first){const s=by('bb-2');p(s).main=[{...first.pos}];}
 if(id==='richelieu'&&first){const s=by('bb-3');p(s).main=Array.from({length:s.cfg.main!.shots},()=>E.add(first.pos,first.heading));}
 if(id==='smoke'&&!state.evidence.hidden)p(actor).smoke=true;
 if(id==='radar'&&first){if(!state.evidence.revealedRound)p(by('cl-3')).radar={...first.pos};else p(by('bb-1')).main=[{...first.pos}];}
 if(id==='guard')p(by('ca-1')).guard=true;
 if(id==='escort')p(by('ca-2')).escort=true;
 if(id==='advance-salvo')p(by('ca-3')).moves=[{turn:0,forward:true},{turn:0,forward:true}];
 if(['scout','bomber','heavy','fighter'].includes(id)){
  const s=friends.find(s=>s.cfg.carrier)!;
  if(first&&!state.evidence.recovered&&!game.planes.some(p=>p.mother===s.id)){const slot=id==='bomber'?2:0;p(s).planes=[{mode:id==='fighter'?'patrol':'point',target:id==='fighter'?offset(s.pos,0,-4):{...first.pos},slot}];}
  if(id==='scout'&&!state.evidence.carrierMoved&&game.planes.some(p=>p.mother===s.id))p(s).moves=[{turn:0,forward:true}];
 }
 return plans;
}

export function evaluateCampaignRound(state:CampaignState,before:Game,submitted:Plans,result:RoundResult):CampaignState{
 if(state.status!=='playing')return state;
 const next:CampaignState={...state,evidence:{...state.evidence},attempts:state.attempts+1},ev=next.evidence,g=result.game,id=campaignCheckpoint(state).id;
 const allies=g.ships.filter(s=>s.team===0),enemies=g.ships.filter(s=>s.team===1),actor=allies[0];
 const source=(s:Ship|undefined,type:string)=>s?(result.combatStats[s.id]?.damageBySource[type]?.dealt??0):0;
 const by=(k:string)=>allies.find(s=>s.catalogId===k),old=(s:Ship)=>before.ships.find(a=>a.id===s.id)!;
 const add=(k:string,n:number)=>{ev[k]=Number(ev[k]??0)+n};
 let passed=false;
 if(id==='forward'||id==='turn'||id==='exit')passed=E.same(actor.pos,id==='forward'?H(7,69):id==='turn'?H(7,68):H(6,68));
 if(id==='secondary')passed=source(actor,'secondary')>0&&enemies.every(s=>!E.alive(s));
 if(id==='memory'){
  const t=enemies[0],previous=before.ships.find(s=>s.id===t.id)!;
  if(E.shipVisible(before,previous,0))ev.seen=true;
  if(ev.seen&&!E.shipVisible(g,t,0)&&E.alive(t)&&g.explored[0].length>=before.explored[0].length)ev.lost=true;
  passed=!!ev.lost&&source(actor,'secondary')>0&&!E.alive(t);
 }
 if(id==='rendezvous')passed=E.same(actor.pos,H(4,59))&&E.same(by('cl-2')!.pos,H(8,59))&&allies.every(s=>s.hp===s.cfg.hp);
 if(id==='split')passed=(result.combatStats[by('cl-2')!.id]?.shipsSunk??0)>=2&&source(by('cl-2'),'secondary')>=D['cl-2'].secondary!.damage*2;
 if(id.startsWith('torpedo-')){
  add('torpedoDamage',source(actor,'torpedo'));if(before.torpedoes.some(t=>t.team===0)&&source(actor,'torpedo')>0)ev.carriedHit=true;
  const fired=old(actor).torps-actor.torps;
  if(fired>0&&E.validPlan(before,old(actor),submitted[actor.id]).torps.some(t=>t.window>0))ev.nodeLaunch=true;
  if(fired>=2&&E.validPlan(before,old(actor),submitted[actor.id]).torps.some((t,i,a)=>a.some((b,j)=>i!==j&&b.window===t.window&&b.dir!==t.dir)))ev.spreadLaunch=true;
  passed=Number(ev.torpedoDamage)>=enemies.reduce((n,s)=>n+s.cfg.hp,0)&&enemies.every(s=>!E.alive(s))&&(id!=='torpedo-node'||!!ev.nodeLaunch)&&(id!=='torpedo-spread'||!!ev.spreadLaunch)&&(id!=='torpedo-persist'||!!ev.carriedHit)&&allies.every(s=>s.hp===s.cfg.hp);
 }
 if(id==='contact-sweep')passed=actor.hp===old(actor).hp&&before.map.mines.some(m=>
  !g.map.mines.some(n=>E.same(m,n))&&
  !before.ships.some(s=>{const sweep=E.validPlan(before,s,submitted[s.id]).sweep;return sweep&&E.same(sweep,m)})&&
  result.frames.some(frame=>frame.ships.some(s=>s.id===actor.id&&E.same(s.pos,m))));
 if(id==='remote-sweep')passed=before.map.mines.length>g.map.mines.length&&!!E.validPlan(before,old(by('cl-2')!),submitted[by('cl-2')!.id]).sweep&&source(by('cl-2'),'secondary')===0;
 if(id==='lay-mine'){
  if(g.map.mines.some(m=>m.sourceId===actor.id&&m.armedRound===before.round+1))ev.unarmed=true;
  const armed=before.map.mines.filter(m=>m.sourceId===actor.id&&(m.armedRound??0)<=before.round);
  // Engine records structured ownership and damage totals; mine damage currently has no per-type stat bucket.
  if(armed.some(m=>!g.map.mines.some(n=>E.same(m,n)))&&(result.combatStats[actor.id]?.damageDealt??0)>source(actor,'secondary'))ev.mineHit=true;
  passed=!!ev.unarmed&&!!ev.mineHit;
 }
 if(id==='north-carolina'){
  const s=by('bb-1')!,damage=source(s,'main');
  if(damage>0){if(!ev.firstShot&&E.validPlan(before,old(s),submitted[s.id]).main.length===1&&!E.alive(enemies[0]))ev.firstShot=true;else if(ev.firstShot&&damage>=s.cfg.main!.damage*s.cfg.main!.shots)ev.stacked=true;}
  if(old(s).mainReady>before.round&&ev.firstShot)ev.reload=true;
  passed=!!ev.firstShot&&!!ev.reload&&!!ev.stacked&&enemies.every(s=>!E.alive(s));
 }
 if(id==='musashi')passed=source(by('bb-2'),'main')>=D['bb-2'].main!.damage*(D['bb-2'].main!.centerMultiplier!+2)&&enemies.every(s=>!E.alive(s))&&allies.every(s=>s.hp===s.cfg.hp);
 if(id==='richelieu'){if(source(by('bb-3'),'main')>0){if(Number(ev.lastHitRound)===before.round-1)ev.consecutive=true;ev.lastHitRound=before.round;}passed=!!ev.consecutive&&enemies.every(s=>!E.alive(s));}
 if(id==='smoke'){
  if(result.frames.some(f=>f.zones?.some(z=>z.kind==='smoke'&&z.team===0)&&!f.visibleShipIdsByTeam?.[1].includes(actor.id)))ev.hidden=true;
  if(ev.hidden&&!E.activeZones(g).some(z=>z.kind==='smoke'&&z.team===0))ev.expired=true;
  passed=!!ev.hidden&&!!ev.expired&&E.alive(actor);
 }
 if(id==='radar'){
  const t=enemies[0],s=by('cl-3')!;
  if(!E.shipVisible(before,before.ships.find(a=>a.id===t.id)!,0)&&E.shipVisible(g,t,0)&&s.radarLeft!<old(s).radarLeft!)ev.revealedRound=before.round;
  passed=Number(ev.revealedRound)<before.round&&source(by('bb-1'),'main')>0&&enemies.every(s=>!E.alive(s));
 }
 if(id==='guard'){
  const s=by('ca-1')!,taken=result.combatStats[s.id]?.damageBySource;
  if(taken?.torpedo.taken===Math.round(D['dd-2'].torpedo!.damage*(1-s.cfg.guard!.torpedoReduction)))ev.torpedoReduced=true;
  if(taken?.main.taken===Math.round(D['bb-3'].main!.damage*(1-s.cfg.guard!.gunReduction!)))ev.gunReduced=true;
  if(result.presentation.some(e=>e.type==='effect'&&e.kind==='guard-stop'))ev.stopped=true;
  passed=!!ev.torpedoReduced&&!!ev.gunReduced&&!!ev.stopped;
 }
 if(id==='escort'){
  const s=by('ca-2')!,protectedShip=by('bb-1')!;
  passed=!!E.validPlan(before,old(s),submitted[s.id]).escort&&E.hexDist(s.pos,protectedShip.pos)<=s.cfg.escort!.range&&result.combatStats[protectedShip.id]?.damageBySource.main.taken===Math.round(D['bb-3'].main!.damage*(1-s.cfg.escort!.reduction));
 }
 if(id==='advance-salvo')passed=source(by('ca-3'),'secondary')===D['ca-3'].secondary!.damage*2&&enemies.every(s=>!E.alive(s));
 if(['scout','bomber','heavy','fighter','aa'].includes(id)){
  const s=allies.find(s=>s.cfg.carrier)!;
  const slots=s.airReady.map((_,slot)=>slot).filter(slot=>planeForSlot(s.cfg,slot).role===id);
  for(const slot of slots){
   if(old(s).airReady[slot]!==s.airReady[slot]&&s.airReady[slot]===Infinity)ev.launched=true;
   // A short flight can return during the launch round. Readiness advances only after real recovery.
   if(s.airReady[slot]>1&&s.airReady[slot]!==Infinity&&s.destroyedPlanes===old(s).destroyedPlanes){ev.recovered=true;ev[`recoveredSlot${slot}`]=true;}
  }
  const rearmed=slots.some(slot=>ev[`recoveredSlot${slot}`]&&s.airReady[slot]<=g.round);
  if(before.planes.some(p=>p.mother===s.id)&&!E.same(old(s).pos,s.pos))ev.carrierMoved=true;
  if(result.frames.some(f=>f.planes.some(p=>p.team===0&&p.cfg.role==='scout')&&f.visibleShipIdsByTeam?.[0].includes(enemies[0]?.id)))ev.scouted=true;
  if(source(s,'air')>0)ev.bombed=true;
  if(id==='scout')passed=!!ev.scouted&&!!ev.carrierMoved&&!!ev.recovered&&rearmed;
  if(id==='bomber'||id==='heavy')passed=!!ev.bombed&&!!ev.recovered&&rearmed;
  if(id==='fighter')passed=(result.combatStats[s.id]?.planesShotDown??0)>0;
  if(id==='aa')passed=(result.combatStats[by('cl-1')!.id]?.planesShotDown??0)>0;
 }
 if(id==='final')passed=g.winner===0&&enemies.every(s=>!E.alive(s));
 if(passed){next.status='checkpoint-complete';next.completed=[...new Set([...state.completed,id])];next.feedback=id==='final'?`封锁线已突破。存活 ${allies.filter(E.alive).length} 艘；本轮造成 ${Math.round(allies.reduce((n,s)=>n+(result.combatStats[s.id]?.damageDealt??0),0))} 伤害。正式对局全灭或第 30 回合结束，依次比较存活舰数、总耐久。`:'检查点完成。继续航行将进入下一整备点，清理本段遗留武器并补给。';return next;}
 const fail=(why:string)=>{next.status='failed';next.feedback=`${why}。请重试当前检查点，恢复本段舰船、资源与任务目标。`;return next};
 if(state.chapter<9&&allies.some(s=>!E.alive(s)))return fail('必要友舰已经沉没');
 if(id.startsWith('torpedo-')&&actor.torps===0&&!g.torpedoes.some(t=>t.team===0))return fail('所需鱼雷弹药耗尽');
 if(['secondary','memory','split','torpedo-start','torpedo-node','torpedo-spread','torpedo-persist','north-carolina','musashi','richelieu','radar','advance-salvo','scout'].includes(id)&&enemies.length&&enemies.every(s=>!E.alive(s)))return fail('关键目标被其他方式击沉，尚未取得所需机制证据');
 if(id==='north-carolina'&&!ev.firstShot&&!E.alive(enemies[0]))return fail('单发练习目标未由一次单发主炮击沉');
 if(id==='lay-mine'&&!ev.mineHit&&enemies.every(s=>!E.alive(s)))return fail('追兵未触雷便已沉没');
 if(['scout','bomber','heavy','fighter'].includes(id)&&allies.find(s=>s.cfg.carrier)!.destroyedPlanes>0)return fail('本次练习需要的飞机已损失');
 if(id==='smoke'&&!ev.hidden&&actor.smokeLeft===0)return fail('烟幕次数耗尽，尚未成功掩护');
 if(id==='radar'&&!ev.revealedRound&&by('cl-3')!.radarLeft===0)return fail('雷达次数耗尽，尚未取得接触');
 if(id==='lay-mine'&&!ev.unarmed&&actor.minesLeft===0&&!g.map.mines.some(m=>m.sourceId===actor.id))return fail('布雷库存耗尽');
 if((id==='bomber'||id==='heavy')&&!ev.bombed&&enemies.every(s=>!E.alive(s)))return fail('航空目标被其他武器击沉');
 if((id==='aa'||id==='fighter')&&enemies.some(s=>s.destroyedPlanes>0)&&!passed)return fail('目标飞机被其他单位击落，未取得本段拦截证据');
 if(id==='escort'&&before.round>=1&&!passed)return fail('未在预告炮击到达时成功护航');
 if(id==='guard'&&before.round>=1&&(!ev.gunReduced||!ev.torpedoReduced))return fail('未在预告攻击到达时完成封锁减伤');
 if(id==='final'&&g.phase==='ended')return fail('本轮未能歼灭封锁舰队');
 next.hintLevel=Math.max(state.hintLevel,Math.min(2,Math.floor(next.attempts/3)));next.feedback='当前目标尚未完成，可以继续规划；需要时展开提示或恢复检查点。';return next;
}
export function advanceCampaign(state:CampaignState):CampaignState{
 if(state.status!=='checkpoint-complete')return state;
 let chapter=state.chapter,checkpoint=state.checkpoint+1;if(checkpoint>=CAMPAIGN_CHAPTERS[chapter].checkpoints.length){chapter++;checkpoint=0;}
 if(chapter>=CAMPAIGN_CHAPTERS.length)return{...state,status:'complete'};
 return{...state,chapter,checkpoint,status:'playing',attempts:0,hintLevel:0,evidence:{},feedback:undefined};
}
