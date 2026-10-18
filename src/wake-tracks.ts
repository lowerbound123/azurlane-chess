import type {BattleFrame,TorpedoWake,XY} from '../shared/game.ts';
import type {WakeSegment,WakeTimeline} from '../shared/render.ts';
import {hexToXY,key,presentationCells,torpedoVisible,xyToHex} from './engine.ts';
import {clipSegment} from './battle-visuals.ts';

interface WakeUnit {kind:WakeSegment['kind'];id:string;team:number;xy:XY;hp?:number}
function snapshot(frame:BattleFrame,viewerTeam:number){
 const visible=new Set(frame.visibleByTeam?.[viewerTeam]??frame.visible);
 const explored=new Set(frame.exploredByTeam?.[viewerTeam]??frame.explored);
 const water=presentationCells(visible,frame.zones);
 const units:WakeUnit[]=[
  ...frame.ships.filter(s=>s.team===viewerTeam||(frame.visibleShipIdsByTeam?frame.visibleShipIdsByTeam[viewerTeam]?.includes(s.id):visible.has(key(xyToHex(s.xy))))&&water.has(key(xyToHex(s.xy)))).map(s=>({...s,kind:'ship' as const})),
  ...frame.torpedoes.filter(t=>torpedoVisible(t,viewerTeam,visible,explored)&&(t.team===viewerTeam||water.has(key(xyToHex(t.xy))))),
 ];
 return {units:new Map(units.map(u=>[`${u.kind}:${u.id}`,u])),water,explored};
}
const centers=(cells:Set<string>)=>[...cells].map(k=>{const [q,r]=k.split(',').map(Number);return hexToXY({q,r});});

/** Clip final movement before it reaches either the network or the renderer. */
export function projectTorpedoWakes(wakes:readonly TorpedoWake[],frames:readonly BattleFrame[],viewerTeam:number):TorpedoWake[]{
 const projected:TorpedoWake[]=[];
 for(const wake of wakes){
  const frame=frames.findLast(f=>f.t<=wake.start+1e-9)??frames[0];if(!frame)continue;
  const view=snapshot(frame,viewerTeam),allowed=centers(wake.team===viewerTeam?view.explored:view.water);
  const dx=wake.to.x-wake.from.x,dy=wake.to.y-wake.from.y,square=dx*dx+dy*dy;if(square<1e-14)continue;
  for(const [a,b]of clipSegment({x:wake.from.x,y:0,z:wake.from.y},{x:wake.to.x,y:0,z:wake.to.y},allowed)){
   const lo=Math.max(0,Math.min(1,((a.x-wake.from.x)*dx+(a.z-wake.from.y)*dy)/square));
   const hi=Math.max(lo,Math.min(1,((b.x-wake.from.x)*dx+(b.z-wake.from.y)*dy)/square));
   if(hi-lo>1e-8)projected.push({team:wake.team,from:{x:a.x,y:a.z},to:{x:b.x,y:b.z},start:wake.start+(wake.end-wake.start)*lo,end:wake.start+(wake.end-wake.start)*hi});
  }
 }
 return projected;
}

/** Full presentation history, independent of display frame rate. Birth times
 * reveal only the travelled portion; no wake connects through a hidden unit. */
export function buildWakeTimeline(frames:readonly BattleFrame[],viewerTeam:number,torpedoWakes:readonly TorpedoWake[]=[]):WakeTimeline {
 const segments:WakeSegment[]=[],distances=new Map<string,number>();
 let previous=frames[0]?snapshot(frames[0],viewerTeam):undefined;
 for(let i=1;i<frames.length;i++){
  const from=frames[i-1],to=frames[i],next=snapshot(to,viewerTeam);
  if(to.t>from.t&&previous){
   const visibleCenters=centers(previous.water),exploredCenters=centers(previous.explored);
   for(const [id,unit]of previous.units){
    const target=next.units.get(id);if(!target||unit.hp===0)continue;
    const dx=target.xy.x-unit.xy.x,dy=target.xy.y-unit.xy.y,length=Math.hypot(dx,dy);
    if(length<1e-7||!Number.isFinite(length))continue;
    const distance=distances.get(id)??0;
    // Own hulls continuously explore their path. Weapons and enemies can only
    // leave foam in cells that were already permitted by this snapshot.
    const parts=unit.kind==='ship'&&unit.team===viewerTeam?[[{x:unit.xy.x,y:0,z:unit.xy.y},{x:target.xy.x,y:0,z:target.xy.y}]]:
     clipSegment({x:unit.xy.x,y:0,z:unit.xy.y},{x:target.xy.x,y:0,z:target.xy.y},unit.team===viewerTeam?exploredCenters:visibleCenters);
    const discrete=unit.kind==='ship'&&[...(from.zones??[]),...(to.zones??[])].some(z=>z.kind==='smoke');
    for(const [a,b]of parts){
     const lo=Math.max(0,Math.min(1,((a.x-unit.xy.x)*dx+(a.z-unit.xy.y)*dy)/(length*length)));
     const hi=Math.max(lo,Math.min(1,((b.x-unit.xy.x)*dx+(b.z-unit.xy.y)*dy)/(length*length)));
     if(hi-lo<1e-8)continue;
     segments.push({kind:unit.kind,from:{x:a.x,y:a.z},to:{x:b.x,y:b.z},start:discrete?to.t:from.t+(to.t-from.t)*lo,end:discrete?to.t:from.t+(to.t-from.t)*hi,distance:distance+length*lo});
    }
    distances.set(id,distance+length);
   }
  }
  previous=next;
 }
 for(const wake of projectTorpedoWakes(torpedoWakes,frames,viewerTeam)){
  const previous=segments.findLast(s=>s.kind==='torpedo'&&Math.hypot(s.to.x-wake.from.x,s.to.y-wake.from.y)<1e-5&&Math.abs(s.end-wake.start)<1e-6);
  segments.push({kind:'torpedo',from:wake.from,to:wake.to,start:wake.start,end:wake.end,distance:previous?previous.distance+Math.hypot(previous.to.x-previous.from.x,previous.to.y-previous.from.y):0});
 }
 return {segments,endTime:frames.at(-1)?.t??0};
}
