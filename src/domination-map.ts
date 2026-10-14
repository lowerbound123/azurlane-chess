import type {GameMap,Hex} from '../shared/game.ts';
import {CAPTURE_CENTERS,DOMINATION_RULES} from '../shared/domination.ts';
import {allHexes,fromCR,toCR,key,hexDist,add,inBounds,deployment,mod} from './engine.ts';

/** Keep a shortest, heading-aware opening route to every point for both teams. */
function openingRoutes(map:GameMap):Set<string>{
 const protectedCells=new Set<string>();
 for(const team of [0,1])for(const point of CAPTURE_CENTERS){
  const queue=deployment(team,map).map(h=>({h,d:team?3:0,parent:-1}));
  const seen=new Set(queue.map(n=>`${key(n.h)}:${n.d}`));
  for(let i=0;i<queue.length;i++){
   const node=queue[i];
   if(hexDist(node.h,point.center)<=2){for(let j=i;j>=0;j=queue[j].parent)protectedCells.add(key(queue[j].h));break;}
   for(const turn of [0,-1,1])for(const forward of [true,false]){
    const d=mod(node.d+turn),h=forward?add(node.h,d):node.h,k=`${key(h)}:${d}`;
    if(!inBounds(h,map)||seen.has(k))continue;seen.add(k);queue.push({h,d,parent:i});
   }
  }
 }
 return protectedCells;
}
function connected(map:GameMap,blocked:Set<string>):boolean {
 const cells=allHexes(map).filter(h=>!blocked.has(key(h))),queue=[cells[0]],seen=new Set([key(cells[0])]);
 for(let i=0;i<queue.length;i++)for(let d=0;d<6;d++){
  const h=add(queue[i],d),k=key(h);if(inBounds(h,map)&&!blocked.has(k)&&!seen.has(k)){seen.add(k);queue.push(h);}
 }
 return seen.size===cells.length;
}
export function generateDominationMap(seed:number):GameMap {
 const map:GameMap={width:DOMINATION_RULES.width,height:DOMINATION_RULES.height,islands:[],mines:[]};
 let state=seed>>>0;
 const random=()=>{state+=0x6D2B79F5;let t=state;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return((t^t>>>14)>>>0)/4294967296;};
 const shuffled=allHexes(map);for(let i=shuffled.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[shuffled[i],shuffled[j]]=[shuffled[j],shuffled[i]];}
 const mirror=(h:Hex)=>{const {c,r}=toCR(h);return fromCR(map.width-1-c,map.height-1-r);};
 const protectedCells=openingRoutes(map),deploy=new Set([...deployment(0,map),...deployment(1,map)].map(key));
 const objective=(h:Hex)=>CAPTURE_CENTERS.some(p=>hexDist(h,p.center)<=2);
 const blocked=new Set<string>();
 for(const h of shuffled){
  const pair=[h,mirror(h)];if(blocked.size>=34)break;
  if(pair.some(p=>blocked.has(key(p))||protectedCells.has(key(p))||deploy.has(key(p))||objective(p)))continue;
  const next=new Set([...blocked,...pair.map(key)]);
  if(next.size<=34&&connected(map,next))pair.forEach(p=>blocked.add(key(p)));
 }
 map.islands=[...blocked];
 for(const h of shuffled){
  if(map.mines.length>=8)break;const pair=[h,mirror(h)];
  if(key(pair[0])===key(pair[1])||pair.some(p=>blocked.has(key(p))||deploy.has(key(p))||objective(p)||map.mines.some(m=>key(m)===key(p))))continue;
  map.mines.push(...pair.map(p=>({...p})));
 }
 return map;
}
