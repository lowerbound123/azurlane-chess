import type {CampaignSave} from '../../shared/campaign.ts';
import {SHIP_DEFINITIONS} from '../ship-definitions.ts';
import {hexToXY} from '../engine.ts';
export const CAMPAIGN_SAVE_KEY='azurlane-chess:campaign:homeward';
export const CAMPAIGN_SAVE_VERSION=1;
const MAX_BYTES=2*1024*1024;
const record=(v:unknown):v is Record<string,unknown>=>!!v&&typeof v==='object'&&!Array.isArray(v);
function requireValue(ok:unknown):asserts ok {if(!ok)throw new Error('教学进度内容无效，原记录已保留；可返回教学页重新开始。');}
const integer=(v:unknown,min:number,max:number)=>typeof v==='number'&&Number.isSafeInteger(v)&&v>=min&&v<=max;
const finite=(v:unknown,min:number,max:number)=>typeof v==='number'&&Number.isFinite(v)&&v>=min&&v<=max;
const hex=(v:unknown)=>record(v)&&integer(v.r,0,71)&&integer(v.q,-35,12)&&Number(v.q)+Math.floor(Number(v.r)/2)>=0&&Number(v.q)+Math.floor(Number(v.r)/2)<13;
const cell=(v:unknown)=>typeof v==='string'&&/^-?\d+,\d+$/.test(v)&&hex({q:Number(v.split(',')[0]),r:Number(v.split(',')[1])});
const strings=(v:unknown,max=100)=>Array.isArray(v)&&v.length<=max&&v.every(s=>typeof s==='string'&&s.length<=120);
function tree(v:unknown,path='',depth=0):void {
 requireValue(depth<=16);
 if(typeof v==='number')requireValue(Number.isFinite(v)||(v===Infinity&&/\.airReady\.\d+$/.test(path)));
 else if(Array.isArray(v)){requireValue(v.length<=1000);v.forEach((x,i)=>tree(x,path+'.'+i,depth+1));}
 else if(record(v)){requireValue(Object.keys(v).length<=1000);for(const [k,x]of Object.entries(v)){requireValue(!['__proto__','constructor','prototype'].includes(k));tree(x,path+'.'+k,depth+1);}}
 else requireValue(v===null||typeof v==='string'||typeof v==='boolean'||v===undefined);
}
function validate(value:unknown):asserts value is CampaignSave {
 requireValue(record(value));tree(value);
 const save=value as unknown as CampaignSave,s=save.state,g=save.game;
 requireValue(record(s)&&s.version===CAMPAIGN_SAVE_VERSION&&integer(s.chapter,0,9)&&integer(s.checkpoint,0,63));
 requireValue(['playing','checkpoint-complete','failed','complete'].includes(s.status)&&strings(s.completed)&&integer(s.hintLevel,0,20)&&integer(s.attempts,0,10000)&&record(s.evidence));
 requireValue(Object.values(s.evidence).every(v=>typeof v==='boolean'||finite(v,-1e9,1e9)));
 requireValue(record(g)&&g.ruleset==='fleet-v1'&&integer(g.round,1,10000)&&integer(g.nextId,0,1e8));
 requireValue(['deploy','plan','ended'].includes(g.phase)&&[null,0,1,'draw'].includes(g.winner));
 requireValue(g.map?.width===13&&g.map.height===72&&Array.isArray(g.map.islands)&&g.map.islands.length<=936&&g.map.islands.every(cell));
 requireValue(new Set(g.map.islands).size===g.map.islands.length&&Array.isArray(g.map.mines)&&g.map.mines.length<=936&&g.map.mines.every(hex));
 requireValue(Array.isArray(g.explored)&&g.explored.length===2&&g.explored.every(a=>Array.isArray(a)&&a.length<=936&&a.every(cell)));
 requireValue(Array.isArray(g.ships)&&g.ships.length>=1&&g.ships.length<=20&&new Set(g.ships.map(x=>x.id)).size===g.ships.length);
 for(const ship of g.ships){
  requireValue(record(ship)&&typeof ship.id==='string'&&ship.id.length<100&&[0,1].includes(ship.team)&&ship.kind==='ship'&&typeof ship.label==='string');
  requireValue(ship.catalogId&&Object.hasOwn(SHIP_DEFINITIONS,ship.catalogId)&&ship.template===ship.catalogId.split('-')[0]);
  requireValue(hex(ship.pos)&&record(ship.xy)&&!g.map.islands.includes(`${ship.pos.q},${ship.pos.r}`));
  requireValue(finite(ship.xy.x,-2,25)&&finite(ship.xy.y,-2,110));
  const xy=hexToXY(ship.pos);if(ship.hp>0)requireValue(Math.abs(ship.xy.x-xy.x)<1e-5&&Math.abs(ship.xy.y-xy.y)<1e-5);
  const c=ship.cfg;requireValue(record(c)&&finite(c.hp,1,1000)&&finite(ship.hp,0,c.hp)&&integer(c.speed,1,8)&&finite(c.vision,0,10)&&finite(c.radius,.05,2)&&finite(c.collision,0,100));
  requireValue(integer(ship.heading,0,5)&&integer(ship.torps,0,50)&&integer(ship.mainReady,1,10010));
  if(c.secondary)requireValue(finite(c.secondary.damage,0,200)&&finite(c.secondary.range,0,12));
  if(c.main)requireValue(integer(c.main.shots,1,4)&&finite(c.main.damage,0,200)&&finite(c.main.range,1,12)&&integer(c.main.reload,0,3));
  if(c.torpedo)requireValue(finite(c.torpedo.speed,.1,8)&&finite(c.torpedo.damage,0,200)&&finite(c.torpedo.life,.1,4)&&integer(c.torpedo.max,1,6));
  requireValue(Array.isArray(ship.airReady)&&Array.isArray(ship.airHP)&&ship.airReady.length===ship.airHP.length&&ship.airReady.length===(c.carrier?.stock??0));
  requireValue(ship.airReady.every(n=>n===Infinity||integer(n,1,10010))&&ship.airHP.every(n=>finite(n,0,3)));
  if(c.carrier){requireValue(integer(c.carrier.stock,1,8)&&integer(c.carrier.launch,1,2)&&Array.isArray(c.carrier.slots)&&c.carrier.slots.length===c.carrier.stock);c.carrier.slots.forEach(plane=>requireValue(validPlaneConfig(plane)));}
 }
 requireValue(Array.isArray(g.planes)&&g.planes.length<=80&&Array.isArray(g.torpedoes)&&g.torpedoes.length<=100);
 for(const p of g.planes){requireValue(record(p)&&validPlaneConfig(p.cfg)&&finite(p.hp,0,p.cfg.hp)&&finite(p.xy?.x,-100,300)&&finite(p.xy?.y,-100,300));requireValue(g.ships.some(s=>s.id===p.mother)&&integer(p.slot,0,7)&&['outbound','return'].includes(p.state)&&['point','target','patrol'].includes(p.mode)&&hex(p.target)&&finite(p.traveled,0,100));}
 for(const t of g.torpedoes)requireValue(record(t)&&integer(t.heading,0,5)&&finite(t.xy?.x,-100,300)&&finite(t.xy?.y,-100,300)&&finite(t.age,0,5)&&finite(t.cfg?.speed,.1,8)&&finite(t.cfg?.damage,0,200)&&finite(t.cfg?.life,.1,4));
 requireValue(Array.isArray(g.log)&&g.log.length<=300);
 if(g.zones)requireValue(Array.isArray(g.zones)&&g.zones.length<=30&&g.zones.every(z=>['smoke','radar'].includes(z.kind)&&[0,1].includes(z.team)&&hex(z.center)&&integer(z.radius,0,3)&&integer(z.expires,1,10010)));
 requireValue(record(save.plans)&&Object.keys(save.plans).every(id=>g.ships.some(s=>s.id===id&&s.team===0)));
 for(const p of Object.values(save.plans)){
  requireValue(record(p)&&Array.isArray(p.moves)&&p.moves.length<=8&&p.moves.every(m=>record(m)&&[-1,0,1].includes(m.turn)&&typeof m.forward==='boolean'));
  requireValue(Array.isArray(p.torps)&&p.torps.length<=6&&p.torps.every(t=>record(t)&&integer(t.window,0,8)&&integer(t.dir,0,5)));
  requireValue(Array.isArray(p.main)&&p.main.length<=4&&p.main.every(hex)&&Array.isArray(p.planes)&&p.planes.length<=2);
  requireValue(p.planes.every(o=>record(o)&&['point','target','patrol'].includes(o.mode)&&integer(o.slot,0,7)&&(o.mode==='target'?typeof o.targetId==='string':hex(o.target))));
  requireValue(p.sweep===null||hex(p.sweep));if(p.radar)requireValue(hex(p.radar));if(p.mineSteps)requireValue(Array.isArray(p.mineSteps)&&p.mineSteps.every(n=>integer(n,1,8)));
 }
 requireValue(typeof save.selected==='string'&&(save.selected===''||g.ships.some(s=>s.id===save.selected&&s.team===0)));
 if(save.fleet)requireValue(strings(save.fleet,5)&&save.fleet.every(id=>Object.hasOwn(SHIP_DEFINITIONS,id)));
 if(save.checkpointExplored)requireValue(Array.isArray(save.checkpointExplored)&&save.checkpointExplored.length===2&&save.checkpointExplored.every(a=>Array.isArray(a)&&a.length<=936&&a.every(cell)));
}
function validPlaneConfig(p:unknown){return record(p)&&finite(p.hp,1,3)&&finite(p.speed,.1,10)&&finite(p.range,.1,20)&&finite(p.vision,0,6)&&finite(p.damage,0,100)&&['bomber','heavy','fighter','scout'].includes(String(p.role));}
export type CampaignRead={kind:'missing'}|{kind:'resume';save:CampaignSave}|{kind:'migrate';chapter:number;completed:string[]}|{kind:'error';message:string};
export function createCampaignStorage(storage:Pick<Storage,'getItem'|'setItem'>){
 return {
  read():CampaignRead {
   try{
    const raw=storage.getItem(CAMPAIGN_SAVE_KEY);if(raw===null)return {kind:'missing'};requireValue(raw.length<=MAX_BYTES);
    const envelope=JSON.parse(raw);requireValue(record(envelope)&&envelope.magic==='azurlane-campaign'&&record(envelope.save));
    if(envelope.version!==CAMPAIGN_SAVE_VERSION){const s=envelope.save.state;requireValue(integer(envelope.version,0,1000)&&record(s)&&integer(s.chapter,0,9)&&strings(s.completed));return {kind:'migrate',chapter:s.chapter as number,completed:s.completed as string[]};}
    const save=envelope.save as unknown as CampaignSave;
    if(Array.isArray(save.game?.ships))for(const s of save.game.ships)if(Array.isArray(s.airReady))s.airReady=s.airReady.map(n=>n===null?Infinity:n);
    validate(save);return {kind:'resume',save};
   }catch(error){return {kind:'error',message:error instanceof Error?error.message:'无法读取教学进度'};}
  },
  write(save:CampaignSave):{ok:true}|{ok:false;message:string}{
   try{validate(save);const json=JSON.stringify({magic:'azurlane-campaign',version:CAMPAIGN_SAVE_VERSION,save});requireValue(json.length<=MAX_BYTES);storage.setItem(CAMPAIGN_SAVE_KEY,json);return {ok:true};}
   catch(error){return {ok:false,message:error instanceof Error?error.message:'无法保存教学进度'};}
  },
 };
}
