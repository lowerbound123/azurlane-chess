import type {FrameShip,Presentation,Zone} from '../../shared/game.ts';
import type {SampledVisuals} from '../battle-visuals.ts';
import type {MusicTrack} from '../../shared/audio.ts';
import {presentationCells,key} from '../engine.ts';
export type AudioShip=Pick<FrameShip,'id'|'team'|'template'|'hp'|'catalogId'>;
export interface AudioFrame {t:number;ships:AudioShip[];visible:string[];visibleByTeam?:string[][];zones?:Zone[];visuals?:SampledVisuals}
export interface AudioRound {game:{ships:AudioShip[]};frames:AudioFrame[];presentation?:Presentation[]}
export type BattleAudioEvent={id:string;time:number;channel:'effect';cue:string}|{id:string;time:number;channel:'voice';ship:AudioShip;action:'skill'|'lose'};
const frontline=new Set(['dd','cl','ca']);
const skills=new Set(['torpedo','guard','sweep','skill','mine','smoke','radar','escort']);
const actionEffects:Record<string,string>={fire:'battle-cannon-sub',mainFire:'battle-cannon-main',aircraft:'battle-plane',torpedo:'battle-torpedo-move',sweep:'battle-cannon-sub',dead:'battle-sink',radar:'battle-scan',mine:'battle-shuihua'};
const impactEffects:Record<string,string>={main:'battle-boom1','main-blast':'battle-boom2',bomb:'battle-air-atk',torpedo:'battle-torpedo-hit',hit:'battle-hit',shot:'battle-hit',aa:'battle-cannon-air',fighter:'battle-cannon-air',collision:'battle-hit','guard-start':'battle-wave'};

/** Uses raw local events or the server's visibility-clipped snapshots. Never infer an unseen enemy action. */
export function battleAudioEvents(round:AudioRound,initial:AudioShip[],team:number):BattleAudioEvent[]{
 const units=new Map([...initial,...round.frames.flatMap(f=>f.ships),...round.game.ships].map(s=>[s.id,s]));
 const events:BattleAudioEvent[]=[],seen=new Set<string>();
 const add=(event:BattleAudioEvent)=>{if(!seen.has(event.id)){seen.add(event.id);events.push(event);}};
 const visible=(at:{q:number;r:number},time:number)=>{
  const frame=round.frames.findLast(f=>f.t<=time+1e-8)??round.frames[0];
  return !!frame&&presentationCells(new Set(frame.visibleByTeam?.[team]??frame.visible),frame.zones).has(key(at));
 };
 const act=(id:string,shipId:string,action:string,time:number,audible:boolean)=>{
  const unit=units.get(shipId);if(!unit)return;
  const t=Math.max(0,Number(time.toFixed(6)));
  if(unit.team===team&&(action==='mainFire'&&unit.template==='bb'||action==='aircraft'&&unit.template==='cv'||frontline.has(unit.template)&&skills.has(action)))
   add({id:`voice:skill:${shipId}:${t.toFixed(3)}`,time:t,channel:'voice',ship:unit,action:'skill'});
  if(audible&&actionEffects[action])add({id:`action:${id}`,time:t,channel:'effect',cue:actionEffects[action]});
 };
 if(round.presentation?.length){
  for(const event of round.presentation){
   if(event.type==='action')act(event.id,event.shipId,event.action,event.time,event.team===team||visible(event.at,event.time));
   else if(event.type==='effect'&&impactEffects[event.kind]&&(visible(event.at,event.time)||event.kind==='hit'&&event.team===team))
    add({id:`impact:${event.id}`,time:event.time,channel:'effect',cue:impactEffects[event.kind]});
  }
 }else{
  const observed=new Set<string>();
  for(const frame of round.frames){
   for(const event of frame.visuals?.actions??[]){
    const id=`action:${event.id}`;if(observed.has(id))continue;observed.add(id);
    // The server may reveal an old event only after it enters vision. Never
    // move its sound earlier than the first snapshot that actually exposed it.
    act(event.id,event.shipId,event.action,frame.t,true);
   }
   for(const event of frame.visuals?.effects??[]){
    const cue=impactEffects[event.kind];if(!cue)continue;
    add({id:`impact:${event.id}`,time:frame.t,channel:'effect',cue});
   }
  }
 }
 const aliveAtStart=new Set([...initial,...(round.frames[0]?.ships??[])].filter(s=>s.team===team&&s.hp>0).map(s=>s.id));
 const lost=new Set<string>();
 for(const frame of [...round.frames,{t:round.frames.at(-1)?.t??0,ships:round.game.ships}])for(const unit of frame.ships){
  if(unit.team!==team||unit.hp>0||!aliveAtStart.has(unit.id)||lost.has(unit.id))continue;
  lost.add(unit.id);add({id:`voice:lose:${unit.id}`,time:frame.t,channel:'voice',ship:unit,action:'lose'});
 }
 return events.sort((a,b)=>a.time-b.time||a.id.localeCompare(b.id));
}
export function musicForPage(screen:string,ended=false,overview=false,assembling=false):MusicTrack{
 if(assembling)return 'fleet-assembly';
 if(screen==='battle')return overview?'campaign':ended?'port':'combat';
 if(screen==='fleet'||screen==='ai-fleet')return 'fleet-assembly';
 if(screen==='new')return 'stage-select';
 if(screen==='history')return 'campaign';
 if(screen==='lessons'||screen==='online')return 'port';
 if(screen==='saves'||screen==='book'||screen==='not-found')return 'archive';
 return 'main-menu';
}
