import type {BattleFrame,Presentation,XY} from '../shared/game.ts';
import {REPLAY_FRAME_MS} from '../shared/replay-timing.ts';

export interface SecondaryAnimation {detectedAt:number;events:Presentation[]}
const DISCOVERY_DELAY_MS=500;

function timeAtOffset(frames:readonly BattleFrame[],offset:number){
  const index=Math.min(Math.floor(offset),frames.length-1),from=frames[index],to=frames[index+1];
  // Settling snapshots continue in steps of 0.1 after movement has finished.
  return from.t+(offset-index)*(to?to.t-from.t:.1);
}

function shipPosition(frames:readonly BattleFrame[],id:string,time:number):XY|undefined{
  const nextIndex=frames.findIndex(f=>f.t>time),index=nextIndex<0?frames.length-1:Math.max(0,nextIndex-1);
  const frame=frames[index],ship=frame.ships.find(s=>s.id===id),next=frames[index+1];
  if(!ship)return;
  const target=next?.ships.find(s=>s.id===id);
  if(!target||ship.hp<=0||[...(frame.zones??[]),...(next.zones??[])].some(z=>z.kind==='smoke'))return {...ship.xy};
  const u=Math.min(1,Math.max(0,(time-frame.t)/(next.t-frame.t)));
  return {x:ship.xy.x+(target.xy.x-ship.xy.x)*u,y:ship.xy.y+(target.xy.y-ship.xy.y)*u};
}

/** Change presentation only; snapshots, damage and combat event times stay intact. */
export function scheduleSecondaryAnimations(frames:readonly BattleFrame[],animations:readonly SecondaryAnimation[]){
  if(!frames.length)return;
  for(const animation of animations){
    const projectile=animation.events.find(e=>e.type==='projectile');
    if(!projectile||projectile.type!=='projectile')continue;
    const revealed=frames.findIndex(f=>f.t>=animation.detectedAt-1e-9);
    const deadline=timeAtOffset(frames,(revealed<0?frames.length-1:revealed)+DISCOVERY_DELAY_MS/REPLAY_FRAME_MS);
    const shift=Math.max(0,deadline-projectile.start);
    for(const event of animation.events){
      if(event.type==='projectile'){event.start+=shift;event.end+=shift;}
      else event.time+=shift;
    }
    const origin=projectile.sourceId?shipPosition(frames,projectile.sourceId,projectile.start):undefined;
    if(origin)projectile.from=origin;
  }
}
