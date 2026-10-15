export * from '../../shared/history.ts';
export * from './content.ts';
export * from './maps.ts';
import type {HistoricalId,HistoricalSave} from '../../shared/history.ts';
import {getHistoricalDefinition} from './content.ts';
import {clone,createShip,updateExploration} from '../engine.ts';
import {planeForSlot} from '../ship-definitions.ts';
export function createHistoricalBattle(id:HistoricalId):HistoricalSave {
 const d=getHistoricalDefinition(id);if(!d)throw new Error('未知历史战斗');
 const ships=d.units.map(u=>{const s=createShip(u.template,u.team,Number(u.id.split('-')[1]),u.pos);s.cfg=clone(u.cfg);s.id=u.id;s.label=u.name;s.name=u.name;s.hp=u.hp??u.cfg.hp;s.heading=u.heading;s.torps=u.cfg.torpedo?.reserve??0;s.smokeLeft=u.cfg.smoke?.charges??0;s.airReady=clone(u.airReady??Array(u.cfg.carrier?.stock??0).fill(1));s.airHP=s.airReady.map((_,i)=>planeForSlot(s.cfg,i).hp);return s;});
 const game={ruleset:'fleet-v1' as const,seed:19421213,round:1,map:clone(d.map),ships,torpedoes:[],planes:[],nextId:0,log:[],winner:null,phase:'plan' as const,explored:[[],[]],zones:[]};updateExploration(game);
 return {game,state:{version:1,scenarioId:id,status:'playing',lastResolvedRound:0,stage:({"river-plate":'contact',narvik:'advance',"denmark-strait":'breakthrough',midway:'search',samar:'escort'} as const)[id],counters:{},events:[],extracted:{},contacts:{},convoyRoute:'central',convoyWait:false,convoyWaitLastRound:-1},plans:{},selected:d.units.find(u=>u.controlled)!.id};
}
export {historicalFriendlyPlans} from './ai.ts';
export {resolveHistoricalRound,historicalObjectives} from './runtime.ts';
