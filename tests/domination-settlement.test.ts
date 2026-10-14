import {test,expect} from 'vitest';
import * as E from '../src/engine.ts';
import {settleDomination,dominationWinner} from '../shared/domination.ts';
const make=()=>E.createFleetGame(undefined,42,undefined,'domination');
test('simultaneous end conditions use score, survivors, HP and finally draw',()=>{
 const g=make(),counts=[{count:2,hp:100},{count:2,hp:100}];g.domination!.scores=[100,105];expect(dominationWinner(g,counts)).toBe(1);
 g.domination!.scores=[105,105];expect(dominationWinner(g,counts)).toBe('draw');counts[0].hp=101;expect(dominationWinner(g,counts)).toBe(0);
 counts[1].count=3;expect(dominationWinner(g,counts)).toBe(1);
 g.domination!.scores=[95,0];expect(dominationWinner(g,counts)).toBeNull();g.round=30;expect(dominationWinner(g,counts)).toBe(0);
 counts[0].count=0;counts[0].hp=0;expect(dominationWinner(g,counts)).toBe(1);
 counts[1].count=0;counts[1].hp=0;expect(dominationWinner(g,counts)).toBe(0);g.domination!.scores=[0,0];expect(dominationWinner(g,counts)).toBe('draw');
});
test('sink transitions score regardless cause, never for already dead hulls or twice in one round',()=>{
 const g=make(),before=structuredClone(g.ships);g.ships[0].hp=0;g.ships[5].hp=0;settleDomination(g,before);expect(g.domination!.scores).toEqual([15,15]);
 settleDomination(g,before);expect(g.domination!.scores).toEqual([15,15]);g.round++;settleDomination(g,g.ships);expect(g.domination!.scores).toEqual([15,15]);
});
test('hidden hull captures publicly without disclosing its identity, and extra hulls do not accelerate',()=>{
 const g=make();g.map.islands=[];g.map.mines=[];const center=g.domination!.points[0].center;
 for(const [i,h]of [center,E.add(center,0)].entries()){g.ships[i].pos=h;g.ships[i].xy=E.hexToXY(h);}
 g.zones=[{kind:'smoke',team:0,center,radius:2,expires:4}];settleDomination(g,g.ships);
 expect(g.domination!.points[0].progress).toBe(50);const view=E.observe(g,1);expect(view.ships.some(s=>s.team===0)).toBe(false);expect(view.domination).toEqual(g.domination);expect(JSON.stringify(view.domination)).not.toContain('0-0');
 g.ships[0].hp-=1;g.round++;settleDomination(g,g.ships);expect(g.domination!.points[0].owner).toBe(0);
});
test('replay snapshots show gains only after settlement and ended games cannot score again',()=>{
 const g=make();g.phase='plan';g.map.mines=[];g.map.islands=[];g.round=3;g.domination!.lastRound=2;g.domination!.scores=[95,0];Object.assign(g.domination!.points[0],{owner:0,capturedRound:2});
 const result=E.resolveRound(g);expect(result.frames[0].domination!.scores).toEqual([95,0]);expect(result.frames.at(-1)!.domination!.scores).toEqual([100,0]);expect(result.game.winner).toBe(0);
 expect(E.resolveRound(result.game).game).toEqual(result.game);
});
