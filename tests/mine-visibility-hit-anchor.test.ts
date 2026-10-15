import {test,expect,vi} from 'vitest';
import * as THREE from 'three';
import * as E from '../src/engine.ts';
import {playerView,playerResult} from '../server/views.ts';
import {sampleBattleVisuals} from '../src/battle-visuals.ts';
import {Effects} from '../src/scene/effects.ts';
import type {Game} from '../shared/game.ts';
vi.mock('../src/scene/resources.ts',async original=>({...await original<typeof import('../src/scene/resources.ts')>(),damageNumber:()=>new THREE.Sprite(new THREE.SpriteMaterial())}));
const h=(q:number,r:number)=>({q,r});
function fixture(){const g=E.createFleetGame();g.phase='plan';g.map.islands=[];g.map.mines=[];g.ships=[E.createShip('bb',0,0,h(2,5)),E.createShip('ca',1,0,h(6,5))];g.ships.forEach(s=>{delete s.cfg.aa;delete s.cfg.secondary;});E.updateExploration(g);return g;}
test('unexplored mines are absent from local observations, network state and replay frames',()=>{
 const g=fixture(),known=h(3,5),unknown=h(17,0);g.explored=[['3,5'],[]];g.map.mines=[known,unknown];
 expect(E.observe(g,0).map.mines).toEqual([known]);expect(playerView(g,0).map.mines).toEqual([known]);
 const result=E.resolveRound(g);const wire=playerResult(g,result,0);for(const f of wire.frames)expect(f.mines.every(m=>f.explored.includes(E.key(m)))).toBe(true);
});
test('a mine impact damages the ship and emits an anchored torpedo explosion; contact sweeping does not',()=>{
 const g=fixture(),s=g.ships[0];g.map.mines=[{...s.pos}];const out=E.resolveRound(g);
 expect(out.game.ships[0].hp).toBeLessThan(s.hp);expect(out.presentation.some(p=>p.type==='effect'&&p.kind==='torpedo'&&p.targetId===s.id)).toBe(true);
 const dd=E.createShip('dd',0,0,s.pos);g.ships[0]=dd;const clear=E.resolveRound(g);expect(clear.game.ships[0].hp).toBe(dd.hp);expect(clear.presentation.some(p=>p.kind==='torpedo')).toBe(false);
});
test('successful hits follow a visible moving target, retain a lethal impact fallback, and never expose hidden IDs',()=>{
 const g=fixture(),target=g.ships[1],out=E.resolveRound(g,{[g.ships[0].id]:{...E.emptyPlan(),main:[target.pos]}});
 const impact=out.presentation.find(p=>p.type==='effect'&&p.kind==='main')!;if(impact.type!=='effect')throw new Error('missing impact');expect(impact.targetId).toBe(target.id);
 const cells=new Set(E.allHexes(g.map).map(E.key)),moved={...target,xy:{x:target.xy.x+.6,y:target.xy.y+.25}};
 const visuals=sampleBattleVisuals([impact],1.3,cells,0,[moved]);expect(visuals.effects[0].targetId).toBe(target.id);
 const fx=new Effects(new THREE.Scene());fx.update(visuals,[moved]);const node=fx.cache.get(`vfx:${impact.id}:main`)!;expect(node.position.x).toBe(moved.xy.x);expect(node.position.z).toBe(moved.xy.y);
 fx.update(visuals,[{...moved,xy:{x:moved.xy.x+1,y:moved.xy.y}}]);expect(node.position.x).toBe(moved.xy.x+1);
 const dead=sampleBattleVisuals([impact],1.3,cells,0,[]);expect(dead.effects[0].position).toEqual(target.xy);expect(dead.effects[0].targetId).toBeUndefined();fx.update(dead,[]);expect(node.position.x).toBe(target.xy.x);fx.dispose();
 const hidden=sampleBattleVisuals([impact],1.3,new Set(),0,[]);expect(hidden.effects).toEqual([]);
});
