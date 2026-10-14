import type {Game} from '../shared/game.ts';
import {requestFixture,historyFixture} from './helpers/ai-fixtures.ts';
import type {RequestFixture,LogFixture,ContextFixture} from './helpers/ai-fixtures.ts';
import type {ModelConfig} from '../server/types.ts';
import {test,afterAll,afterEach} from 'vitest';
import assert from 'node:assert/strict';
import { AIService } from '../server/ai.ts';
import { GameService } from '../server/game-service.ts';
import * as E from '../src/engine.ts';
import type { AIRoundMemory } from '../server/ai-history.ts';


const model:ModelConfig={id:'test', name:'测试 AI', model:'provider-model', baseURL:'https://example.test/v1', apiKey:'private-test-key', protocol:'chat', timeoutMs:1000};
const plans = (game:Game) => Object.fromEntries(game.ships.filter((s) => s.team===1 && E.alive(s)).map((s) => [s.id,E.emptyPlan()]));
const reply = (protocol: string, value:unknown) => new Response(JSON.stringify(protocol==='responses'
  ? {status:'completed',output:[{type:'message',content:[{type:'output_text',text:JSON.stringify(value)}]}]}
  : {choices:[{finish_reason:'stop',message:{content:JSON.stringify(value)}}]}));
const historyFor=(round:number)=>Array.from({length:round-1},(_,i)=>({...historyFixture(i+1),observations:[{t:1,changed:[{id:'1-0',kind:'ship',team:1,pos:{q:0,r:0},hp:100-i}]}]}));
test('FULL includes every completed round for both AI protocols; standard stays stateless', async () => {
  for (const protocol of ['chat','responses'] as const) {
    const game=E.createGame();game.phase='plan';game.round=30;Reflect.set(game,'secret','unseen-server-secret');
    const history=historyFor(30), requests:RequestFixture[]=[];
    const service=new AIService({models:[{...model,protocol}],logger:null,fetchImpl:async(_,init)=>{requests.push(requestFixture(init));return reply(protocol,{plans:plans(game)});}});
    for(const aiMode of ['full','standard'] as const)await service.generate({game,team:1,modelId:model.id,aiMode,history});
    const full=JSON.parse((requests[0].messages||requests[0].input)[1].content), standard=JSON.parse((requests[1].messages||requests[1].input)[1].content);
    assert.equal(full.aiMode,'full');assert.deepEqual(full.history,history);assert.equal(full.history.length,29);
    assert.equal(standard.history,undefined);assert.equal(standard.aiMode,undefined);
    assert.equal(requests[0].previous_response_id,undefined);assert.equal(requests[0].conversation,undefined);
    assert.ok(!JSON.stringify(requests).includes('unseen-server-secret'));assert.ok(!JSON.stringify(requests).includes(model.apiKey));
  }
});

test('FULL freezes queued context and uses the same history for invalid-output correction', async () => {
  const game=E.createGame();game.phase='plan';game.round=2;
  const history=historyFor(2), expected=structuredClone(history), requests:RequestFixture[]=[];
  const service=new AIService({models:[model],concurrency:1,logger:null,fetchImpl:async(_,init)=>{requests.push(requestFixture(init));return reply('chat',requests.length===1?{invalid:true}:{plans:plans(game)});}});
  service.active=1;
  const result=service.generate({game,team:1,modelId:model.id,aiMode:'full',history});
  history[0].end.round=999;history.push(Object.assign(historyFixture(88),{observations:[],secret:'late-history-secret'}));Reflect.set(game,'secret','late-game-secret');
  service.release();await result;
  assert.equal(requests.length,2);assert.deepEqual(requests[0].messages.slice(0,2),requests[1].messages.slice(0,2));
  assert.deepEqual(JSON.parse(requests[0].messages[1].content).history,expected);
  assert.ok(!JSON.stringify(requests).includes('late-history-secret'));assert.equal(service.active,0);
});

const settle = async () => {for(let i=0;i<6;i++)await new Promise(resolve=>setImmediate(resolve));};
function harness() {
  let now=10000, fail=false, id=0;const calls: { game: Game; history: AIRoundMemory[]|undefined; team: number; modelId: string|null; matchId?: string|null; signal?: AbortSignal; aiMode?: "standard"|"full"; }[]=[];
  const service=new GameService({models:[model],autoTick:false,now:()=>now,logger:{error(){}},pool:{resolve:async(game,orders)=>E.resolveRound(game,orders),close:async()=>{}},ai:{generate:async input=>{
    calls.push({...input,game:E.clone(input.game),history:structuredClone(input.history)});
    if(fail){fail=false;throw Object.assign(new Error('验收失败'),{code:'AI_TEST'});}return plans(input.game);
  }}});
  const identity=service.session('访客'), p=service.connect(identity.token,()=>{});
  const command=(type: string,payload={})=>{const m=service.matches.get(p.match!);return service.command(p,{v:2,id:String(++id),type,payload,matchId:m?.id,round:m?.game?.round});};
  return {service,p,calls,command,advance:()=>{now+=100000;service.tick();},failNext:()=>{fail=true;},async start(aiMode:string|undefined=undefined){const q:Record<string,unknown>={modelId:model.id,roster:E.DEFAULT_ROSTER};if(aiMode!==undefined)q.aiMode=aiMode;assert.equal(command('ai.start',q).ok,true);const m=service.matches.get(p.match!);assert.equal(command('deploy.update',{ready:true,positions:m!.game!.ships.filter(s=>s.team===0).map(s=>({id:s.id,pos:s.pos}))}).ok,true);await settle();return m;}};
}

test('FULL match retains its own completed rounds across retries and reconnects without exposing history', async () => {
  const h=harness();try {
    const m=await h.start('full');assert.equal(m!.aiMode,'full');assert.deepEqual(h.calls[0].history,[]);assert.equal(h.calls[0].matchId,m!.id);
    assert.equal(h.command('orders.submit',{plans:{}}).ok,true);await settle();assert.equal(m!.stage,'playback');
    assert.equal(m!.aiHistory.length,1);assert.equal(m!.aiHistory[0].round,1);assert.ok(Object.keys(m!.aiHistory[0].orders).every(id=>id.startsWith('1-')));
    const recorded=structuredClone(m!.aiHistory);h.failNext();h.advance();await settle();assert.equal(m!.aiStatus,'error');
    assert.equal(h.command('ai.retry',{aiMode:'standard',history:[{round:99}]}).ok,true);await settle();
    assert.equal(h.calls.length,3);assert.equal(h.calls[2].aiMode,'full');assert.deepEqual(h.calls[1].history,recorded);assert.deepEqual(h.calls[2].history,recorded);assert.equal(m!.aiHistory.length,1);
    assert(h.calls.every(call=>call.matchId===m!.id));
    const oldSend=h.p.send;h.service.disconnect(h.p,oldSend!);h.service.connect(h.p.token,()=>{});assert.equal(h.calls.length,3);
    const publicMatch=h.service.view(h.p).match;assert.equal(publicMatch!.aiMode,'full');assert.equal(publicMatch!.aiHistoryRounds,1);assert.equal(Reflect.get(publicMatch!,'aiHistory'),undefined);assert.ok(!JSON.stringify(publicMatch).includes('observations'));
    assert.equal(h.command('orders.submit',{plans:{}}).ok,true);await settle();assert.equal(m!.aiHistory.length,2);assert.deepEqual(m!.aiHistory.map(r=>r.round),[1,2]);
    h.command('match.resign');h.command('match.leave');const next=await h.start('full');assert.deepEqual(h!.calls.at(-1)!.history,[]);assert.equal(h!.calls.at(-1)!.matchId,next!.id);assert.notEqual(next!.id,m!.id);
  }finally{await h.service.close();}
});

test('standard remains the default and malformed mode cannot create a match', async () => {
  const h=harness();try {
    for(const aiMode of ['FULL','unknown',null,{},true]) {const response=h.command('ai.start',{modelId:model.id,roster:E.DEFAULT_ROSTER,aiMode});assert.equal(response.code,'INVALID_AI_MODE');assert.equal(h.p.match,null);}
    const m=await h.start();assert.equal(m!.aiMode,'standard');assert.equal(h.calls[0].aiMode,'standard');
    assert.equal(h.command('orders.submit',{plans:{}}).ok,true);await settle();assert.deepEqual(m!.aiHistory,[]);h.advance();await settle();assert.deepEqual(h!.calls.at(-1)!.history,[]);
  }finally{await h.service.close();}
});

test('ending a FULL match before pending resolution cannot append stale history', async () => {
  const h=harness();let complete;try{
    const m=await h.start('full');h.service.pool.resolve=(game,orders)=>new Promise(resolve=>{complete=()=>resolve(E.resolveRound(game,orders));});
    h.command('orders.submit',{plans:{}});await settle();assert.equal(m!.stage,'resolving');h.service.end(m!,0,'中止结算');complete!();await settle();assert.deepEqual(m!.aiHistory,[]);assert.equal(m!.stage,'ended');
  }finally{await h.service.close();}
});
