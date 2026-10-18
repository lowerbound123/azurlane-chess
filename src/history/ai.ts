import type {Game,Plans} from '../../shared/game.ts';
import type {HistoricalState} from '../../shared/history.ts';
import {emptyPlan,fromCR,hexDist,inSmoke,observe,toCR} from '../engine.ts';
import {getHistoricalDefinition} from './content.ts';
import {enemyIntent,recentContacts} from './doctrine.ts';
import type {HistoricalIntent} from './doctrine.ts';
import {tacticalMoves} from './tactics.ts';
import {historicalWeapons} from './weapons.ts';
export {navigateHistorical} from './tactics.ts';

export function historicalEnemyPlans(game:Game,state:HistoricalState):Plans {
 const v=observe(game,1),definition=getHistoricalDefinition(state.scenarioId)!;
 const plans:Plans={},contacts=recentContacts(v,1,state.contacts),damage=new Map<string,number>(),intents=new Map<string,HistoricalIntent>();
 const friends=v.ships.filter(s=>s.team===1).sort((a,b)=>a.id.localeCompare(b.id));
 for(const ship of friends){
  const intent=enemyIntent(v,ship,definition,state.scenarioId==='river-plate'?state.stage:'',contacts);
  const p=emptyPlan();p.moves=tacticalMoves(v,ship,intent,plans);plans[ship.id]=p;intents.set(ship.id,intent);
 }
 // All allied routes are final before aiming shells or launching torpedoes.
 for(const ship of friends)plans[ship.id]=historicalWeapons(v,ship,plans[ship.id],intents.get(ship.id)!,{plans,damage,contacts});
 return plans;
}
export function historicalFriendlyPlans(game:Game,state:HistoricalState):Plans {
 if(state.scenarioId!=='samar')return {};
 const definition=getHistoricalDefinition(state.scenarioId)!,v=observe(game,0),plans:Plans={};
 const contacts=recentContacts(v,0,state.contacts),damage=new Map<string,number>(),intents=new Map<string,HistoricalIntent>();
 const carriers=v.ships.filter(s=>s.team===0&&definition.units.find(u=>u.id===s.id)?.controlled===false)
  .sort((a,b)=>state.convoyRoute==='east'?b.id.localeCompare(a.id):a.id.localeCompare(b.id));
 const smokeCenters:typeof v.ships[number]['pos'][]=[];
 for(const s of carriers){
  const lane=[9,13,17][Number(s.id.split('-')[1])-3],east=state.convoyRoute==='east',eastLane=Math.min(21,lane+4);
  const goal=east&&s.pos.r<12&&toCR(s.pos).c<eastLane?fromCR(eastLane,s.pos.r):fromCR(east?eastLane:lane,22);
  const target=v.ships.filter(t=>t.team!==s.team).sort((a,b)=>hexDist(s.pos,a.pos)-hexDist(s.pos,b.pos)||a.id.localeCompare(b.id))[0];
  const wait=state.convoyWait&&state.convoyWaitLastRound!==v.round-1;
  const intent:HistoricalIntent={role:'convoy',goal,range:0,targetId:target?.id,hold:wait,escape:{at:fromCR(east?eastLane:lane,22),rounds:definition.roundLimit-v.round+1}};
  const p=emptyPlan();p.moves=tacticalMoves(v,s,intent,plans);
  const threatened=v.ships.some(e=>e.team!==s.team&&hexDist(e.pos,s.pos)<=6);
  if((s.smokeLeft??0)>0&&threatened&&!inSmoke(v,s.pos)&&!smokeCenters.some(h=>hexDist(h,s.pos)<=s.cfg.smoke!.radius)){
   p.smoke=true;smokeCenters.push(s.pos);
  }
  plans[s.id]=p;intents.set(s.id,intent);
 }
 for(const s of carriers)plans[s.id]=historicalWeapons(v,s,plans[s.id],intents.get(s.id)!,{plans,damage,contacts});
 return plans;
}
