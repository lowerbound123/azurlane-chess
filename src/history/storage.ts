import type {HistoricalId,HistoricalSave} from '../../shared/history.ts';
import type {Hex} from '../../shared/game.ts';
import {validateStatuses} from '../../shared/status.ts';
import {getHistoricalDefinition} from './content.ts';
import {hexToXY,inBounds,key} from '../engine.ts';
import {planeForSlot} from '../ship-definitions.ts';
export const HISTORICAL_SAVE_PREFIX='azurlane-chess:historical:v1';
export const HISTORICAL_CONTENT_VERSION=1;
const MAX_BYTES=2*1024*1024;
const record=(x:unknown):x is Record<string,unknown>=>!!x&&typeof x==='object'&&!Array.isArray(x);
const finite=(x:unknown,min:number,max:number)=>typeof x==='number'&&Number.isFinite(x)&&x>=min&&x<=max;
const integer=(x:unknown,min:number,max:number)=>finite(x,min,max)&&Number.isSafeInteger(x);
function requireValue(x:unknown):asserts x {if(!x)throw new Error('历史战斗记录内容无效或版本不兼容，原记录已保留。');}
function tree(x:unknown,depth=0,path=''){
 requireValue(depth<=20);
 if(typeof x==='number')requireValue(Number.isFinite(x)||(x===Infinity&&/\.airReady\.\d+$/.test(path)));
 else if(typeof x==='string')requireValue(x.length<=4000);
 else if(Array.isArray(x)){requireValue(x.length<=1000);x.forEach((v,i)=>tree(v,depth+1,`${path}.${i}`));}
 else if(record(x)){requireValue(Object.keys(x).length<=1000);for(const [k,v] of Object.entries(x)){requireValue(!['__proto__','constructor','prototype'].includes(k));tree(v,depth+1,`${path}.${k}`);}}
 else requireValue(x===null||x===undefined||typeof x==='boolean');
}
function canonical(x:unknown):string{if(Array.isArray(x))return `[${x.map(canonical).join(',')}]`;if(record(x))return `{${Object.keys(x).sort().map(k=>`${JSON.stringify(k)}:${canonical(x[k])}`).join(',')}}`;return JSON.stringify(x);}
export function validateHistoricalSave(value:unknown,expectedId?:HistoricalId):asserts value is HistoricalSave {
 tree(value);requireValue(record(value));const save=value as unknown as HistoricalSave,s=save.state,g=save.game;
 requireValue(record(s)&&s.version===1&&typeof s.scenarioId==='string'&&(!expectedId||s.scenarioId===expectedId));const d=getHistoricalDefinition(s.scenarioId);requireValue(d);
 const hex=(v:unknown):v is Hex=>record(v)&&integer(v.q,-100,100)&&integer(v.r,0,d.map.height-1)&&inBounds(v as unknown as Hex,d.map);
 const cell=(v:unknown)=>typeof v==='string'&&/^-?\d+,\d+$/.test(v)&&hex({q:Number(v.split(',')[0]),r:Number(v.split(',')[1])});
 const strings=(v:unknown,max=100)=>Array.isArray(v)&&v.length<=max&&v.every(x=>typeof x==='string'&&x.length<=150);
 const unit=(id:string)=>d.units.find(u=>u.id===id);
 requireValue(['playing','won','lost'].includes(s.status)&&['contact','retreat','advance','control','breakthrough','search','strike','pursuit','escort','last-carrier'].includes(s.stage));
 requireValue(integer(s.lastResolvedRound,0,d.roundLimit)&&record(s.counters)&&Object.keys(s.counters).every(k=>['tracking','retreatRound','sunk','port','portContested','carriers'].includes(k))&&Object.values(s.counters).every(n=>integer(n,0,d.roundLimit+1)));
 if(s.counters.portContested!==undefined)requireValue(integer(s.counters.portContested,0,1));
 requireValue(strings(s.events,60)&&new Set(s.events).size===s.events.length&&record(s.extracted)&&record(s.contacts)&&['central','east'].includes(s.convoyRoute)&&typeof s.convoyWait==='boolean'&&integer(s.convoyWaitLastRound,-1,d.roundLimit));
 for(const [id,x] of Object.entries(s.extracted)){const u=unit(id);requireValue(u&&record(x)&&x.id===id&&x.team===u.team&&x.label===u.name&&finite(x.hp,1,u.cfg.hp)&&integer(x.round,1,s.lastResolvedRound));requireValue(d.regions.some(r=>r.kind===(u.team===0?'exit':'enemy-exit')));}
 for(const [id,x] of Object.entries(s.contacts)){requireValue(/^[01]:[01]-\d+$/.test(id)&&record(x));const u=unit(id.slice(2));requireValue(u&&u.team!==Number(id[0])&&hex(x.at)&&integer(x.heading,0,5)&&integer(x.round,1,s.lastResolvedRound));}
 if(s.result){requireValue(record(s.result)&&typeof s.result.won==='boolean'&&integer(s.result.stars,0,3)&&s.result.won===(s.status==='won')&&s.result.stars===(s.result.won?1+s.result.bonus.filter(Boolean).length:0)&&integer(s.result.round,1,d.roundLimit)&&s.result.round===s.lastResolvedRound&&typeof s.result.reason==='string'&&s.result.reason.length<=200&&Array.isArray(s.result.bonus)&&s.result.bonus.length===2&&s.result.bonus.every(x=>typeof x==='boolean'));}
 requireValue((s.status==='playing')===!s.result);
 requireValue(record(g)&&g.ruleset==='fleet-v1'&&!g.domination&&!g.battleMode&&integer(g.seed,0,0x7fffffff)&&integer(g.round,1,d.roundLimit+1)&&integer(g.nextId,0,10000));
 requireValue(g.phase===(s.status==='playing'?'plan':'ended')&&g.winner===(s.status==='playing'?null:s.status==='won'?0:1));
 requireValue(s.status==='playing'?g.round===s.lastResolvedRound+1:g.round===s.lastResolvedRound);
 requireValue(canonical(g.map)===canonical(d.map));
 requireValue(Array.isArray(g.ships)&&g.ships.length===d.units.length-Object.keys(s.extracted).length&&new Set(g.ships.map(x=>x.id)).size===g.ships.length);
 for(const ship of g.ships){const u=unit(ship.id);requireValue(u&&!s.extracted[ship.id]&&ship.team===u.team&&ship.kind==='ship'&&ship.template===u.template&&ship.label===u.name&&ship.name===u.name&&!ship.catalogId&&canonical(ship.cfg)===canonical(u.cfg));
  requireValue(validateStatuses(ship.statuses)&&finite(ship.hp,0,u.cfg.hp)&&hex(ship.pos)&&!d.map.islands.includes(key(ship.pos))&&record(ship.xy)&&finite(ship.xy.x,-10,100)&&finite(ship.xy.y,-10,100));
  if(ship.hp>0){const xy=hexToXY(ship.pos);requireValue(Math.abs(xy.x-ship.xy.x)<1e-5&&Math.abs(xy.y-ship.xy.y)<1e-5);}
  requireValue(integer(ship.heading,0,5)&&integer(ship.torps,0,u.cfg.torpedo?.reserve??0)&&integer(ship.mainReady,1,d.roundLimit+4)&&integer(ship.destroyedPlanes,0,u.cfg.carrier?.stock??0));
  requireValue(Array.isArray(ship.airReady)&&Array.isArray(ship.airHP)&&ship.airReady.length===(u.cfg.carrier?.stock??0)&&ship.airHP.length===ship.airReady.length&&ship.airReady.every(n=>n===Infinity||integer(n,1,d.roundLimit+4))&&ship.airHP.every((n,i)=>finite(n,0,planeForSlot(u.cfg,i).hp)));
  if(ship.smokeLeft!==undefined)requireValue(integer(ship.smokeLeft,0,u.cfg.smoke?.charges??0));
 }
 requireValue(d.units.every(u=>s.extracted[u.id]||g.ships.some(x=>x.id===u.id)));
 requireValue(Array.isArray(g.explored)&&g.explored.length===2&&g.explored.every(a=>Array.isArray(a)&&a.length<=d.map.width*d.map.height&&a.every(cell)&&new Set(a).size===a.length));
 requireValue(Array.isArray(g.planes)&&g.planes.length<=50&&new Set(g.planes.map(x=>x.id)).size===g.planes.length&&Array.isArray(g.torpedoes)&&g.torpedoes.length<=60&&new Set(g.torpedoes.map(x=>x.id)).size===g.torpedoes.length);
 const entityNumbers=[...g.planes,...g.torpedoes].map(e=>Number(e.id.slice(1)));requireValue(entityNumbers.every(n=>integer(n,0,g.nextId-1))&&new Set(entityNumbers).size===entityNumbers.length);
 const xy=(x:unknown)=>record(x)&&finite(x.x,-100,200)&&finite(x.y,-100,200);
 for(const p of g.planes){const u=unit(p.mother);requireValue(u&&u.cfg.carrier&&!s.extracted[p.mother]&&p.kind==='plane'&&typeof p.id==='string'&&/^p\d+$/.test(p.id)&&p.team===u.team&&integer(p.slot,0,u.cfg.carrier.stock-1)&&canonical(p.cfg)===canonical(planeForSlot(u.cfg,p.slot))&&validateStatuses(p.statuses)&&finite(p.hp,1,p.cfg.hp)&&xy(p.xy)&&['outbound','return'].includes(p.state)&&['point','target','patrol'].includes(p.mode)&&hex(p.target)&&finite(p.traveled,0,p.cfg.range+.01)&&typeof p.tracking==='boolean'&&Array.isArray(p.waypoints)&&p.waypoints.length<=100&&p.waypoints.every(hex));requireValue(p.targetId===null||(typeof p.targetId==='string'&&unit(p.targetId)&&unit(p.targetId)!.team!==p.team));}
 for(const t of g.torpedoes){const u=unit(t.owner);requireValue(u&&u.cfg.torpedo&&t.kind==='torpedo'&&t.team===u.team&&typeof t.id==='string'&&/^t\d+$/.test(t.id)&&canonical(t.cfg)===canonical(u.cfg.torpedo)&&xy(t.xy)&&integer(t.heading,0,5)&&finite(t.age,0,t.cfg.life)&&integer(t.launched,1,s.lastResolvedRound)&&finite(t.birth,0,1)&&typeof t.armed==='boolean');}
 requireValue(Array.isArray(g.log)&&g.log.length<=300&&g.log.every(x=>record(x)&&integer(x.round,1,d.roundLimit)&&typeof x.text==='string'&&x.text.length<=400&&(x.at===null||hex(x.at))&&[null,0,1].includes(x.team)));
 if(g.zones)requireValue(Array.isArray(g.zones)&&g.zones.length<=30&&g.zones.every(z=>z.kind==='smoke'&&[0,1].includes(z.team)&&hex(z.center)&&z.radius===1&&integer(z.expires,1,d.roundLimit+3)));
 requireValue(record(save.plans)&&Object.keys(save.plans).every(id=>unit(id)?.controlled&&g.ships.some(x=>x.id===id)));
 for(const [id,p] of Object.entries(save.plans)){const u=unit(id)!,speed=u.cfg.speed;requireValue(record(p)&&Array.isArray(p.moves)&&p.moves.length<=speed&&p.moves.every(m=>record(m)&&[-1,0,1].includes(m.turn)&&typeof m.forward==='boolean'));
  requireValue(Array.isArray(p.torps)&&p.torps.length<=2&&p.torps.every(t=>record(t)&&integer(t.window,0,speed)&&integer(t.dir,0,5))&&Array.isArray(p.main)&&p.main.length<=(u.cfg.main?.shots??0)&&p.main.every(hex)&&Array.isArray(p.planes)&&p.planes.length<=(u.cfg.carrier?.launch??0));
  requireValue(p.planes.every(o=>record(o)&&integer(o.slot,0,(u.cfg.carrier?.stock??0)-1)&&['point','target','patrol'].includes(o.mode)&&(o.mode==='target'?typeof o.targetId==='string'&&unit(o.targetId)&&unit(o.targetId)!.team!==u.team:hex(o.target))));requireValue(p.sweep===null||hex(p.sweep));if(p.smoke!==undefined)requireValue(typeof p.smoke==='boolean');requireValue(!p.guard&&!p.escort&&!p.radar&&!p.mineSteps?.length);
 }
 requireValue(typeof save.selected==='string'&&(save.selected===''||(unit(save.selected)?.team===0&&g.ships.some(s=>s.id===save.selected))));
}
export type HistoricalRead={kind:'missing'}|{kind:'resume';save:HistoricalSave}|{kind:'error';message:string};
export function createHistoricalStorage(storage:Pick<Storage,'getItem'|'setItem'>){
 const key=(id:HistoricalId)=>`${HISTORICAL_SAVE_PREFIX}:${id}`,bestKey=(id:HistoricalId)=>`${HISTORICAL_SAVE_PREFIX}:best:${id}`;
 function read(id:HistoricalId):HistoricalRead{try{requireValue(getHistoricalDefinition(id));const raw=storage.getItem(key(id));if(raw===null)return {kind:'missing'};requireValue(raw.length<=MAX_BYTES);const e=JSON.parse(raw);tree(e);requireValue(record(e)&&e.magic==='azurlane-historical'&&e.version===1&&e.contentVersion===HISTORICAL_CONTENT_VERSION&&record(e.save));const save=e.save as unknown as HistoricalSave;if(Array.isArray(save.game?.ships))for(const s of save.game.ships)if(Array.isArray(s.airReady))s.airReady=s.airReady.map((n:unknown)=>n==='in-flight'?Infinity:n as number);validateHistoricalSave(save,id);return {kind:'resume',save};}catch(e){return {kind:'error',message:e instanceof Error?e.message:'无法读取历史战斗记录'};}}
 function best(id:HistoricalId):{stars:number;round:number}|null{try{const raw=storage.getItem(bestKey(id));if(!raw||raw.length>1024)return null;const v=JSON.parse(raw);return record(v)&&integer(v.stars,1,3)&&integer(v.round,1,getHistoricalDefinition(id)!.roundLimit)?{stars:Number(v.stars),round:Number(v.round)}:null;}catch{return null;}}
 function persist(save:HistoricalSave,replace=false):{ok:true}|{ok:false;message:string}{try{validateHistoricalSave(save);if(!replace){const old=read(save.state.scenarioId);if(old.kind==='error')throw new Error(old.message);}const raw=JSON.stringify({magic:'azurlane-historical',version:1,contentVersion:HISTORICAL_CONTENT_VERSION,save},(_k,v)=>v===Infinity?'in-flight':v);requireValue(raw.length<=MAX_BYTES);storage.setItem(key(save.state.scenarioId),raw);const result=save.state.result;if(result?.won){const previous=best(save.state.scenarioId);if(!previous||result.stars>previous.stars||(result.stars===previous.stars&&result.round<previous.round))storage.setItem(bestKey(save.state.scenarioId),JSON.stringify({stars:result.stars,round:result.round}));}return {ok:true};}catch(e){return {ok:false,message:e instanceof Error?e.message:'无法保存历史战斗记录'};}}
 return {read,write:(save:HistoricalSave)=>persist(save),best,/** Explicit user restart may replace damaged progress; automatic writes may never do so. */ restart:(save:HistoricalSave)=>persist(save,true)};
}
