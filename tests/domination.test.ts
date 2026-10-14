import {test,expect} from 'vitest';
import * as E from '../src/engine.ts';
import type {Game} from '../shared/game.ts';

const make=()=>E.createFleetGame(undefined,20261004,undefined,'domination');
function quiet():Game {const g=make();g.phase='plan';g.map.islands=[];g.map.mines=[];for(const s of g.ships){delete s.cfg.secondary;delete s.cfg.aa;}return g;}
function put(g:Game,id:string,h:{q:number;r:number}){const s=g.ships.find(s=>s.id===id)!;s.pos={...h};s.xy=E.hexToXY(h);}
test('domination creates expanded three-point map without changing legacy defaults',()=>{
 const g=make();expect(g.map.width).toBe(21);expect(g.map.height).toBe(17);expect(g.domination?.points.map(p=>p.id)).toEqual(['A','B','C']);expect(g.domination?.scores).toEqual([0,0]);
 expect(E.createFleetGame().map.width).toBe(19);expect(E.createFleetGame().domination).toBeUndefined();expect(make()).toEqual(g);
});
test('two capture settlements, delayed income and unattended ownership',()=>{
 let g=quiet();const h=E.fromCR(4,5);put(g,'0-0',h);
 g=E.resolveRound(g).game;expect(g.domination?.points[0]).toMatchObject({owner:null,progressTeam:0,progress:50});
 g=E.resolveRound(g).game;expect(g.domination?.points[0]).toMatchObject({owner:0,progress:0,capturedRound:2});expect(g.domination?.scores).toEqual([0,0]);
 put(g,'0-0',E.fromCR(4,16));g=E.resolveRound(g).game;expect(g.domination?.scores).toEqual([5,0]);
});
test('contesting freezes capture, friendly rotation continues, empty neutral resets',()=>{
 let g=quiet();put(g,'0-0',E.fromCR(4,5));g=E.resolveRound(g).game;
 put(g,'1-0',E.fromCR(6,5));g=E.resolveRound(g).game;expect(g.domination?.points[0]).toMatchObject({owner:null,progress:50,contested:true});
 put(g,'0-0',E.fromCR(4,16));put(g,'1-0',E.fromCR(17,0));g=E.resolveRound(g).game;expect(g.domination?.points[0]).toMatchObject({progress:0,progressTeam:null});
 put(g,'0-1',E.fromCR(4,5));g=E.resolveRound(g).game;put(g,'0-1',E.fromCR(3,16));put(g,'0-0',E.fromCR(4,5));g=E.resolveRound(g).game;expect(g.domination?.points[0].owner).toBe(0);
});
test('enemy presence blocks income and exclusive entry neutralizes before takeover',()=>{
 let g=quiet();put(g,'0-0',E.fromCR(4,5));g=E.resolveRound(E.resolveRound(g).game).game;
 put(g,'1-0',E.fromCR(6,5));g=E.resolveRound(g).game;expect(g.domination?.scores).toEqual([0,0]);expect(g.domination?.points[0].owner).toBe(0);
 put(g,'0-0',E.fromCR(4,16));g=E.resolveRound(g).game;expect(g.domination?.points[0]).toMatchObject({owner:null,progressTeam:1,progress:50});
 g=E.resolveRound(g).game;expect(g.domination?.points[0].owner).toBe(1);expect(g.domination?.scores).toEqual([0,0]);
 g=E.resolveRound(g).game;expect(g.domination?.scores).toEqual([0,5]);
});
test('artillery casualty scores once and cannot finish capture',()=>{
 let g=quiet();const at=E.fromCR(10,8);put(g,'1-0',at);put(g,'0-3',E.fromCR(10,12));g.ships.find(s=>s.id==='1-0')!.hp=1;
 g=E.resolveRound(g,{'0-3':{...E.emptyPlan(),main:[at]}}).game;
 expect(g.domination?.scores).toEqual([15,0]);expect(g.domination?.points[1].progress).toBe(0);
 g=E.resolveRound(g).game;expect(g.domination?.scores).toEqual([15,0]);
});
test('passing through a circle does not capture and collision rollback uses actual resting positions',()=>{
 const moves=(n:number)=>Array.from({length:n},()=>({turn:0,forward:true}));
 let g=quiet();put(g,'0-0',{q:5,r:8});g.ships[0].heading=0;
 g=E.resolveRound(g,{'0-0':{...E.emptyPlan(),moves:moves(5)}}).game;
 expect(g.ships[0].pos).toEqual({q:9,r:8});expect(g.domination!.points[1].progress).toBe(0);
 g=quiet();put(g,'0-0',{q:3,r:8});put(g,'1-0',{q:5,r:8});g.ships[0].heading=0;g.ships[5].heading=3;
 const result=E.resolveRound(g,{'0-0':{...E.emptyPlan(),moves:moves(5)},'1-0':{...E.emptyPlan(),moves:moves(5)}});
 expect(result.events.some(e=>e.text.includes('沿原路回退'))).toBe(true);expect(result.game.ships[0].pos).toEqual({q:3,r:8});
 expect(result.game.domination!.points[1]).toMatchObject({progressTeam:1,progress:50,contested:false});
});
test('fatal mine in a circle gives sinking score without capture progress',()=>{
 const g=quiet();put(g,'0-1',{q:4,r:8});g.ships[1].heading=0;g.ships[1].hp=1;g.map.mines=[{q:5,r:8}];
 const result=E.resolveRound(g,{'0-1':{...E.emptyPlan(),moves:[{turn:0,forward:true}]}});
 expect(result.game.ships[1].hp).toBe(0);expect(result.game.domination!.scores).toEqual([0,15]);expect(result.game.domination!.points[1].progress).toBe(0);
});
