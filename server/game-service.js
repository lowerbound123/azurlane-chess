import { randomBytes, randomInt, randomUUID } from 'node:crypto';
import * as E from '../src/engine.js';
import { playerView, playerResult, validateOrders } from './views.js';
const LIMITS = [0,60,120,300];
const fail=(code,message)=>{throw Object.assign(new Error(message),{code});};
const assert=(condition,code,message)=>{if(!condition)fail(code,message);};
function roster(value) {
  assert(Array.isArray(value)&&value.length===5&&value.every((t,i)=>i<3?['dd','cl','ca'].includes(t):['bb','cv'].includes(t)),'INVALID_ROSTER','请选择3艘前排和2艘后排');
  return [...value];
}
export class GameService {
  constructor({pool,ai,models=[],now=Date.now,autoTick=true,logger=console}={}) {
    Object.assign(this,{pool,ai,models,now,logger}); this.serverId=randomUUID(); this.players=new Map(); this.tokens=new Map(); this.rooms=new Map(); this.matches=new Map(); this.queue=[];this.closed=false;
    if(autoTick)this.timer=setInterval(()=>this.tick(),100);this.timer?.unref();
  }
  session(nickname) {
    assert(!this.closed,'CLOSED','服务器正在关闭');
    assert(typeof nickname==='string'&&nickname.trim().length>=1&&nickname.trim().length<=20&&!/[\x00-\x1f]/.test(nickname),'INVALID_NICKNAME','昵称需为1至20个字符');
    assert(this.players.size<2000,'FULL','服务器访客已满，请稍后再试');
    const id=randomUUID(),token=randomBytes(32).toString('base64url');
    const p={id,token,nickname:nickname.trim(),room:null,match:null,queued:false,connected:false,send:null,close:null,requests:new Map(),touched:this.now()};
    this.players.set(id,p);this.tokens.set(token,p);return {token,playerId:id,nickname:p.nickname,serverId:this.serverId};
  }
  connect(token,send,close=()=>{}) {
    const p=this.tokens.get(token);assert(p,'SESSION_EXPIRED','访客身份已失效，服务器可能已重启，请重新进入');
    const oldClose=p.close; p.send=send;p.close=close;p.connected=true;p.touched=this.now();oldClose?.();
    const m=this.matches.get(p.match),seat=m?.seats.find(s=>s.playerId===p.id);
    if(seat?.disconnectedAt!=null){seat.remainingMs=Math.max(0,seat.remainingMs-(this.now()-seat.disconnectedAt));if(seat.remainingMs===0&&m.stage!=='ended'){const opponent=m.seats.find(s=>s!==seat),both=opponent.disconnectedAt!=null&&this.now()-opponent.disconnectedAt>=opponent.remainingMs;this.end(m,both?null:1-m.seats.indexOf(seat),both?'双方断线，对局中止':'对手断线超时');}seat.disconnectedAt=null;}
    if(m){this.updatePause(m);if(m.stage==='plan')this.tryResolve(m);this.broadcastMatch(m);}else this.sendState(p);
    return p;
  }
  disconnect(p,send) {
    if(p.send!==send)return; p.connected=false;p.send=null;p.close=null;p.touched=this.now();
    if(p.queued){this.queue=this.queue.filter(id=>id!==p.id);p.queued=false;this.broadcastQueue();}
    const m=this.matches.get(p.match);if(m&&m.stage!=='ended'){
      const s=m.seats.find(s=>s.playerId===p.id);s.disconnectedAt=this.now();this.updatePause(m);this.broadcastMatch(m);
    }
  }
  push(p,message){try{p.send?.({v:1,...message});}catch{ /* transport owns close handling */ }}
  view(p) {
    const room=this.rooms.get(p.room),m=this.matches.get(p.match),myTeam=m?.seats.findIndex(s=>s.playerId===p.id);
    return {serverId:this.serverId,player:{id:p.id,nickname:p.nickname},room:room?{code:room.code,hostId:room.hostId,turnSeconds:room.turnSeconds,players:room.players.map(id=>{const x=this.players.get(id);return{id:x.id,nickname:x.nickname,ready:room.ready[id]||false,roster:room.rosters[id]};})}:null,
      queue:p.queued?{position:this.queue.indexOf(p.id)+1}:null,
      match:m?{id:m.id,kind:m.kind,myTeam,stage:m.stage,round:m.game.round,game:playerView(m.game,myTeam),plans:E.clone(m.orders[myTeam]||{}),submitted:[...m.submitted],deadline:m.deadline,playbackUntil:m.playbackUntil,paused:m.pauseSince!=null,disconnects:m.seats.flatMap((s,team)=>s.disconnectedAt==null?[]:[{team,remainingMs:Math.max(0,s.remainingMs-(this.now()-s.disconnectedAt))}]),aiStatus:m.aiStatus,aiError:m.aiError,result:m.result}:null};
  }
  sendState(p){this.push(p,{type:'state',...this.view(p)});}
  broadcastRoom(r){for(const id of r.players)this.sendState(this.players.get(id));}
  broadcastMatch(m){for(const s of m.seats)if(s.playerId)this.sendState(this.players.get(s.playerId));}
  broadcastQueue(){for(const id of this.queue)this.sendState(this.players.get(id));}
  idle(p){assert(!p.room&&!p.match&&!p.queued,'ALREADY_BUSY','请先退出当前房间、队列或对局');}
  command(p,msg) {
    assert(msg&&msg.v===1&&typeof msg.id==='string'&&msg.id.length>0&&msg.id.length<=80&&typeof msg.type==='string','BAD_MESSAGE','消息格式无效');
    const fingerprint=JSON.stringify(msg),previous=p.requests.get(msg.id);
    if(previous){assert(previous.fingerprint===fingerprint,'DUPLICATE_ID','请求编号已被其他操作使用');this.push(p,previous.reply);return previous.reply;}
    let reply;
    try {const data=this.execute(p,msg);reply={type:'ack',id:msg.id,ok:true,...(data?{data}:{})};}
    catch(error){reply={type:'error',id:msg.id,code:error.code||'INVALID_REQUEST',message:error.code?error.message:'操作无效，请检查输入'};}
    p.touched=this.now();p.requests.set(msg.id,{fingerprint,reply});if(p.requests.size>128)p.requests.delete(p.requests.keys().next().value);this.push(p,reply);return reply;
  }
  execute(p,msg) {
    const q=msg.payload||{};assert(q&&typeof q==='object'&&!Array.isArray(q),'BAD_MESSAGE','操作参数无效');
    if(msg.type==='room.create'){
      this.idle(p);const rr=roster(q.roster);assert(LIMITS.includes(q.turnSeconds),'INVALID_TIME','不支持的回合时限');assert(this.rooms.size<200,'FULL','房间已满');
      let code;do{code=randomBytes(4).toString('hex').toUpperCase();}while(this.rooms.has(code));
      const r={code,hostId:p.id,players:[p.id],rosters:{[p.id]:rr},ready:{},turnSeconds:q.turnSeconds,created:this.now()};this.rooms.set(code,r);p.room=code;this.broadcastRoom(r);return {code};
    }
    if(msg.type==='room.join'){
      this.idle(p);const rr=roster(q.roster),r=this.rooms.get(String(q.code||'').trim().toUpperCase());assert(r&&r.players.length<2,'ROOM_UNAVAILABLE','房间不存在或已满');r.players.push(p.id);r.rosters[p.id]=rr;r.ready={};p.room=r.code;this.broadcastRoom(r);return;
    }
    if(msg.type.startsWith('room.')){
      const r=this.rooms.get(p.room);assert(r,'NO_ROOM','当前不在房间中');
      if(msg.type==='room.leave'){
        if(r.hostId===p.id){this.rooms.delete(r.code);for(const id of r.players){const x=this.players.get(id);x.room=null;this.sendState(x);}}
        else{r.players=r.players.filter(id=>id!==p.id);delete r.rosters[p.id];r.ready={};p.room=null;this.sendState(p);this.broadcastRoom(r);}return;
      }
      if(msg.type==='room.update'){
        const rr=q.roster===undefined?null:roster(q.roster);
        if(q.turnSeconds!==undefined)assert(r.hostId===p.id&&LIMITS.includes(q.turnSeconds),'INVALID_TIME','仅房主可以修改回合时限');
        if(rr)r.rosters[p.id]=rr;if(q.turnSeconds!==undefined)r.turnSeconds=q.turnSeconds;r.ready={};this.broadcastRoom(r);return;
      }
      if(msg.type==='room.ready'){assert(typeof q.ready==='boolean','INVALID_READY','准备状态无效');r.ready[p.id]=q.ready;this.broadcastRoom(r);return;}
      if(msg.type==='room.start'){
        assert(r.hostId===p.id&&r.players.length===2&&r.players.every(id=>r.ready[id]&&this.players.get(id).connected),'NOT_READY','双方连接并准备后，由房主开始');
        assert(this.matches.size<200,'FULL','对局已满');this.rooms.delete(r.code);const seats=r.players.map(id=>({playerId:id,roster:r.rosters[id]}));for(const id of r.players)this.players.get(id).room=null;this.start(seats,r.turnSeconds);return;
      }
      fail('UNKNOWN_COMMAND','未知房间操作');
    }
    if(msg.type==='queue.join'){
      this.idle(p);p.roster=roster(q.roster);assert(this.queue.length<500,'FULL','匹配队列已满');p.queued=true;this.queue.push(p.id);this.pairQueue();this.broadcastQueue();return;
    }
    if(msg.type==='queue.leave'){assert(p.queued,'NOT_QUEUED','当前不在队列');this.queue=this.queue.filter(id=>id!==p.id);p.queued=false;this.sendState(p);this.broadcastQueue();return;}
    if(msg.type==='ai.start'){
      this.idle(p);assert(this.models.some(x=>x.id===q.modelId),'MODEL_UNAVAILABLE','该AI模型尚未配置');const rr=roster(q.roster);assert(this.matches.size<200,'FULL','对局已满');this.start([{playerId:p.id,roster:rr},{playerId:null,roster:E.DEFAULT_ROSTER}],0,q.modelId);return;
    }
    const m=this.matches.get(p.match);assert(m&&msg.matchId===m.id,'NO_MATCH','对局不存在或已结束');const team=m.seats.findIndex(s=>s.playerId===p.id);
    if(msg.type==='match.leave'){assert(m.stage==='ended','MATCH_ACTIVE','请先认输或等待对局结束');p.match=null;this.sendState(p);return;}
    if(msg.type==='match.resign'){assert(m.stage!=='ended','MATCH_ENDED','对局已结束');this.end(m,1-team,`第 ${team+1} 队认输`);return;}
    assert(msg.round===m.game.round,'STALE_ROUND','回合已变化，请刷新当前状态');
    assert(m.pauseSince==null,'DISCONNECTED','等待对手重连');
    if(msg.type==='deploy.update'){
      assert(m.stage==='deploy','WRONG_STAGE','当前不在部署阶段');assert(typeof q.ready==='boolean'&&Array.isArray(q.positions)&&q.positions.length===5,'INVALID_DEPLOY','部署格式无效');
      const own=m.game.ships.filter(s=>s.team===team),allowed=new Set(E.deployment(team).map(E.key)),seen=new Set(),cells=new Set();
      for(const item of q.positions){assert(item&&own.some(s=>s.id===item.id)&&!seen.has(item.id)&&Number.isInteger(item.pos?.q)&&Number.isInteger(item.pos?.r)&&allowed.has(E.key(item.pos))&&!cells.has(E.key(item.pos)),'INVALID_DEPLOY','舰船必须部署在不同的己方部署格');seen.add(item.id);cells.add(E.key(item.pos));}
      for(const item of q.positions){const s=own.find(s=>s.id===item.id);s.pos={q:item.pos.q,r:item.pos.r};s.xy=E.hexToXY(s.pos);}m.submitted[team]=q.ready;E.updateExploration(m.game);
      if(m.submitted.every(Boolean))this.beginPlan(m);this.broadcastMatch(m);return;
    }
    assert(m.stage==='plan','WRONG_STAGE','当前不能修改指令');
    if(msg.type==='orders.submit'){
      assert(!m.submitted[team],'ALREADY_SUBMITTED','请先撤回已提交指令');m.orders[team]=validateOrders(m.game,team,q.plans);m.submitted[team]=true;this.tryResolve(m);this.broadcastMatch(m);return;
    }
    if(msg.type==='orders.withdraw'){
      assert(m.submitted[team]&&!m.submitted[1-team],'LOCKED','双方已提交或当前没有可撤回指令');m.submitted[team]=false;this.broadcastMatch(m);return;
    }
    if(msg.type==='ai.retry'){assert(m.kind==='ai'&&m.aiStatus==='error','NOT_RETRYABLE','当前无需重试AI');this.generateAI(m);this.broadcastMatch(m);return;}
    fail('UNKNOWN_COMMAND','未知操作');
  }
  pairQueue(){while(this.queue.length>=2&&this.matches.size<200){const ids=this.queue.splice(0,2);for(const id of ids)this.players.get(id).queued=false;this.start(ids.map(id=>({playerId:id,roster:this.players.get(id).roster})),120);}}
  start(seats,turnSeconds,modelId=null){
    if(!modelId&&randomInt(2))seats.reverse();
    const g=E.createGame(seats[0].roster,randomInt(2147483647));g.ships=g.ships.filter(s=>s.team===0).concat(seats[1].roster.map((type,i)=>E.createShip(type,1,i,E.deployment(1)[[8,6,4,2,0][i]])));g.explored=[[],[]];E.updateExploration(g);
    const m={id:randomUUID(),kind:modelId?'ai':'pvp',modelId,seats:seats.map(s=>({...s,timeouts:0,remainingMs:90000,disconnectedAt:null})),game:g,stage:'deploy',turnSeconds,deadline:modelId?null:this.now()+120000,playbackUntil:null,pauseSince:null,submitted:[false,!!modelId],orders:[{},{}],result:null,aiStatus:null,aiError:null,created:this.now()};
    this.matches.set(m.id,m);for(const s of m.seats)if(s.playerId)this.players.get(s.playerId).match=m.id;this.broadcastMatch(m);return m;
  }
  beginPlan(m){m.stage='plan';m.game.phase='plan';m.orders=[{},{}];m.submitted=[false,false];m.timedOut=[false,false];m.playbackUntil=null;m.deadline=m.turnSeconds?this.now()+m.turnSeconds*1000:null;if(m.pauseSince!=null)m.pauseSince=this.now();if(m.kind==='ai')this.generateAI(m);}
  generateAI(m){
    m.aiAbort?.abort();const abort=new AbortController();m.aiAbort=abort;const round=m.game.round;m.aiStatus='thinking';m.aiError=null;
    Promise.resolve().then(()=>this.ai.generate({game:E.clone(m.game),team:1,modelId:m.modelId,signal:abort.signal})).then(plans=>{
      if(abort.signal.aborted||m.stage!=='plan'||m.game.round!==round)return;m.orders[1]=plans;m.submitted[1]=true;m.aiStatus='ready';this.tryResolve(m);this.broadcastMatch(m);
    }).catch(error=>{if(abort.signal.aborted||m.stage!=='plan'||m.game.round!==round)return;m.aiStatus='error';m.aiError=typeof error.code==='string'&&error.code.startsWith('AI_')?error.message:'AI 请求失败或指令无效，请重试或结束对局';this.broadcastMatch(m);});
  }
  tryResolve(m){
    if(m.stage!=='plan'||m.pauseSince!=null||!m.submitted.every(Boolean)||m.aiStatus==='error')return;
    for(let team=0;team<2;team++)if(!m.timedOut?.[team])m.seats[team].timeouts=0;
    m.stage='resolving';m.deadline=null;const before=E.clone(m.game),round=before.round,orders={...m.orders[0],...m.orders[1]};
    Promise.resolve().then(()=>this.pool.resolve(before,orders)).then(result=>{
      if(m.stage!=='resolving'||m.game.round!==round)return;
      const projected=[0,1].map(team=>playerResult(before,result,team));
      m.game=result.game;m.stage='playback';m.playbackUntil=this.now()+Math.max(1000,result.frames.length*110);m.lastRound={round,projected};
      for(const [team,s]of m.seats.entries())if(s.playerId)this.push(this.players.get(s.playerId),{type:'round',matchId:m.id,round,result:projected[team],playbackUntil:m.playbackUntil});this.broadcastMatch(m);
    }).catch(error=>{if(m.stage!=='resolving')return;this.logger.error?.({event:'resolve_failed',matchId:m.id});this.end(m,null,'服务器结算失败，对局中止');});
  }
  updatePause(m){
    const offline=m.seats.some(s=>s.playerId&&s.disconnectedAt!=null);
    if(offline&&m.pauseSince==null)m.pauseSince=this.now();
    if(!offline&&m.pauseSince!=null){if(m.deadline!=null)m.deadline+=this.now()-m.pauseSince;m.pauseSince=null;}
  }
  end(m,winner,reason){m.aiAbort?.abort();m.stage='ended';m.deadline=null;m.playbackUntil=null;m.pauseSince=null;m.endedAt=this.now();m.result={winner,reason};m.game.phase='ended';m.game.winner=winner;this.broadcastMatch(m);}
  tick(){
    const now=this.now();
    for(const m of this.matches.values()){
      if(m.stage==='ended'){if(now-m.endedAt>1800000){for(const s of m.seats)if(s.playerId){const p=this.players.get(s.playerId);if(p?.match===m.id){p.match=null;this.sendState(p);}}this.matches.delete(m.id);}continue;}
      const expired=m.seats.map(s=>s.disconnectedAt!=null&&now-s.disconnectedAt>=s.remainingMs);
      if(expired.every(Boolean)){this.end(m,null,'双方断线，对局中止');continue;}
      const lost=expired.findIndex(Boolean);if(lost>=0&&(m.seats[1-lost].playerId===null||m.seats[1-lost].disconnectedAt==null)){this.end(m,1-lost,'对手断线超时');continue;}
      if(m.stage==='playback'&&now>=m.playbackUntil){
        if(m.game.phase==='ended')this.end(m,m.game.winner,'战斗结束');else{this.beginPlan(m);this.broadcastMatch(m);}continue;
      }
      if(m.pauseSince!=null||m.deadline==null||now<m.deadline)continue;
      if(m.stage==='deploy'){this.beginPlan(m);this.broadcastMatch(m);continue;}
      if(m.stage==='plan'){
        for(let team=0;team<2;team++)if(!m.submitted[team]){m.seats[team].timeouts++;m.timedOut[team]=true;m.orders[team]={};m.submitted[team]=true;}
        const lost=m.seats.map(s=>s.timeouts>=3);if(lost.every(Boolean))this.end(m,'draw','双方连续3轮超时');else if(lost.some(Boolean))this.end(m,lost[0]?1:0,'对手连续3轮超时');else{this.tryResolve(m);this.broadcastMatch(m);}
      }
    }
    for(const r of this.rooms.values())if(now-r.created>3600000){this.rooms.delete(r.code);for(const id of r.players){const p=this.players.get(id);p.room=null;this.sendState(p);}}
    for(const p of this.players.values())if(!p.connected&&!p.room&&!p.match&&!p.queued&&now-p.touched>3600000){this.players.delete(p.id);this.tokens.delete(p.token);}
    if(this.queue.length>=2)this.pairQueue();
  }
  async close(){this.closed=true;clearInterval(this.timer);for(const m of this.matches.values())m.aiAbort?.abort();for(const p of this.players.values()){this.push(p,{type:'error',code:'SERVER_RESTART',message:'服务器正在关闭，本局不会保存，请重新进入'});p.close?.(1012,'服务器重启');}await this.pool?.close?.();}
}
