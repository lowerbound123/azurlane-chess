import {expect,test} from 'vitest';
import type {BattleFrame,Ship,Torpedo,XY} from '../shared/game.ts';
import * as E from '../src/engine.ts';
import {buildWakeTimeline} from '../src/wake-tracks.ts';
import {torpedoFixture} from './helpers/game-fixtures.ts';
import {playerResult} from '../server/views.ts';
import {materializeResult} from '../shared/network.ts';

const water=E.allHexes().map(E.key);
const at=(q:number,r:number)=>E.hexToXY({q,r});
const ship=(xy:XY,team=0)=>({...E.createShip('dd',team,0,E.xyToHex(xy)),xy});
const torp=(xy:XY,team=0)=>({...torpedoFixture('torp',team,E.xyToHex(xy)),xy});
function frame(t:number,ships:Ship[]=[],torpedoes:Torpedo[]=[],extra:Partial<BattleFrame>={}):BattleFrame{
 return {t,ships,torpedoes,planes:[],mines:[],effects:[],visible:water,explored:water,...extra};
}

test('complete frame history retains every leg of a turn and torpedo movement after the units stop or disappear',()=>{
 const a=at(3,4),b=at(4,4),c=at(4,5),d=at(6,4);
 const frames=[frame(0,[ship(a)],[torp(a)]),frame(.1,[ship(b)],[torp(d)]),frame(.2,[ship(c)]),frame(1.8,[ship(c)])];
 const before=structuredClone(frames),timeline=buildWakeTimeline(frames,0);
 const ships=timeline.segments.filter(s=>s.kind==='ship'),torpedoes=timeline.segments.filter(s=>s.kind==='torpedo');
 expect(ships.map(s=>[s.from,s.to])).toEqual([[a,b],[b,c]]);
 expect(torpedoes.length).toBeGreaterThan(0);
 expect(torpedoes[0].from).toEqual(a);expect(torpedoes.at(-1)!.to).toEqual(d);
 expect(timeline.endTime).toBe(1.8);expect(frames).toEqual(before);
});

test('a fast replay still has a wake in each actually traversed cell, including before a turn',()=>{
 const mover=E.createShip('dd',0,0,{q:3,r:5});mover.heading=0;mover.cfg.speed=4;
 const game={...E.createGame(),phase:'plan' as const,ships:[mover],map:{width:19,height:15,islands:[],mines:[]}};
 const plan={...E.emptyPlan(),moves:[{turn:0,forward:true},{turn:-1,forward:true},{turn:0,forward:true},{turn:0,forward:false}]};
 const result=E.resolveRound(game,{[mover.id]:plan}),timeline=buildWakeTimeline(result.frames,0),cells=new Set<string>();
 for(const segment of timeline.segments.filter(s=>s.kind==='ship'))for(let i=0;i<=20;i++){
  const u=i/20;cells.add(E.key(E.xyToHex({x:segment.from.x+(segment.to.x-segment.from.x)*u,y:segment.from.y+(segment.to.y-segment.from.y)*u})));
 }
 expect([...cells].sort()).toEqual(['3,5','4,5','5,4','6,3'].sort());
});

test('hidden enemy intervals never connect the visible positions on either side',()=>{
 const a=at(3,4),b=at(4,4),c=at(5,4),d=at(6,4);
 const visible=(xy:XY)=>[E.key(E.xyToHex(xy))];
 const timeline=buildWakeTimeline([
  frame(0,[ship(a,1)],[],{visible:visible(a)}),
  frame(.1,[ship(b,1)],[],{visible:[]}),
  frame(.2,[ship(c,1)],[],{visible:visible(c)}),
  frame(.3,[ship(d,1)],[],{visible:[...visible(c),...visible(d)]}),
 ],0);
 expect(timeline.segments.length).toBeGreaterThan(0);
 for(const segment of timeline.segments){expect(segment.start).toBeGreaterThanOrEqual(.2);expect(segment.from.x).toBeGreaterThanOrEqual(c.x-1e-6);}
});

test('friendly torpedoes cannot leave wake fragments inside unexplored gaps',()=>{
 const a=at(3,4),b=at(7,4),known=[E.key(E.xyToHex(a)),E.key(E.xyToHex(b))];
 const timeline=buildWakeTimeline([frame(0,[],[torp(a)],{visible:[],explored:known}),frame(.1,[],[torp(b)],{visible:[],explored:known})],0);
 expect(timeline.segments.length).toBeGreaterThan(0);
 for(const segment of timeline.segments)for(let i=0;i<=100;i++){
  const u=i/100;
  expect(known).toContain(E.key(E.xyToHex({x:segment.from.x+(segment.to.x-segment.from.x)*u,y:segment.from.y+(segment.to.y-segment.from.y)*u})));
 }
});

test('smoke blocks enemy wakes, and discrete ship jumps under smoke are revealed at the next snapshot',()=>{
 const a=at(3,4),b=at(4,4),zones=[{kind:'smoke' as const,team:1,center:{q:3,r:4},radius:2,expires:3}];
 const frames=[frame(0,[ship(a),{...ship(a,1),id:'enemy'}],[],{zones,visibleShipIdsByTeam:[['0-0'],['enemy']]}),frame(.1,[ship(b),{...ship(b,1),id:'enemy'}],[],{zones,visibleShipIdsByTeam:[['0-0'],['enemy']]})];
 const timeline=buildWakeTimeline(frames,0);
 expect(timeline.segments).toHaveLength(1);expect(timeline.segments[0].from).toEqual(a);expect(timeline.segments[0].to).toEqual(b);
 expect(timeline.segments[0].start).toBe(.1);expect(timeline.segments[0].end).toBe(.1);
});

test('viewer team one uses its own per-frame fog and projected server frames work without team arrays',()=>{
 const a=at(3,4),b=at(4,4),own=[frame(0,[ship(a,1)]),frame(.1,[ship(b,1)])];
 const otherView=own.map(f=>({...f,visible:[],explored:[],visibleByTeam:[[],water],exploredByTeam:[[],water]}));
 expect(buildWakeTimeline(otherView,0).segments).toHaveLength(0);
 expect(buildWakeTimeline(otherView,1).segments).toHaveLength(1);
 expect(buildWakeTimeline(own,1).segments).toHaveLength(1);
});

for(const terminal of ['hit','lifetime','short-lived'] as const)test(`torpedo ${terminal} retains its final travelled cell even when it disappears between published frames`,()=>{
 const launcher=E.createShip('dd',0,0,{q:3,r:6}),target=E.createShip('dd',1,0,terminal==='lifetime'?{q:14,r:1}:terminal==='short-lived'?{q:4,r:6}:{q:6,r:6});
 launcher.heading=1;if(terminal==='lifetime')launcher.cfg.torpedo!.life=.63;if(terminal==='short-lived')launcher.cfg.torpedo!.speed=240;
 const game={...E.createGame(),phase:'plan' as const,map:{width:19,height:15,islands:[],mines:[]},ships:[launcher,target]};E.updateExploration(game);
 const result=E.resolveRound(game,{[launcher.id]:{...E.emptyPlan(),torps:[{window:0,dir:0}]}});
 const covered=(timeline:ReturnType<typeof buildWakeTimeline>)=>{
  const cells=new Set<string>();for(const segment of timeline.segments.filter(s=>s.kind==='torpedo'))for(let i=0;i<=30;i++){
   const u=i/30;cells.add(E.key(E.xyToHex({x:segment.from.x+(segment.to.x-segment.from.x)*u,y:segment.from.y+(segment.to.y-segment.from.y)*u})));
  }return [...cells];
 };
 expect(covered(buildWakeTimeline(result.frames,0,result.torpedoWakes))).toContain(terminal==='short-lived'?'4,6':'6,6');
 const projected=materializeResult(playerResult(game,result,0));
 expect(covered(buildWakeTimeline(projected.frames,0,projected.torpedoWakes))).toContain(terminal==='short-lived'?'4,6':'6,6');
});

for(const team of [0,1])test(`team ${team} wire results clip terminal torpedo motion to known water and suppress hidden enemy motion`,()=>{
 const a=at(3,4),b=at(7,4),known=[E.key(E.xyToHex(a)),E.key(E.xyToHex(b))],game=E.createGame();
 const frames=[frame(0,[],[],{visible:[],explored:known}),frame(.1,[],[],{visible:[],explored:known})];
 const result={game,frames,events:[],presentation:[],counts:[],combatStats:{},torpedoWakes:[{team,from:a,to:b,start:0,end:.1},{team:1-team,from:a,to:b,start:0,end:.1}]};
 const before=structuredClone(result),projected=playerResult(game,result,team);
 expect(projected.torpedoWakes!.length).toBeGreaterThan(0);
 for(const segment of projected.torpedoWakes!){
  expect(segment.team).toBe(team);expect(Object.keys(segment).sort()).toEqual(['end','from','start','team','to']);
  for(let i=0;i<=50;i++){const u=i/50;expect(known).toContain(E.key(E.xyToHex({x:segment.from.x+(segment.to.x-segment.from.x)*u,y:segment.from.y+(segment.to.y-segment.from.y)*u})));}
 }
 expect(result).toEqual(before);
});
