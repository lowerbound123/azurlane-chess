import {describe,it,expect} from 'vitest';
import * as E from '../src/engine.ts';
import {SHIP_DEFINITIONS} from '../src/ship-definitions.ts';
import type {CampaignState} from '../shared/campaign.ts';
import type {Game,Plans} from '../shared/game.ts';
import * as C from '../src/campaign/index.ts';
import {createCampaignStorage} from '../src/campaign/storage.ts';

describe('归航行动真实战役',()=>{
 it('公开完整运行时并以单舰无敌舰开局',()=>{
  expect(C.createCampaignState).toBeTypeOf('function');
  const state=C.createCampaignState(),f=C.createCampaignFixture(state);
  expect(state.version).toBe(1);expect(f.game.map.width).toBe(13);expect(f.game.map.height).toBe(72);
  expect(f.game.ships.map((s:any)=>s.catalogId)).toEqual(['dd-2']);expect(f.game.winner).toBeNull();
  expect(C.advanceCampaign(state)).toEqual(state);
 });
 it('所有检查点参考指令在真实结算中连续通过，覆盖十五舰',()=>{
  expect(C.CAMPAIGN_CHAPTERS).toHaveLength(10);
  let state:CampaignState=C.createCampaignState();const seen=new Set<string>();let checkpoints=0;let saved='';const storage=createCampaignStorage({getItem:()=>saved||null,setItem:(_,v)=>{saved=v}});
  while(state.status!=='complete'){
   const cp=C.campaignCheckpoint(state),fixture=C.createCampaignFixture(state);let game:Game=fixture.game;game.phase='plan';
   for(const ship of game.ships)expect(E.legal(game.map,ship.pos),`${cp.id}: ${ship.id} is in water`).toBe(true);
   game.ships.filter(s=>s.team===0).forEach(s=>{seen.add(s.catalogId!);expect(s.cfg).toEqual(SHIP_DEFINITIONS[s.catalogId!]);expect(E.legal(game.map,s.pos)).toBe(true)});
   for(let n=0;n<35&&state.status==='playing';n++){
    const snapshot=structuredClone(game),plans:Plans={...C.campaignOrders(state,game),...C.campaignReferencePlans(state,game)};
    expect(game).toEqual(snapshot);
    const result=E.resolveRound(game,plans,{termination:state.chapter===9?'fleet':'mission'});
    state=C.evaluateCampaignRound(state,game,plans,result);game=result.game;
    expect(storage.write({state,game,plans:{},selected:fixture.selected}),`${cp.id} round ${game.round}`).toEqual({ok:true});
    expect(storage.read().kind).toBe('resume');
   }
   expect(state.status,`${cp.id}: ${state.feedback} ${JSON.stringify(state.evidence)}`).toBe('checkpoint-complete');
   checkpoints++;state=C.advanceCampaign(state);
  }
  expect(checkpoints).toBeGreaterThanOrEqual(27);expect([...seen].sort()).toEqual(Object.keys(SHIP_DEFINITIONS).sort());
 });
 it('接受非参考航行路线且不能只靠提交命令通过',()=>{
  expect(C.createCampaignState).toBeTypeOf('function');let state=C.createCampaignState();let {game}=C.createCampaignFixture(state);
  const ref=C.campaignReferencePlans(state,game);const fake={...E.resolveRound(game,{}, {termination:'mission'}),game:structuredClone(game)};
  expect(C.evaluateCampaignRound(state,game,ref,fake).status).toBe('playing');
  const wait={...E.emptyPlan(),moves:[{turn:1,forward:false},{turn:-1,forward:false}]};
  let result=E.resolveRound(game,{'0-0':wait},{termination:'mission'});state=C.evaluateCampaignRound(state,game,{'0-0':wait},result);game=result.game;
  const plans=C.campaignReferencePlans(state,game);result=E.resolveRound(game,plans,{termination:'mission'});state=C.evaluateCampaignRound(state,game,plans,result);
  expect(state.status).toBe('checkpoint-complete');
 });
 it('鱼雷耗尽或关键舰沉没有明确失败，可重建当前检查点',()=>{
  expect(C.createCampaignState).toBeTypeOf('function');const state={...C.createCampaignState(),chapter:3};const f=C.createCampaignFixture(state);
  f.game.ships[0].torps=0;const result=E.resolveRound(f.game,{}, {termination:'mission'});const failed=C.evaluateCampaignRound(state,f.game,{},result);
  expect(failed.status).toBe('failed');expect(failed.feedback).toMatch(/重试/);
  const restored=C.createCampaignFixture({...failed,status:'playing',evidence:{}});expect(restored.game.ships[0].torps).toBe(SHIP_DEFINITIONS['dd-2'].torpedo!.reserve);
 });
 it('终章支持自选合法五舰并进入独立部署',()=>{
  expect(C.createCampaignState).toBeTypeOf('function');const fleet=['dd-1','cl-1','ca-3','bb-2','cv-2'];const {game}=C.createCampaignFixture({...C.createCampaignState(),chapter:9},fleet);
  expect(game.phase).toBe('deploy');expect(game.ships.filter((s:any)=>s.team===0).map((s:any)=>s.catalogId)).toEqual(fleet);
  for(const s of game.ships.filter((s:any)=>s.team===0)){const p=E.toCR(s.pos);expect(p.c).toBeGreaterThanOrEqual(2);expect(p.c).toBeLessThanOrEqual(10);expect(p.r).toBeGreaterThanOrEqual(8);expect(p.r).toBeLessThanOrEqual(11)}
  for(const s of game.ships.filter((s:any)=>s.team===1))expect(s.hp).toBe(Math.round(s.cfg.hp*.6));
 });
});

describe('机制证据与恢复边界',()=>{
 it('双向鱼雷不能用副炮代替另一条航道的命中',()=>{
  let state={...C.createCampaignState(),chapter:3,checkpoint:2};let {game}=C.createCampaignFixture(state);
  const cruiser=game.ships.find((s:any)=>s.team===0&&s.catalogId==='cl-2')!,northern=game.ships.filter((s:any)=>s.team===1)[1];
  cruiser.pos=E.add(northern.pos,3);cruiser.xy=E.hexToXY(cruiser.pos);
  for(let i=0;i<5&&state.status==='playing';i++){
   const plans:Plans=i===0?{'0-0':{...E.emptyPlan(),torps:[{window:0,dir:0},{window:0,dir:1}]}}:{};
   const result=E.resolveRound(game,plans,{termination:'mission'});state=C.evaluateCampaignRound(state,game,plans,result);game=result.game;
  }
  expect(game.ships.filter((s:any)=>s.team===1).every((s:any)=>s.hp===0)).toBe(true);
  expect(state.status).toBe('failed');expect(state.feedback).toMatch(/关键目标/);
 });
 it('航行接受同轮原地转向后的不同合法到达路线',()=>{
  const state=C.createCampaignState(),{game}=C.createCampaignFixture(state);
  const plans={'0-0':{...E.emptyPlan(),moves:[{turn:-1,forward:false},{turn:1,forward:true}]}};
  expect(plans).not.toEqual(C.campaignReferencePlans(state,game));
  const result=E.resolveRound(game,plans,{termination:'mission'});
  expect(C.evaluateCampaignRound(state,game,plans,result).status).toBe('checkpoint-complete');
 });
 it('终章敌方指令不读取雾外玩家舰位置',()=>{
  const state={...C.createCampaignState(),chapter:9},{game}=C.createCampaignFixture(state);
  const a=structuredClone(game),b=structuredClone(game);
  a.ships.filter(s=>s.team===0).forEach((s,i)=>{s.pos=E.fromCR(2+i*2,30);s.xy=E.hexToXY(s.pos)});
  b.ships.filter(s=>s.team===0).forEach((s,i)=>{s.pos=E.fromCR(2+i*2,40);s.xy=E.hexToXY(s.pos)});
  expect(C.campaignOrders(state,a)).toEqual(C.campaignOrders(state,b));
 });
});

it('错过一次性护航演练后明确失败，避免永久等待',()=>{
 const state={...C.createCampaignState(),chapter:7,checkpoint:1},{game}=C.createCampaignFixture(state);
 const plans=C.campaignOrders(state,game),result=E.resolveRound(game,plans,{termination:'mission'});
 expect(C.evaluateCampaignRound(state,game,plans,result).status).toBe('failed');
});
it('烟幕资源耗尽但未掩护时可以恢复检查点',()=>{
 const state={...C.createCampaignState(),chapter:6},{game}=C.createCampaignFixture(state);game.ships[0].smokeLeft=0;
 const result=E.resolveRound(game,{}, {termination:'mission'});
 expect(C.evaluateCampaignRound(state,game,{},result).status).toBe('failed');
});
it.each(['torpedo-start','torpedo-node','torpedo-spread','torpedo-persist','north-carolina','scout','bomber','heavy'])('空过一轮后参考方案仍能继续：%s',(id)=>{
 let state=C.createCampaignState();state.chapter=C.CAMPAIGN_CHAPTERS.findIndex(c=>c.checkpoints.some(p=>p.id===id));state.checkpoint=C.CAMPAIGN_CHAPTERS[state.chapter].checkpoints.findIndex(p=>p.id===id);
 let {game}=C.createCampaignFixture(state);
 for(let i=0;i<15&&state.status==='playing';i++){
  const plans={...C.campaignOrders(state,game),...(i===0?{}:C.campaignReferencePlans(state,game))};const result=E.resolveRound(game,plans,{termination:'mission'});
  state=C.evaluateCampaignRound(state,game,plans,result);game=result.game;
 }
 expect(state.status,JSON.stringify(state.evidence)).toBe('checkpoint-complete');
});
it('结算不降低玩家已主动展开的提示层级',()=>{
 const state={...C.createCampaignState(),hintLevel:2},{game}=C.createCampaignFixture(state),result=E.resolveRound(game,{}, {termination:'mission'});
 expect(C.evaluateCampaignRound(state,game,{},result).hintLevel).toBe(2);
});
it.each([['scout',1],['bomber',3],['heavy',1]] as const)('同机型的其他机库槽位也可完成 %s',(id,slot)=>{
 let state={...C.createCampaignState(),chapter:8,checkpoint:C.CAMPAIGN_CHAPTERS[8].checkpoints.findIndex(p=>p.id===id)}, {game}=C.createCampaignFixture(state);
 for(let n=0;n<12&&state.status==='playing';n++){
  const plans=C.campaignReferencePlans(state,game);for(const plan of Object.values(plans))for(const order of plan.planes)order.slot=slot;
  const result=E.resolveRound(game,{...C.campaignOrders(state,game),...plans},{termination:'mission'});state=C.evaluateCampaignRound(state,game,plans,result);game=result.game;
 }
 expect(state.status,JSON.stringify(state.evidence)).toBe('checkpoint-complete');
});
it('固定海图南端为 3–5 格航道且所有水格连通',()=>{
 const map=C.CAMPAIGN_MAP,water=E.allHexes(map).filter(h=>E.legal(map,h));
 for(let r=68;r<72;r++)expect(water.filter(h=>h.r===r).length).toBeLessThanOrEqual(5);
 const visited=new Set([E.key(water[0])]),queue=[water[0]];
 for(let i=0;i<queue.length;i++)for(let dir=0;dir<6;dir++){const h=E.add(queue[i],dir),key=E.key(h);if(E.legal(map,h)&&!visited.has(key)){visited.add(key);queue.push(h)}}
 expect(visited.size).toBe(water.length);
});
it('布设水雷在下轮武装并由预告追兵真实触发',()=>{
 let state={...C.createCampaignState(),chapter:4,checkpoint:2},{game}=C.createCampaignFixture(state);
 for(let i=0;i<2;i++){
  const plans={...C.campaignOrders(state,game),...C.campaignReferencePlans(state,game)},result=E.resolveRound(game,plans,{termination:'mission'});
  state=C.evaluateCampaignRound(state,game,plans,result);game=result.game;
  if(i===0){expect(state.status).toBe('playing');expect(game.map.mines.some(m=>m.armedRound===2)).toBe(true)}
 }
 expect(state.status).toBe('checkpoint-complete');expect(state.evidence.mineHit).toBe(true);
});
it('接触排雷后继续航行仍记录真实清雷，不要求停在原雷格',()=>{
 const state={...C.createCampaignState(),chapter:4,checkpoint:0},{game}=C.createCampaignFixture(state);
 const plans={'0-0':{...E.emptyPlan(),moves:[{turn:0,forward:true},{turn:0,forward:true}]}};
 const result=E.resolveRound(game,plans,{termination:'mission'});
 expect(result.game.map.mines).toHaveLength(0);expect(result.game.ships[0].hp).toBe(game.ships[0].hp);
 expect(E.same(result.game.ships[0].pos,game.map.mines[0])).toBe(false);
 expect(C.evaluateCampaignRound(state,game,plans,result).status).toBe('checkpoint-complete');
});
it('北卡单发演练不能由首次三发齐射替代',()=>{
 const state={...C.createCampaignState(),chapter:5,checkpoint:0},{game}=C.createCampaignFixture(state);
 const ship=game.ships.find(s=>s.team===0&&s.catalogId==='bb-1')!,target=game.ships.find(s=>s.team===1)!;
 const plans={[ship.id]:{...E.emptyPlan(),main:Array.from({length:ship.cfg.main!.shots},()=>({...target.pos}))}};
 const result=E.resolveRound(game,plans,{termination:'mission'});
 expect(C.evaluateCampaignRound(state,game,plans,result).status).toBe('failed');
});
