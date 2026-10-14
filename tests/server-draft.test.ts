import type {Ship} from '../shared/game.ts';
import type {ServiceOptions} from '../server/types.ts';
import {test,afterAll,afterEach} from 'vitest';
import assert from 'node:assert/strict';
import {GameService} from '../server/game-service.ts';
import {currentDraftTurn,draftActionError} from '../src/draft.ts';
import {fleetError,getShip} from '../src/ship-catalog.ts';
import * as E from '../src/engine.ts';
import {finishDraft} from './helpers/draft-match.ts';

function setup(options:ServiceOptions={}) {
  let now=1000,sequence=0;
  const service=new GameService({autoTick:false,now:()=>now,...options});
  const users=['甲','乙','丙'].map(name=>{const session=service.session(name),messages:Record<string,unknown>[]=[];const send=(m:Record<string,unknown>)=>messages.push(m);return {session,messages,send,p:service.connect(session.token,send)};});
  const cmd=(team: number,type: string,payload={},extra={})=>{const p=users[team].p,m=service.matches.get(p.match!);return service.command(p,{v:2,id:String(++sequence),type,payload,...(m?{matchId:m.id,round:m.game?.round??0}:{}),...extra});};
  const pair=()=>{cmd(0,'queue.join');cmd(1,'queue.join');return service.matches.get(users[0].p.match!);};
  return {service,users,cmd,pair,advance:(ms:number)=>now+=ms};
}

test('PVP waits for draft, validates ownership and revision, and deduplicates actions', () => {
  const h=setup(),m=h.pair();assert.equal(m!.game,null);assert.equal(m!.stage,'draft');
  assert.equal(h!.service.view(h.users[0].p).match!.round,0);
  assert.equal(h.cmd(1,'draft.guess',{guess:0,revision:0}).code,'WRONG_TURN');
  assert.equal(h.cmd(2,'draft.guess',{guess:0,revision:0},{matchId:m!.id,round:0}).code,'NO_MATCH');
  assert.equal(h.cmd(0,'draft.confirm',{revision:0}).code,'WRONG_STAGE');
  assert.equal(h.cmd(0,'draft.guess',{guess:0,revision:0}).ok,true);
  const team=currentDraftTurn(m!.draft!)!.team;
  const msg={v:2,id:'dedupe',type:'draft.action',matchId:m!.id,round:0,payload:{shipId:'dd-1',revision:m!.draft!.revision}};
  const reply=h.service.command(h.users[team].p,msg),revision=m!.draft!.revision;
  assert.equal(reply.ok,true);assert.deepEqual(h.service.command(h.users[team].p,msg),reply);assert.equal(m!.draft!.revision,revision);
  assert.throws(()=>h.service.command(h.users[team].p,{...msg,payload:{...msg.payload,shipId:'dd-2'}}),{code:'DUPLICATE_ID'});
  assert.equal(h.cmd(team,'draft.action',msg.payload).code,'STALE_DRAFT');
  assert.equal(h.cmd(0,'deploy.update',{positions:[],ready:true}).code,'WRONG_STAGE');
  finishDraft(m,h.cmd,{confirm:false});assert.equal(m!.game,null);assert.equal(m!.draft!.history.length,20);
  assert.equal(h.cmd(0,'draft.confirm',{revision:m!.draft!.revision}).ok,true);assert.equal(m!.game,null);
  assert.equal(h.cmd(0,'draft.confirm',{revision:m!.draft!.revision}).code,'WRONG_STAGE');
  assert.equal(h.cmd(1,'draft.confirm',{revision:m!.draft!.revision}).ok,true);assert.equal(m!.stage,'deploy');
  for(let team=0;team<2;team++) {
    const ships:Ship[]=m!.game!.ships.filter((s)=>s.team===team);assert.equal(fleetError(ships.map((s)=>s.catalogId)),'');
    assert.deepEqual(ships.map((s)=>s.cfg.role),['front','front','front','back','back']);
    ships.forEach((s)=>{assert.equal(s.label,getShip!(s.catalogId!)!.name);assert.equal(s.template,getShip!(s.catalogId!)!.template);});
  }
  assert.equal(h.cmd(0,'draft.action',{shipId:'ca-3',revision:m!.draft!.revision}).code,'WRONG_STAGE');
});

test('ready room starts draft and both legal fleets enter deployment through commands', () => {
  const h=setup();const code=h.cmd(0,'room.create',{turnSeconds:60}).data!.code;
  h.cmd(1,'room.join',{code});assert.equal(h.cmd(0,'room.start').code,'NOT_READY');
  h.cmd(0,'room.ready',{ready:true});h.cmd(1,'room.ready',{ready:true});assert.equal(h.cmd(0,'room.start').ok,true);
  const m=h.service.matches.get(h.users[0].p.match!);assert.equal(m!.stage,'draft');finishDraft(m,h.cmd);
  for(let team=0;team<2;team++)assert.equal(h.cmd(team,'deploy.update',{ready:true,positions:m!.game!.ships.filter(s=>s.team===team).map(s=>({id:s.id,pos:s.pos}))}).ok,true);
  assert.equal(m!.stage,'plan');
});

test('draft disconnect pauses, restores authoritative selection and preserves revision', () => {
  const h=setup(),m=h.pair();h.cmd(0,'draft.guess',{guess:1,revision:0});const before=structuredClone(m!.draft),deadline=m!.deadline;
  const user=h.users[1];h.service.disconnect(user.p,user.send);assert.equal(h!.service.view(user.p).match!.pausedAt,1000);h.advance(40000);
  const team=currentDraftTurn(m!.draft!)!.team;assert.equal(h.cmd(team,'draft.action',{shipId:'dd-1',revision:m!.draft!.revision}).code,'DISCONNECTED');
  h.service.connect(user.session.token,user.send);assert.equal(m!.deadline,deadline!+40000);assert.deepEqual(m!.draft,before);
  assert.deepEqual((user!.messages.at(-1)! as unknown as import('../shared/network.ts').OnlineState).match!.draft,before);assert.equal((user!.messages.at(-1)! as unknown as import('../shared/network.ts').OnlineState).match!.game,null);
  h.service.disconnect(user.p,user.send);h.advance(50001);h.service.connect(user.session.token,user.send);assert.equal(m!.stage,'ended');assert.equal(m!.result!.winner,0);
});

test('resigning before battle creation and leaving handles null game safely', () => {
  const h=setup(),m=h.pair();assert.equal(h.cmd(1,'match.resign').ok,true);assert.equal(m!.game,null);assert.equal(m!.result!.winner,0);
  assert.equal(h.cmd(0,'match.leave').ok,true);assert.equal(h.cmd(1,'match.leave').ok,true);assert.equal(h.users[0].p.match,null);
});

test('guess, action and final confirmation deadlines end with the correct winner', () => {
  for(const stage of ['guess','action','both-confirm','one-confirm']) {
    const h=setup(),m=h.pair();let winner:number|null=1;
    if(stage==='action'){h.cmd(0,'draft.guess',{guess:0,revision:0});winner=1-currentDraftTurn(m!.draft!)!.team;}
    if(stage.includes('confirm')){finishDraft(m,h.cmd,{confirm:false});winner=null;}
    if(stage==='one-confirm'){h.cmd(0,'draft.confirm',{revision:m!.draft!.revision});winner=0;}
    h.advance(120001);h.service.tick();assert.equal(m!.stage,'ended');assert.equal(m!.result!.winner,winner);assert.equal(m!.game,null);
  }
});

test('late draft action cannot reset an expired deadline before the timer tick', () => {
  const h=setup(),m=h.pair();h.advance(120001);
  assert.equal(h.cmd(0,'draft.guess',{guess:0,revision:0}).code,'WRONG_STAGE');assert.equal(m!.stage,'ended');assert.equal(m!.draft!.revision,0);
});

test('injected rules configure fleet counts and deployment up to nine unique cells', () => {
  for(const size of [1,2,6,9]) {
    const limits={front:Math.min(size,6),back:Math.max(0,size-6)};
    const h=setup({draftRules:{poolMode:'independent',banTarget:'opponent',fleetLimits:limits,steps:[{actor:'first',action:'pick',count:size},{actor:'second',action:'pick',count:size}]}}),m=h.pair();
    finishDraft(m,h.cmd);assert.equal(m!.game!.ships.length,size*2);
    for(let team=0;team<2;team++) {
      const ships:Ship[]=m!.game!.ships.filter(s=>s.team===team);assert.equal(ships.length,size);assert.equal(new Set(ships.map(s=>E.key(s.pos))).size,size);
      assert.ok(ships.every(s=>E.deployment(team).some(p=>E.same(p,s.pos))));
    }
  }
});

test('online AI accepts catalog identities, sorts roles and skips PvP drafting', () => {
  const h=setup({models:[{id:'qa',name:'测试AI'}]});
  assert.equal(h.cmd(0,'ai.start',{modelId:'qa',roster:['cv-3','dd-3','cl-2','bb-2','ca-1']}).ok,true);
  const m=h.service.matches.get(h.users[0].p.match!);assert.equal(m!.draft,null);assert.equal(m!.stage,'deploy');
  assert.deepEqual(m!.game!.ships.filter(s=>s.team===0).map(s=>s.catalogId),['dd-3','cl-2','ca-1','cv-3','bb-2']);
  assert.deepEqual(m!.game!.ships.filter(s=>s.team===0).map(s=>s.cfg.role),['front','front','front','back','back']);
});
