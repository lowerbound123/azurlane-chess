import {describe,it,expect} from 'vitest';
import {writeFileSync} from 'node:fs';
import {createHistoricalBattle,resolveHistoricalRound,HISTORICAL_BATTLES} from '../src/history/index.ts';
import {navigateHistorical} from '../src/history/ai.ts';
import {createHistoricalStorage,HISTORICAL_SAVE_PREFIX} from '../src/history/storage.ts';
import {emptyPlan,fromCR,hexDist,observe,route,legal,mod,add} from '../src/engine.ts';
import {planeForSlot} from '../src/ship-definitions.ts';
import type {HistoricalSave} from '../shared/history.ts';
import type {Plans} from '../shared/game.ts';
/** Reference skipper consumes only player observation, contacts, and public mission regions. */
function referenceOrders(save:HistoricalSave,variant=false):Plans {
 const {game:g,state:h}=save,d=HISTORICAL_BATTLES.find(x=>x.id===h.scenarioId)!,v=observe(g,0),plans:Plans={},friends=v.ships.filter(s=>s.team===0&&d.units.find(u=>u.id===s.id)!.controlled),enemies=v.ships.filter(s=>s.team!==0);
 const reserved= friends.map(s=>s.pos);
 for(const ship of friends){const p=emptyPlan(),i=Number(ship.id.split('-')[1]);const targets=enemies.slice().sort((a,b)=>hexDist(ship.pos,a.pos)-hexDist(ship.pos,b.pos)||a.hp-b.hp||a.id.localeCompare(b.id));let target:typeof targets[number]|undefined=targets[0];
  let goal=target?.pos??fromCR(7,5),range=target?3:0;
  if(h.scenarioId==='river-plate'){
   if(h.stage==='retreat'){
    // Keep contact with an escaping ship rather than stopping behind its old position.
    const contact=Object.entries(h.contacts).filter(([k])=>k.startsWith('0:')).sort((a,b)=>b[1].round-a[1].round)[0]?.[1];
    const known=target??(contact?{pos:contact.at,heading:contact.heading}:undefined);
    if(known){goal=add(known.pos,known.heading);range=variant?0:1;}
   }else if(target)range=variant?2:4;else goal=fromCR(6+i,6+i);
  }
  if(h.scenarioId==='denmark-strait'){goal=variant&&ship.pos.r<5&&ship.pos.q>5?fromCR(i===0?7:9,4):fromCR(i===0?2:4,12);range=0;}
  if(h.scenarioId==='narvik'){goal=target?.pos??fromCR(i===0?9:i===1?4:13,i===0?13:4);range=target?(variant?(ship.template==='bb'?5:2):(ship.cfg.main?Math.min(3,ship.cfg.main.range):2)):0;if((h.counters.sunk??0)>=(variant?6:4)){goal=fromCR(9+i,13);range=0;}}
  if(h.scenarioId==='midway'){goal=enemies.slice().sort((a,b)=>a.id.localeCompare(b.id))[0]?.pos??Object.entries(h.contacts).filter(([k])=>k.startsWith('0:')).sort((a,b)=>a[0].localeCompare(b[0]))[0]?.[1].at??fromCR(7,10);range=3;if(((h.counters.sunk??0)>=3||(variant&&g.round>=5))&&i===2){goal=fromCR(24,14);range=0;}}
  if(h.scenarioId==='samar'){goal=fromCR([8,12,16][i],Math.min(21,ship.pos.r+4));range=0;}
  p.moves=navigateHistorical(v.map,ship,goal,reserved.filter(x=>x!==ship.pos),range);
  if(ship.cfg.main&&ship.mainReady<=g.round){target=targets.find(t=>hexDist(ship.pos,t.pos)<=ship.cfg.main!.range);if(target)p.main=Array.from({length:ship.cfg.main.shots},()=>({...target!.pos}));}
  if(ship.cfg.smoke&&h.scenarioId==='samar'&&(ship.smokeLeft??0)>0&&g.round<=3)p.smoke=true;
  if(ship.cfg.torpedo&&target&&!p.smoke){const nodes=route(ship,p,v.map);for(let window=0;window<nodes.length&&p.torps.length<2;window++){const n=nodes[window];const dirs=[0,1,2,3,4,5].filter(d=>d!==n.heading&&d!==mod(n.heading+3)).sort((a,b)=>hexDist(add(n.pos,a),target!.pos)-hexDist(add(n.pos,b),target!.pos));if(hexDist(n.pos,target.pos)<=6)p.torps.push({window,dir:dirs[0]});}}
  if(ship.cfg.carrier){const liveSlots=ship.airReady.map((ready,slot)=>({ready,slot,cfg:planeForSlot(ship.cfg,slot)})).filter(x=>x.ready<=g.round&&ship.airHP[x.slot]>0).sort((a,b)=>(a.cfg.role==='scout'?-2:a.cfg.role==='fighter'?-1:0)-(b.cfg.role==='scout'?-2:b.cfg.role==='fighter'?-1:0)||a.slot-b.slot);
   for(const {slot,cfg} of liveSlots){if(p.planes.length>=ship.cfg.carrier.launch)break;
    if(cfg.role==='fighter'){if(v.planes.some(x=>x.team!==0)||g.round===1)p.planes.push({slot,mode:'patrol',target:enemies.slice().sort((a,b)=>a.id.localeCompare(b.id))[0]?.pos??Object.entries(h.contacts).filter(([k])=>k.startsWith('0:')).sort((a,b)=>a[0].localeCompare(b[0]))[0]?.[1].at??fromCR(12,[5,10,14][i])});}
    else if(cfg.role==='scout')p.planes.push({slot,mode:'point',target:fromCR(7,[7,11,2][i])});
    else {const victim=enemies.slice().sort((a,b)=>a.id.localeCompare(b.id))[0];if(victim)p.planes.push({slot,mode:'target',targetId:victim.id});else {const c=Object.entries(h.contacts).filter(([k])=>k.startsWith('0:')).sort((a,b)=>a[0].localeCompare(b[0]))[0]?.[1];if(c)p.planes.push({slot,mode:'point',target:c.at});}}
   }
  }
  plans[ship.id]=p;reserved.push(...route(ship,p,v.map).slice(1).map(x=>x.pos));
 }
 return plans;
}
describe('real historical reference victories',()=>{
 it.each(HISTORICAL_BATTLES.flatMap(x=>[{id:x.id,variant:false},{id:x.id,variant:true}]))('$id alternate=$variant wins from the unmodified initial fixture',({id,variant})=>{
  let save=createHistoricalBattle(id);if(variant&&id==='samar')save.state.convoyRoute='east';const progress:string[]=[];const data=new Map<string,string>(),store=createHistoricalStorage({getItem:k=>data.get(k)??null,setItem:(k,v)=>{data.set(k,v);}});
  for(let n=0;n<20&&save.state.status==='playing';n++){
   const out=resolveHistoricalRound(save.game,save.state,referenceOrders(save,variant));save={...save,game:out.game,state:out.historical,plans:{},selected:''};
   progress.push(`R${n+1} ${save.state.stage} sunk=${save.state.counters.sunk} tracking=${save.state.counters.tracking??0} port=${save.state.counters.port??0} exits=${Object.keys(save.state.extracted)} HP=${save.game.ships.map(s=>s.id+':'+s.hp).join(',')}`);
   expect(store.write(save),progress.join('\n')).toEqual({ok:true});const read=store.read(id);expect(read.kind).toBe('resume');if(read.kind==='resume')save=read.save;
  }
  console.log(id,variant?'alternate':'primary',`round=${save.state.result?.round} stars=${save.state.result?.stars} sunk=${save.state.counters.sunk} extracted=${Object.keys(save.state.extracted).join(',')} surviving=${save.game.ships.filter(s=>s.team===0&&s.hp>0).map(s=>s.id+':'+s.hp).join(',')}`);expect(save.state.status,progress.join('\n')).toBe('won');expect(save.state.result!.round).toBeLessThanOrEqual(HISTORICAL_BATTLES.find(x=>x.id===id)!.roundLimit);
  if(process.env.HISTORICAL_EXPORT_WON==='1'&&id==='midway'&&!variant){const key=`${HISTORICAL_SAVE_PREFIX}:${id}`;writeFileSync('/private/tmp/historical-won-sample.json',JSON.stringify({key,value:data.get(key)}));}
 },30000);
});
