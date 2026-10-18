import type {GameMap,Hex,Move,Observation,Plan,Plans,RouteNode,Ship,Torpedo,XY} from '../../shared/game.ts';
import {effectiveSpeed} from '../../shared/status.ts';
import {add,emptyPlan,hexDist,hexToXY,key,legal,mod,route,RULES,xyToHex} from '../engine.ts';
import {friendlyRouteConflicts} from '../planning.ts';
import type {HistoricalIntent} from './doctrine.ts';

function navigation(map:GameMap,ship:Pick<Ship,'pos'|'heading'>,goal:Hex,occupied:Hex[],range:number):Move[]|null {
 if(hexDist(ship.pos,goal)<=range)return [];
 const blocked=new Set(occupied.map(key));blocked.delete(key(ship.pos));
 const stamp=(h:Hex,d:number)=>`${key(h)}:${d}`;
 const queue:{pos:Hex;heading:number;prev:number;move?:Move}[]=[{pos:ship.pos,heading:ship.heading,prev:-1}];
 const seen=new Set([stamp(ship.pos,ship.heading)]);let found=-1;
 for(let i=0;i<queue.length;i++){
  const n=queue[i];if(hexDist(n.pos,goal)<=range){found=i;break;}
  for(const forward of [true,false])for(const turn of [0,-1,1]){
   if(!forward&&turn===0)continue;const heading=mod(n.heading+turn),pos=forward?add(n.pos,heading):n.pos,id=stamp(pos,heading);
   if(!legal(map,pos)||blocked.has(key(pos))||seen.has(id))continue;
   seen.add(id);queue.push({pos,heading,prev:i,move:{turn,forward}});
  }
 }
 if(found<0)return null;
 const moves:Move[]=[];for(let i=found;queue[i].prev>=0;i=queue[i].prev)moves.push(queue[i].move!);
 return moves.reverse();
}
/** Kept as the public heading-aware navigator used by previews and reference skippers. */
export function navigateHistorical(map:GameMap,ship:Pick<Ship,'pos'|'heading'|'cfg'>,goal:Hex,occupied:Hex[]=[],range=0):Move[]{
 return (navigation(map,ship,goal,occupied,range)??[]).slice(0,ship.cfg.speed);
}
function position(nodes:RouteNode[],speed:number,time:number):XY {
 const step=Math.min(time*speed,nodes.length-1),i=Math.floor(step),f=step-i;
 const a=hexToXY(nodes[i].pos),b=hexToXY(nodes[Math.min(i+1,nodes.length-1)].pos);
 return {x:a.x+(b.x-a.x)*f,y:a.y+(b.y-a.y)*f};
}
/** Match the engine's occupied-hex contact and arming at its physics substeps. */
function torpedoHits(v:Observation,s:Ship,p:Plan,t:Torpedo,birth:number,until:number,plans:Plans):boolean {
 const nodes=route(s,p,v.map,v.round),speed=effectiveSpeed(s,v.round);
 const owner=v.ships.find(s=>s.id===t.owner),ownerNodes=owner?route(owner,owner.id===s.id?p:plans[owner.id],v.map,v.round):undefined;
 const vector=hexToXY(add({q:0,r:0},t.heading));let armed=t.armed;
 const duration=Math.min(until-birth,t.cfg.life-t.age);if(duration<0)return false;
 for(let step=0;step<=Math.ceil(duration*RULES.ticks);step++){
  const elapsed=Math.min(duration,step/RULES.ticks),time=birth+elapsed;
  const cell=xyToHex({x:t.xy.x+vector.x*t.cfg.speed*elapsed,y:t.xy.y+vector.y*t.cfg.speed*elapsed});
  if(!legal(v.map,cell))return false;
  if(!armed&&(!owner||key(cell)!==key(xyToHex(position(ownerNodes!,effectiveSpeed(owner,v.round),time)))))armed=true;
  if(armed&&key(cell)===key(xyToHex(position(nodes,speed,time))))return true;
 }
 return false;
}
export function torpedoRisk(v:Observation,s:Ship,p:Plan):number {
 return v.torpedoes.reduce((risk,t)=>risk+(torpedoHits(v,s,p,t,0,1,{[s.id]:p})?t.cfg.damage:0),0);
}
export function safeTorpedo(v:Observation,s:Ship,p:Plan,window:number,dir:number,plans:Plans):boolean {
 const origin=route(s,p,v.map,v.round)[window].pos,birth=window/effectiveSpeed(s,v.round);
 const torpedo:Torpedo={id:'candidate',kind:'torpedo',team:s.team,owner:s.id,xy:hexToXY(origin),heading:dir,age:0,launched:v.round,birth,armed:false,cfg:s.cfg.torpedo!};
 const knownPlans={...plans,[s.id]:p};
 // Future friendly motion is unknown after this round; assume the last planned cell.
 return !v.ships.filter(t=>t.team===s.team).some(t=>torpedoHits(v,t,knownPlans[t.id]??emptyPlan(),torpedo,birth,birth+torpedo.cfg.life,knownPlans));
}
export function tacticalMoves(v:Observation,s:Ship,intent:HistoricalIntent,plans:Plans):Move[]{
 if(intent.hold)return [];
 const speed=effectiveSpeed(s,v.round),friends=v.ships.filter(t=>t.team===s.team&&t.id!==s.id);
 const occupied=friends.map(t=>route(t,plans[t.id],v.map,v.round).at(-1)!.pos);
 const path=intent.goal?navigation(v.map,s,intent.goal,occupied,intent.range):[];
 const candidates:{moves:Move[];remaining:number;preferred?:boolean}[]=[{moves:[],remaining:path?.length??100}];
 if(path)candidates.push({moves:path.slice(0,speed),remaining:Math.max(0,path.length-speed),preferred:true});
 for(const forward of [true,false])for(const turn of [0,-1,1]){
  if(!forward&&!turn)continue;const heading=mod(s.heading+turn),pos=forward?add(s.pos,heading):s.pos;
  if(!legal(v.map,pos)||occupied.some(h=>key(h)===key(pos)))continue;
  const rest=intent.goal?navigation(v.map,{pos,heading},intent.goal,occupied,intent.range):[];
  if(rest===null)continue;const full=[{turn,forward},...rest];
  candidates.push({moves:full.slice(0,speed),remaining:Math.max(0,full.length-speed)});
 }
 let best:Move[]=[],bestScore=-Infinity;
 for(const candidate of candidates){
  const p={...emptyPlan(),moves:candidate.moves},nodes=route(s,p,v.map,v.round),end=nodes.at(-1)!.pos;
  const collision=friendlyRouteConflicts(s,p,friends,plans,v.map,v.round).length;
  const mines=v.map.mines.filter(m=>(m.armedRound??0)<=v.round&&nodes.some(n=>key(n.pos)===key(m))).reduce((n,m)=>n+(m.damage??40),0);
  const ram=v.ships.some(t=>t.team!==s.team&&key(t.pos)===key(end))?60:0;
  // Evasion must still leave enough sailing time to finish the escort mission.
  const escape=intent.escape;
  const urgent=escape&&hexDist(s.pos,escape.at)>=Math.max(0,escape.rounds-2)*speed;
  const progress=escape?hexDist(end,escape.at)*(urgent?12:4):0;
  const backtrack=escape&&end.r<s.pos.r?24:0;
  let exposure=0;
  if(intent.role==='convoy'||intent.role==='patrol'){
   const predictable=predictedPositions(v,s).find(h=>key(h.at)===key(end))?.weight??0;
   for(const enemy of v.ships.filter(t=>t.team!==s.team)){
    if(enemy.cfg.main&&enemy.mainReady<=v.round&&hexDist(enemy.pos,end)<=enemy.cfg.main.range)exposure+=enemy.cfg.main.damage*enemy.cfg.main.shots*predictable;
    if(enemy.cfg.secondary&&hexDist(enemy.pos,end)<=enemy.cfg.secondary.range+1)exposure+=enemy.cfg.secondary.damage*2;
    if(enemy.torps>0&&hexDist(enemy.pos,end)<=3)exposure+=15;
   }
  }
  const score=-candidate.remaining*3-torpedoRisk(v,s,p)*2-collision*10000-mines*2-ram-exposure-progress-backtrack+(candidate.preferred?.1:0)-p.moves.length*.01;
  if(score>bestScore){bestScore=score;best=p.moves;}
 }
 return best;
}
/** A small deterministic hypothesis set; never consumes committed enemy orders. */
export function predictedPositions(v:Observation,s:Ship):{at:Hex;weight:number}[]{
 const hypotheses=[{at:{...s.pos},weight:.55}];
 for(const [turn,weight] of [[0,.25],[-1,.1],[1,.1]]){
  const moves=Array.from({length:effectiveSpeed(s,v.round)},(_,i)=>({turn:i===0?turn:0,forward:true}));
  const at=route(s,{moves},v.map,v.round).at(-1)!.pos;
  const existing=hypotheses.find(h=>key(h.at)===key(at));if(existing)existing.weight+=weight;else hypotheses.push({at,weight});
 }
 return hypotheses.sort((a,b)=>b.weight-a.weight||key(a.at).localeCompare(key(b.at)));
}
