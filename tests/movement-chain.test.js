import test from 'node:test';
import assert from 'node:assert/strict';
import * as E from '../src/engine.js';
import {friendlyRouteConflicts,movementOutcomes} from '../src/planning.js';
const plan=(...moves)=>({...E.emptyPlan(),moves});
test('accepted target route can collide immediately and roll back; warning and receipt explain it',()=>{
 const g=E.createGame(),s=g.ships[1],p=plan({turn:1,forward:false},{turn:1,forward:true}),plans={[s.id]:p};
 assert.equal(E.validPlan(g,s,p).moves.length,2);
 assert.ok(friendlyRouteConflicts(s,p,g.ships,plans,g.map).includes('重巡-3'));
 const result=E.resolveRound(g,plans),after=result.game.ships.find(x=>x.id===s.id);
 assert.deepEqual(after.pos,s.pos);assert.ok(after.hp<s.hp);
 assert.deepEqual(movementOutcomes(g,plans,result)[s.id],{steps:2,received:2,reason:'碰撞截停并回退',blocked:true});
});
test('unobstructed submitted route survives validation and reaches its displayed endpoint',()=>{
 const g=E.createGame(),s=g.ships[0],p=plan({turn:-1,forward:true}),plans={[s.id]:p};
 assert.deepEqual(friendlyRouteConflicts(s,p,g.ships,plans,g.map),[]);
 const result=E.resolveRound(g,plans);
 assert.deepEqual(result.game.ships[0].pos,E.route(s,p,g.map).at(-1).pos);
 assert.equal(movementOutcomes(g,plans,result)[s.id].reason,'已执行并到达');
});
test('crossing motion warns, following parallel motion does not, enemies do not leak',()=>{
 const g=E.createGame(),a=g.ships[0],b=g.ships[1];g.map.islands=[];
 a.pos={q:1,r:5};b.pos={q:3,r:5};a.heading=0;b.heading=3;
 const p=plan({turn:0,forward:true});
 assert.deepEqual(friendlyRouteConflicts(a,p,[a,b],{[b.id]:p},g.map),[b.label]);
 b.pos={q:0,r:5};b.heading=0;b.cfg.speed=a.cfg.speed;
 assert.deepEqual(friendlyRouteConflicts(a,p,[a,b],{[b.id]:p},g.map),[]);
 b.team=1;assert.deepEqual(friendlyRouteConflicts(a,p,[a,b],{},g.map),[]);
});
test('video regression: adjacent eastbound lanes at different speeds all reach their targets',()=>{
 const g=E.createGame();[g.ships[3].pos,g.ships[4].pos]=[g.ships[4].pos,g.ships[3].pos];
 for(const s of g.ships)s.xy=E.hexToXY(s.pos);
 const plans={};[2,3,3,2,1].forEach((count,i)=>plans[g.ships[i].id]=plan(...Array.from({length:count},()=>({turn:0,forward:true}))));
 // Existing saves retain their original, larger visual marker radii.
 assert.ok(g.ships[0].cfg.radius>.75);
 for(const s of g.ships.slice(0,5))assert.deepEqual(friendlyRouteConflicts(s,plans[s.id],g.ships,plans,g.map),[]);
 const result=E.resolveRound(g,plans);
 for(const s of g.ships.slice(0,5)){
  const actual=result.game.ships.find(x=>x.id===s.id);
  assert.deepEqual(actual.pos,E.route(s,plans[s.id],g.map).at(-1).pos,s.label);
  assert.equal(actual.hp,s.hp,s.label+' must not suffer a parallel-lane collision');
 }
});
