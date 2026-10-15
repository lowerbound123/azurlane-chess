import type {Game,GameMap,Hex,Move,Observation,Plan,Plans,Ship} from '../../shared/game.ts';
import type {HistoricalState} from '../../shared/history.ts';
import {add,clone,emptyPlan,fromCR,hexDist,key,legal,mod,observe,route,toCR,validPlan} from '../engine.ts';
import {planeForSlot} from '../ship-definitions.ts';
import {getHistoricalDefinition} from './content.ts';
/** Breadth-first search includes heading, turning in place, and legal forward actions. */
export function navigateHistorical(map:GameMap,ship:Pick<Ship,'pos'|'heading'|'cfg'>,goal:Hex,occupied:Hex[]=[],range=0):Move[]{
 if(hexDist(ship.pos,goal)<=range)return [];
 const blocked=new Set(occupied.map(key));blocked.delete(key(ship.pos));
 const stamp=(h:Hex,d:number)=>`${key(h)}:${d}`;
 const queue:{pos:Hex;heading:number;prev:number;move?:Move}[]=[{pos:ship.pos,heading:ship.heading,prev:-1}],seen=new Set([stamp(ship.pos,ship.heading)]);let found=-1;
 for(let i=0;i<queue.length;i++){
  const n=queue[i];if(hexDist(n.pos,goal)<=range){found=i;break;}
  // Forward movement is preferred to a gratuitous turn in place; ordering is stable.
  for(const forward of [true,false])for(const turn of [0,-1,1]){if(!forward&&turn===0)continue;const heading=mod(n.heading+turn),pos=forward?add(n.pos,heading):n.pos,id=stamp(pos,heading);if(!legal(map,pos)||blocked.has(key(pos))||seen.has(id))continue;seen.add(id);queue.push({pos,heading,prev:i,move:{turn,forward}});}
 }
 if(found<0)return [];
 const moves:Move[]=[];for(let i=found;queue[i].prev>=0;i=queue[i].prev)moves.push(queue[i].move!);return moves.reverse().slice(0,ship.cfg.speed);
}
const sortedTargets=(v:Observation,s:Ship)=>v.ships.filter(t=>t.team!==s.team&&t.hp>0).sort((a,b)=>hexDist(s.pos,a.pos)-hexDist(s.pos,b.pos)||a.id.localeCompare(b.id));
function weapons(v:Observation,s:Ship,p:Plan,state:HistoricalState){
 const enemies=sortedTargets(v,s),target=enemies[0];
 if(s.cfg.main&&s.mainReady<=v.round){const t=enemies.find(t=>hexDist(s.pos,t.pos)<=s.cfg.main!.range);if(t){const next=add(t.pos,t.heading);p.main=Array.from({length:s.cfg.main.shots},(_,i)=>clone(i===1&&legal(v.map,next)&&hexDist(s.pos,next)<=s.cfg.main!.range?next:t.pos));}}
 if(s.cfg.torpedo&&s.torps>0&&target&&!p.smoke){const nodes=route(s,p,v.map);for(let window=0;window<nodes.length&&p.torps.length<2;window++){const n=nodes[window];const direction=[0,1,2,3,4,5].filter(d=>d!==n.heading&&d!==mod(n.heading+3)).sort((a,b)=>hexDist(add(n.pos,a),target.pos)-hexDist(add(n.pos,b),target.pos)||a-b)[0];if(hexDist(n.pos,target.pos)<=7&&hexDist(add(n.pos,direction),target.pos)<hexDist(n.pos,target.pos))p.torps.push({window,dir:direction});}}
 if(s.cfg.carrier){const search=state.scenarioId==='midway'?fromCR(s.team===0?7:20,(Number(s.id.split('-')[1])*5+5)%v.map.height):fromCR(11,3);
  const contact=Object.entries(state.contacts).filter(([k])=>k.startsWith(`${s.team}:`)).sort((a,b)=>b[1].round-a[1].round||a[0].localeCompare(b[0]))[0]?.[1];
  for(let slot=0;slot<s.airReady.length&&p.planes.length<s.cfg.carrier.launch;slot++){if(s.airReady[slot]>v.round||s.airHP[slot]<=0)continue;const cfg=planeForSlot(s.cfg,slot),role=cfg.role??'bomber';
   if(role==='fighter'){if(v.round===1||v.planes.some(e=>e.team!==s.team&&hexDist(s.pos,e.target)<=8))p.planes.push({slot,mode:'patrol',target:clone(s.pos)});}
   else if(role==='scout')p.planes.push({slot,mode:'point',target:clone(contact?.at??search)});
   else if(target)p.planes.push({slot,mode:'target',targetId:target.id});
   else if(contact&&v.round-contact.round<=4)p.planes.push({slot,mode:'point',target:clone(contact.at)});
  }
 }
 return validPlan(v,s,p);
}
export function historicalEnemyPlans(game:Game,state:HistoricalState):Plans {
 const v=observe(game,1); // No subsequent operation consumes enemy ships from the unfiltered game.
 const plans:Plans={},friends=v.ships.filter(s=>s.team===1).sort((a,b)=>a.id.localeCompare(b.id)),reserved:Hex[]=[];
 for(const s of friends){const p=emptyPlan(),enemies=sortedTargets(v,s);let target=state.scenarioId==='samar'?(enemies.find(x=>x.template==='cv')??enemies[0]):state.scenarioId==='denmark-strait'?(enemies.find(x=>x.id==='0-0')??enemies[0]):enemies[0];
  const last=Object.entries(state.contacts).filter(([k])=>k.startsWith('1:')).sort((a,b)=>b[1].round-a[1].round||a[0].localeCompare(b[0]))[0]?.[1];
  let goal:Hex|undefined=target?.pos??last?.at,range=target?(s.cfg.main?Math.min(5,s.cfg.main.range):3):0;
  if(state.scenarioId==='river-plate'&&state.stage==='retreat'){goal=fromCR(1,15);range=0;}
  else if(state.scenarioId==='narvik'){
   // Anchored damaged ambush ships hold; mobile ships contest the public port once contact begins.
   if(s.cfg.speed<=1)goal=undefined;
   else if(!target&&!last)goal=undefined;
   else if(s.hp<60){goal=fromCR(s.id==='1-1'?5:13,5);range=0;}
  }else if(state.scenarioId==='midway'){goal=undefined;} // Keep launch locations coherent; scouts search the known sectors.
  else if(!goal&&state.scenarioId==='denmark-strait'){goal=fromCR(7,10);range=0;}
  else if(!goal&&state.scenarioId==='samar'){goal=fromCR(11,18);range=0;}
  const obstacles=[...friends.filter(t=>t.id!==s.id).map(t=>t.pos),...reserved];
  if(goal)p.moves=navigateHistorical(v.map,s,goal,obstacles,range);
  // A visible torpedo lane is avoided by stopping or turning one cell aside.
  const danger=v.torpedoes.filter(t=>t.team!==s.team).map(t=>t.xy);
  if(danger.length){const nodes=route(s,p,v.map);if(nodes.slice(1).some(n=>danger.some(t=>Math.hypot(t.x-(Math.sqrt(3)*(n.pos.q+n.pos.r/2)),t.y-1.5*n.pos.r)<2)))p.moves=[];}
  plans[s.id]=weapons(v,s,p,state);reserved.push(...route(s,plans[s.id],v.map).slice(1).map(n=>n.pos));
 }
 return plans;
}
export function historicalFriendlyPlans(game:Game,state:HistoricalState):Plans {
 if(state.scenarioId!=='samar')return {};
 const d=getHistoricalDefinition(state.scenarioId)!,v=observe(game,0),plans:Plans={},reserved:Hex[]=[];
 const carriers=v.ships.filter(s=>s.team===0&&d.units.find(u=>u.id===s.id)?.controlled===false).sort((a,b)=>state.convoyRoute==='east'?b.id.localeCompare(a.id):a.id.localeCompare(b.id));
 for(const s of carriers){const p=emptyPlan();const lane=[9,13,17][Number(s.id.split('-')[1])-3];
  const wait=state.convoyWait&&state.convoyWaitLastRound!==game.round-1;
  // East detour adds four legal moves, preserving heading and continuous position.
  const goal=state.convoyRoute==='east'&&s.pos.r<12&&toCR(s.pos).c<Math.min(21,lane+4)?fromCR(Math.min(21,lane+4),s.pos.r):fromCR(state.convoyRoute==='east'?Math.min(21,lane+4):lane,22);
  if(!wait)p.moves=navigateHistorical(v.map,s,goal,[...carriers.filter(t=>t.id!==s.id&&!plans[t.id]).map(t=>t.pos),...reserved]);
  if((s.smokeLeft??0)>0&&sortedTargets(v,s).some(e=>hexDist(e.pos,s.pos)<=6))p.smoke=true;
  plans[s.id]=weapons(v,s,p,state);reserved.push(...route(s,plans[s.id],v.map).slice(1).map(n=>n.pos));
 }
 return plans;
}
