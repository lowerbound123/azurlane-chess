import type {Game,Plans,RoundResult,Ship} from '../../shared/game.ts';
import type {HistoricalState,HistoricalObjective} from '../../shared/history.ts';
import {clone,key,observe,resolveRound,visibleCells,shipVisible,hexToXY} from '../engine.ts';
import {getHistoricalDefinition} from './content.ts';
import {historicalEnemyPlans,historicalFriendlyPlans} from './ai.ts';
function once(s:HistoricalState,id:string){if(!s.events.includes(id))s.events.push(id);}
/** Called after engine damage and rollback; consumes the pre-extraction final observation. Mutates only the supplied resolved game. */
export function settleHistoricalOutcome(game:Game,input:HistoricalState,round:number,visibleIds:string[][]):HistoricalState {
 const state=clone(input);if(state.status!=='playing'||round<=state.lastResolvedRound)return state;
 const d=getHistoricalDefinition(state.scenarioId)!;state.lastResolvedRound=round;
 for(const team of [0,1])for(const ship of game.ships.filter(s=>s.hp>0&&s.team!==team&&visibleIds[team]?.includes(s.id)))state.contacts[`${team}:${ship.id}`]={at:clone(ship.pos),heading:ship.heading,round};
 const visibleSpee=visibleIds[0]?.includes('1-0');
 const spee=game.ships.find(s=>s.id==='1-0');
 if(state.scenarioId==='river-plate'){
  if(state.stage!=='retreat'&&spee&&spee.hp>0&&spee.hp<=210){state.stage='retreat';state.counters.retreatRound=round;state.counters.tracking=0;once(state,'enemy-retreat');}
  else if(state.stage==='retreat'&&round>(state.counters.retreatRound??0)){state.counters.tracking=visibleSpee?(state.counters.tracking??0)+1:0;if(!visibleSpee)once(state,'contact-interrupted');}
 }
 const exits=d.regions.filter(r=>r.kind==='exit'||r.kind==='enemy-exit');
 for(const ship of game.ships.filter(s=>s.hp>0))if(exits.some(e=>(e.kind==='enemy-exit'?ship.team===1:ship.team===0)&&e.cells.some(h=>key(h)===key(ship.pos)))){
  state.extracted[ship.id]={id:ship.id,label:ship.label,team:ship.team,hp:ship.hp,round};once(state,`extracted:${ship.id}`);
 }
 const extractedIds=new Set(Object.keys(state.extracted));game.ships=game.ships.filter(s=>!extractedIds.has(s.id));game.planes=game.planes.filter(p=>!extractedIds.has(p.mother));
 const alive=(id:string)=>!!game.ships.find(s=>s.id===id&&s.hp>0),safe=(id:string)=>alive(id)||!!state.extracted[id];
 const sunk=(team:number)=>d.units.filter(u=>u.team===team&&!safe(u.id)).length;
 const aliveCount=(team:number)=>game.ships.filter(s=>s.hp>0&&s.team===team).length;
 const exitsCount=(ids:string[])=>ids.filter(id=>state.extracted[id]).length;
 const hp=(id:string)=>state.extracted[id]?.hp??game.ships.find(s=>s.id===id)?.hp??0;
 state.counters.sunk=sunk(1);
 let won=false,fail=false,reason='',bonus:boolean[]=[false,false];
 if(state.scenarioId==='river-plate'){
  fail=aliveCount(0)===0;won=!fail&&(sunk(1)===1||(state.counters.tracking??0)>=2);
  if(!won&&state.extracted['1-0']){fail=true;reason='德舰已脱离，连续目视未完成';}
  bonus=[d.units.filter(u=>u.team===0).every(u=>safe(u.id)),round<=10];
 }else if(state.scenarioId==='narvik'){
  const port=d.regions.find(r=>r.kind==='control')!,occupants=game.ships.filter(s=>s.hp>0&&port.cells.some(h=>key(h)===key(s.pos)));
  const uncontested=occupants.some(s=>s.team===0)&&!occupants.some(s=>s.team===1);state.counters.port=uncontested?(state.counters.port??0)+1:0;
  state.counters.portContested=occupants.some(s=>s.team===1)?1:0;
  if(state.counters.portContested)once(state,'port-contested');
  fail=!alive('0-0');won=!fail&&sunk(1)>=4&&state.counters.port>=2;bonus=[hp('0-0')>=210,sunk(1)===6];state.stage=sunk(1)>=4?'control':'advance';
 }else if(state.scenarioId==='denmark-strait'){
  fail=!safe('0-0');won=!fail&&(!!state.extracted['0-0']||sunk(1)===2);bonus=[!!state.extracted['0-1']||(sunk(1)===2&&alive('0-1')),hp('0-0')>=185];state.stage='breakthrough';
 }else if(state.scenarioId==='midway'){
  const escaped=exitsCount(['0-0','0-1','0-2']),canAttack=game.planes.some(p=>p.team===0&&p.hp>0&&p.state==='outbound'&&p.cfg.damage>0&&p.traveled<p.cfg.range);
  won=(sunk(1)>=3&&escaped>=1)||(sunk(1)===4&&(aliveCount(0)>0||escaped>0));
  fail=!won&&aliveCount(0)===0&&!canAttack;bonus=[sunk(1)===4,['0-0','0-1','0-2'].every(safe)];state.stage=sunk(1)>=3?'pursuit':Object.keys(state.contacts).some(k=>k.startsWith('0:'))?'strike':'search';
 }else{
  const ids=['0-3','0-4','0-5'],escaped=exitsCount(ids),remaining=ids.filter(alive).length;state.counters.carriers=escaped;
  fail=escaped+remaining<2;
  if(escaped>=2)once(state,'two-carriers-safe');
  const finished=remaining===0||round>=d.roundLimit;won=!fail&&finished&&escaped>=2;fail=fail||(finished&&!won);
  bonus=[escaped===3,['0-0','0-1','0-2'].some(safe)];state.stage=escaped>=2?'last-carrier':'escort';
  if(state.convoyWait&&state.convoyWaitLastRound!==round-1)state.convoyWaitLastRound=round;state.convoyWait=false;
 }
 if(fail)finish(false,reason||((state.scenarioId==='narvik'||state.scenarioId==='denmark-strait')?'必要旗舰沉没':'已无法完成主要目标'));
 else if(won)finish(true,'主要目标完成');
 else if(round>=d.roundLimit)finish(false,'回合上限到达，主要目标未完成');
 else {game.winner=null;game.phase='plan';}
 return state;
 function finish(won:boolean,reason:string){state.status=won?'won':'lost';state.result={won,stars:won?1+bonus.filter(Boolean).length:0,round,reason,bonus};game.winner=won?0:1;game.phase='ended';game.round=round;once(state,won?'mission-won':'mission-lost');}
}
export function resolveHistoricalRound(input:Game,state:HistoricalState,submitted:Plans):RoundResult&{historical:HistoricalState} {
 if(state.status!=='playing'||state.lastResolvedRound>=input.round)return {game:clone(input),historical:clone(state),frames:[],events:[],counts:[0,1].map(team=>({count:input.ships.filter(s=>s.team===team&&s.hp>0).length,hp:input.ships.filter(s=>s.team===team&&s.hp>0).reduce((n,s)=>n+s.hp,0)})),presentation:[],combatStats:{}};
 const d=getHistoricalDefinition(state.scenarioId)!,plans:Plans={};for(const u of d.units.filter(u=>u.controlled))if(submitted[u.id])plans[u.id]=submitted[u.id];
 Object.assign(plans,historicalEnemyPlans(input,state),historicalFriendlyPlans(input,state));
 const result=resolveRound(input,plans,{termination:'mission'}),last=result.frames.at(-1)!;
 const visible=last.visibleShipIdsByTeam??[0,1].map(team=>observe({...result.game,round:input.round},team).ships.map(s=>s.id));
 const contactState=clone(state);
 for(const f of result.frames)for(const team of [0,1])for(const ship of f.ships)if(ship.hp>0&&ship.team!==team&&f.visibleShipIdsByTeam?.[team]?.includes(ship.id))contactState.contacts[`${team}:${ship.id}`]={at:clone(ship.pos),heading:ship.heading,round:input.round};
 // A later visible empty cell does not confirm an earlier hidden sinking.
 // damage log timestamps follow simulation time, while the hit action records delayed shell impactTime.
 for(const dead of result.game.ships.filter(s=>s.hp<=0)){
  const death=result.events.find(e=>e.text.startsWith(`${dead.label} `)&&e.text.endsWith('· 沉没')&&e.at);
  const hit=result.presentation.filter(p=>p.type==='action'&&p.shipId===dead.id&&(p.action==='dead'||p.action==='hit')).at(-1);
  if(!death?.at||!hit||hit.type!=='action')continue;
  const after=result.frames.find(f=>f.t>=hit.time-1e-9);const before=result.frames.filter(f=>f.t<hit.time-1e-9).at(-1);if(!before||!after)continue;
  for(const team of [0,1]){const confirms=(f:typeof last)=>shipVisible({...result.game,round:input.round,ships:f.ships as Ship[],planes:f.planes,zones:f.zones},{team:dead.team,xy:hexToXY(death.at!)},team,new Set(f.visibleByTeam?.[team]??[]));
   if(confirms(before)&&confirms(after))delete contactState.contacts[`${team}:${dead.id}`];
  }
 }
 const historical=settleHistoricalOutcome(result.game,contactState,input.round,visible);
 result.counts=[0,1].map(team=>({count:result.game.ships.filter(s=>s.team===team&&s.hp>0).length,hp:result.game.ships.filter(s=>s.team===team&&s.hp>0).reduce((n,s)=>n+s.hp,0)}));
 // Final playback state reflects extraction and its aircraft removal, with updated visibility.
 const extracted=new Set(Object.keys(historical.extracted));last.ships=last.ships.filter(s=>!extracted.has(s.id));last.planes=last.planes.filter(p=>!extracted.has(p.mother));
 const vis=[0,1].map(team=>visibleCells(result.game,team));last.visibleByTeam=vis.map(v=>[...v]);last.visible=[...vis[0]];last.visibleShipIdsByTeam=last.visibleShipIdsByTeam?.map(ids=>ids.filter(id=>!extracted.has(id)));
 for(const id of historical.events.filter(id=>!state.events.includes(id))){const text=id==='enemy-retreat'?'敌舰正在脱离':id==='two-carriers-safe'?'已确保主要护送目标，继续争取第三艘':id==='contact-interrupted'?'目视接触中断，追踪计数清零':id==='port-contested'?'港口任务区受争夺':id.startsWith('extracted:')?`${historical.extracted[id.slice(10)]?.label??'舰船'} 已撤离`:historical.result?.reason;if(text){const log={round:input.round,text,at:null,team:0};result.events.push(log);result.game.log.push(log);}}
 result.game.log=result.game.log.slice(-300);return {...result,historical};
}
export function historicalObjectives(game:Game,state:HistoricalState):HistoricalObjective[]{
 const d=getHistoricalDefinition(state.scenarioId)!,sunk=state.counters.sunk??d.units.filter(u=>u.team===1&&!state.extracted[u.id]&&!game.ships.some(s=>s.id===u.id&&s.hp>0)).length;
 const obj=(id:string,label:string,current:number,target:number):HistoricalObjective=>({id,label,current:Math.min(current,target),target,complete:current>=target});
 switch(state.scenarioId){case 'river-plate':return [obj('retreat','迫使敌舰撤退或击沉',state.stage==='retreat'||sunk?1:0,1),obj('tracking','连续目视',sunk?2:state.counters.tracking??0,2)];case 'narvik':return [obj('sunk','德舰击沉',sunk,4),obj('port',state.counters.portContested?'港口受争夺':'港口连续独占',state.counters.port??0,2)];case 'denmark-strait':return [obj('flagship','旗舰撤离或敌舰全灭',state.extracted['0-0']||sunk===2?1:0,1)];case 'midway':return [obj('sunk','日舰击沉',sunk,3),obj('exit','美舰撤离或全灭日舰',sunk===4?1:Object.values(state.extracted).filter(x=>x.team===0).length,1)];case 'samar':return [obj('carriers','主要目标：航母已撤离',state.counters.carriers??0,2),obj('third-carrier','额外目标：第三艘航母撤离',state.counters.carriers??0,3)];}
}
