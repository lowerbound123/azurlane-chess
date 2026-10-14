import assert from 'node:assert/strict';
import {test} from 'vitest';
import * as E from '../src/engine.ts';
import {createDominationState} from '../shared/domination.ts';
import type {Game} from '../shared/game.ts';
import type {Player} from '../server/types.ts';
import {GameService} from '../server/game-service.ts';
import {playerView,playerResult,validateOrders} from '../server/views.ts';
import {createAIRoundMemory} from '../server/ai-history.ts';
import {snapshotMatch} from '../server/match-records.ts';
import {AIService} from '../server/ai.ts';
import {createApp} from '../server/app.ts';
import {finishDraft} from './helpers/draft-match.ts';
import {requestFixture} from './helpers/ai-fixtures.ts';

function harness(){
 let sequence=0,resolves=0;
 const service=new GameService({autoTick:false,logger:{},models:[{id:'qa',name:'测试AI'}],pool:{async resolve(game,plans){resolves++;return E.resolveRound(game,plans);}},ai:{async generate(){return {};}}});
 const player=(name:string)=>{const session=service.session(name),messages:Record<string,unknown>[]=[];const send=(value:Record<string,unknown>)=>messages.push(value);return {session,messages,send,p:service.connect(session.token,send)};};
 const cmd=(u:{p:Player},type:string,payload:Record<string,unknown>={},id=String(++sequence))=>{const m=service.matches.get(u.p.match!);return service.command(u.p,{v:2,id,type,payload,...(m?{matchId:m.id,round:m.game?.round??0}:{})});};
 return {service,player,cmd,get resolves(){return resolves;}};
}
const flush=()=>new Promise(resolve=>setImmediate(resolve));
function largeGame():Game{
 const g=E.createFleetGame();g.phase='plan';g.map={width:21,height:17,islands:[],mines:[]};g.battleMode='domination';g.domination=createDominationState();
 for(const s of g.ships){s.pos=E.deployment(s.team,g.map)[Number(s.id.split('-').at(-1))];s.xy=E.hexToXY(s.pos);}
 g.explored=[[],[]];E.updateExploration(g);return g;
}

test('room mode belongs to host, resets ready, survives draft and permits larger deployments',()=>{
 const h=harness(),a=h.player('a'),b=h.player('b');
 assert.equal(h.cmd(a,'room.create',{turnSeconds:60,battleMode:'domination'}).ok,true);
 const code=a.p.room!;assert.equal(h.service.view(a.p).room?.battleMode,'domination');
 assert.equal(h.cmd(b,'room.join',{code}).ok,true);
 h.cmd(a,'room.ready',{ready:true});h.cmd(b,'room.ready',{ready:true});
 assert.equal(h.cmd(b,'room.update',{battleMode:'annihilation'}).code,'INVALID_BATTLE_MODE');
 assert.equal(h.cmd(a,'room.update',{battleMode:'annihilation'}).ok,true);assert.deepEqual(h.service.rooms.get(code)?.ready,{});
 h.cmd(a,'room.update',{battleMode:'domination'});h.cmd(a,'room.ready',{ready:true});h.cmd(b,'room.ready',{ready:true});
 assert.equal(h.cmd(a,'room.start',{battleMode:'annihilation'}).code,'INVALID_BATTLE_MODE');
 assert.equal(h.cmd(a,'room.start',{battleMode:'domination'}).ok,true);const m=h.service.matches.get(a.p.match!)!;
 assert.equal(h.service.view(b.p).match?.battleMode,'domination');
 finishDraft(m,(team,type,payload)=>h.cmd([a,b][team],type,payload));
 assert.equal(m.game?.map.width,21);assert.equal(m.game?.map.height,17);assert.equal(m.game?.battleMode,'domination');
 for(const team of [0,1])assert.equal(h.cmd([a,b][team],'deploy.update',{ready:true,positions:m.game!.ships.filter(s=>s.team===team).map(s=>({id:s.id,pos:s.pos}))}).ok,true);
 assert.equal(m.stage,'plan');assert.equal(h.cmd(a,'room.update',{battleMode:'annihilation'}).code,'NO_ROOM');assert.equal(m.game?.battleMode,'domination');
});

test('queue pairs FIFO within each mode, defaults missing mode, and rejects invalid selections',()=>{
 const h=harness(),users=['a','b','c','d'].map(h.player);
 assert.equal(h.cmd(users[0],'queue.join',{battleMode:'domination'}).ok,true);
 assert.equal(h.cmd(users[1],'queue.join').ok,true);assert.equal(h.service.matches.size,0);
 assert.equal(h.service.view(users[0].p).queue?.battleMode,'domination');
 assert.equal(h.cmd(users[2],'queue.join',{battleMode:'domination'}).ok,true);assert.equal(users[0].p.match,users[2].p.match);assert.equal(users[1].p.match,null);
 assert.equal(h.cmd(users[3],'queue.join').ok,true);assert.equal(users[1].p.match,users[3].p.match);
 assert.equal(h.service.view(users[3].p).match?.battleMode,'annihilation');
 for(const type of ['room.create','room.update','queue.join','ai.start']){const u=h.player(type);assert.equal(h.cmd(u,type,{battleMode:'typo',turnSeconds:60,modelId:'qa'}).code,'INVALID_BATTLE_MODE');assert.equal(u.p.queued,false);assert.equal(u.p.room,null);assert.equal(u.p.match,null);}
});

test('online AI uses chosen battle map while omitted mode retains the old map',()=>{
 for(const mode of [undefined,'domination']){
  const h=harness(),u=h.player('a');assert.equal(h.cmd(u,'ai.start',{modelId:'qa',...(mode?{battleMode:mode}:{})}).ok,true);
  const m=h.service.matches.get(u.p.match!)!;assert.equal(m.game?.map.width,mode?21:19);assert.equal(m.game?.map.height,mode?17:15);
  assert.equal(h.service.view(u.p).match?.battleMode,mode??'annihilation');
 }
});

test('public projection keeps actual dimensions and public capture state while hiding enemies',()=>{
 const g=largeGame();g.domination!.scores=[35,20];g.domination!.points[0].contested=true;
 const hidden=g.ships.find(s=>s.team===1)!;hidden.label='HIDDEN SHIP SECRET';
 const view=playerView(g,0);assert.equal(view.map.width,21);assert.equal(view.map.height,17);assert.equal(view.battleMode,'domination');assert.deepEqual(view.domination?.scores,[35,20]);
 assert.equal(view.domination?.points[0].contested,true);assert.equal(JSON.stringify(view).includes('HIDDEN SHIP SECRET'),false);
 view.domination!.scores[0]=999;assert.equal(g.domination!.scores[0],35);
});

test('order validation accepts the new edge for main, planes and segments but rejects outside it',()=>{
 const g=largeGame(),bb=g.ships.find(s=>s.team===0&&s.cfg.main)!,cv=g.ships.find(s=>s.team===0&&s.cfg.carrier)!;
 bb.pos=E.fromCR(19,15);bb.xy=E.hexToXY(bb.pos);bb.heading=0;
 const edge=E.fromCR(20,15),outside=E.fromCR(21,15);
 assert.doesNotThrow(()=>validateOrders(g,0,{[bb.id]:{main:[edge],moves:[{turn:0,forward:true}],segments:[{start:0,end:1,target:edge}]},[cv.id]:{planes:[{slot:0,mode:'point',target:E.fromCR(20,16)}]}}));
 assert.throws(()=>validateOrders(g,0,{[bb.id]:{main:[outside]}}),{code:'INVALID_ORDERS'});
 assert.throws(()=>validateOrders(g,0,{[cv.id]:{planes:[{slot:0,mode:'point',target:E.fromCR(20,17)}]}}),{code:'INVALID_ORDERS'});
});

test('round replay and FULL memory retain score changes only at their public settlement time',()=>{
 const g=largeGame();g.ships.find(s=>s.team===1)!.label='HIDDEN MEMORY SECRET';g.domination!.points[0].owner=0;g.domination!.points[0].capturedRound=0;
 const result=E.resolveRound(g,{}),projected=playerResult(g,result,0),memory=createAIRoundMemory(g,projected,0,{});
 assert.deepEqual(projected.frames[0].domination?.scores,[0,0]);assert.deepEqual(projected.frames.at(-1)?.domination?.scores,[5,0]);assert.deepEqual(projected.game.domination?.scores,[5,0]);
 assert.deepEqual(memory.start.domination?.scores,[0,0]);assert.deepEqual(memory.end.domination?.scores,[5,0]);assert.deepEqual(memory.observations.at(-1)?.domination?.scores,[5,0]);
 assert.equal(memory.start.battleMode,'domination');assert.equal(JSON.stringify(memory).includes(g.ships.find(s=>s.team===1)!.label),false);
});

test('duplicate submissions and reconnect do not produce a second round or score gain',async()=>{
 const h=harness(),a=h.player('a'),b=h.player('b');h.cmd(a,'queue.join',{battleMode:'domination'});h.cmd(b,'queue.join',{battleMode:'domination'});
 const m=h.service.matches.get(a.p.match!)!;finishDraft(m,(team,type,payload)=>h.cmd([a,b][team],type,payload));h.service.beginPlan(m);
 assert.equal(m.game!.battleMode,'domination');m.game!.domination!.points[0].owner=0;m.game!.domination!.points[0].capturedRound=0;
 assert.equal(h.cmd(a,'orders.submit',{plans:{}},'submit-a').ok,true);assert.equal(h.cmd(a,'orders.submit',{plans:{}},'submit-a').ok,true);assert.equal(h.cmd(b,'orders.submit',{plans:{}},'submit-b').ok,true);
 assert.equal(h.cmd(b,'orders.submit',{plans:{}},'submit-b').ok,true);await flush();await flush();
 assert.equal(h.resolves,1);assert.deepEqual(m.game!.domination!.scores,[5,0]);h.service.disconnect(a.p,a.send);h.service.connect(a.session.token,a.send);assert.equal(h.resolves,1);assert.deepEqual(h.service.view(a.p).match?.game?.domination?.scores,[5,0]);
 m.result={winner:0,reason:'结束'};m.endedAt=1000;const record=snapshotMatch(m,'playback');assert.equal(record.battleMode,'domination');assert.deepEqual(record.domination?.scores,[5,0]);
});

test('remote AI receives objective rules and public scores without private enemy facts',async()=>{
 const g=largeGame(),hidden=g.ships.find(s=>s.team===1)!;hidden.label='HIDDEN AI SECRET';
 let captured:ReturnType<typeof requestFixture>|undefined;
 const ai=new AIService({logger:null,models:[{id:'qa',name:'qa',model:'qa',baseURL:'https://ai.example',apiKey:'test',protocol:'chat'}],fetchImpl:async(_url,init)=>{captured=requestFixture(init);return new Response(JSON.stringify({choices:[{finish_reason:'stop',message:{content:'{"plans":{}}'}}]}),{status:200});}});
 await ai.generate({game:g,team:0,modelId:'qa'});const body=captured!,context=JSON.parse(body.messages[1].content);
 assert.equal(context.view.battleMode,'domination');assert.deepEqual(context.view.domination.scores,[0,0]);assert.equal(context.view.map.width,21);assert.equal(JSON.stringify(body).includes('HIDDEN AI SECRET'),false);
 assert.match(body.messages[0].content,/100/);assert.match(body.messages[0].content,/15/);assert.match(body.messages[0].content,/capture|captur/i);
});

test('configuration advertises battle modes so clients can detect server support',async()=>{
 const app=await createApp({requireBuild:false,pool:{async resolve(game,plans){return E.resolveRound(game,plans);}},models:[]});
 try{const response=await app.inject('/api/config');assert.deepEqual(response.json().battleModes,['annihilation','domination']);}finally{await app.close();}
});
