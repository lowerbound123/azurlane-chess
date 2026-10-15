import {test,expect,vi} from 'vitest';
import * as THREE from 'three';
import * as E from '../src/engine.ts';
import {sampleBattleVisuals} from '../src/battle-visuals.ts';
import {BattleAbilities} from '../src/scene/battle-abilities.ts';
import type {Game,Ship} from '../shared/game.ts';
import type {MapModel} from '../shared/render.ts';
const h=(q:number,r:number)=>({q,r});
const quiet=(s:Ship)=>{delete s.cfg.secondary;delete s.cfg.aa;return s;};
const game=(ships:Ship[]):Game=>({seed:1,round:1,ruleset:'fleet-v1',map:{width:15,height:12,islands:[],mines:[]},ships,torpedoes:[],planes:[],nextId:0,log:[],winner:null,phase:'plan',explored:[[],[]]});
test('salvos stagger visually, retain committed damage, and heavy impacts identify the seven-cell effect',()=>{
 const a=quiet(E.createShip('bb',0,0,h(2,5))),b=quiet(E.createShip('ca',1,0,h(4,5)));
 const result=E.resolveRound(game([a,b]),{[a.id]:{...E.emptyPlan(),main:[b.pos,b.pos,b.pos]}});
 const shots=result.presentation.filter(p=>p.type==='projectile'&&p.kind==='main');
 expect(shots.map(p=>p.start)).toEqual([0,.08,.16]);expect(result.game.ships[1].hp).toBe(50);
 expect(new Set(sampleBattleVisuals(result.presentation,.5,E.allHexes(result.game.map).map(E.key),0).projectiles.filter(p=>p.kind==='main'&&p.position).map(p=>p.position!.x)).size).toBe(3);
 a.cfg.main={...a.cfg.main!,shots:1,blast:1,centerMultiplier:2};
 const heavy=E.resolveRound(game([a,b]),{[a.id]:{...E.emptyPlan(),main:[b.pos]}});
 expect(heavy.presentation.some(p=>p.type==='effect'&&p.kind==='main-blast')).toBe(true);
 expect(heavy.frames.at(-1)!.t).toBeGreaterThanOrEqual(1.95);
});
test('smoke, radar and escort only build from visible cells and visible actual state; removal releases meshes',()=>{
 const provider=E.createShip('ca',0,0,h(2,5)),ally=E.createShip('bb',0,1,h(3,5));provider.cfg.escort={range:1,reduction:.3,steps:1};provider.escorting=true;
 const cells=[provider.pos,ally.pos].map(p=>({...p,k:E.key(p),known:true,visible:true,island:false}));
 const model:MapModel={cells,ships:[provider,ally],planes:[],torpedoes:[],mines:[],zones:[{kind:'smoke',team:1,center:h(3,5),radius:1,expires:3},{kind:'radar',team:1,center:h(8,5),radius:1,expires:3}],round:1,myTeam:0,selected:'',phase:'execute',mode:'move',previews:[],mainTargets:[],rays:[],showPlans:false,showRanges:false,overlayType:'',busy:true,airRange:null,visuals:{}};
 const fx=new BattleAbilities(new THREE.Scene());fx.update(model);fx.seek(2);
 expect([...fx.cache.keys()].filter(k=>k.startsWith('smoke:'))).toHaveLength(2);
 expect([...fx.cache.keys()].some(k=>k.startsWith('radar:'))).toBe(false);
 expect(fx.cache.has('escort:'+ally.id)).toBe(true);expect(fx.cache.has('escort:'+provider.id)).toBe(false);
 const mesh=fx.root.getObjectByProperty('type','Mesh') as THREE.Mesh;const dispose=vi.spyOn(mesh.geometry,'dispose');
 fx.update({...model,ships:[ally],zones:[]});expect(fx.cache.size).toBe(0);expect(dispose).toHaveBeenCalledOnce();fx.dispose();
});

test('weapon contacts produce torpedo, falling bomb and air interception effects without gameplay side effects',()=>{
 const owner=quiet(E.createCatalogShip('cv-2',0,0,h(1,5))),target=quiet(E.createShip('ca',1,0,h(5,5)));
 const g=game([owner,target]);
 g.torpedoes=[{id:'t',kind:'torpedo',team:0,owner:owner.id,xy:{...target.xy},heading:0,age:0,launched:1,birth:0,armed:true,cfg:{speed:4,damage:40,life:3,reserve:1,max:1}}];
 const torpedo=E.resolveRound(g);expect(torpedo.presentation.some(p=>p.kind==='torpedo')).toBe(true);expect(torpedo.game.ships[1].hp).toBe(190);
 const aircraft=(id:string,team:number,role:'bomber'|'fighter',xy:{x:number;y:number})=>({id,kind:'plane' as const,team,mother:owner.id,slot:0,hp:2,cfg:{role,hp:2,speed:6,vision:3,range:12,damage:role==='bomber'?25:0,...(role==='fighter'?{attack:{range:1,damage:2}}:{})},xy,mode:'point' as const,target:target.pos,targetId:null,tracking:false,state:'outbound' as const,traveled:0,waypoints:[]});
 const air=game([owner,target]);air.planes=[aircraft('b',0,'bomber',{...target.xy})];const bomb=E.resolveRound(air);
 expect(bomb.presentation.some(p=>p.kind==='bomb'&&p.type==='projectile')).toBe(true);expect(bomb.presentation.some(p=>p.kind==='bomb'&&p.type==='effect')).toBe(true);expect(bomb.game.ships[1].hp).toBe(205);
 const duel=game([owner,target]);duel.planes=[aircraft('f',0,'fighter',{...target.xy}),aircraft('e',1,'bomber',{...target.xy})];const fighter=E.resolveRound(duel);expect(fighter.presentation.some(p=>p.kind==='fighter')).toBe(true);
});

test('online presentation keeps opaque effect identity and finite duration across frames',async()=>{
 const {playerResult}=await import('../server/views.ts');
 const a=quiet(E.createShip('bb',0,0,h(2,5))),b=quiet(E.createShip('ca',1,0,h(4,5))),g=game([a,b]);
 const out=E.resolveRound(g,{[a.id]:{...E.emptyPlan(),main:[b.pos,b.pos,b.pos]}}),wire=playerResult(g,out,0);
 const frames=wire.frames.filter(f=>f.visuals.effects.some(e=>e.kind==='main'));
 expect(frames.length).toBeGreaterThan(2);
 const effect=frames[0].visuals.effects.find(e=>e.kind==='main')!;
 expect(effect.id).toMatch(/^e\d+$/);expect(effect.duration).toBe(.65);
 expect(frames[1].visuals.effects.find(e=>e.id===effect.id)?.age).toBeGreaterThan(effect.age);
 expect(wire.presentation).toEqual([]);
});
