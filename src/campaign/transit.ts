import type {BattleFrame,Game,Hex,Move,Ship,XY} from '../../shared/game.ts';
import type {CampaignFixture} from '../../shared/campaign.ts';
import {effectiveSpeed} from '../../shared/status.ts';
import * as E from '../engine.ts';

export interface CampaignTransitFrame extends BattleFrame {notice:string;cameraFocus:XY&{radius:number};visibilityBarrier?:boolean}
export interface CampaignTransit {fixture:CampaignFixture;frames:CampaignTransitFrame[]}

/** Noncombat sailing uses the same legal turn/forward commands as player orders. */
function sailingRoute(game:Game,ship:Ship,goal:(pos:Hex,heading:number,steps:number)=>boolean):Move[]{
 const blocked=new Set(game.ships.filter(s=>s.id!==ship.id&&E.alive(s)).map(s=>E.key(s.pos)));
 const queue:{pos:Hex;heading:number;parent:number;move?:Move;steps:number}[]=[{pos:ship.pos,heading:ship.heading,parent:-1,steps:0}];
 const seen=new Set([`${E.key(ship.pos)}:${ship.heading}`]);
 for(let i=0;i<queue.length;i++){
  const node=queue[i];
  if(goal(node.pos,node.heading,node.steps)){
   const moves:Move[]=[];for(let n=i;queue[n].parent>=0;n=queue[n].parent)moves.push(queue[n].move!);return moves.reverse();
  }
  for(const turn of [0,-1,1])for(const forward of [true,false]){
   const heading=E.mod(node.heading+turn),pos=forward?E.add(node.pos,heading):node.pos,key=`${E.key(pos)}:${heading}`;
   if(!E.legal(game.map,pos)||blocked.has(E.key(pos))||seen.has(key))continue;
   seen.add(key);queue.push({pos,heading,parent:i,move:{turn,forward},steps:node.steps+1});
  }
 }
 throw new Error(`${ship.label}找不到安全航渡路线`);
}

/** No future fixture exploration enters the live map before its ships arrive. */
export function buildCampaignTransit(before:Game,target:CampaignFixture,focus:{from:Hex;to:Hex;fromRadius?:number;toRadius?:number}):CampaignTransit{
 const fixture=E.clone(target),game=E.clone(before),frames:CampaignTransitFrame[]=[];
 const used=new Set(before.ships.map(s=>s.id)),remap=new Map<string,string>();
 let sequence=Math.max(before.nextId,fixture.game.nextId);
 for(const ship of fixture.game.ships){
  const survivor=ship.team===0?before.ships.find(s=>s.team===0&&s.catalogId===ship.catalogId&&E.alive(s)):undefined;
  let id=survivor?.id;
  if(!id){do{id=`${ship.team===0?'fleet':'training'}-${sequence++}`;}while(used.has(id));}
  used.add(id);remap.set(ship.id,id);ship.id=id;
 }
 fixture.selected=remap.get(fixture.selected)??fixture.selected;
 fixture.plans=Object.fromEntries(Object.entries(fixture.plans).map(([id,p])=>[remap.get(id)??id,{...p,planes:p.planes.map(o=>o.mode==='target'?{...o,targetId:remap.get(o.targetId)??o.targetId}:o)}]));
 const shipId=(id:string)=>remap.get(id)??id;
 for(const torpedo of fixture.game.torpedoes)torpedo.owner=shipId(torpedo.owner);
 for(const plane of fixture.game.planes){plane.mother=shipId(plane.mother);if(plane.targetId)plane.targetId=shipId(plane.targetId);}
 for(const mine of fixture.game.map.mines)if(mine.sourceId)mine.sourceId=shipId(mine.sourceId);
 for(const unit of [...fixture.game.ships,...fixture.game.planes])for(const status of unit.statuses??[])if(status.source){
  status.source.unitId=shipId(status.source.unitId);if(status.source.shipId)status.source.shipId=shipId(status.source.shipId);
 }
 fixture.game.nextId=sequence;
 const observers=new Set(game.ships.filter(s=>s.team===0&&E.alive(s)).map(s=>s.id));
 const departing=new Set<string>();
 const view=()=>E.visibleCells({...game,ships:game.ships.filter(s=>s.team!==0||observers.has(s.id))},0);
 const contact=(s:Pick<Ship,'team'|'xy'>,visible=view())=>E.shipVisible({...game,ships:game.ships.filter(s=>s.team!==0||observers.has(s.id))},{...s,team:1},0,visible);
 let notice='本段完成，舰队自动沿航道前往下一任务。';
 function capture(){
  const visible=view(),enemyVision=E.visibleCells(game,1);
  game.explored[0]=[...new Set([...game.explored[0],...visible])];game.explored[1]=[...new Set([...game.explored[1],...enemyVision])];
  const ships=game.ships.filter(E.alive).filter(s=>s.team!==0||observers.has(s.id)||departing.has(s.id)||contact(s,visible));
  const contacts=ships.filter(s=>s.team===0||contact(s,visible)).map(s=>s.id),prior=frames.at(-1);
  frames.push(E.clone({t:frames.length*.1,round:game.round,ships,planes:game.planes,torpedoes:game.torpedoes,mines:game.map.mines,zones:game.zones,
   visible:[...visible],explored:game.explored[0],visibleByTeam:[[...visible],[...enemyVision]],exploredByTeam:game.explored,
   visibleShipIdsByTeam:[contacts,ships.map(s=>s.id)],visibilityBarrier:!!prior&&contacts.some(id=>!prior.visibleShipIdsByTeam![0].includes(id)),effects:[],notice,cameraFocus:{...E.hexToXY(focus.from),radius:focus.fromRadius??5}}));
 }
 function sail(s:Ship,moves:Move[],stop?:()=>boolean){
  for(const move of moves){
   // Each command is a real legal movement step, without weapons or combat settlement.
   const node=E.route(s,{moves:[move]},game.map,game.round)[1];
   if(!node)throw new Error(`${s.label}的自动航渡指令无效`);
   const from={...s.xy},to=E.hexToXY(node.pos),steps=Math.ceil(10/effectiveSpeed(s,game.round));
   s.heading=node.heading;
   for(let i=1;i<=steps;i++){
    s.xy={x:from.x+(to.x-from.x)*i/steps,y:from.y+(to.y-from.y)*i/steps};
    s.pos=E.xyToHex(s.xy);capture();
   }
   s.pos={...node.pos};s.xy=to;
   if(stop?.())break;
  }
 }
 function moveTo(s:Ship,pos:Hex,heading?:number){
  sail(s,sailingRoute(game,s,(h,d)=>E.same(h,pos)&&(heading===undefined||d===heading)));
 }
 function retire(s:Ship){
  observers.delete(s.id);if(s.team===0)departing.add(s.id);
  notice=`${s.label}自动驶离任务海域，其余舰船继续航行。`;
  const visible=view();sail(s,sailingRoute(game,s,(h,_,steps)=>steps>0&&!visible.has(E.key(h))));
  departing.delete(s.id);game.ships=game.ships.filter(a=>a.id!==s.id);capture();
 }
 function entryNear(goal:Hex):Hex{
  const occupied=new Set(game.ships.filter(E.alive).map(s=>E.key(s.pos))),visible=view();
  const entries=E.allHexes(game.map).filter(h=>E.legal(game.map,h)&&!occupied.has(E.key(h))&&contact({team:1,xy:E.hexToXY(h)},visible));
  entries.sort((a,b)=>E.hexDist(a,goal)-E.hexDist(b,goal));
  if(!entries.length)throw new Error('没有可供舰船会合的可见航道');return entries[0];
 }
 function arrive(s:Ship,entry:Hex,friendly:boolean){
  const visible=view(),proxy={...E.clone(s),pos:{...entry},xy:E.hexToXY(entry),heading:0};
  const outward=sailingRoute(game,proxy,h=>!visible.has(E.key(h)));
  for(const move of outward){proxy.heading=E.mod(proxy.heading+move.turn);if(move.forward)proxy.pos=E.add(proxy.pos,proxy.heading);}
  s.pos={...proxy.pos};s.xy=E.hexToXY(s.pos);s.heading=E.mod(proxy.heading+3);game.ships.push(s);
  notice=friendly?`${s.label}正从迷雾中驶来，等待舰队取得接触。`:'前方靶舰正在从视野外驶入航道。';capture();
  const route=sailingRoute(game,s,h=>E.same(h,entry));sail(s,route,friendly?()=>contact(s):undefined);
  if(friendly){
   if(!contact(s))throw new Error(`${s.label}尚未进入已有视野`);
   notice=`已看见${s.label}，正在会合。`;for(let i=0;i<3;i++)capture();
   observers.add(s.id);notice=`${s.label}加入舰队，开始共享视野。`;capture();
  }
 }

 capture();
 // Finish visible weapon travel instead of discarding aircraft in midair.
 for(const plane of [...game.planes]){
  const mother=game.ships.find(s=>s.id===plane.mother&&E.alive(s));
  if(mother){const from={...plane.xy},steps=Math.max(1,Math.ceil(Math.hypot(from.x-mother.xy.x,from.y-mother.xy.y)/Math.sqrt(3)));
   notice='演练飞机正在返航，舰队准备继续航行。';for(let i=1;i<=steps;i++){plane.xy={x:from.x+(mother.xy.x-from.x)*i/steps,y:from.y+(mother.xy.y-from.y)*i/steps};capture();}}
  game.planes=game.planes.filter(p=>p.id!==plane.id);capture();
 }
 for(const torpedo of [...game.torpedoes]){
  notice='上一段已发射的鱼雷继续驶离演练海域。';
  for(let i=0;i<80;i++){
   const h=E.add(E.xyToHex(torpedo.xy),torpedo.heading);if(!E.legal(game.map,h))break;
   torpedo.xy=E.hexToXY(h);capture();
  }
  game.torpedoes=game.torpedoes.filter(t=>t.id!==torpedo.id);capture();
 }
 game.zones=[];
 for(const s of [...game.ships].filter(s=>s.team===1&&E.alive(s)))retire(s);
 game.ships=game.ships.filter(s=>s.team===0&&E.alive(s));
 const incoming=fixture.game.ships.filter(s=>s.team===0&&!game.ships.some(a=>a.id===s.id));
 for(const source of incoming)arrive(E.clone(source),entryNear(source.pos),true);
 const wanted=new Set(fixture.game.ships.filter(s=>s.team===0).map(s=>s.id));
 for(const s of [...game.ships].filter(s=>s.team===0&&!wanted.has(s.id)))retire(s);
 const destinations=fixture.game.ships.filter(s=>s.team===0),goalKeys=new Set(destinations.map(s=>E.key(s.pos)));
 const pending=new Set(destinations.map(s=>s.id));
 while(pending.size){
  const goal=destinations.find(s=>pending.has(s.id)&&!game.ships.some(a=>a.id!==s.id&&E.alive(a)&&E.same(a.pos,s.pos)));
  if(!goal){
   const blocker=game.ships.find(s=>s.id!==destinations.find(d=>pending.has(d.id))!.id&&E.same(s.pos,destinations.find(d=>pending.has(d.id))!.pos))!;
   notice=`${blocker.label}自动让出航道，避免友舰相撞。`;
   sail(blocker,sailingRoute(game,blocker,(h,_,steps)=>steps>0&&!goalKeys.has(E.key(h))));continue;
  }
  const current=game.ships.find(s=>s.id===goal.id)!;
  notice=`${current.label}已收到移动指令，自动前往下一段任务位置。`;moveTo(current,goal.pos,goal.heading);pending.delete(goal.id);
 }
 // Supply and the next exercise share one clock, including smoke and statuses.
 // Ships have already reached these exact poses; restoring supplies cannot move them.
 game.round=fixture.game.round;game.ships=E.clone(fixture.game.ships.filter(s=>s.team===0));
 game.zones=E.clone(fixture.game.zones??[]);
 for(const enemy of fixture.game.ships.filter(s=>s.team===1)){
  const s=E.clone(enemy);arrive(s,entryNear(enemy.pos),false);
  notice='训练靶舰沿航道驶向预告位置，请观察其移动。';moveTo(s,enemy.pos,enemy.heading);
 }
 fixture.game.explored=E.clone(game.explored);E.updateExploration(fixture.game);
 game.ships=E.clone(fixture.game.ships);game.map.mines=E.clone(fixture.game.map.mines);game.explored=E.clone(fixture.game.explored);
 game.torpedoes=E.clone(fixture.game.torpedoes);game.planes=E.clone(fixture.game.planes);
 notice='舰队已就位，直接开始下一段任务。';capture();
 const start=E.hexToXY(focus.from),end=E.hexToXY(focus.to);
 const fromRadius=focus.fromRadius??5,toRadius=focus.toRadius??fromRadius;
 frames.forEach((frame,i)=>{const t=i/Math.max(1,frames.length-1);frame.cameraFocus={x:start.x+(end.x-start.x)*t,y:start.y+(end.y-start.y)*t,radius:fromRadius+(toRadius-fromRadius)*t};});
 return{fixture,frames};
}
