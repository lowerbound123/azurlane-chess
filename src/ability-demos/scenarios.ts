import type {Game,Ship,Plans,RoundResult,Hex,BattleFrame} from '../../shared/game.ts';
import type {MapModel} from '../../shared/render.ts';
import {allHexes,clone,createCatalogShip,emptyPlan,fromCR,key,hexDist,shipVisible,visibleCells,torpedoVisible,presentationCells,resolveRound,route,updateExploration,xyToHex} from '../engine.ts';
import {sampleBattleVisuals} from '../battle-visuals.ts';
import {interpolateFrame} from '../playback.ts';
import {ABILITY_DEMO_SHIP_IDS} from '../../shared/ability-demo.ts';
import {assertDemoEvidence} from './evidence.ts';
import {buildRemainingDemo} from './remaining.ts';
export const DEMO_IDS=ABILITY_DEMO_SHIP_IDS;
export type DemoId=typeof DEMO_IDS[number];
export interface DemoBeat {start:number;end:number;round:number;from:number;to:number;viewer:number;title:string;detail:string;preview?:boolean;experiment?:string}
export interface AbilityDemoSpec {id:DemoId;name:string;ability:string;duration:number;fps:number;width:number;height:number;focus:Hex;radius:number;game:Game;orders:Plans[];beats:DemoBeat[];posterTime:number;aaRange?:boolean;experiments?:Record<string,{label:string;game:Game;orders:Plans[]}>}
export interface CompiledExperiment {label:string;game:Game;orders:Plans[];rounds:RoundResult[];starts:BattleFrame[]}
export interface CompiledAbilityDemo {spec:AbilityDemoSpec;rounds:RoundResult[];experiments:Record<string,CompiledExperiment>}
const ship=(id:string,team:number,index:number,c:number,r:number)=>createCatalogShip(id,team,index,fromCR(c,r));
function game(ships:Ship[]):Game {const g:Game={seed:20261015,round:1,ruleset:'fleet-v1',zones:[],map:{width:13,height:11,islands:[],mines:[]},ships,planes:[],torpedoes:[],nextId:0,log:[],winner:null,phase:'plan',explored:[[],[]]};updateExploration(g);return g;}
const plan=(p:Partial<ReturnType<typeof emptyPlan>>)=>({...emptyPlan(),...p});
export function buildAbilityDemo(id:string):AbilityDemoSpec {
 const base={fps:30,width:768,height:960,focus:fromCR(6,5),radius:5};
 if(id==='bb-2'){
  const g=game([ship(id,0,0,2,6),ship('cv-1',1,0,7,5),ship('cv-2',1,1,8,5),ship('cv-3',0,1,7,6)]),target=g.ships[1].pos;
  return {...base,focus:fromCR(5,5),id,name:g.ships[0].label,ability:'重型主炮',duration:12,posterTime:6.2,game:g,orders:[{'0-0':plan({main:[target]})}],beats:[
   {start:0,end:2,round:0,from:-.01,to:-.01,viewer:0,preview:true,title:'一发重炮 · 覆盖七格',detail:'瞄准中心格，周围六格也会受到波及'},
   {start:2,end:9,round:0,from:0,to:2.1,viewer:0,title:'中心 120 · 邻格 60',detail:'主炮实际结算；范围伤害同样会命中友军'},
   {start:9,end:12,round:0,from:2.1,to:2.1,viewer:0,title:'重火力需要预判落点',detail:'一发炮弹｜七格范围｜中心双倍｜注意友军位置'}]};
 }
 if(id==='dd-3'){
  const a=ship(id,0,0,5,5),enemy=ship('cv-1',1,0,8,5);enemy.heading=3;const g=game([a,enemy]);
  return {...base,id,name:a.label,ability:'烟幕掩护',duration:14,posterTime:1.4,game:g,orders:[{'0-0':plan({smoke:true})},{'1-0':plan({moves:[{turn:0,forward:true},{turn:0,forward:true}]})},{}],beats:[
   {start:0,end:2.5,round:0,from:0,to:.7,viewer:0,title:'释放烟幕 · 覆盖七格',detail:'我方视角：烟幕内视野也会缩至一格'},
   {start:2.5,end:6,round:0,from:.7,to:1.2,viewer:1,title:'敌方视角 · 舰船隐蔽',detail:'烟幕遮蔽舰船；画面不会显示隐藏轮廓'},
   {start:6,end:11,round:1,from:0,to:1.4,viewer:1,title:'第二回合 · 贴近仍会发现',detail:'烟幕持续；敌舰进入相邻格后可以看见舰船'},
   {start:11,end:14,round:2,from:0,to:1.2,viewer:1,title:'第三回合 · 烟幕消散',detail:'本回合与下一回合有效；消耗一次烟幕储备'}]};
 }
 if(id==='cv-2'){
  const g=game([ship(id,0,0,3,7),ship('bb-1',1,0,8,7),ship('cv-2',1,1,10,2)]);
  return {...base,id,name:g.ships[0].label,ability:'战斗机与轰炸机',duration:18,posterTime:6.5,game:g,orders:[{'0-0':plan({planes:[{slot:0,mode:'patrol',target:fromCR(6,4)},{slot:4,mode:'point',target:fromCR(8,7)}]}),'1-1':plan({planes:[{slot:4,mode:'point',target:fromCR(3,7)}]})},{},{},{}],beats:[
   {start:0,end:2,round:0,from:-.01,to:-.01,viewer:0,preview:true,title:'四架战斗机 · 两架轰炸机',detail:'本次出动一战一轰；每回合合计最多放飞两架'},
   {start:2,end:4,round:0,from:0,to:.4,viewer:0,title:'分工出击 · 巡逻与轰炸',detail:'战斗机前往巡逻点；轰炸机飞向目标舰'},
   {start:4,end:6,round:0,from:.4,to:.7,viewer:0,title:'战斗机拦截 · 空战伤害 2',detail:'真实拦截来袭敌机，阻止其继续接近舰队'},
   {start:6,end:8,round:0,from:.7,to:1.1,viewer:0,title:'轰炸机投弹 · 对舰伤害 25',detail:'命中后自动返航；接近舰船时也会受到防空火力'},
   {start:8,end:12,round:1,from:0,to:1.1,viewer:0,title:'轰炸机返航 · 战斗机继续巡逻',detail:'空战伤害 2｜轰炸伤害 25｜飞机自动返航'},
   {start:12,end:15,round:2,from:0,to:1.1,viewer:0,title:'回收飞机 · 等待整备',detail:'实际回收后进入整备，不能立刻重复出击'},
   {start:15,end:18,round:3,from:0,to:1.1,viewer:0,title:'规划下一轮空中支援',detail:'有限机库与起飞额度，需要在制空和打击间分配'}]};
 }
 const remaining=buildRemainingDemo(id);if(remaining)return remaining;
 throw new Error(`尚未编排演示：${id}；可选 ${DEMO_IDS.join(', ')}`);
}
function initialFrame(g:Game):BattleFrame {return {t:-.01,round:g.round,ships:clone(g.ships),planes:clone(g.planes),torpedoes:clone(g.torpedoes),mines:clone(g.map.mines),zones:clone(g.zones??[]),visibleShipIdsByTeam:[0,1].map(team=>g.ships.filter(s=>s.hp>0&&shipVisible(g,s,team)).map(s=>s.id)),visibleByTeam:[0,1].map(team=>[...visibleCells(g,team)]),exploredByTeam:clone(g.explored),visible:[...visibleCells(g,0)],explored:[...g.explored[0]],effects:[]};}
export function compileAbilityDemo(spec:AbilityDemoSpec):CompiledAbilityDemo {
 const experiments:Record<string,CompiledExperiment>={};
 for(const [id,source]of Object.entries({main:{label:'',game:spec.game,orders:spec.orders},...spec.experiments})){
  let g=clone(source.game);const starts:BattleFrame[]=[],rounds=source.orders.map(orders=>{starts.push(initialFrame(g));const result=resolveRound(g,orders,{termination:'mission'});g=result.game;return result;});experiments[id]={...source,rounds,starts};
 }
 const compiled={spec,rounds:experiments.main.rounds,experiments};let at=0;for(const b of spec.beats){if(b.start!==at||b.end<=b.start||!experiments[b.experiment??'main']?.rounds[b.round])throw new Error('演示时间线不完整');at=b.end;}if(at!==spec.duration)throw new Error('演示时间线未覆盖全片');assertDemoEvidence(compiled);return compiled;
}
export function sampleAbilityDemo(demo:CompiledAbilityDemo,seconds:number){
 const {spec}=demo,time=Math.max(0,Math.min(spec.duration-1/spec.fps,seconds)),beat=spec.beats.find(b=>time>=b.start&&time<b.end)!;
 const experiment=demo.experiments[beat.experiment??'main'],rounds=experiment.rounds;
 const simTime=beat.from+(beat.to-beat.from)*(time-beat.start)/(beat.end-beat.start),result=rounds[beat.round],frames=result.frames;
 let i=0;while(i+1<frames.length&&frames[i+1].t<=simTime+1e-9)i++;
 const first=frames[i],next=frames[i+1],fraction=next?Math.max(0,Math.min(1,(simTime-first.t)/(next.t-first.t))):0,frame=simTime<0?experiment.starts[beat.round]:interpolateFrame(first,next,fraction);
 const visible=new Set(frame.visibleByTeam?.[beat.viewer]??frame.visible),ids=new Set(frame.visibleShipIdsByTeam?.[beat.viewer]??frame.ships.map(s=>s.id)),ships=frame.ships.filter(s=>ids.has(s.id)),planes=frame.planes.filter(p=>p.team===beat.viewer||visible.has(key(xyToHex(p.xy)))),zones=frame.zones??[],visuals=sampleBattleVisuals(result.presentation,simTime,presentationCells(visible,zones),beat.viewer,[...ships,...planes]);
 const initial=beat.round===0?experiment.game:rounds[beat.round-1].game;
 const previews=beat.preview?Object.entries(experiment.orders[beat.round]).filter(([id])=>initial.ships.find(s=>s.id===id)?.team===beat.viewer).map(([id,p])=>{const s=initial.ships.find(s=>s.id===id)!;return {ship:s,plan:p,nodes:route(s,p,initial.map,initial.round),selected:true,torps:[],planes:p.planes.flatMap(p=>p.mode==='target'?[]:[{target:p.target}])};}):[];
 const model:MapModel={map:experiment.game.map,focusRegion:{center:spec.focus,radius:spec.radius},cells:allHexes(experiment.game.map).map(h=>({...h,known:true,visible:visible.has(key(h)),island:experiment.game.map.islands.includes(key(h)),...(spec.aaRange?{overlay:hexDist(h,experiment.game.ships[0].pos)<=3?'aa':null,hovered:hexDist(h,experiment.game.ships[0].pos)<=1}:{})})),myTeam:beat.viewer,ships,planes,torpedoes:frame.torpedoes.filter(t=>torpedoVisible(t,beat.viewer,visible,new Set(frame.exploredByTeam?.[beat.viewer]??frame.explored))),mines:frame.mines.filter(m=>(frame.exploredByTeam?.[beat.viewer]??frame.explored).includes(key(m))),zones,round:beat.round+1,selected:'0-0',phase:beat.preview?'plan':'playback',mode:'select',previews,mainTargets:[],rays:[],showPlans:!!beat.preview,showRanges:false,overlayType:spec.aaRange?'aa':'',busy:true,airRange:null,visuals,visualTime:time};
 return {time,simTime,beat,model,stats:{ships:ships.map(s=>({id:s.id,hp:s.hp})),planes:planes.map(p=>({id:p.id,role:p.cfg.role,state:p.state}))}};
}
