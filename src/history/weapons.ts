import type {Hex,Observation,Plan,PlaneOrder,Plans,Ship} from '../../shared/game.ts';
import {add,allHexes,clone,fromCR,hexDist,hexLine,hexToXY,inBounds,key,legal,mod,route,validPlan,xyToHex} from '../engine.ts';
import {planeForSlot} from '../ship-definitions.ts';
import type {HistoricalContact,HistoricalIntent} from './doctrine.ts';
import {contactSearch} from './doctrine.ts';
import {predictedPositions,safeTorpedo} from './tactics.ts';

export interface WeaponCoordination {plans:Plans;damage:Map<string,number>;contacts:HistoricalContact[]}
const flightDistance=(a:Hex,b:Hex)=>{const x=hexToXY(a),y=hexToXY(b);return Math.hypot(x.x-y.x,x.y-y.y)/Math.sqrt(3);};
function airPoint(v:Observation,s:Ship,slot:number,goal:Hex):Hex {
 const range=planeForSlot(s.cfg,slot).range;
 if(inBounds(goal,v.map)&&flightDistance(s.pos,goal)<=range)return clone(goal);
 return allHexes(v.map).filter(h=>flightDistance(s.pos,h)<=range).sort((a,b)=>hexDist(a,goal)-hexDist(b,goal)||key(a).localeCompare(key(b)))[0]??clone(s.pos);
}
function targetOrder(v:Observation,s:Ship,intent:HistoricalIntent,damage:Map<string,number>):Ship[]{
 const score=(t:Ship)=>(t.id===intent.targetId?30:0)-hexDist(s.pos,t.pos)*2-Math.max(0,(damage.get(t.id)??0)-t.hp)*.25;
 return v.ships.filter(t=>t.team!==s.team&&t.hp>0).sort((a,b)=>score(b)-score(a)||a.id.localeCompare(b.id));
}
export function historicalWeapons(v:Observation,s:Ship,p:Plan,intent:HistoricalIntent,coord:WeaponCoordination):Plan {
 const enemies=targetOrder(v,s,intent,coord.damage),target=enemies[0];
 const friends=v.ships.filter(t=>t.team===s.team);
 const friendlyEnds=friends.map(t=>route(t,t.id===s.id?p:coord.plans[t.id],v.map,v.round).at(-1)!.pos);
 if(s.cfg.main&&s.mainReady<=v.round){
  const victim=enemies.find(t=>hexDist(s.pos,t.pos)<=s.cfg.main!.range);
  if(victim){
   const aims=predictedPositions(v,victim).filter(h=>hexDist(s.pos,h.at)<=s.cfg.main!.range&&!friendlyEnds.some(f=>hexDist(f,h.at)<=(s.cfg.main!.blast??0)));
   for(let shot=0;shot<s.cfg.main.shots&&aims.length;shot++){
    aims.sort((a,b)=>b.weight-a.weight||key(a.at).localeCompare(key(b.at)));
    p.main.push(clone(aims[0].at));aims[0].weight*=.4;
   }
   coord.damage.set(victim.id,(coord.damage.get(victim.id)??0)+p.main.length*s.cfg.main.damage*.5);
  }
 }
 if(s.cfg.torpedo&&s.torps>0&&target&&!p.smoke){
  const nodes=route(s,p,v.map,v.round),hypotheses=predictedPositions(v,target),options:{window:number;dir:number;score:number}[]=[];
  for(let window=0;window<nodes.length;window++)for(let dir=0;dir<6;dir++){
   if(dir===nodes[window].heading||dir===mod(nodes[window].heading+3))continue;
   let at=nodes[window].pos,score=0,unsafe=false;
   for(let distance=1;distance<=s.cfg.torpedo.speed*s.cfg.torpedo.life;distance++){
    at=add(at,dir);if(!legal(v.map,at))break;
    if(friends.some((f,i)=>f.id!==s.id&&(key(f.pos)===key(at)||key(friendlyEnds[i])===key(at)))){unsafe=true;break;}
    score+=hypotheses.filter(h=>key(h.at)===key(at)).reduce((n,h)=>n+h.weight,0)/(1+distance*.08);
   }
   if(!unsafe&&score>.18)options.push({window,dir,score});
  }
  options.sort((a,b)=>b.score-a.score||a.window-b.window||a.dir-b.dir);
  for(const o of options){
   if(p.torps.length>=Math.min(s.torps,s.cfg.torpedo.max))break;
   if(p.torps.some(t=>t.dir===o.dir)||p.torps.filter(t=>t.window===o.window).length>=(s.cfg.torpedo.perWindow??1)||!safeTorpedo(v,s,p,o.window,o.dir,coord.plans))continue;
   p.torps.push({window:o.window,dir:o.dir});
  }
 }
 if(s.cfg.carrier){
  const threats=v.planes.filter(p=>p.team!==s.team&&p.state==='outbound'&&p.hp>0&&p.cfg.damage>0&&hexDist(s.pos,xyToHex(p.xy))<=p.cfg.speed+2)
   .sort((a,b)=>hexDist(s.pos,xyToHex(a.xy))-hexDist(s.pos,xyToHex(b.xy))||a.id.localeCompare(b.id));
  const contact=coord.contacts.find(c=>c.id===intent.targetId)??coord.contacts[0];
  const index=Number(s.id.split('-')[1]),sector=(index+Math.floor((v.round-1)/4))%4;
  const search=contact?contactSearch(v,contact,index):fromCR(s.team===1?20:7,[3,8,13,18][sector]);
  const candidates:{order:PlaneOrder;priority:number;hp:number}[]=[];
  for(let slot=0;slot<s.airReady.length;slot++){
   if(s.airReady[slot]>v.round||s.airHP[slot]<=0)continue;
   const cfg=planeForSlot(s.cfg,slot),role=cfg.role??'bomber';let order:PlaneOrder|undefined,priority=0;
   if(role==='fighter'){
    if(threats.length||v.round===1){
     const end=route(s,p,v.map,v.round).at(-1)!.pos;
     const approach=threats[0]?hexLine(end,xyToHex(threats[0].xy))[1]??end:end;
     order={slot,mode:'patrol',target:airPoint(v,s,slot,approach)};priority=threats.length?100:70;
    }
   }else if(role==='scout'){
    order={slot,mode:'point',target:airPoint(v,s,slot,search)};priority=target?20:80;
   }else{
    const victim=enemies.find(t=>flightDistance(s.pos,t.pos)<=cfg.range);
    if(victim){order={slot,mode:'target',targetId:victim.id};priority=60;}
    else if(contact&&v.round-contact.round<=2&&flightDistance(s.pos,contact.at)<=cfg.range){order={slot,mode:'point',target:clone(contact.at)};priority=45;}
   }
   if(order)candidates.push({order,priority,hp:s.airHP[slot]});
  }
  candidates.sort((a,b)=>b.priority-a.priority||b.hp-a.hp||a.order.slot!-b.order.slot!);
  p.planes=candidates.slice(0,s.cfg.carrier.launch).map(c=>c.order);
  for(const o of p.planes)if(o.mode==='target')coord.damage.set(o.targetId,(coord.damage.get(o.targetId)??0)+planeForSlot(s.cfg,o.slot!).damage*.7);
 }
 return validPlan(v,s,p);
}
