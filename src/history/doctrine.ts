import type {Hex,Observation,Ship} from '../../shared/game.ts';
import type {HistoricalDefinition,HistoricalState} from '../../shared/history.ts';
import {add,allHexes,fromCR,hexDist,hexLine,key,legal,toCR} from '../engine.ts';

export interface HistoricalContact {id:string;at:Hex;heading:number;round:number}
export interface HistoricalIntent {
 role:'raider'|'withdraw'|'ambush'|'port-guard'|'rear-guard'|'pursuit'|'intercept'|'patrol'|'convoy';
 goal?:Hex;range:number;targetId?:string;hold?:boolean;escape?:{at:Hex;rounds:number};
}
/** Only our sightings enter tactics. Old contacts remain in the save for the UI. */
export function recentContacts(v:Observation,team:number,contacts:HistoricalState['contacts']):HistoricalContact[]{
 return Object.entries(contacts).filter(([id,c])=>id.startsWith(`${team}:`)&&c.round<v.round&&v.round-c.round<=4)
  .map(([id,c])=>({id:id.slice(2),...c})).sort((a,b)=>b.round-a.round||a.id.localeCompare(b.id));
}
export function contactSearch(v:Observation,c:HistoricalContact,index:number):Hex {
 let at={...c.at};const age=Math.max(0,v.round-c.round-1);
 for(let n=0;n<Math.min(age*2,4);n++){const next=add(at,c.heading);if(!legal(v.map,next))break;at=next;}
 // Separate search sectors after losing a track; never extrapolate forever.
 if(age>0){const next=add(at,(c.heading+index%3-1+6)%6);if(legal(v.map,next))at=next;}
 return at;
}
function priorityTarget(v:Observation,s:Ship,d:HistoricalDefinition):Ship|undefined {
 const enemies=v.ships.filter(t=>t.team!==s.team&&t.hp>0);
 const score=(t:Ship)=>{
  const distance=hexDist(s.pos,t.pos);
  const imminent=t.cfg.torpedo&&t.torps>0&&distance<=2?40:0;
  const mission=d.id==='samar'&&t.template==='cv'?25:d.id==='denmark-strait'&&t.id==='0-0'?25:0;
  return imminent+mission-distance*2+(d.id==='river-plate'?(1-t.hp/t.cfg.hp)*3:0);
 };
 return enemies.sort((a,b)=>score(b)-score(a)||a.id.localeCompare(b.id))[0];
}
export function enemyIntent(v:Observation,s:Ship,d:HistoricalDefinition,stage:string,contacts:HistoricalContact[]):HistoricalIntent {
 const index=Number(s.id.split('-')[1]),target=priorityTarget(v,s,d);
 const contact=contacts.find(c=>d.id==='samar'?d.units.some(u=>u.id===c.id&&u.template==='cv'):d.id==='denmark-strait'?c.id==='0-0':true)??contacts[0];
 const known=target?.pos??(contact?contactSearch(v,contact,index):undefined);
 const intent:HistoricalIntent={role:'pursuit',goal:known,range:target?Math.min(5,s.cfg.main?.range??3):0,targetId:target?.id};
 switch(d.id){
  case 'river-plate':
   if(stage==='retreat')return {...intent,role:'withdraw',goal:fromCR(1,15),range:0};
   if(target&&hexDist(s.pos,target.pos)<4){
    const positions=allHexes(v.map).filter(h=>legal(v.map,h)&&hexDist(h,target.pos)===5);
    positions.sort((a,b)=>hexDist(s.pos,a)-hexDist(s.pos,b)||key(a).localeCompare(key(b)));
    return {...intent,role:'raider',goal:positions[0]??known,range:0};
   }
   return {...intent,role:'raider',goal:known??fromCR(8,7)};
  case 'narvik': {
   if(s.cfg.speed<=1)return {...intent,role:'ambush',goal:undefined,hold:true};
   if(!known)return {...intent,role:index===5?'rear-guard':'ambush',goal:undefined,hold:true};
   if(s.hp<60)return {...intent,role:'withdraw',goal:fromCR(index===1||index===3?5:13,5),range:0};
   const survivors=v.ships.filter(t=>t.team===s.team&&t.hp>0).length;
   if(index===1||(index===5&&survivors<=3))return {...intent,role:'port-guard',goal:fromCR(9,13),range:1};
   if(index===5)return {...intent,role:'rear-guard',goal:fromCR(13,6),range:0};
   return {...intent,role:'ambush',goal:fromCR(index===3?5:13,10),range:0};
  }
  case 'denmark-strait': {
   if(index===1&&known){
    const line=hexLine(known,fromCR(2,12));
    return {...intent,role:'intercept',goal:line[Math.min(3,line.length-1)],range:0};
   }
   return {...intent,goal:known??fromCR(7,10)};
  }
  case 'midway': {
   // Own launch stations form a shared patrol pattern; no opposing spawn is read.
   const origin=d.units.find(u=>u.id===s.id)!.pos,{c,r}=toCR(origin);
   const offset=[[2,0],[2,2],[0,2],[0,0]][Math.floor((v.round-1)/3)%4];
   return {...intent,role:'patrol',goal:fromCR(c+offset[0],r+offset[1]),range:0};
  }
  case 'samar':
   if(s.template==='ca'&&known){
    const {c,r}=toCR(known),side=index===2?-2:2;
    return {...intent,role:'intercept',goal:fromCR(Math.max(1,Math.min(v.map.width-2,c+side)),Math.min(22,r+3)),range:0};
   }
   return {...intent,goal:known??fromCR(index===0?8:12,18)};
 }
}
