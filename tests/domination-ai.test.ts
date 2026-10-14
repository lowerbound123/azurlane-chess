import {test,expect} from 'vitest';
import * as E from '../src/engine.ts';
test('local AI captures and holds a neutral point without visible enemies',()=>{
 let g=E.createFleetGame(undefined,42,undefined,'domination');g.phase='plan';g.map.islands=[];g.map.mines=[];
 g.ships=g.ships.filter(s=>s.id==='0-0'||s.id==='1-4');
 g.ships[0].pos=E.fromCR(4,5);g.ships[0].xy=E.hexToXY(g.ships[0].pos);
 for(let i=0;i<2;i++){const view=E.observe(g,0);expect(view.ships.filter(s=>s.team===1)).toHaveLength(0);const p=E.planAI(view,0);expect(p['0-0']).toEqual(E.validPlan(view,view.ships[0],p['0-0']));g=E.resolveRound(g,p).game;}
 expect(g.domination!.points[0].owner).toBe(0);
});
test('local AI reaches an objective from normal deployment',()=>{
 let g=E.createFleetGame(undefined,42,undefined,'domination');g.phase='plan';g.map.mines=[];
 for(let i=0;i<5;i++)g=E.resolveRound(g,E.planAI(E.observe(g,0),0)).game;
 expect(g.domination!.points.some(p=>p.owner===0)).toBe(true);
});
