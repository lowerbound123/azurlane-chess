import {activeStatuses,type StatusInstance,type StatusEffect} from '../shared/status.ts';
export function effectText(effect:StatusEffect){
 const labels={speed:'航速',vision:'视野',outgoingDamage:'输出伤害',incomingDamage:'承受伤害',periodicDamage:'回合末伤害',periodicHeal:'回合末治疗'};
 const percent=effect.kind==='outgoingDamage'||effect.kind==='incomingDamage';
 const value=Number((effect.value*(percent?100:1)).toFixed(2));
 return `${labels[effect.kind]} ${value>=0?'+':''}${value}${percent?'%':''}`;
}
export function statusGroups(statuses:StatusInstance[]|undefined,round:number){
 const active=new Set(activeStatuses({statuses},round).map(s=>s.instanceId)),groups=new Map<string,StatusInstance[]>();
 for(const status of statuses??[])if(status.endRound===null||status.endRound>=round){const group=groups.get(status.definitionId)??[];group.push(status);groups.set(status.definitionId,group);}
 return [...groups.entries()].map(([id,group])=>{
  group.sort((a,b)=>a.order-b.order||a.instanceId.localeCompare(b.instanceId));
  const effective=group.filter(s=>active.has(s.instanceId)),representative=effective[0]??group[0];
  const effects=new Map<StatusEffect['kind'],number>();for(const s of effective)for(const e of s.effects)effects.set(e.kind,(effects.get(e.kind)??0)+e.value*s.stacks);
  return {id,name:representative.name,kind:representative.kind,icon:representative.icon,priority:representative.priority,maxStacks:representative.maxStacks,stacks:effective.reduce((n,s)=>n+s.stacks,0),pending:group.every(s=>s.startRound>round),effects:[...effects].map(([kind,value])=>effectText({kind,value})),
   instances:group.map(s=>({id:s.instanceId,name:s.source?.name,description:s.description,state:s.startRound>round?'pending':active.has(s.instanceId)?'active':'suppressed',effects:s.effects.map(effectText),timing:`第 ${s.startRound} 回合生效 · ${s.endRound===null?'直到主动移除':`第 ${s.endRound} 回合结束后消失`}`}))};
 }).sort((a,b)=>b.priority-a.priority||a.id.localeCompare(b.id));
}
