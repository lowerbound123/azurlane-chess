import test from 'node:test';
import assert from 'node:assert/strict';
import * as E from '../src/engine.js';
const h=(q,r)=>({q,r});
const game=ships=>({seed:1,round:1,map:{width:E.W,height:E.H,islands:[],mines:[]},ships,torpedoes:[],planes:[],nextId:0,log:[],winner:null,phase:'plan'});
const quiet=s=>{delete s.cfg.secondary;delete s.cfg.aa;return s;};
const visible=new Set(E.allHexes().map(E.key));
const shell={id:'shell',type:'projectile',kind:'main',team:1,from:E.hexToXY(h(1,5)),to:E.hexToXY(h(9,5)),at:h(9,5),start:0,end:1.1};
const sample=async(...args)=>(await import('../src/battle-visuals.js')).sampleBattleVisuals(...args);
test('committed shells have stable distinct IDs and survive the firing ship sinking',()=>{
 const a=quiet(E.createShip('bb',0,0,h(3,5))),b=quiet(E.createShip('ca',1,0,h(5,5)));
 a.hp=1;b.cfg.secondary={damage:10,range:3};const g=game([a,b]);
 const plans={[a.id]:{...E.emptyPlan(),main:[b.pos,b.pos,b.pos]}};
 const out=E.resolveRound(g,plans);
 assert.ok(Array.isArray(out.presentation));
 const shells=out.presentation.filter(e=>e.type==='projectile'&&e.kind==='main');
 assert.equal(shells.length,3);assert.equal(new Set(shells.map(e=>e.id)).size,3);
 assert.equal(out.game.ships[0].hp,0);assert.equal(out.game.ships[1].hp,50);assert.equal(out.game.nextId,0);
 assert.deepEqual(shells,E.resolveRound(g,plans).presentation.filter(e=>e.type==='projectile'&&e.kind==='main'));
 for(const s of shells){assert.deepEqual(s.from,a.xy);assert.deepEqual(s.to,b.xy);assert.equal(s.start,0);assert.equal(s.end,1.1);}
 const impacts=out.presentation.filter(e=>e.type==='effect'&&e.kind==='main');
 assert.equal(impacts.length,3);assert(impacts.every(e=>e.time===1.1));
 assert(out.presentation.filter(e=>e.kind==='hit').some(e=>e.time===1.1));
});
test('main shell exact endpoints, raised midpoint, and finite lifetime',async()=>{
 const start=(await sample([shell],0,visible)).projectiles[0].position;
 const mid=(await sample([shell],.55,visible)).projectiles[0].position;
 const end=(await sample([shell],1.1,visible)).projectiles[0].position;
 assert.deepEqual(start,{x:shell.from.x,y:0,z:shell.from.y});
 assert.deepEqual(end,{x:shell.to.x,y:0,z:shell.to.y});assert(mid.y>1);
 assert(Math.abs(mid.x-(start.x+end.x)/2)<1e-12);
 assert.deepEqual(await sample([shell],1.11,visible),{projectiles:[],effects:[]});
});
test('every emitted trail segment stays inside visible hexes even across hidden gaps',async()=>{
 const sparse=new Set([E.key(h(7,5)),E.key(h(9,5))]);
 const result=await sample([shell],1.1,sparse);
 assert(result.projectiles.length>0);
 for(const p of result.projectiles){
  assert.deepEqual(Object.keys(p).sort(),['id','kind','position','team','trail']);
  for(let i=1;i<p.trail.length;i++)for(let j=0;j<=50;j++){
   const a=p.trail[i-1],b=p.trail[i],u=j/50;
   assert(sparse.has(E.key(E.xyToHex({x:a.x+(b.x-a.x)*u,y:a.z+(b.z-a.z)*u}))));
  }
  if(p.position)assert(sparse.has(E.key(E.xyToHex({x:p.position.x,y:p.position.z}))));
 }
 assert.deepEqual(await sample([shell],.5,new Set()),{projectiles:[],effects:[]});
});
test('effect ages and secondary traces follow continuous time without mutating events',async()=>{
 const events=[{id:'hit',type:'effect',kind:'hit',at:h(5,5),time:.3,duration:.1,text:'−8'},
 {id:'shot',type:'projectile',kind:'shot',team:0,from:E.hexToXY(h(4,5)),to:E.hexToXY(h(5,5)),at:h(5,5),start:.3,end:.34}];
 const copy=structuredClone(events);
 assert.equal((await sample(events,.29,visible)).effects.length,0);
 const result=await sample(events,.35,visible);assert.equal(result.projectiles.length,0);assert(Math.abs(result.effects[0].age-.5)<1e-9);
 assert.deepEqual(await sample(events,.41,visible),{projectiles:[],effects:[]});
 assert.deepEqual(await sample(events,.35,new Set()),{projectiles:[],effects:[]});assert.deepEqual(events,copy);
});
