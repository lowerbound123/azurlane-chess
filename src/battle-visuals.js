import { hexToXY, xyToHex, key } from './engine.js';

const lerp=(a,b,u)=>({x:a.x+(b.x-a.x)*u,y:a.y+(b.y-a.y)*u,z:a.z+(b.z-a.z)*u});
const seen=(point,visible)=>visible.has(key(xyToHex({x:point.x,y:point.z})));
const normals=Array.from({length:6},(_,i)=>({x:Math.cos(i*Math.PI/3),z:Math.sin(i*Math.PI/3)}));

// Clip each line against the convex footprint of each visible hex. Separate
// fragments never share a polyline across fog, even if both endpoints are seen.
function clipSegment(a,b,centers) {
  const ranges=[];
  for(const center of centers){
    let lo=0,hi=1;
    for(const n of normals){
      // Slight inset avoids rounding a boundary point onto a hidden neighbor.
      const limit=Math.sqrt(3)/2-1e-7;
      const start=(a.x-center.x)*n.x+(a.z-center.y)*n.z;
      const delta=(b.x-a.x)*n.x+(b.z-a.z)*n.z;
      if(Math.abs(delta)<1e-12){if(start>limit){hi=-1;break;}continue;}
      const cut=(limit-start)/delta;
      if(delta>0)hi=Math.min(hi,cut);else lo=Math.max(lo,cut);
      if(lo>hi)break;
    }
    if(lo<=hi&&lo<=1&&hi>=0)ranges.push([Math.max(0,lo),Math.min(1,hi)]);
  }
  return ranges.sort((a,b)=>a[0]-b[0]).map(([lo,hi])=>[lerp(a,b,lo),lerp(a,b,hi)]);
}

function position(event,u) {
  const main=event.kind==='main',aa=event.kind==='aa';
  const distance=Math.hypot(event.to.x-event.from.x,event.to.y-event.from.y);
  const height=main?Math.max(1.5,Math.min(5,distance*.28)):aa?.15:.12;
  return {x:event.from.x+(event.to.x-event.from.x)*u,
    y:(aa?.2+u*1.4:main?0:.15)+4*height*u*(1-u),
    z:event.from.y+(event.to.y-event.from.y)*u};
}

/** Pure time sampling. The renderer receives only visible fragments and no source metadata. */
export function sampleBattleVisuals(events=[],time=0,visible=new Set()) {
  const cells=visible instanceof Set?visible:new Set(visible);
  const centers=[...cells].map(k=>{const [q,r]=k.split(',').map(Number);return hexToXY({q,r});});
  const projectiles=[],effects=[];
  for(const event of events){
    if(event.type==='effect'){
      const age=(time-event.time)/event.duration;
      if(age>=0&&age<=1&&cells.has(key(event.at)))effects.push({id:event.id,kind:event.kind,at:{...event.at},age,text:event.text??''});
      continue;
    }
    if(event.type!=='projectile'||time<event.start||time>event.end)continue;
    const u=(time-event.start)/(event.end-event.start),point=position(event,u);
    const tail=Math.max(0,u-(event.kind==='main'?.24:.55));
    const segments=12,fragments=[];
    for(let i=0;i<segments;i++){
      const a=position(event,tail+(u-tail)*i/segments),b=position(event,tail+(u-tail)*(i+1)/segments);
      for(const segment of clipSegment(a,b,centers)){
        const last=fragments.at(-1),end=last?.at(-1);
        if(end&&Math.hypot(end.x-segment[0].x,end.z-segment[0].z)<1e-8)last.push(segment[1]);
        else fragments.push(segment);
      }
    }
    const safePosition=seen(point,cells)?point:null;
    if(!fragments.length){if(safePosition)projectiles.push({id:event.id,kind:event.kind,team:event.team,position:safePosition,trail:[]});continue;}
    // Keep one stable particle ID; clipped trail parts have independent IDs.
    projectiles.push({id:event.id,kind:event.kind,team:event.team,position:safePosition,trail:fragments[0]});
    for(let i=1;i<fragments.length;i++)projectiles.push({id:`${event.id}:trail:${i}`,kind:event.kind,team:event.team,position:null,trail:fragments[i]});
  }
  return {projectiles,effects};
}
