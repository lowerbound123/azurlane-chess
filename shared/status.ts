/** Serializable status rules shared by the authoritative simulation and its consumers. */
export type StatusKind = 'buff'|'debuff'|'neutral';
export type StatusEffectKind = 'speed'|'vision'|'outgoingDamage'|'incomingDamage'|'periodicDamage'|'periodicHeal';
export interface StatusEffect {kind:StatusEffectKind;value:number}
export interface StatusDefinition {id:string;name:string;kind:StatusKind;icon:string;description:string;effects:StatusEffect[];priority?:number;strength?:number;maxStacks?:number}
export interface StatusSource {unitId:string;shipId?:string;name?:string}
export interface StatusInstance {
 instanceId:string;definitionId:string;name:string;kind:StatusKind;icon:string;description:string;
 effects:StatusEffect[];priority:number;strength:number;maxStacks:number;stacks:number;order:number;
 source?:StatusSource;startRound:number;endRound:number|null;lastSettledRound?:number;
}
export interface StatusCarrier {statuses?:StatusInstance[]}
export interface StatusUnit extends StatusCarrier {kind?:'ship'|'plane';cfg:{speed:number;vision:number}}
export interface StatusContext {round:number;phase?:'plan'|'execute';duration:number|null;source?:StatusSource;instanceId?:string}
export interface BattleStatusContext {phase?:'plan'|'execute';duration:number|null;sourceId?:string}
export interface PeriodicStatusEffect {instanceId:string;source?:StatusSource;damage:number;heal:number}
export const MAX_STATUS_INSTANCES=64;
export const MAX_MOVE_STEPS=20;
export const MAX_SNAPSHOT_DAMAGE=Number.MAX_SAFE_INTEGER;
// State may be a Vue proxy in local planning. Copy plain data without importing UI code.
const copy=<T>(value:T):T=>(Array.isArray(value)?value.map(copy):value!==null&&typeof value==='object'?Object.fromEntries(Object.entries(value).map(([key,item])=>[key,copy(item)])):value) as T;
const endValue=(s:StatusInstance)=>s.endRound??Infinity;
const active=(s:StatusInstance,round:number)=>s.startRound<=round&&(s.endRound===null||s.endRound>=round);
const stable=(a:StatusInstance,b:StatusInstance)=>a.order-b.order||a.instanceId.localeCompare(b.instanceId);
function writeStatuses(unit:StatusCarrier,statuses:StatusInstance[]){if(statuses.length)unit.statuses=statuses;else delete unit.statuses;}

/** Gameplay entry point: capture attribution while the source aircraft still exists. */
export function applyBattleStatus(game:import('./game.ts').Game,targetId:string,definition:StatusDefinition,context:BattleStatusContext){
 const units=[...game.ships,...game.planes],target=units.find(u=>u.id===targetId);
 if(!target||target.hp<=0||game.phase==='ended')throw new Error('状态目标不可用');
 const source=context.sourceId===undefined?undefined:units.find(u=>u.id===context.sourceId);
 if(context.sourceId!==undefined&&!source)throw new Error('状态来源不存在');
 return applyStatus(target,definition,{round:game.round,phase:context.phase,duration:context.duration,...(source?{source:{unitId:source.id,shipId:source.kind==='plane'?source.mother:source.id,name:source.kind==='ship'?source.label:'飞机'}}:{})});
}

export function applyStatus(unit:StatusCarrier,definition:StatusDefinition,context:StatusContext):StatusInstance {
 const start=context.round+(context.phase==='execute'?1:0),end=context.duration===null?null:start+context.duration-1;
 const prior=unit.statuses??[],order=Math.max(0,...prior.map(s=>s.order))+1;
 const next:StatusInstance={instanceId:context.instanceId??`status-${order}`,definitionId:definition.id,name:definition.name,kind:definition.kind,icon:definition.icon,description:definition.description,effects:copy(definition.effects),priority:definition.priority??0,strength:definition.strength??1,maxStacks:definition.maxStacks??1,stacks:1,order,startRound:start,endRound:end,...(context.source?{source:copy(context.source)}:{})};
 if(!Number.isSafeInteger(context.round)||context.round<1||(context.duration!==null&&(!Number.isSafeInteger(context.duration)||context.duration<1))||!validateStatuses([next]))throw new Error('状态定义或时间无效');
 let statuses=prior.filter(s=>s.endRound===null||s.endRound>=context.round).map(copy);
 if(statuses.some(s=>s.definitionId===next.definitionId&&s.maxStacks!==next.maxStacks))throw new Error('同类状态的叠层规则不一致');
 if(next.maxStacks===1){
  const sameSource=statuses.filter(s=>s.definitionId===next.definitionId&&s.source?.unitId===next.source?.unitId).sort((a,b)=>b.startRound-a.startRound||stable(a,b));
  const previous=sameSource[0];
  if(previous){
   next.endRound=previous.endRound===null||next.endRound===null?null:Math.max(previous.endRound,next.endRound);
   if(previous.startRound<=context.round&&start>context.round){previous.endRound=start-1;}
   else {next.startRound=Math.min(previous.startRound,start);next.instanceId=previous.instanceId;next.order=previous.order;if(previous.lastSettledRound!==undefined)next.lastSettledRound=previous.lastSettledRound;statuses=statuses.filter(s=>s!==previous);}
  }
 } else {
  const layers=statuses.filter(s=>s.definitionId===next.definitionId&&active(s,start)).sort((a,b)=>endValue(a)-endValue(b)||stable(a,b));
  while(layers.length>=next.maxStacks){const removed=layers.shift()!;if(removed.startRound<start)removed.endRound=start-1;else statuses=statuses.filter(s=>s!==removed);}
 }
 if(statuses.some(s=>s.instanceId===next.instanceId)||statuses.length>=MAX_STATUS_INSTANCES)throw new Error('状态实例重复或数量超出上限');
 statuses.push(next);writeStatuses(unit,statuses);return next;
}
export function removeStatus(unit:StatusCarrier,instanceId:string){writeStatuses(unit,(unit.statuses??[]).filter(s=>s.instanceId!==instanceId));}
export function clearStatuses(unit:StatusCarrier,kind?:StatusKind){writeStatuses(unit,kind?(unit.statuses??[]).filter(s=>s.kind!==kind):[]);}
export function expireStatuses(unit:StatusCarrier,completedRound:number){writeStatuses(unit,(unit.statuses??[]).filter(s=>s.endRound===null||s.endRound>completedRound));}
export function activeStatuses(unit:StatusCarrier,round:number):StatusInstance[] {
 const groups=new Map<string,StatusInstance[]>();
 for(const s of unit.statuses??[])if(active(s,round)){const group=groups.get(s.definitionId)??[];group.push(s);groups.set(s.definitionId,group);}
 return [...groups.values()].flatMap(group=>group[0].maxStacks>1?group.sort(stable).slice(0,group[0].maxStacks):[group.sort((a,b)=>b.strength-a.strength||stable(a,b))[0]]).sort(stable);
}
export function statusModifiers(unit:StatusCarrier,round:number){
 const values={speed:0,vision:0,outgoingDamage:0,incomingDamage:0,periodicDamage:0,periodicHeal:0};
 for(const s of activeStatuses(unit,round))for(const e of s.effects)values[e.kind]+=e.value*s.stacks;
 return {speed:values.speed,vision:values.vision,outgoing:Math.max(0,1+values.outgoingDamage),incoming:Math.max(0,1+values.incomingDamage)};
}
export function effectiveSpeed(unit:StatusUnit,round=1){
 if(!unit.statuses?.length)return unit.cfg.speed;
 const speed=unit.cfg.speed+statusModifiers(unit,round).speed;
 return unit.kind==='plane'?Math.max(.1,speed):Math.max(1,Math.min(MAX_MOVE_STEPS,Math.floor(speed)));
}
export function effectiveVision(unit:StatusUnit,round=1){return !unit.statuses?.length?unit.cfg.vision:Math.max(0,Math.floor(unit.cfg.vision+statusModifiers(unit,round).vision));}
export function outgoingDamage(unit:StatusCarrier,amount:number,round:number){return !unit.statuses?.length?amount:Math.min(MAX_SNAPSHOT_DAMAGE,amount*statusModifiers(unit,round).outgoing);}
export function incomingDamage(unit:StatusCarrier,amount:number,round:number){const multiplier=unit.statuses?.length?statusModifiers(unit,round).incoming:1;return multiplier===1?amount:Math.max(0,Math.round(amount*multiplier));}
export function periodicStatusEffects(unit:StatusCarrier,round:number):PeriodicStatusEffect[]{
 const result=activeStatuses(unit,round).filter(s=>s.lastSettledRound!==round).map(s=>({instanceId:s.instanceId,...(s.source?{source:copy(s.source)}:{}),damage:s.effects.filter(e=>e.kind==='periodicDamage').reduce((n,e)=>n+e.value*s.stacks,0),heal:s.effects.filter(e=>e.kind==='periodicHeal').reduce((n,e)=>n+e.value*s.stacks,0)}));
 for(const s of unit.statuses??[])if(active(s,round))s.lastSettledRound=round;
 return result.filter(s=>s.damage||s.heal);
}

/** IDs and attribution can contain concealed unit IDs. Never forward them verbatim. */
export function projectStatuses(statuses:StatusInstance[]|undefined,knownIds:Set<string>):StatusInstance[]|undefined {
 if(!statuses?.length)return undefined;
 return statuses.slice().sort(stable).map((s,i)=>{const out=copy(s);out.instanceId=`status-${i}`;if(out.source){if(!knownIds.has(out.source.unitId))delete out.source;else if(out.source.shipId&&!knownIds.has(out.source.shipId))delete out.source.shipId;}return out;});
}

const record=(v:unknown):v is Record<string,unknown>=>!!v&&typeof v==='object'&&!Array.isArray(v)&&[Object.prototype,null].includes(Object.getPrototypeOf(v));
const str=(v:unknown,max=120):v is string=>typeof v==='string'&&v.length>0&&v.length<=max;
const integer=(v:unknown,min=0,max=1e9)=>Number.isSafeInteger(v)&&Number(v)>=min&&Number(v)<=max;
const finite=(v:unknown,min=-1e5,max=1e5)=>typeof v==='number'&&Number.isFinite(v)&&v>=min&&v<=max;
export function validateStatuses(value:unknown):value is StatusInstance[]|undefined {
 if(value===undefined)return true;
 if(!Array.isArray(value)||value.length>MAX_STATUS_INSTANCES)return false;
 const ids=new Set(),rules=new Map<string,number>();
 for(const s of value){
  if(!record(s)||!str(s.instanceId)||ids.has(s.instanceId)||!str(s.definitionId)||!str(s.name)||!str(s.icon)||typeof s.description!=='string'||s.description.length>1000||!['buff','debuff','neutral'].includes(String(s.kind))||!integer(s.priority,-1000,1000)||!finite(s.strength,0)||!integer(s.maxStacks,1,32)||s.stacks!==1||!integer(s.order,1)||!integer(s.startRound,1)||(s.endRound!==null&&!integer(s.endRound,Number(s.startRound)))||(s.lastSettledRound!==undefined&&!integer(s.lastSettledRound,Number(s.startRound),s.endRound===null?1e9:Number(s.endRound))))return false;
  if(s.source!==undefined&&(!record(s.source)||!str(s.source.unitId)||s.source.shipId!==undefined&&!str(s.source.shipId)||s.source.name!==undefined&&!str(s.source.name)))return false;
  if(!Array.isArray(s.effects)||s.effects.length>12||!s.effects.length||s.effects.some(e=>!record(e)||!['speed','vision','outgoingDamage','incomingDamage','periodicDamage','periodicHeal'].includes(String(e.kind))||!finite(e.value,String(e.kind).startsWith('periodic')?0:-1e5)))return false;
  const limit=rules.get(s.definitionId);if(limit!==undefined&&limit!==s.maxStacks)return false;
  rules.set(s.definitionId,s.maxStacks as number);ids.add(s.instanceId);
 }
 for(const [id,max]of rules)if(max>1){const group=value.filter(s=>s.definitionId===id);if(group.some(s=>group.filter(layer=>active(layer,s.startRound)).length>max))return false;}
 return true;
}
