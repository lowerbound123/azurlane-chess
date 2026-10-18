import type {CampaignState} from '../../shared/campaign.ts';
import type {Presentation} from '../../shared/game.ts';
import {add,inBounds,key,type MapSize} from '../engine.ts';
import {CAMPAIGN_CHAPTERS} from './content.ts';

/** A lesson-only view mask. Never add these cells to simulation or saved exploration. */
export function artilleryImpactCells(state:CampaignState|null,time:number|undefined,events:readonly Presentation[],map?:MapSize,team=0){
 const cells=new Set<string>();
 if(!state||CAMPAIGN_CHAPTERS[state.chapter]?.id!=='artillery'||time===undefined)return cells;
 for(const event of events){
  if(event.type!=='effect'||event.team!==team||!['main','main-blast'].includes(event.kind)||time<event.time-1e-9||time>event.time+event.duration+1e-9)continue;
  const area=event.kind==='main-blast'?[event.at,...Array.from({length:6},(_,d)=>add(event.at,d))]:[event.at];
  for(const at of area)if(inBounds(at,map))cells.add(key(at));
 }
 return cells;
}
