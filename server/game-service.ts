import type {BattleMode} from '../shared/domination.ts';
import {DEFAULT_FLEET} from '../src/ship-definitions.ts';
import {PROTOCOL_VERSION} from '../shared/network.ts';
import type {PublicModel,CommandReply} from '../shared/network.ts';
import type {ServiceOptions,Player,Room,Match,ModelConfig,Logger,Send,Close,Command,SessionUser,SeatInput,BattleExecutor,AIExecutor} from './types.ts';
import type {Game,Hex} from '../shared/game.ts';
import type {DraftState} from '../shared/draft.ts';
import type {AccountStore} from './account-store.ts';
import type {OnlineState,Identity} from '../shared/network.ts';
import {BattlePool} from './pool.ts';
import {AIService} from './ai.ts';
import {isRecord,errorMessage} from '../src/lib/errors.ts';
import Type from 'typebox';
import Value from 'typebox/value';
interface Payload {battleMode?:BattleMode;roster?:string[];turnSeconds?:number;code?:string;ready?:boolean;modelId?:string;aiMode?:'standard'|'full';guess?:number;revision?:number;shipId?:string;positions?:{id:string;pos:Hex}[];plans?:unknown}
const PayloadSchema=Type.Object({battleMode:Type.Optional(Type.Union([Type.Literal('annihilation'),Type.Literal('domination')])),roster:Type.Optional(Type.Array(Type.String())),turnSeconds:Type.Optional(Type.Number()),code:Type.Optional(Type.String()),ready:Type.Optional(Type.Boolean()),modelId:Type.Optional(Type.String()),aiMode:Type.Optional(Type.Union([Type.Literal('standard'),Type.Literal('full')])),guess:Type.Optional(Type.Number()),revision:Type.Optional(Type.Number()),shipId:Type.Optional(Type.String()),positions:Type.Optional(Type.Array(Type.Object({id:Type.String(),pos:Type.Object({q:Type.Number(),r:Type.Number()})}))),plans:Type.Optional(Type.Unknown())});
import { randomBytes, randomInt, randomUUID } from 'node:crypto';
import * as E from '../src/engine.ts';
import { catalogFleet, getShip, fleetError, sortFleet, nameFleet } from '../src/ship-catalog.ts';
import { createDraft, guessFirst, actDraft, confirmDraft, currentDraftTurn } from '../src/draft.ts';
import { playerView, playerResult, validateOrders } from './views.ts';
import { initializeMatchStats, accumulateRoundStats, snapshotMatch } from './match-records.ts';
import { createAIRoundMemory } from './ai-history.ts';
const LIMITS = [0,60,120,300];
function fail(code:string,message:string):never {throw Object.assign(new Error(message),{code});}
function assert(condition:unknown,code:string,message:string):asserts condition {if(!condition)fail(code,message);}
function roster(value: string[] = DEFAULT_FLEET) {
  let ids; try { ids = sortFleet(catalogFleet(value)); } catch { fail('INVALID_ROSTER','请选择有效且不重复的舰船'); }
  assert(!fleetError(ids),'INVALID_ROSTER','请选择3艘前排和2艘后排');
  return ids;
}
export class GameService {
  readonly draftInitial:DraftState;readonly pool:BattleExecutor;readonly ai:AIExecutor;readonly models:PublicModel[];readonly now:()=>number;readonly logger:Logger;readonly serverId:string;
  readonly players=new Map<string,Player>();readonly tokens=new Map<string,Player>();readonly accountPlayers=new Map<string,Player>();readonly rooms=new Map<string,Room>();readonly matches=new Map<string,Match>();queue:string[]=[];closed=false;timer?:ReturnType<typeof setInterval>;
  resolveAccount?:(hash:string|null)=>SessionUser|null;recordStore:Pick<AccountStore,'saveMatch'>|null=null;
  private player(id:string):Player {const player=this.players.get(id);if(!player)throw new Error('对局成员不存在');return player;}

  constructor({pool,ai,models=[],draftRules,draftPool,now=Date.now,autoTick=true,logger=console}:ServiceOptions={}) {
    this.draftInitial=createDraft(draftRules,draftPool);
    this.models=models;this.now=now;this.logger=logger;this.pool=pool??new BattlePool();this.ai=ai??new AIService({models:models.filter(isConfiguredModel),logger});this.serverId=randomUUID();
    if(autoTick)this.timer=setInterval(()=>this.tick(),100);this.timer?.unref();
  }
  session(nickname:unknown,account:SessionUser|null=null):Identity {
    assert(!this.closed,'CLOSED','服务器正在关闭');
    if(account)nickname=account.username;
    assert(typeof nickname==='string'&&nickname.trim().length>=1&&nickname.trim().length<=20&&!/[\x00-\x1f]/.test(nickname),'INVALID_NICKNAME','昵称需为1至20个字符');
    const existing=account&&this.accountPlayers.get(account.id);
    if(existing)return {token:existing.token,playerId:existing.id,nickname:existing.nickname,serverId:this.serverId,identityType:'account',accountId:account.id};
    assert(this.players.size<2000,'FULL','服务器访客已满，请稍后再试');
    const id=randomUUID(),token=randomBytes(32).toString('base64url');
    const p:Player={id,token,nickname:nickname.trim(),accountId:account?.id||null,sessionHash:account?.sessionHash||null,room:null,match:null,queued:false,connected:false,send:null,close:null,requests:new Map(),touched:this.now()};
    this.players.set(id,p);this.tokens.set(token,p);if(account)this.accountPlayers.set(account.id,p);
    return {token,playerId:id,nickname:p.nickname,serverId:this.serverId,identityType:account?'account':'guest',...(account?{accountId:account.id}:{})};
  }
  accountBusy(accountId:string){const p=this.accountPlayers.get(accountId);return !!(p&&(p.room||p.match||p.queued));}
  accountFor(p:Player|undefined|null){
    if(!p?.accountId)return null;
    const account=this.resolveAccount?.(p.sessionHash);
    assert(account?.id===p.accountId,'AUTH_SESSION_EXPIRED','登录已过期，请重新登录后连接，或退出账号后以访客连接');
    return account;
  }
  connect(token:string,send:Send,close:Close=()=>{},account:SessionUser|null=null) {
    const p=this.tokens.get(token);assert(p,'SESSION_EXPIRED','访客身份已失效，服务器可能已重启，请重新进入');
    if(p.accountId){assert(account?.id===p.accountId,'AUTH_SESSION_EXPIRED','账号会话已失效，请重新登录');p.sessionHash=account.sessionHash;}
    const oldClose=p.close; p.send=send;p.close=close;p.connected=true;p.touched=this.now();oldClose?.();
    const m=p.match?this.matches.get(p.match!):undefined,seat=m?.seats.find(s=>s.playerId===p.id);
    if(m&&seat?.disconnectedAt!=null){seat.remainingMs=Math.max(0,seat.remainingMs-(this.now()-seat.disconnectedAt));if(seat.remainingMs===0&&m.stage!=='ended'){const opponent=m.seats.find(s=>s!==seat)!,both=opponent.disconnectedAt!=null&&this.now()-opponent.disconnectedAt>=opponent.remainingMs;this.end(m,both?null:1-m.seats.indexOf(seat),both?'双方断线，对局中止':'对手断线超时');}seat.disconnectedAt=null;}
    if(m){this.updatePause(m);if(m.stage==='plan')this.tryResolve(m);this.broadcastMatch(m);}else this.sendState(p);
    return p;
  }
  disconnect(p:Player,send:Send) {
    if(p.send!==send)return; p.connected=false;p.send=null;p.close=null;p.touched=this.now();
    if(p.queued){this.queue=this.queue.filter(id=>id!==p.id);p.queued=false;this.broadcastQueue();}
    const m=p.match?this.matches.get(p.match!):undefined;if(m&&m.stage!=='ended'){
      const s=m.seats.find(s=>s.playerId===p.id)!;s.disconnectedAt=this.now();this.updatePause(m);this.broadcastMatch(m);
    }
  }
  push(p:Player,message:Record<string,unknown>){try{p.send?.({v:PROTOCOL_VERSION,...message});}catch{ /* transport owns close handling */ }}
  view(p:Player):OnlineState&{serverId:string} {
    const room=this.rooms.get(p.room!),m=this.matches.get(p.match!),myTeam=m?m.seats.findIndex(s=>s.playerId===p.id):0;
    return {serverId:this.serverId,player:{id:p.id,nickname:p.nickname},room:room?{battleMode:room.battleMode??'annihilation',code:room.code,hostId:room.hostId,turnSeconds:room.turnSeconds,players:room.players.map(id=>{const x=this.player(id);return{id:x.id,nickname:x.nickname,ready:room.ready[id]||false,roster:room.rosters[id]};})}:null,
      queue:p.queued?{battleMode:p.battleMode??'annihilation',position:this.queue.filter(id=>(this.player(id).battleMode??'annihilation')===(p.battleMode??'annihilation')).indexOf(p.id)+1}:null,
      match:m?{battleMode:m.battleMode??'annihilation',id:m.id,kind:m.kind,aiName:this.models.find(x=>x.id===m.modelId)?.name||null,...(m.kind==='ai'?{aiMode:m.aiMode,aiHistoryRounds:m.aiHistory.length}:{}),myTeam,stage:m.stage,round:m.game?.round??0,game:m.game?playerView(m.game,myTeam):null,draft:m.draft?E.clone(m.draft):null,plans:E.clone(m.orders[myTeam]||{}),submitted:[...m.submitted],deadline:m.deadline,playbackUntil:m.playbackUntil,paused:m.pauseSince!=null,pausedAt:m.pauseSince,disconnects:m.seats.flatMap((s,team)=>s.disconnectedAt==null?[]:[{team,remainingMs:Math.max(0,s.remainingMs-(this.now()-s.disconnectedAt))}]),aiStatus:m.aiStatus,aiError:m.aiError,result:m.result,...(m.recordStatus&&m.seats[myTeam]?.accountId&&m.seats[myTeam].accountId===p.accountId?{recordStatus:m.recordStatus}:{})}:null};
  }
  sendState(p:Player){this.push(p,{type:'state',...this.view(p)});}
  broadcastRoom(r:Room){for(const id of r.players)this.sendState(this.player(id));}
  broadcastMatch(m:Match){for(const s of m.seats)if(s.playerId)this.sendState(this.player(s.playerId));}
  broadcastQueue(){for(const id of this.queue)this.sendState(this.player(id));}
  idle(p:Player){assert(!p.room&&!p.match&&!p.queued,'ALREADY_BUSY','请先退出当前房间、队列或对局');}
  command(p:Player,value:unknown):CommandReply {
    assert(isRecord(value)&&value.v===PROTOCOL_VERSION,'PROTOCOL_MISMATCH','客户端与服务器版本不匹配，请刷新页面');
    assert(isRecord(value)&&value.v===PROTOCOL_VERSION&&typeof value.id==='string'&&typeof value.type==='string'&&(value.matchId===undefined||typeof value.matchId==='string')&&(value.round===undefined||typeof value.round==='number'),'BAD_MESSAGE','消息格式无效');
    const msg:Command={v:PROTOCOL_VERSION,id:value.id,type:value.type,...(typeof value.matchId==='string'?{matchId:value.matchId}:{}),...(typeof value.round==='number'?{round:value.round}:{}),...(isRecord(value.payload)?{payload:value.payload}:{})};
    assert(value.payload===undefined||isRecord(value.payload),'BAD_MESSAGE','操作参数无效');
    assert(msg&&msg.v===PROTOCOL_VERSION&&typeof msg.id==='string'&&msg.id.length>0&&msg.id.length<=80&&typeof msg.type==='string','BAD_MESSAGE','消息格式无效');
    const fingerprint=JSON.stringify(msg),previous=p.requests.get(msg.id);
    if(previous){assert(previous.fingerprint===fingerprint,'DUPLICATE_ID','请求编号已被其他操作使用');this.push(p,previous.reply);return previous.reply;}
    let reply:CommandReply;
    try {const data=this.execute(p,msg);reply={type:'ack',id:msg.id,ok:true,...(data?{data}:{})};}
    catch(error){reply={type:'error',id:msg.id,code:isRecord(error)&&typeof error.code==='string'?error.code:'INVALID_REQUEST',message:isRecord(error)&&error.code?errorMessage(error):'操作无效，请检查输入'};}
    p.touched=this.now();p.requests.set(msg.id,{fingerprint,reply});if(p.requests.size>128)p.requests.delete(p.requests.keys().next().value!);this.push(p,reply);return reply;
  }
  execute(p:Player,msg:Command) {
    const raw=msg.payload||{};if(raw.battleMode!==undefined)assert(raw.battleMode==='annihilation'||raw.battleMode==='domination','INVALID_BATTLE_MODE','请选择歼灭或三据点占领模式');if(msg.type==='ai.start'&&raw.aiMode!==undefined)assert(raw.aiMode==='standard'||raw.aiMode==='full','INVALID_AI_MODE','请选择普通或 FULL 模式');assert(Value.Check(PayloadSchema,raw),'BAD_MESSAGE','操作参数无效');const q:Payload=raw;assert(q&&typeof q==='object'&&!Array.isArray(q),'BAD_MESSAGE','操作参数无效');
    if(['room.create','room.join','room.start','queue.join','ai.start'].includes(msg.type))this.accountFor(p);
    if(msg.type==='room.create'){
      this.idle(p);const rr=roster(q.roster);assert(typeof q.turnSeconds==='number'&&LIMITS.includes(q.turnSeconds),'INVALID_TIME','不支持的回合时限');assert(this.rooms.size<200,'FULL','房间已满');
      let code;do{code=randomBytes(4).toString('hex').toUpperCase();}while(this.rooms.has(code));
      const r={battleMode:q.battleMode??'annihilation',code,hostId:p.id,players:[p.id],rosters:{[p.id]:rr},ready:{},turnSeconds:q.turnSeconds,created:this.now()};this.rooms.set(code,r);p.room=code;this.broadcastRoom(r);return {code};
    }
    if(msg.type==='room.join'){
      this.idle(p);const rr=roster(q.roster),r=this.rooms.get(String(q.code||'').trim().toUpperCase());assert(r&&r.players.length<2,'ROOM_UNAVAILABLE','房间不存在或已满');r.players.push(p.id);r.rosters[p.id]=rr;r.ready={};p.room=r.code;this.broadcastRoom(r);return;
    }
    if(msg.type.startsWith('room.')){
      const r=this.rooms.get(p.room!);assert(r,'NO_ROOM','当前不在房间中');
      if(msg.type==='room.leave'){
        if(r.hostId===p.id){this.rooms.delete(r.code);for(const id of r.players){const x=this.player(id);x.room=null;this.sendState(x);}}
        else{r.players=r.players.filter(id=>id!==p.id);delete r.rosters[p.id];r.ready={};p.room=null;this.sendState(p);this.broadcastRoom(r);}return;
      }
      if(msg.type==='room.update'){
        const rr=q.roster===undefined?null:roster(q.roster);
        if(q.battleMode!==undefined)assert(r.hostId===p.id,'INVALID_BATTLE_MODE','仅房主可以修改战斗模式');
        if(q.turnSeconds!==undefined)assert(r.hostId===p.id&&typeof q.turnSeconds==='number'&&LIMITS.includes(q.turnSeconds),'INVALID_TIME','仅房主可以修改回合时限');
        if(q.battleMode!==undefined)r.battleMode=q.battleMode;if(rr)r.rosters[p.id]=rr;if(q.turnSeconds!==undefined)r.turnSeconds=q.turnSeconds;r.ready={};this.broadcastRoom(r);return;
      }
      if(msg.type==='room.ready'){assert(typeof q.ready==='boolean','INVALID_READY','准备状态无效');r.ready[p.id]=q.ready;this.broadcastRoom(r);return;}
      if(msg.type==='room.start'){
        assert(q.battleMode===undefined||q.battleMode===(r.battleMode??'annihilation'),'INVALID_BATTLE_MODE','战斗模式已变化，请确认房间当前模式后开始');
        assert(r.hostId===p.id&&r.players.length===2&&r.players.every(id=>r.ready[id]&&this.player(id).connected),'NOT_READY','双方连接并准备后，由房主开始');
        assert(r.players.every(id=>{try{this.accountFor(this.player(id));return true;}catch{return false;}}),'NOT_READY','有玩家登录已过期，请重新连接后准备');
        assert(this.matches.size<200,'FULL','对局已满');this.rooms.delete(r.code);const seats=r.players.map(id=>({playerId:id,roster:r.rosters[id]}));for(const id of r.players)this.player(id).room=null;this.start(seats,r.turnSeconds,null,'friend','standard',r.battleMode??'annihilation');return;
      }
      fail('UNKNOWN_COMMAND','未知房间操作');
    }
    if(msg.type==='queue.join'){
      this.idle(p);p.roster=roster(q.roster);p.battleMode=q.battleMode??'annihilation';assert(this.queue.length<500,'FULL','匹配队列已满');p.queued=true;this.queue.push(p.id);this.pairQueue();this.broadcastQueue();return;
    }
    if(msg.type==='queue.leave'){assert(p.queued,'NOT_QUEUED','当前不在队列');this.queue=this.queue.filter(id=>id!==p.id);p.queued=false;this.sendState(p);this.broadcastQueue();return;}
    if(msg.type==='ai.start'){
      this.idle(p);assert(this.models.some(x=>x.id===q.modelId),'MODEL_UNAVAILABLE','该AI模型尚未配置');assert(typeof q.modelId==='string','MODEL_UNAVAILABLE','该AI模型尚未配置');const aiMode=q.aiMode===undefined?'standard':q.aiMode;assert(['standard','full'].includes(aiMode),'INVALID_AI_MODE','请选择普通或 FULL 模式');const rr=roster(q.roster);assert(this.matches.size<200,'FULL','对局已满');this.start([{playerId:p.id,roster:rr},{playerId:null,roster:DEFAULT_FLEET}],0,q.modelId,'ai',aiMode,q.battleMode??'annihilation');return;
    }
    const m=p.match?this.matches.get(p.match!):undefined;assert(m&&msg.matchId===m.id,'NO_MATCH','对局不存在或已结束');const team=m.seats.findIndex(s=>s.playerId===p.id);
    if(msg.type==='match.leave'){assert(m.stage==='ended','MATCH_ACTIVE','请先认输或等待对局结束');p.match=null;this.sendState(p);return;}
    if(msg.type==='match.resign'){assert(m.stage!=='ended','MATCH_ENDED','对局已结束');this.end(m,1-team,`第 ${team+1} 队认输`);return;}
    assert(msg.round===(m.game?.round??0),'STALE_ROUND','回合已变化，请刷新当前状态');
    assert(m.pauseSince==null,'DISCONNECTED','等待对手重连');
    if(msg.type.startsWith('draft.')){
      if(m.stage==='draft'&&m.deadline!=null&&this.now()>=m.deadline)this.tick();
      assert(m.stage==='draft'&&m.draft,'WRONG_STAGE','当前不在选禁阶段');
      if(msg.type==='draft.guess') m.draft=guessFirst(m.draft,team,q.guess!,randomInt(2),q.revision!);
      else if(msg.type==='draft.action') m.draft=actDraft(m.draft,team,q.shipId!,q.revision!);
      else if(msg.type==='draft.confirm') m.draft=confirmDraft(m.draft,team,q.revision!);
      else fail('UNKNOWN_COMMAND','未知选禁操作');
      m.deadline=this.now()+120000;
      if(m.draft.ready.every(Boolean)){
        m.seats.forEach((seat,index)=>seat.roster=[...m.draft!.picks[index]]);
        this.createBattle(m);
      }
      this.broadcastMatch(m);return;
    }
    if(msg.type==='deploy.update'){
      assert(m.stage==='deploy','WRONG_STAGE','当前不在部署阶段');assert(typeof q.ready==='boolean'&&Array.isArray(q.positions)&&q.positions.length===m.game!.ships.filter(s=>s.team===team).length,'INVALID_DEPLOY','部署格式无效');
      const own=m.game!.ships.filter(s=>s.team===team),allowed=new Set(E.deployment(team,m.game!.map).map(E.key)),seen=new Set(),cells=new Set();
      for(const item of q.positions!){assert(item&&own.some(s=>s.id===item.id)&&!seen.has(item.id)&&Number.isInteger(item.pos?.q)&&Number.isInteger(item.pos?.r)&&allowed.has(E.key(item.pos))&&!cells.has(E.key(item.pos)),'INVALID_DEPLOY','舰船必须部署在不同的己方部署格');seen.add(item.id);cells.add(E.key(item.pos));}
      for(const item of q.positions!){const s=own.find(s=>s.id===item.id)!;s.pos={q:item.pos.q,r:item.pos.r};s.xy=E.hexToXY(s.pos);}m.submitted[team]=q.ready!;E.updateExploration(m.game!);
      if(m.submitted.every(Boolean))this.beginPlan(m);this.broadcastMatch(m);return;
    }
    assert(m.stage==='plan','WRONG_STAGE','当前不能修改指令');
    if(msg.type==='orders.submit'){
      assert(!m.submitted[team],'ALREADY_SUBMITTED','请先撤回已提交指令');m.orders[team]=validateOrders(m.game!,team,q.plans);m.submitted[team]=true;this.tryResolve(m);this.broadcastMatch(m);return;
    }
    if(msg.type==='orders.withdraw'){
      assert(m.submitted[team]&&!m.submitted[1-team],'LOCKED','双方已提交或当前没有可撤回指令');m.submitted[team]=false;this.broadcastMatch(m);return;
    }
    if(msg.type==='ai.retry'){assert(m.kind==='ai'&&m.aiStatus==='error','NOT_RETRYABLE','当前无需重试AI');this.generateAI(m);this.broadcastMatch(m);return;}
    fail('UNKNOWN_COMMAND','未知操作');
  }
  pairQueue(){
    this.queue=this.queue.filter(id=>{
      const p=this.player(id);
      if(!p)return false;
      try{this.accountFor(p);return true;}catch(error){p.queued=false;this.push(p,{type:'error',code:isRecord(error)?error.code:undefined,message:errorMessage(error)});p.close?.(1008,'账号会话已过期');return false;}
    });
    while(this.queue.length>=2&&this.matches.size<200){
      const first=this.queue.findIndex((id,i)=>this.queue.slice(i+1).some(other=>(this.player(other).battleMode??'annihilation')===(this.player(id).battleMode??'annihilation')));
      if(first<0)break;
      const a=this.queue[first],battleMode=this.player(a).battleMode??'annihilation',second=this.queue.findIndex((id,i)=>i>first&&(this.player(id).battleMode??'annihilation')===battleMode),ids=[a,this.queue[second]];
      this.queue.splice(second,1);this.queue.splice(first,1);for(const id of ids)this.player(id).queued=false;
      this.start(ids.map(id=>({playerId:id,roster:this.player(id).roster!})),120,null,'random','standard',battleMode);
    }
  }
  start(seats:SeatInput[],turnSeconds:number,modelId:string|null=null,mode=modelId?'ai':'friend',aiMode:'standard'|'full'='standard',battleMode:BattleMode='annihilation'){
    const boundSeats=seats.map(s=>{
      const p=s.playerId?this.players.get(s.playerId):undefined,account=this.accountFor(p);
      return {...s,accountId:account?.id||null,nickname:p?.nickname||this.models.find(x=>x.id===modelId)?.name||'AI',timeouts:0,remainingMs:90000,disconnectedAt:null};
    });
    const m:Match={battleMode,combatStats:{},roundsResolved:0,endedAt:0,recordAttempts:0,recordRetryAt:null,timedOut:[false,false],aiMode,aiHistory:[],id:randomUUID(),kind:modelId?'ai':'pvp',mode,modelId,...(modelId?{aiMode,aiHistory:[]}:{}),seats:boundSeats,game:null,draft:modelId?null:E.clone(this.draftInitial),stage:modelId?'deploy':'draft',turnSeconds,deadline:modelId?null:this.now()+120000,playbackUntil:null,pauseSince:null,submitted:[false,!!modelId],orders:[{},{}],result:null,aiStatus:null,aiError:null,created:this.now()};
    if(modelId)this.createBattle(m);
    this.matches.set(m.id,m);for(const s of m.seats)if(s.playerId)this.player(s.playerId).match=m.id;this.broadcastMatch(m);return m;
  }
  createBattle(m:Match){
    const fleets=m.seats.map(s=>sortFleet(catalogFleet(s.roster)));
    const g=E.createFleetGame([],randomInt(2147483647),[],m.battleMode??'annihilation');
    const spots=[[0,2,4,6,8,1,3,5,7],[8,6,4,2,0,7,5,3,1]];
    g.ruleset='fleet-v1';g.zones=[];g.ships=fleets.flatMap((ids,team)=>ids.map((id,i)=>E.createCatalogShip(id,team,i,E.deployment(team,g.map)[spots[team][i]])));
    m.seats.forEach((seat,team)=>seat.roster=[...fleets[team]]);
    fleets.forEach((ids,team)=>nameFleet(g.ships,ids,team));g.explored=[[],[]];E.updateExploration(g);
    m.game=g;m.stage='deploy';m.deadline=m.modelId?null:this.now()+120000;m.submitted=[false,!!m.modelId];m.orders=[{},{}];initializeMatchStats(m);
  }
  beginPlan(m:Match){m.stage='plan';m.game!.phase='plan';m.orders=[{},{}];m.submitted=[false,false];m.timedOut=[false,false];m.playbackUntil=null;m.deadline=m.turnSeconds?this.now()+m.turnSeconds*1000:null;if(m.pauseSince!=null)m.pauseSince=this.now();if(m.kind==='ai')this.generateAI(m);}
  generateAI(m:Match){
    m.aiAbort?.abort();const abort=new AbortController();m.aiAbort=abort;const round=m.game!.round;m.aiStatus='thinking';m.aiError=null;
    Promise.resolve().then(()=>this.ai.generate({game:E.clone(m.game!),team:1,modelId:m.modelId,matchId:m.id,signal:abort.signal,aiMode:m.aiMode,history:m.aiHistory})).then(plans=>{
      if(abort.signal.aborted||m.stage!=='plan'||m.game!.round!==round)return;m.orders[1]=plans;m.submitted[1]=true;m.aiStatus='ready';this.tryResolve(m);this.broadcastMatch(m);
    }).catch(error=>{if(abort.signal.aborted||m.stage!=='plan'||m.game!.round!==round)return;m.aiStatus='error';m.aiError=isRecord(error)&&typeof error.code==='string'&&error.code.startsWith('AI_')?errorMessage(error):'AI 请求失败或指令无效，请重试或结束对局';this.broadcastMatch(m);});
  }
  tryResolve(m:Match){
    if(m.stage!=='plan'||m.pauseSince!=null||!m.submitted.every(Boolean)||m.aiStatus==='error')return;
    for(let team=0;team<2;team++)if(!m.timedOut?.[team])m.seats[team].timeouts=0;
    m.stage='resolving';m.deadline=null;const before=E.clone(m.game!),round=before.round,orders={...m.orders[0],...m.orders[1]},aiOrders=m.aiMode==='full'?E.clone(m.orders[1]):null;
    Promise.resolve().then(()=>this.pool.resolve(before,orders)).then(result=>{
      if(m.stage!=='resolving'||m.game!.round!==round)return;
      const projected=[0,1].map(team=>playerResult(before,result,team));
      if(m.kind==='ai'&&m.aiMode==='full')m.aiHistory.push(createAIRoundMemory(before,projected[1],1,aiOrders));
      accumulateRoundStats(m,result);
      m.game=result.game;m.stage='playback';m.playbackUntil=this.now()+Math.max(1000,result.frames.length*110);m.lastRound={round,projected};
      for(const [team,s]of m.seats.entries())if(s.playerId)this.push(this.player(s.playerId),{type:'round',matchId:m.id,round,result:projected[team],playbackUntil:m.playbackUntil});this.broadcastMatch(m);
    }).catch(error=>{if(m.stage!=='resolving')return;this.logger.error?.({event:'resolve_failed',matchId:m.id});this.end(m,null,'服务器结算失败，对局中止');});
  }
  updatePause(m:Match){
    const offline=m.seats.some(s=>s.playerId&&s.disconnectedAt!=null);
    if(offline&&m.pauseSince==null)m.pauseSince=this.now();
    if(!offline&&m.pauseSince!=null){if(m.deadline!=null)m.deadline+=this.now()-m.pauseSince;m.pauseSince=null;}
  }
  end(m:Match,winner:Game['winner'],reason:string){
    if(m.stage==='ended')return;
    const endStage=m.stage;
    m.aiAbort?.abort();m.stage='ended';m.deadline=null;m.playbackUntil=null;m.pauseSince=null;m.endedAt=this.now();m.result={winner,reason};if(m.game){m.game!.phase='ended';m.game!.winner=winner;}
    if(m.seats.some(s=>s.accountId)){
      m.recordSnapshot=snapshotMatch(m,endStage);m.recordAttempts=0;this.persistResult(m);
    }
    this.broadcastMatch(m);
  }
  persistResult(m:Match,notify=false){
    m.recordAttempts++;
    try{assert(this.recordStore&&m.recordSnapshot,'RECORD_UNAVAILABLE','战绩存储不可用');this.recordStore.saveMatch(m.recordSnapshot);m.recordStatus='saved';m.recordRetryAt=null;}
    catch{
      const delay=[1000,5000,30000][m.recordAttempts-1];
      m.recordStatus=delay===undefined?'failed':'pending';m.recordRetryAt=delay===undefined?null:m.endedAt+delay;
      this.logger.error?.({event:'match_record_save_failed',matchId:m.id,attempt:m.recordAttempts});
    }
    if(notify)this.broadcastMatch(m);
  }
  tick(){
    const now=this.now();
    for(const m of this.matches.values()){
      if(m.stage==='ended'){if(m.recordStatus==='pending'&&m.recordRetryAt!=null&&now>=m.recordRetryAt)this.persistResult(m,true);if(now-m.endedAt>1800000){for(const s of m.seats)if(s.playerId){const p=this.player(s.playerId);if(p?.match===m.id){p.match=null;this.sendState(p);}}this.matches.delete(m.id);}continue;}
      const expired=m.seats.map(s=>s.disconnectedAt!=null&&now-s.disconnectedAt>=s.remainingMs);
      if(expired.every(Boolean)){this.end(m,null,'双方断线，对局中止');continue;}
      const lost=expired.findIndex(Boolean);if(lost>=0&&(m.seats[1-lost].playerId===null||m.seats[1-lost].disconnectedAt==null)){this.end(m,1-lost,'对手断线超时');continue;}
      if(m.stage==='playback'&&m.playbackUntil!=null&&now>=m.playbackUntil){
        if(m.game!.phase==='ended')this.end(m,m.game!.winner,'战斗结束');else{this.beginPlan(m);this.broadcastMatch(m);}continue;
      }
      if(m.pauseSince!=null||m.deadline==null||now<m.deadline)continue;
      if(m.stage==='draft'){const team=m.draft!.status==='guess'?0:currentDraftTurn(m.draft!)?.team;const waiting=team===undefined?m.draft!.ready.flatMap((ready,i)=>ready?[]:[i]):[team];this.end(m,waiting.length===1?1-waiting[0]:null,'选禁操作超时');continue;}
      if(m.stage==='deploy'){this.beginPlan(m);this.broadcastMatch(m);continue;}
      if(m.stage==='plan'){
        for(let team=0;team<2;team++)if(!m.submitted[team]){m.seats[team].timeouts++;m.timedOut[team]=true;m.orders[team]={};m.submitted[team]=true;}
        const lost=m.seats.map(s=>s.timeouts>=3);if(lost.every(Boolean))this.end(m,'draw','双方连续3轮超时');else if(lost.some(Boolean))this.end(m,lost[0]?1:0,'对手连续3轮超时');else{this.tryResolve(m);this.broadcastMatch(m);}
      }
    }
    for(const r of this.rooms.values())if(now-r.created>3600000){this.rooms.delete(r.code);for(const id of r.players){const p=this.player(id);p.room=null;this.sendState(p);}}
    for(const p of this.players.values())if(!p.connected&&!p.room&&!p.match&&!p.queued&&now-p.touched>3600000){this.players.delete(p.id);this.tokens.delete(p.token);if(p.accountId)this.accountPlayers.delete(p.accountId);}
    if(this.queue.length>=2)this.pairQueue();
  }
  async close(){this.closed=true;clearInterval(this.timer);for(const m of this.matches.values())m.aiAbort?.abort();for(const p of this.players.values()){this.push(p,{type:'error',code:'SERVER_RESTART',message:'服务器正在关闭，本局不会保存，请重新进入'});p.close?.(1012,'服务器重启');}await this.pool?.close?.();}
}

function isConfiguredModel(model:PublicModel):model is ModelConfig {return 'model' in model && typeof model.model==='string' && 'baseURL' in model && typeof model.baseURL==='string' && 'apiKey' in model && typeof model.apiKey==='string' && 'protocol' in model && (model.protocol==='chat'||model.protocol==='responses');}
