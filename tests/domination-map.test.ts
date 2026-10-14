import {test,expect} from 'vitest';
import * as E from '../src/engine.ts';
import {generateDominationMap} from '../src/domination-map.ts';
import {CAPTURE_CENTERS} from '../shared/domination.ts';
function arrival(map:E.MapSize&{islands:string[];mines:[]},team:number,center:{q:number;r:number}){
 const queue=E.deployment(team,map).map(h=>({h,d:team?3:0,n:0})),seen=new Set(queue.map(x=>`${E.key(x.h)}:${x.d}`));
 for(let i=0;i<queue.length;i++){const {h,d,n}=queue[i];if(E.hexDist(h,center)<=2)return n;
  for(const t of [-1,0,1])for(const forward of [true,false]){const hd=E.mod(d+t),p=forward?E.add(h,hd):h,k=`${E.key(p)}:${hd}`;if(E.legal(map,p)&&!seen.has(k)){seen.add(k);queue.push({h:p,d:hd,n:n+1});}}
 }return Infinity;
}
test('24 seeds keep connected water, clean objective circles and short heading-aware openings',()=>{
 for(const seed of Array.from({length:24},(_,i)=>i*9173)){
  const map=generateDominationMap(seed),cells=E.allHexes(map),water=cells.filter(h=>E.legal(map,h)),seen=new Set([E.key(water[0])]),queue=[water[0]];
  expect(map.islands.length).toBeGreaterThanOrEqual(32);expect(map.islands.length).toBeLessThanOrEqual(36);expect(map.mines).toHaveLength(8);
  for(let i=0;i<queue.length;i++)for(let d=0;d<6;d++){const h=E.add(queue[i],d),k=E.key(h);if(E.legal(map,h)&&!seen.has(k)){seen.add(k);queue.push(h);}}
  expect(seen.size).toBe(water.length);
  for(const p of CAPTURE_CENTERS){const circle=cells.filter(h=>E.hexDist(h,p.center)<=2);expect(circle).toHaveLength(19);expect(circle.every(h=>E.legal(map,h))).toBe(true);
   const exits=new Set(circle.flatMap(h=>E.DIRS.map((_,d)=>E.add(h,d))).filter(h=>E.legal(map,h)&&E.hexDist(h,p.center)>2).map(E.key));expect(exits.size).toBeGreaterThanOrEqual(2);
   for(const team of [0,1])expect(arrival({...map,mines:[]},team,p.center)).toBe(arrival({...map,islands:[],mines:[]},team,p.center));
  }
  expect(map.mines.every(h=>E.legal(map,h)&&CAPTURE_CENTERS.every(p=>E.hexDist(h,p.center)>2)&&[0,1].every(team=>!E.deployment(team,map).some(d=>E.same(d,h))))).toBe(true);
 }
});
