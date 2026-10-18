import {test,expect} from 'vitest';
import * as E from '../src/engine.ts';
import {sampleBattleVisuals} from '../src/battle-visuals.ts';
import {playFrames} from '../src/playback.ts';
import {scheduleSecondaryAnimations} from '../src/secondary-presentation.ts';
import type {Game,Ship,ProjectilePresentation} from '../shared/game.ts';

const h=(q:number,r:number)=>({q,r});
const quiet=(s:Ship)=>{delete s.cfg.secondary;delete s.cfg.aa;return s;};
const game=(ships:Ship[]):Game=>({seed:1,round:1,map:{width:19,height:15,islands:[],mines:[]},ships,torpedoes:[],planes:[],nextId:0,log:[],winner:null,phase:'plan',explored:[[],[]]});
const visible=new Set(E.allHexes().map(E.key));

test('new contact takes damage immediately while secondary fire waits 500 ms after first visible replay frame',()=>{
  const gun=E.createShip('dd',0,0,h(2,5)),enemy=quiet(E.createShip('ca',1,0,h(6,5)));
  gun.cfg.vision=3;gun.cfg.secondary={damage:8,range:3,multi:false};delete gun.cfg.aa;
  enemy.cfg.speed=4;enemy.heading=3;
  const out=E.resolveRound(game([gun,enemy]),{[enemy.id]:{...E.emptyPlan(),moves:[{turn:0,forward:true},{turn:0,forward:true}]}});
  const first=out.frames.find(f=>f.visibleByTeam![0].includes(E.key(f.ships.find(s=>s.id===enemy.id)!.pos)))!;
  const hit=out.presentation.find(p=>p.type==='effect'&&p.kind==='hit'&&p.targetId===enemy.id)!;
  const shot=out.presentation.find((p):p is ProjectilePresentation=>p.type==='projectile'&&p.kind==='shot')!;
  expect(first.t).toBeGreaterThan(0);expect(first.ships.find(s=>s.id===enemy.id)!.hp).toBe(222);
  expect(hit.type==='effect'&&hit.time).toBeLessThanOrEqual(first.t);
  // A movement snapshot spans 1/30 simulation units and 110 ms at normal speed.
  expect(shot.start).toBeCloseTo(first.t+5/33,10);
  expect(sampleBattleVisuals(out.presentation,shot.start-.0001,visible,0,out.frames.at(-1)!.ships).projectiles.filter(p=>p.kind==='shot')).toHaveLength(0);
  expect(sampleBattleVisuals(out.presentation,shot.start+.001,visible,0,out.frames.at(-1)!.ships).projectiles.some(p=>p.kind==='shot')).toBe(true);
  expect(out.game.ships.find(s=>s.id===enemy.id)!.hp).toBe(222);
});

test('a target already visible before execution does not gain another discovery delay',()=>{
  const gun=E.createShip('dd',0,0,h(2,5)),enemy=quiet(E.createShip('ca',1,0,h(4,5)));
  const out=E.resolveRound(game([gun,enemy]));
  expect(out.presentation.find(p=>p.type==='projectile'&&p.kind==='shot')?.start).toBe(0);
});

test('the normal-speed replay shows the first secondary firing action exactly half a second after discovery',()=>{
  const gun=E.createShip('dd',0,0,h(2,5)),enemy=quiet(E.createShip('ca',1,0,h(6,5)));
  gun.cfg.vision=3;gun.cfg.secondary={damage:8,range:3,multi:false};delete gun.cfg.aa;
  enemy.cfg.speed=4;enemy.heading=3;
  const out=E.resolveRound(game([gun,enemy]),{[enemy.id]:{...E.emptyPlan(),moves:[{turn:0,forward:true},{turn:0,forward:true}]}});
  let pending:FrameRequestCallback=()=>{},clock=0,discovered:number|undefined,fired:number|undefined;
  const stop=playFrames(out.frames,{speed:()=>1,now:()=>0,request:cb=>{pending=cb;return 1;},cancel:()=>{},complete:()=>{},render:frame=>{
    const target=frame.ships.find(s=>s.id===enemy.id)!;
    if(discovered===undefined&&frame.visibleByTeam![0].includes(E.key(target.pos)))discovered=clock;
    const visuals=sampleBattleVisuals(out.presentation,frame.t,visible,0,frame.ships);
    if(fired===undefined&&visuals.actions.some(a=>a.shipId===gun.id&&a.action==='fire'))fired=clock;
  }});
  try{for(clock=10;clock<=1400;clock+=10)pending(clock);expect(discovered).toBe(440);expect(fired).toBe(940);}finally{stop();}
});

test('a delayed shell leaves the moving gun at its displayed firing position rather than its discovery position',()=>{
  const gun=E.createShip('dd',0,0,h(2,5)),enemy=quiet(E.createShip('ca',1,0,h(6,5)));
  gun.cfg.vision=3;gun.cfg.secondary={damage:8,range:3,multi:false};gun.cfg.speed=2;delete gun.cfg.aa;
  const out=E.resolveRound(game([gun,enemy]),{[gun.id]:{...E.emptyPlan(),moves:[{turn:0,forward:true}]}});
  const shot=out.presentation.find((p):p is ProjectilePresentation=>p.type==='projectile'&&p.kind==='shot')!;
  expect(shot.sourceId).toBe(gun.id);expect(shot.targetId).toBe(enemy.id);
  expect(shot.from.x).toBeCloseTo(gun.xy.x+Math.sqrt(3)*2*shot.start,10);
  expect(shot.from.y).toBe(gun.xy.y);
});

test('a discovery near the end of movement still waits 500 ms across the slower simulation-clock settling frames',()=>{
  const gun=E.createShip('dd',0,0,h(2,5)),enemy=quiet(E.createShip('ca',1,0,h(4,5)));
  const out=E.resolveRound(game([gun,enemy]));
  const shot:ProjectilePresentation={id:'late-contact',type:'projectile',kind:'shot',team:0,from:gun.xy,to:enemy.xy,at:enemy.pos,start:1,end:1.045};
  scheduleSecondaryAnimations(out.frames.filter(f=>f.t<=1.1),[{detectedAt:1,events:[shot]}]);
  expect(shot.start).toBeCloseTo(1+5/11,10);
  expect(shot.end-shot.start).toBeCloseTo(.045,10);
});

test('secondary shells track the current visible target without modifying the committed trajectory or revealing hidden coordinates',()=>{
  const shot:ProjectilePresentation&{targetId:string}={id:'tracking',type:'projectile',kind:'shot',team:0,from:E.hexToXY(h(2,5)),to:E.hexToXY(h(4,5)),at:h(4,5),start:0,end:.1,targetId:'enemy'};
  const before=structuredClone(shot),moved={id:'enemy',team:1,xy:E.hexToXY(h(5,5))};
  const tracked=sampleBattleVisuals([shot],.1,visible,0,[moved]);
  expect(tracked.projectiles.find(p=>p.position)?.position).toMatchObject({x:moved.xy.x,z:moved.xy.y});
  const hidden={...moved,xy:E.hexToXY(h(12,5))};
  const partial=new Set([E.key(h(2,5)),E.key(h(3,5)),E.key(h(4,5))]);
  expect(sampleBattleVisuals([shot],.1,partial,0,[hidden]).projectiles.find(p=>p.position)?.position).toMatchObject({x:shot.to.x,z:shot.to.y});
  expect(shot).toEqual(before);
});

test('remote mine sweeping emits a cannon shell and an impact while retaining immediate mine removal',()=>{
  const gun=E.createShip('bb',0,0,h(2,5)),enemy=quiet(E.createShip('cv',1,0,h(12,10))),mine=h(4,5),g=game([gun,enemy]);
  g.map.mines=[mine];const out=E.resolveRound(g,{[gun.id]:{...E.emptyPlan(),sweep:mine}});
  expect(out.frames[0].mines).toEqual([]);expect(out.game.map.mines).toEqual([]);
  const shot=out.presentation.find((p):p is ProjectilePresentation=>p.type==='projectile'&&p.kind==='shot')!;
  expect(shot).toBeDefined();expect(shot.from).toEqual(gun.xy);expect(shot.to).toEqual(E.hexToXY(mine));
  expect(out.presentation.some(p=>p.type==='effect'&&p.kind==='shot'&&E.same(p.at,mine))).toBe(true);
  expect(out.presentation.some(p=>p.type==='action'&&p.shipId===gun.id&&p.action==='sweep')).toBe(true);
});
