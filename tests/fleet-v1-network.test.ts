import {it,expect} from 'vitest';
import * as E from '../src/engine.ts';
import {playerView,validateOrders,playerResult} from '../server/views.ts';
it('hides smoke ships on visible terrain, private charges and mine source',()=>{
 const g=E.createFleetGame();g.map.islands=[];g.ships.forEach((s,i)=>{s.pos={q:s.team?7:3,r:7};s.xy=E.hexToXY(s.pos)});
 g.zones=[{kind:'smoke',team:1,center:{q:7,r:7},radius:1,expires:3}];
 g.map.mines=[{q:5,r:7,armedRound:2,sourceId:'1-0',team:1,damage:40}];
 const v=playerView(g,0);expect(v.ships.every(s=>s.team===0)).toBe(true);expect(v.map.mines[0]).toEqual({q:5,r:7,armedRound:2});
 expect(v.zones?.some(z=>z.kind==='smoke')).toBe(true);
});
it('accepts new skills and rejects forged and duplicate slots',()=>{
 const g=E.createFleetGame(['dd-1','cl-3','ca-2','cv-2','cv-3']);g.map.islands=[];
 const cv=g.ships[3],mine=g.ships[0];
 expect(()=>validateOrders(g,0,{[cv.id]:{...E.emptyPlan(),planes:[{slot:0,mode:'patrol',target:cv.pos}]}})).not.toThrow();
 expect(()=>validateOrders(g,0,{[cv.id]:{...E.emptyPlan(),planes:[{slot:0,mode:'patrol',target:cv.pos},{slot:0,mode:'patrol',target:cv.pos}]}})).toThrow();
 expect(()=>validateOrders(g,0,{[mine.id]:{...E.emptyPlan(),smoke:true}})).toThrow();
});
it('radar-revealed smoke ships remain present in every projected frame',()=>{
 const g=E.createFleetGame();g.map.islands=[];g.map.mines=[];g.phase='plan';
 g.ships=[E.createCatalogShip('cl-3',0,0,{q:0,r:7}),E.createCatalogShip('bb-1',1,0,{q:4,r:7})];g.ships.forEach(s=>delete s.cfg.secondary);
 g.zones=[{kind:'smoke',team:1,center:{q:4,r:7},radius:1,expires:3},{kind:'radar',team:0,center:{q:4,r:7},radius:1,expires:3}];
 const projected=playerResult(g,E.resolveRound(g),0);expect(projected.frames.every(f=>f.ships.some(s=>s.id==='1-0'))).toBe(true);
});
