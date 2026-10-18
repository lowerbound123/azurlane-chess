import {scheduleSecondaryAnimations,type SecondaryAnimation} from './secondary-presentation.ts';
import {DEATH_PRESENTATION_DURATION} from '../shared/character-presentation.ts';
import {catalogArt} from './ship-art.ts';
import {effectiveSpeed,effectiveVision,outgoingDamage,incomingDamage,periodicStatusEffects,expireStatuses,clearStatuses,projectStatuses} from '../shared/status.ts';
import type { Hex, XY, ShipType, ShipConfig, Ship, Game, Observation, GameMap, Plane, Torpedo, Plans, Plan, RouteNode, Effect, Presentation, BattleFrame, RoundResult, BattleLog, Contribution, DamageType, Motion } from '../shared/game.ts';
/* Pure deterministic simulation. Templates provide capabilities; roster tags never drive rules. */
import { createCombatStatsTracker } from './combat-stats.ts';
import {createDominationState,settleDomination,dominationWinner,type BattleMode} from '../shared/domination.ts';
import {generateDominationMap} from './domination-map.ts';
export const W=19,H=15,DIRS=[[1,0],[0,1],[-1,1],[-1,0],[0,-1],[1,-1]];
export const RULES={roundLimit:30,ticks:240,shipRadius:Math.sqrt(3)/2-.001,shipCollisionRadius:.75-.001,mineDamage:40,torpedo:{speed:4,damage:45,life:3},plane:{hp:2,speed:6,vision:3,range:12,damage:25}};
import {TEMPLATES,DEFAULT_ROSTER,SHIP_DEFINITIONS,DEFAULT_FLEET,planeForSlot} from './ship-definitions.ts';
export {TEMPLATES,DEFAULT_ROSTER} from './ship-definitions.ts';
export const mod=(n:number,m=6)=>(n%m+m)%m;
export const clone=<T>(x:T):T=>structuredClone(x);
export const key=(h:Hex)=>`${h.q},${h.r}`;
export const fromCR=(c:number,r:number)=>({q:c-Math.floor(r/2),r});
export const toCR=(h:Hex)=>({c:h.q+Math.floor(h.r/2),r:h.r});
export const hexDist=(a:Hex,b:Hex)=>Math.max(Math.abs(a.q-b.q),Math.abs(a.r-b.r),Math.abs(a.q+a.r-b.q-b.r));
export const add=(h:Hex,d:number)=>({q:h.q+DIRS[mod(d)][0],r:h.r+DIRS[mod(d)][1]});
export type MapSize=Pick<GameMap,'width'|'height'>;
const defaultMapSize:MapSize={width:W,height:H};
export interface RoundResolutionOptions {termination?:'fleet'|'mission'}
export const inBounds=(h:Hex,map:MapSize=defaultMapSize)=>{const c=toCR(h);return c.c>=0&&c.c<map.width&&c.r>=0&&c.r<map.height};
export const hexToXY=(h:Hex)=>({x:Math.sqrt(3)*(h.q+h.r/2),y:1.5*h.r});
export function roundHex(q:number,r:number){let x=q,z=r,y=-x-z,rx=Math.round(x+1e-9),ry=Math.round(y+2e-9),rz=Math.round(z-3e-9);let dx=Math.abs(rx-x),dy=Math.abs(ry-y),dz=Math.abs(rz-z);if(dx>dy&&dx>dz)rx=-ry-rz;else if(dy>dz)ry=-rx-rz;else rz=-rx-ry;return {q:rx,r:rz};}
export const xyToHex=(p:XY)=>roundHex(Math.sqrt(3)/3*p.x-p.y/3,2/3*p.y);
export const same=(a:Hex,b:Hex)=>a.q===b.q&&a.r===b.r;
export const allHexes=(map:MapSize=defaultMapSize)=>Array.from({length:map.width*map.height},(_,i)=>fromCR(i%map.width,Math.floor(i/map.width)));
export function hexLine(a:Hex,b:Hex){const n=hexDist(a,b);return Array.from({length:n+1},(_,i)=>roundHex(a.q+(b.q-a.q)*i/(n||1),a.r+(b.r-a.r)*i/(n||1)));}
export function hasLOS(map:GameMap,a:Hex,b:Hex){return hexLine(a,b).slice(1,-1).every(h=>!map.islands.includes(key(h)));}
export function legal(map:GameMap,h:Hex){return inBounds(h,map)&&!map.islands.includes(key(h));}
export function deployment(team:number,map:MapSize=defaultMapSize){return allHexes(map).filter(h=>{const {c,r}=toCR(h);return team===0?r>=map.height-3&&c<3:r<3&&c>=map.width-3});}
function rng(seed:number){let a=(Number(seed)||1)>>>0;return()=>{a+=0x6D2B79F5;let t=a;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return((t^t>>>14)>>>0)/4294967296}}
export function generateMap(seed=20261004){const rand=rng(seed),islands=new Set<string>(),blocked=new Set([...deployment(0),...deployment(1)].map(key));const mirror=(h:Hex)=>{const {c,r}=toCR(h);return fromCR(W-1-c,r)};const connected=(set:Set<string>)=>{const water=allHexes().filter(h=>!set.has(key(h))),seen=new Set([key(water[0])]),q=[water[0]];for(let i=0;i<q.length;i++)for(let d=0;d<6;d++){const h=add(q[i],d),k=key(h);if(inBounds(h)&&!set.has(k)&&!seen.has(k)){seen.add(k);q.push(h)}}return seen.size===water.length};let anchor=fromCR(5,4);for(let n=0;islands.size<30&&n<3000;n++){if(n%4===0)anchor=fromCR(3+Math.floor(rand()*6),1+Math.floor(rand()*10));const h=n%4?add(anchor,Math.floor(rand()*6)):anchor,m=mirror(h);if(!inBounds(h)||h.r===5||h.r===10||blocked.has(key(h))||blocked.has(key(m)))continue;const trial=new Set([...islands,key(h),key(m)]);if(trial.size<=32&&connected(trial)){islands.add(key(h));islands.add(key(m));}}const mines:Hex[]=[];for(let n=0;mines.length<8&&n<1000;n++){const h=fromCR(3+Math.floor(rand()*6),1+Math.floor(rand()*12)),m=mirror(h);if(islands.has(key(h))||islands.has(key(m))||mines.some(x=>same(x,h)||same(x,m)))continue;mines.push(h,m);}return{width:W,height:H,islands:[...islands],mines};}
export function createShip(type:ShipType,team:number,index:number,pos:Hex):Ship{const cfg={radius:RULES.shipRadius,...clone(TEMPLATES[type])};return{id:`${team}-${index}`,kind:'ship',team,label:`${cfg.name}-${index+1}`,template:type,cfg,hp:cfg.hp,pos:{...pos},xy:hexToXY(pos),heading:team===0?0:3,torps:cfg.torpedo?.reserve||0,mainReady:1,airReady:Array(cfg.carrier?.stock||0).fill(1),airHP:Array(cfg.carrier?.stock||0).fill(cfg.carrier?.plane.hp||0),destroyedPlanes:0};}
export function createGame(roster:ShipType[]=DEFAULT_ROSTER,seed=20261004):Game{const map=generateMap(seed),spots=[0,2,4,6,8];const g:Game={seed,round:1,map,ships:[...roster.map((t,i)=>createShip(t,0,i,deployment(0)[spots[i]])),...DEFAULT_ROSTER.map((t,i)=>createShip(t,1,i,deployment(1)[spots[4-i]]))],torpedoes:[],planes:[],nextId:0,log:[],winner:null,phase:'deploy',explored:[[],[]]};updateExploration(g);return g;}
export function createCatalogShip(id:string,team:number,index:number,pos:Hex):Ship {
 const definition=SHIP_DEFINITIONS[id];if(!definition)throw new Error('无效舰船 '+id);
 const s=createShip(id.split('-')[0] as ShipType,team,index,pos);s.cfg=clone(definition);s.catalogId=id;s.label=catalogArt(id)?.name??s.cfg.name;s.hp=s.cfg.hp;s.torps=s.cfg.torpedo?.reserve??0;
 s.airReady=Array(s.cfg.carrier?.stock??0).fill(1);s.airHP=s.airReady.map((_,i)=>s.cfg.carrier!.slots![i].hp);
 if(s.cfg.minelayer)s.minesLeft=s.cfg.minelayer.reserve;if(s.cfg.smoke)s.smokeLeft=s.cfg.smoke.charges;if(s.cfg.radar)s.radarLeft=s.cfg.radar.charges;return s;
}
export function createFleetGame(ids:string[]=DEFAULT_FLEET,seed=20261004,enemy:string[]=DEFAULT_FLEET,battleMode:BattleMode='annihilation'):Game {
 const g=createGame([],seed),spots=[0,2,4,6,8];g.ruleset='fleet-v1';g.zones=[];
 if(battleMode==='domination'){g.battleMode=battleMode;g.domination=createDominationState();g.map=generateDominationMap(seed);}
 g.ships=[ids,enemy].flatMap((fleet,team)=>fleet.map((id,i)=>createCatalogShip(id,team,i,deployment(team,g.map)[spots[team?4-i:i]])));
 g.explored=[[],[]];updateExploration(g);return g;
}
export const alive=(s:{hp:number})=>s.hp>0;
// Adjacent parallel hex lanes are 1.5 world units apart. The circular map
// marker is larger than the hull and must not make those lanes collide.
// Clamp legacy saved marker radii too, without changing the save format.
export const collisionRadius=(s:Pick<Ship,"cfg">)=>Math.min(s.cfg.radius,RULES.shipCollisionRadius);
const visibilityCache=new WeakMap<GameMap,{terrain:string;footprints:Map<string,string[]>;teams:Map<number,{signature:string;cells:Set<string>}>}>();
export function visibleCells(g:Observation,team:number){
 if('visible' in g&&Array.isArray(g.visible))return new Set<string>(g.visible);
 const watchers=[...g.ships.filter(s=>s.team===team&&alive(s)).map(s=>({pos:xyToHex(s.xy),vision:inSmoke(g,xyToHex(s.xy))?1:effectiveVision(s,g.round)})),...g.planes.filter(p=>p.team===team&&p.hp>0).map(p=>({pos:xyToHex(p.xy),vision:effectiveVision(p,g.round)}))];
 // Vision changes at hex boundaries, not at every continuous physics substep.
 // The terrain signature also catches edits to an existing islands array.
 const terrain=`${g.map.width}x${g.map.height}:`+g.map.islands.join(';');let cache=visibilityCache.get(g.map);
 if(!cache||cache.terrain!==terrain){cache={terrain,footprints:new Map(),teams:new Map()};visibilityCache.set(g.map,cache);}
 const radar=activeZones(g).filter(z=>z.kind==='radar'&&z.team===team);
 const signature=JSON.stringify(radar)+watchers.map(w=>`${key(w.pos)}:${w.vision}`).join('|'),previous=cache.teams.get(team);
 if(previous?.signature===signature)return new Set(previous.cells);
 const cells=new Set<string>();
 for(const w of watchers){
  const id=`${key(w.pos)}:${w.vision}`;let footprint=cache.footprints.get(id);
  if(!footprint){footprint=allHexes(g.map).filter(h=>hexDist(w.pos,h)<=w.vision&&hasLOS(g.map,w.pos,h)).map(key);cache.footprints.set(id,footprint);}
  for(const cell of footprint)cells.add(cell);
 }
 for(const zone of radar)for(const h of allHexes(g.map))if(hexDist(h,zone.center)<=zone.radius)cells.add(key(h));
 cache.teams.set(team,{signature,cells});return new Set(cells);
}
export const activeZones=(g:Pick<Observation,'round'|'zones'>)=>(g.zones??[]).filter(z=>z.expires>g.round);
export const inSmoke=(g:Pick<Observation,'round'|'zones'>,h:Hex)=>activeZones(g).some(z=>z.kind==='smoke'&&hexDist(z.center,h)<=z.radius);
export function shipVisible(g:Observation,s:Pick<Ship,'xy'|'team'>,team:number,vis=visibleCells(g,team)):boolean {
 if(s.team===team)return true;if('visible' in g&&Array.isArray(g.visible))return g.ships.some(x=>x.id===('id' in s?s.id:''));const at=xyToHex(s.xy);
 if(activeZones(g).some(z=>z.kind==='radar'&&z.team===team&&hexDist(z.center,at)<=z.radius))return true;
 if(!vis.has(key(at)))return false;if(!inSmoke(g,at))return true;
 return [...g.ships.filter(x=>x.team===team&&alive(x)),...g.planes.filter(x=>x.team===team&&alive(x))].some(w=>hexDist(xyToHex(w.xy),at)<=1);
}
/** Conservative presentation mask: smoke cannot disclose a concealed hull through hit text or weapon trails. */
export function presentationCells(visible:Set<string>,zones:NonNullable<Game['zones']>=[]){return new Set([...visible].filter(k=>{const [q,r]=k.split(',').map(Number);return !zones.some(z=>z.kind==='smoke'&&hexDist(z.center,{q,r})<=z.radius);}));}
export function updateExploration(g:Game){if(!g.explored)g.explored=[[],[]];for(const team of [0,1])g.explored[team]=[...new Set([...g.explored[team],...visibleCells(g,team)])];return g.explored;}
// Torpedoes do not explore cells. Ownership only reveals them in explored fog.
export function torpedoVisible(torpedo:Pick<Torpedo,"xy"|"team">,team:number,visible:Set<string>,explored:Set<string>){const cell=key(xyToHex(torpedo.xy));return explored.has(cell)&&(torpedo.team===team||visible.has(cell));}
export function observe(g:Observation,team:number):Observation{
 const vis=visibleCells(g,team),explored=new Set(g.explored?.[team]||vis);
 const ships=g.ships.filter(s=>alive(s)&&(s.team===team||shipVisible(g,s,team,vis))),planes=g.planes.filter(p=>p.team===team||vis.has(key(xyToHex(p.xy))));
 const knownIds=new Set([...g.ships.filter(s=>s.team===team),...ships,...planes].map(u=>u.id));
 const projected=<T extends Ship|Plane>(unit:T):T=>{const result=clone(unit);if(unit.statuses?.length)result.statuses=projectStatuses(unit.statuses,knownIds);return result;};
 return{...(g.domination?{battleMode:g.battleMode,domination:clone(g.domination)}:{}),...(g.ruleset?{ruleset:g.ruleset,zones:clone(g.zones??[])}:{}),round:g.round,map:{...clone(g.map),mines:g.map.mines.filter(m=>explored.has(key(m))),islands:g.explored?g.map.islands.filter(k=>g.explored![team].includes(k)):[...g.map.islands]},ships:ships.map(projected),torpedoes:g.torpedoes.filter(p=>torpedoVisible(p,team,vis,explored)).map(clone),planes:planes.map(projected)};
}
export const emptyPlan=():Plan=>({moves:[],torps:[],main:[],planes:[],sweep:null});
export function route(ship:Pick<Ship,"pos"|"heading"|"cfg"|"statuses">,plan:Partial<Plan>|undefined,map:GameMap,round=1):RouteNode[]{let pos={...ship.pos},heading=ship.heading;const nodes=[{pos:{...pos},heading}];if(plan?.guard&&ship.cfg.guard)return nodes;for(const move of (plan?.moves||[]).slice(0,plan?.escort&&ship.cfg.escort?Math.min(ship.cfg.escort.steps,effectiveSpeed(ship,round)):effectiveSpeed(ship,round))){heading=mod(heading+Math.max(-1,Math.min(1,move.turn||0)));const next=move.forward?add(pos,heading):pos;if(move.forward&&!legal(map,next))break;pos={...next};nodes.push({pos:{...pos},heading});}return nodes;}
export function validPlan(g:Observation,s:Ship,p:Partial<Plan>=emptyPlan()):Plan {
 const out=emptyPlan();
 if(p.guard&&s.cfg.guard)out.guard=true;
 if(p.escort&&s.cfg.escort)out.escort=true;
 if(p.smoke&&s.cfg.smoke&&(s.smokeLeft??0)>0)out.smoke=true;
 if(p.radar&&s.cfg.radar&&(s.radarLeft??0)>0&&inBounds(p.radar,g.map)&&hexDist(s.pos,p.radar)<=s.cfg.radar.range)out.radar=clone(p.radar);
 const nodes=route(s,{...p,guard:out.guard,escort:out.escort},g.map,g.round);out.moves=(p.moves||[]).slice(0,nodes.length-1);
 for(const t of p.torps||[]){const n=nodes[t.window];if(!s.cfg.torpedo||out.smoke||!n||!Number.isInteger(t.window)||!Number.isInteger(t.dir)||out.torps.filter(x=>x.window===t.window).length>=(s.cfg.torpedo.perWindow??1)||out.torps.some(x=>x.window===t.window&&x.dir===mod(t.dir))||out.torps.length>=Math.min(s.torps,s.cfg.torpedo.max)||[n.heading,mod(n.heading+3)].includes(mod(t.dir))||t.window<0)continue;out.torps.push({window:t.window,dir:mod(t.dir)});}
 if(s.cfg.main&&s.mainReady<=g.round)out.main=(p.main||[]).filter(h=>inBounds(h,g.map)&&hexDist(s.pos,h)<=s.cfg.main!.range).slice(0,s.cfg.main.shots).map(clone);
 if(s.cfg.secondary&&!out.radar&&p.sweep&&g.map.mines.some(h=>same(h,p.sweep!))&&hexDist(s.pos,p.sweep)<=s.cfg.secondary.range&&hasLOS(g.map,s.pos,p.sweep))out.sweep={q:p.sweep.q,r:p.sweep.r};
 if(s.cfg.minelayer){const steps=[...new Set(p.mineSteps??[])].filter(k=>Number.isInteger(k)&&k>0&&k<nodes.length&&!same(nodes[k].pos,nodes[k-1].pos)).slice(0,Math.min(s.minesLeft??0,s.cfg.minelayer.max));if(steps.length)out.mineSteps=steps;}
 if(s.cfg.carrier){const used=new Set<number>();for(const o of p.planes??[]){
  if(out.planes.length>=s.cfg.carrier.launch)break;
  const slot=o.slot??(g.ruleset? -1:s.airReady.findIndex((n,i)=>n<=g.round&&!used.has(i)));
  if(!Number.isInteger(slot)||slot<0||slot>=s.airReady.length||s.airReady[slot]>g.round||used.has(slot))continue;
  const cfg=planeForSlot(s.cfg,slot),role=cfg.role??'bomber';
  if(role==='fighter'?o.mode!=='patrol':role==='scout'?o.mode!=='point':!['point','target'].includes(o.mode))continue;
  if(o.mode==='target'?!g.ships.some(t=>t.id===o.targetId&&t.team!==s.team&&alive(t)&&shipVisible(g,t,s.team)):!inBounds(o.target,g.map))continue;
  used.add(slot);out.planes.push(g.ruleset?{...clone(o),slot}:clone(o));
 }}return out;
}
const length=(a:XY,b:XY)=>Math.hypot(a.x-b.x,a.y-b.y);
const lerp=(a:XY,b:XY,t:number)=>({x:a.x+(b.x-a.x)*t,y:a.y+(b.y-a.y)*t});
const toward=(a:XY,b:XY,dist:number)=>{const l=length(a,b);return l<=dist?{...b}:lerp(a,b,dist/l)};
function collisionFraction(a:XY,b:XY,c:XY,d:XY,r:number){const px=a.x-c.x,py=a.y-c.y,vx=(b.x-a.x)-(d.x-c.x),vy=(b.y-a.y)-(d.y-c.y),C=px*px+py*py-r*r,A=vx*vx+vy*vy,B=2*(px*vx+py*vy);if(C<=1e-9)return 0;if(A<1e-12)return null;const disc=B*B-4*A*C;if(disc<0)return null;const t=(-B-Math.sqrt(disc))/(2*A);return t>=-1e-9&&t<=1+1e-9?Math.max(0,t):null;}
function frame(g:Game,t:number,effects:Effect[],deaths:Map<string,number>=new Map()):BattleFrame{const present=(s:Ship)=>alive(s)||(deaths.has(s.id)&&t-deaths.get(s.id)!<DEATH_PRESENTATION_DURATION-1e-9);return{...([...g.ships,...g.planes].some(u=>u.statuses?.length)?{round:g.round}:{}),...(g.domination?{domination:clone(g.domination)}:{}),...(g.ruleset?{zones:clone(activeZones(g)),visibleShipIdsByTeam:[0,1].map(team=>g.ships.filter(s=>present(s)&&shipVisible(g,s,team)).map(s=>s.id))}:{}),t,ships:g.ships.filter(present).map(s=>({id:s.id,team:s.team,label:s.label,template:s.template,hp:s.hp,cfg:s.cfg,pos:xyToHex(s.xy),xy:{...s.xy},heading:s.heading,...(s.statuses?.length?{statuses:clone(s.statuses)}:{}),...(s.guarding?{guarding:true}:{}),...(g.ruleset?{catalogId:s.catalogId,...(s.escorting?{escorting:true}:{})}:{})})),torpedoes:g.torpedoes.map(p=>({...p,xy:{...p.xy}})),planes:g.planes.filter(alive).map(p=>({...p,xy:{...p.xy},...(p.statuses?.length?{statuses:clone(p.statuses)}:{})})),mines:clone(g.map.mines),visibleByTeam:[0,1].map(team=>[...visibleCells(g,team)]),exploredByTeam:[0,1].map(team=>[...(g.explored?.[team]||[])]),visible:[...visibleCells(g,0)],explored:[...(g.explored?.[0]||[])],effects:effects.splice(0)};}
export function resolveRound(input:Game,submitted:Plans={},options:RoundResolutionOptions={}):RoundResult{const g=clone(input);if(g.domination&&g.phase==='ended')return{game:g,frames:[frame(g,0,[])],events:[],counts:[0,1].map(team=>({count:g.ships.filter(s=>s.team===team&&alive(s)).length,hp:g.ships.filter(s=>s.team===team&&alive(s)).reduce((n,s)=>n+s.hp,0)})),presentation:[],combatStats:{}};const deaths=new Map<string,number>();const frames:BattleFrame[]=[],events:BattleLog[]=[],effects:Effect[]=[],presentation:Presentation[]=[],r=g.round,combat=createCombatStatsTracker(g.ships);for(const s of g.ships)if(s.cfg.carrier)s.airHP??=Array(s.cfg.carrier!.stock).fill(s.cfg.carrier!.plane.hp);let time=0;const showEffect=(effect:Effect,meta:{time?:number;team?:number;from?:XY;to?:XY;targetId?:string;sourceId?:string;position?:XY}={})=>{effects.push(effect);const t=meta.time??time,id=`effect:${r}:${presentation.length}`;presentation.push({id,type:'effect',kind:effect.kind,at:clone(effect.at),team:meta.team??null,time:t+(effect.kind==='bomb'?.12:0),duration:effect.kind==='hit'?.65:effect.kind==='main-blast'?.85:effect.kind==='main'?.65:effect.kind==='torpedo'?.75:effect.kind==='bomb'?.8:effect.kind==='shot'?.35:effect.kind==='fighter'?.22:effect.kind.startsWith('guard')?.5:.12,...(effect.text?{text:effect.text}:{}),...(meta.targetId?{targetId:meta.targetId}:{}),...(meta.position?{position:clone(meta.position)}:{})});if(effect.from)presentation.push({id:`${id}:trace`,type:'projectile',kind:effect.kind,team:meta.team??null,...(meta.sourceId?{sourceId:meta.sourceId}:{}),...(effect.kind==='shot'&&meta.targetId?{targetId:meta.targetId}:{}),from:clone(meta.from??hexToXY(effect.from)),to:clone(meta.to??hexToXY(effect.at)),at:clone(effect.at),start:t,end:t+(effect.kind==='bomb'?.12:effect.kind==='fighter'?.12:.045)});};const act=(s:Ship,action:string,t=time,soundOnly=false)=>presentation.push({id:`action:${r}:${presentation.length}`,type:'action',shipId:s.id,team:s.team,action,at:xyToHex(s.xy),time:t,duration:action==='dead'?DEATH_PRESENTATION_DURATION:.65,...(soundOnly?{soundOnly:true}:{})});let impactTime:number|null=null;const log=(text:string,at:Hex|null,team:number|null=null)=>{events.push({round:r,t:Number(time.toFixed(3)),text,at:at?clone(at):null,team});};const damage=(s:Ship,n:number,reason:string,contributions:Contribution[]|undefined,type:DamageType)=>{if(!alive(s))return;const raw=n;if(!['collision','grounding','environment','status'].includes(type))n=incomingDamage(s,n,r);if(contributions&&raw&&n!==raw)contributions=contributions.map(c=>({...c,amount:c.amount*n/raw}));const hpBefore=s.hp;s.hp=Math.max(0,s.hp-n);combat.damage(s,hpBefore,contributions,type);if(s.hp===0)deaths.set(s.id,impactTime??time);act(s,s.hp===0?'dead':'hit',impactTime??time);showEffect({kind:'hit',at:xyToHex(s.xy),text:`−${n}`},{team:s.team,time:impactTime??time,targetId:s.id,position:s.xy});log(`${s.label} ${reason} −${n}${s.hp===0?' · 沉没':''}`,xyToHex(s.xy),s.team)};const plans:Plans={},motion:Record<string,Motion>={},shots:{at:Hex;damage:number;team:number;sourceId:string;blast?:number;centerMultiplier?:number}[]=[],collisionPairs=new Set(),secShots=new Map<string,Set<string>>(),aaShots=new Set(),guardStops=new Set<string>();
 const secondaryAnimations:SecondaryAnimation[]=[],seenSince=[0,1].map(team=>new Map(input.ships.filter(s=>s.team!==team&&shipVisible(input,s,team)).map(s=>[s.id,-Infinity])));
 const secondaryFire=(s:Ship,target:Ship)=>{
  const start=presentation.length;
  act(s,'fire');showEffect({kind:'shot',from:xyToHex(s.xy),at:xyToHex(target.xy)},{team:s.team,sourceId:s.id,from:s.xy,to:target.xy,targetId:target.id,position:target.xy});
  const detectedAt=seenSince[s.team].get(target.id)??time;
  if(Number.isFinite(detectedAt))secondaryAnimations.push({detectedAt,events:presentation.slice(start)});
 };
 for(const s of g.ships){delete s.guarding;delete s.escorting;}
 for(const s of g.ships.filter(alive)){s.xy=hexToXY(s.pos);plans[s.id]=validPlan(g,s,submitted[s.id]);const p=plans[s.id];motion[s.id]={nodes:route(s,p,g.map,r),stopped:false,visited:[clone(s.pos)],fired:new Set()};}
 const gunDamage=(s:Ship,n:number)=>s.guarding?Math.round(n*(1-(s.cfg.guard?.gunReduction??0))):n;
 const protectiveDamage=(s:Ship,n:number,providers:Ship[])=>Math.round(n*(1-Math.max(s.guarding?(s.cfg.guard?.gunReduction??0):0,...providers.filter(a=>a.id!==s.id&&a.team===s.team&&hexDist(xyToHex(a.xy),xyToHex(s.xy))<=a.cfg.escort!.range).map(a=>a.cfg.escort!.reduction))));
 const escortProviders=()=>g.ships.filter(a=>alive(a)&&a.escorting);
 for(const s of g.ships.filter(alive)){const p=plans[s.id];if(p.escort){s.escorting=true;act(s,'escort',time,true);}for(const kind of ['smoke','radar'] as const)if(p[kind]){act(s,kind,time,true);const cfg=s.cfg[kind]!;g.zones??=[];g.zones.push({kind,team:s.team,center:clone(kind==='smoke'?s.pos:p.radar!),radius:cfg.radius,expires:r+cfg.duration});if(kind==='smoke')s.smokeLeft!--;else s.radarLeft!--;log(`${s.label} ${kind==='smoke'?'释放烟幕':'雷达扫描'}`,kind==='smoke'?s.pos:p.radar!,s.team);}}
 const stopByGuard=(s:Ship,at:Hex)=>{if(guardStops.has(s.id))return;const guard=g.ships.find(a=>alive(a)&&a.guarding&&a.team!==s.team&&hexDist(a.pos,at)<=a.cfg.guard!.range);if(!guard)return;guardStops.add(s.id);showEffect({kind:'guard-stop',at},{team:s.team});log(`${s.label} 被${guard.label}海域封锁截停`,at,s.team);};
 for(const s of g.ships.filter(alive))if(plans[s.id].guard){s.guarding=true;act(s,'guard');showEffect({kind:'guard-start',at:s.pos},{team:s.team});log(`${s.label} 开启海域封锁 · 牺牲全部移动力 · 鱼雷减伤60%`,s.pos,s.team);}
 for(const s of g.ships.filter(alive))stopByGuard(s,s.pos);
 // Stable start: simultaneous sweep, launch artillery/aircraft, then initial torpedoes.
 const sweepKeys=new Set();for(const s of g.ships.filter(alive)){const p=plans[s.id];if(p.sweep){act(s,'sweep');showEffect({kind:'shot',from:xyToHex(s.xy),at:p.sweep},{team:s.team,sourceId:s.id,from:s.xy,to:hexToXY(p.sweep)});sweepKeys.add(key(p.sweep));log(`${s.label} 副炮清雷`,p.sweep,s.team);}if(p.main.length){act(s,s.template==='bb'?'mainFire':'fire');for(const [index,h] of p.main.entries()){shots.push({at:h,damage:outgoingDamage(s,s.cfg.main!.damage,r),team:s.team,sourceId:s.id,...(s.cfg.main!.blast?{blast:s.cfg.main!.blast,centerMultiplier:s.cfg.main!.centerMultiplier}:{})});presentation.push({id:`main:${r}:${s.id}:${index}`,type:'projectile',kind:'main',sourceId:s.id,team:s.team,from:{...s.xy},to:hexToXY(h),at:clone(h),start:index*.08,end:1.1});presentation.push({id:`launch:${r}:${s.id}:${index}`,type:'effect',kind:'launch',team:s.team,at:clone(s.pos),time:index*.08,duration:.09});}s.mainReady=r+s.cfg.main!.reload+1;log(`${s.label} 主炮发射 ${p.main.length} 发`,s.pos,s.team);}for(const order of p.planes){const slot=order.slot??s.airReady.findIndex(n=>n<=r);if(slot<0)break;s.airReady[slot]=Infinity;act(s,'aircraft');const target=g.ships.find(t=>t.id===order.targetId);g.planes.push({id:`p${g.nextId++}`,kind:'plane',team:s.team,mother:s.id,slot,hp:s.airHP[slot],cfg:clone(planeForSlot(s.cfg,slot)),...(order.mode==='patrol'?{patrolRemaining:1}:{}),xy:{...s.xy},mode:order.mode,target:clone(order.mode!=='target'?order.target:target!.pos),targetId:target?.id||null,tracking:order.mode==='target',state:'outbound',traveled:0,waypoints:[]});log(`${s.label} 放飞`,s.pos,s.team);}}
 g.map.mines=g.map.mines.filter(h=>!sweepKeys.has(key(h)));
 for(const p of g.planes){const target=g.ships.find(s=>s.id===p.targetId);p.tracking=!!(target&&alive(target)&&shipVisible(input,input.ships.find(s=>s.id===target.id)??target,p.team));}
 const torpedoWakes:NonNullable<RoundResult['torpedoWakes']>=[],torpedoWakeStarts=new Map(g.torpedoes.map(t=>[t.id,{xy:{...t.xy},time:0}]));
 const syncTorpedoWakes=()=>{for(const t of g.torpedoes)torpedoWakeStarts.set(t.id,{xy:{...t.xy},time});};
 const endTorpedoWake=(t:Torpedo)=>{const start=torpedoWakeStarts.get(t.id);if(start&&length(start.xy,t.xy)>1e-7)torpedoWakes.push({team:t.team,from:{...start.xy},to:{...t.xy},start:start.time,end:time});torpedoWakeStarts.delete(t.id);};
 const launchTorps=(s:Ship,window:number)=>{const m=motion[s.id];if(!m||m.fired.has(window)||!alive(s))return;m.fired.add(window);for(const o of plans[s.id].torps.filter(x=>x.window===window)){if(s.torps<=0)continue;s.torps--;act(s,'torpedo');g.torpedoes.push({id:`t${g.nextId++}`,kind:'torpedo',team:s.team,owner:s.id,xy:{...s.xy},heading:o.dir,age:0,launched:r,birth:time,armed:false,cfg:{...clone(s.cfg.torpedo!),damage:outgoingDamage(s,s.cfg.torpedo!.damage,r)}});torpedoWakeStarts.set(g.torpedoes.at(-1)!.id,{xy:{...s.xy},time});log(`${s.label} 发射鱼雷`,xyToHex(s.xy),s.team);}};
 g.ships.filter(alive).forEach(s=>launchTorps(s,0));
 const returnPlane=(p:Plane)=>{p.state='return';p.waypoints=[];};
 const applyAA=()=>{const pending:[Plane,number,Ship][]=[];for(const p of g.planes.filter(alive))for(const s of g.ships.filter(s=>alive(s)&&s.team!==p.team&&s.cfg.aa)){
 const layers=[s.cfg.aa!,...(s.cfg.aa!.inner?[s.cfg.aa!.inner]:[])];layers.forEach((layer,i)=>{const k=`${s.id}:${p.id}:${i}`;if(!aaShots.has(k)&&hexDist(xyToHex(s.xy),xyToHex(p.xy))<=layer.range){aaShots.add(k);pending.push([p,incomingDamage(p,outgoingDamage(s,layer.damage,r),r),s]);}});
 }for(const [p,n,s]of pending){const wasAlive=alive(p);p.hp=Math.max(0,p.hp-n);if(wasAlive&&!alive(p))combat.shotDown(s.id);showEffect({kind:'aa',from:xyToHex(s.xy),at:xyToHex(p.xy)},{team:s.team,from:s.xy,to:p.xy});showEffect({kind:'hit',at:xyToHex(p.xy),text:`−${n}`},{team:p.team});if(!p.hp)log(`${s.label} 击落敌机`,xyToHex(p.xy),s.team);}};
 const airCombat=()=>{const hits:[Plane,Plane][]=[];for(const p of g.planes.filter(p=>alive(p)&&p.cfg.attack&&p.state!=='return'&&p.attackRound!==r)){
 const target=g.planes.filter(t=>alive(t)&&t.team!==p.team&&hexDist(xyToHex(t.xy),xyToHex(p.xy))<=p.cfg.attack!.range).sort((a,b)=>length(p.xy,a.xy)-length(p.xy,b.xy)||a.id.localeCompare(b.id))[0];
 if(target){p.attackRound=r;hits.push([p,target]);}}
 for(const [p,t]of hits){const wasAlive=alive(t);t.hp=Math.max(0,t.hp-incomingDamage(t,outgoingDamage(p,p.cfg.attack!.damage,r),r));if(wasAlive&&!alive(t))combat.shotDown(p.mother);showEffect({kind:'fighter',from:xyToHex(p.xy),at:xyToHex(t.xy)},{team:p.team,from:p.xy,to:t.xy});}
 };
 const contacts=()=>{applyAA();airCombat(); // Aircraft hit resolution must never precede AA at the same instant.
  const hits:[Ship,number,string,string][]=[];for(const p of g.planes.filter(alive)){if(p.state==='return'||p.cfg.damage<=0)continue;const h=xyToHex(p.xy);const target=g.ships.filter(s=>alive(s)&&s.team!==p.team&&same(xyToHex(s.xy),h)&&(p.mode!=='target'||s.id===p.targetId)).sort((a,b)=>a.id.localeCompare(b.id))[0];if(target){showEffect({kind:'bomb',from:h,at:xyToHex(target.xy)},{team:p.team,from:p.xy,to:target.xy,targetId:target.id,position:target.xy});hits.push([target,outgoingDamage(p,p.cfg.damage,r),'遭航空炸弹命中',p.mother]);returnPlane(p);}}
  const providers=escortProviders();for(const [s,n,why,sourceId]of hits){const reduction=Math.max(0,...providers.filter(a=>a.id!==s.id&&a.team===s.team&&hexDist(xyToHex(a.xy),xyToHex(s.xy))<=a.cfg.escort!.range).map(a=>a.cfg.escort!.reduction));const amount=Math.round(n*(1-reduction));damage(s,amount,why,[{sourceId,amount}],'air');}
  const deadT=new Set();for(const torp of g.torpedoes){const h=xyToHex(torp.xy),owner=g.ships.find(s=>s.id===torp.owner);if(!torp.armed&&(!owner||!same(h,xyToHex(owner.xy))))torp.armed=true;if(!inBounds(h,g.map)||g.map.islands.includes(key(h))){deadT.add(torp.id);endTorpedoWake(torp);continue;}if(!torp.armed)continue;const s=g.ships.filter(s=>alive(s)&&same(xyToHex(s.xy),h)).sort((a,b)=>a.id.localeCompare(b.id))[0];if(s){const amount=s.guarding?Math.round(torp.cfg.damage*(1-s.cfg.guard!.torpedoReduction)):torp.cfg.damage;if(s.guarding)showEffect({kind:'guard-block',at:h},{team:s.team});showEffect({kind:'torpedo',at:h},{team:s.team,targetId:s.id,position:s.xy});damage(s,amount,'遭鱼雷命中'+(s.guarding?'（封锁减伤60%）':''),[{sourceId:torp.owner,amount}],'torpedo');deadT.add(torp.id);endTorpedoWake(torp);}}
  g.torpedoes=g.torpedoes.filter(p=>!deadT.has(p.id));
  for(const mine of [...g.map.mines]){const targets=g.ships.filter(s=>alive(s)&&same(xyToHex(s.xy),mine)).sort((a,b)=>Number(!!b.cfg.contactSweep)-Number(!!a.cfg.contactSweep)||a.id.localeCompare(b.id));if(targets.length&&(targets[0].cfg.contactSweep||(mine.armedRound??0)<=r)){const s=targets[0];g.map.mines=g.map.mines.filter(m=>!same(m,mine));if(s.cfg.contactSweep)log(`${s.label} 接触排雷`,mine,s.team);else {showEffect({kind:'torpedo',at:xyToHex(s.xy)},{team:s.team,targetId:s.id,position:s.xy});damage(s,mine.damage??RULES.mineDamage,'触雷',mine.sourceId?[{sourceId:mine.sourceId,amount:mine.damage??RULES.mineDamage}]:undefined,mine.sourceId?'mine':'environment');}}}
  const visibility=[visibleCells(g,0),visibleCells(g,1)],secondaryHits:[Ship,number,Ship][]=[];
  for(const team of [0,1])for(const target of g.ships.filter(s=>s.team!==team)){
   if(alive(target)&&shipVisible(g,target,team,visibility[team])){if(!seenSince[team].has(target.id))seenSince[team].set(target.id,time);}
   else seenSince[team].delete(target.id);
  }
  for(const s of g.ships.filter(s=>alive(s)&&s.cfg.secondary&&!s.cfg.secondary.advanceSalvo&&!plans[s.id]?.sweep&&!plans[s.id]?.radar)){const fired=secShots.get(s.id)||new Set(),cfg=s.cfg.secondary!;const cap=cfg.targets??(cfg.multi?Infinity:1);if(fired.size>=cap)continue;const sh=xyToHex(s.xy),targets=g.ships.filter(t=>alive(t)&&t.team!==s.team&&!fired.has(t.id)&&shipVisible(g,t,s.team,visibility[s.team])&&hexDist(sh,xyToHex(t.xy))<=cfg.range&&hasLOS(g.map,sh,xyToHex(t.xy))).sort((a,b)=>hexDist(sh,xyToHex(a.xy))-hexDist(sh,xyToHex(b.xy))||a.id.localeCompare(b.id));for(const target of targets.slice(0,cap-fired.size)){fired.add(target.id);secondaryHits.push([target,gunDamage(target,outgoingDamage(s,cfg.damage,r)),s]);}secShots.set(s.id,fired);}for(const[t,n,s]of secondaryHits){secondaryFire(s,t);damage(t,n,`遭${s.label}副炮命中`,[{sourceId:s.id,amount:n}],'secondary');}
 };
 contacts();updateExploration(g);frames.push(frame(g,0,effects,deaths));syncTorpedoWakes();
 for(let tick=1;tick<=RULES.ticks;tick++){const prev=(tick-1)/RULES.ticks;time=tick/RULES.ticks;const dt=time-prev,candidates=new Map<string,XY>(),old=new Map<string,XY>();
  for(const s of g.ships.filter(alive)){old.set(s.id,{...s.xy});const m=motion[s.id];if(m.stopped||guardStops.has(s.id)){candidates.set(s.id,{...s.xy});continue;}const progress=time*effectiveSpeed(s,r),i=Math.min(Math.floor(progress+1e-9),effectiveSpeed(s,r)),f=progress-i;const a=m.nodes[Math.min(i,m.nodes.length-1)],b=m.nodes[Math.min(i+1,m.nodes.length-1)];s.heading=(f>1e-9?b:a).heading;candidates.set(s.id,lerp(hexToXY(a.pos),hexToXY(b.pos),f));}
  // Swept circles avoid tunneling, including late impacts against stopped ships.
  const collisionHits:[Ship,number,string][]=[],ships=g.ships.filter(alive),targets=new Map(candidates);let cursor=0,passes=0;
  while(passes++<ships.length*ships.length){
   const positionAt=(s:Ship,t:number):XY=>(motion[s.id].stopped||guardStops.has(s.id))?candidates.get(s.id)!:lerp(old.get(s.id)!,targets.get(s.id)!,t),collisions=[];
   for(let i=0;i<ships.length;i++)for(let j=i+1;j<ships.length;j++){
    const a=ships[i],b=ships[j],pair=[a.id,b.id].sort().join('|');if(collisionPairs.has(pair))continue;
    const local=collisionFraction(positionAt(a,cursor),positionAt(a,1),positionAt(b,cursor),positionAt(b,1),collisionRadius(a)+collisionRadius(b));
    if(local!==null)collisions.push({a,b,t:cursor+(1-cursor)*local,pair});
   }
   collisions.sort((a,b)=>a.t-b.t||a.pair.localeCompare(b.pair));if(!collisions.length)break;
   const first=collisions[0].t,group=collisions.filter(c=>Math.abs(c.t-first)<1e-7),points=new Map<string,XY>();
   for(const c of group)for(const ship of [c.a,c.b])if(!points.has(ship.id))points.set(ship.id,{...positionAt(ship,first)});
   for(const c of group){collisionPairs.add(c.pair);collisionHits.push([c.a,c.b.cfg.collision,c.b.id],[c.b,c.a.cfg.collision,c.a.id]);}
   for(const [id,p] of points){candidates.set(id,p);motion[id].stopped=true;}
   cursor=first;
  }
  const minePlacements:{ship:Ship;at:Hex}[]=[];for(const s of ships){s.xy=candidates.get(s.id)!;const m=motion[s.id];if(!m.stopped&&!guardStops.has(s.id)){const count=Math.floor(time*effectiveSpeed(s,r)+1e-8),was=Math.floor(prev*effectiveSpeed(s,r)+1e-8);for(let i=was+1;i<=count&&i<m.nodes.length;i++){m.visited.push(clone(m.nodes[i].pos));if(plans[s.id].mineSteps?.includes(i)&&!same(m.nodes[i-1].pos,m.nodes[i].pos))minePlacements.push({ship:s,at:m.nodes[i-1].pos});launchTorps(s,i);stopByGuard(s,m.nodes[i].pos);if(guardStops.has(s.id))break;}}}
  minePlacements.sort((a,b)=>(a.ship.team===r%2?-1:1)-(b.ship.team===r%2?-1:1)||a.ship.id.localeCompare(b.ship.id));
  for(const {ship:s,at}of minePlacements)if((s.minesLeft??0)>0&&!g.map.mines.some(m=>same(m,at))){g.map.mines.push({...at,armedRound:r+1,sourceId:s.id,team:s.team,damage:outgoingDamage(s,s.cfg.minelayer!.damage,r)});s.minesLeft!--;act(s,'mine',time,true);log(`${s.label} 布设水雷（下一回合武装）`,at,s.team);}
  for(const t of g.torpedoes){if(t.birth===time&&t.launched===r)continue;const v=hexToXY({q:DIRS[t.heading][0],r:DIRS[t.heading][1]});t.xy.x+=v.x*t.cfg.speed*dt;t.xy.y+=v.y*t.cfg.speed*dt;t.age+=dt;}
  for(const p of g.planes.filter(alive)){const mother=g.ships.find(s=>s.id===p.mother);if(p.state==='return'&&(!mother||!alive(mother))){p.hp=0;log('返航飞机失去母舰',xyToHex(p.xy),p.team);continue;}let target;
   if(p.state==='return')target=mother!.xy;else if(p.mode==='target'){const s=g.ships.find(s=>s.id===p.targetId);if(!s||!alive(s)){returnPlane(p);target=mother?.xy||p.xy;}else{if(!p.tracking&&shipVisible(g,s,p.team))p.tracking=true;if(p.tracking)p.target=xyToHex(s.xy);target=p.tracking?s.xy:hexToXY(p.target);}}else target=hexToXY(p.target);
   const atPatrol=p.state==='outbound'&&p.mode==='patrol'&&length(p.xy,target)<1e-7;if(atPatrol)p.patrolRemaining=Math.max(0,(p.patrolRemaining??1)-dt);
   const before={...p.xy},budget=p.state==='outbound'?Math.max(0,p.cfg.range-p.traveled):Infinity,step=Math.min(effectiveSpeed(p,r)*dt,budget)*Math.sqrt(3);p.xy=toward(p.xy,target,step);if(p.state==='outbound')p.traveled+=length(before,p.xy)/Math.sqrt(3);
  }
  applyAA();airCombat();for(const [s,n,sourceId] of collisionHits)damage(s,n,'发生碰撞',[{sourceId,amount:n}],'collision');contacts();
  for(const p of g.planes.filter(alive)){const mother=g.ships.find(s=>s.id===p.mother);if(p.state==='outbound'&&((p.mode==='patrol'&&length(p.xy,hexToXY(p.target))<1e-7)?(p.patrolRemaining??1)<=1e-8:(p.traveled>=p.cfg.range-1e-8||p.mode==='point'&&length(p.xy,hexToXY(p.target))<1e-7||p.mode==='target'&&!p.tracking&&length(p.xy,hexToXY(p.target))<1e-7)))returnPlane(p);if(p.state==='return'&&mother&&alive(mother)&&length(p.xy,mother.xy)<.12){mother.airReady[p.slot]=r+(p.cfg.rearm??mother.cfg.carrier!.rearm)+1;mother.airHP[p.slot]=p.hp;p.hp=0;clearStatuses(p);p.recovered=true;log(`${mother.label} 回收飞机`,xyToHex(mother.xy),p.team);}}
  for(const p of g.planes.filter(p=>!alive(p)&&!p.accounted)){const m=g.ships.find(s=>s.id===p.mother);if(m&&!p.recovered)m.destroyedPlanes++;p.accounted=true;}
  g.planes=g.planes.filter(alive);g.torpedoes=g.torpedoes.filter(t=>{if(t.age<t.cfg.life-1e-8)return true;endTorpedoWake(t);return false;});
  updateExploration(g);if(tick%8===0){frames.push(frame(g,time,effects,deaths));syncTorpedoWakes();}
 }
 // Delayed secondary resolves from completed forward nodes, before committed main shells.
 const delayed:[Ship,Ship,number][]=[];for(const s of g.ships.filter(s=>alive(s)&&s.cfg.secondary?.advanceSalvo&&!plans[s.id].sweep)){
 const cfg=s.cfg.secondary!,at=xyToHex(s.xy),target=g.ships.filter(t=>alive(t)&&t.team!==s.team&&shipVisible(g,t,s.team)&&hexDist(at,xyToHex(t.xy))<=cfg.range&&hasLOS(g.map,at,xyToHex(t.xy))).sort((a,b)=>hexDist(at,xyToHex(a.xy))-hexDist(at,xyToHex(b.xy))||a.id.localeCompare(b.id))[0];
 const moved=motion[s.id].visited.slice(1).filter((h,i)=>!same(h,motion[s.id].visited[i])).length;
 if(target)for(let n=0;n<(moved>=2?2:1);n++)delayed.push([s,target,gunDamage(target,outgoingDamage(s,cfg.damage,r))]);
 }for(const [s,t,n]of delayed){secondaryFire(s,t);damage(t,n,`遭${s.label}副炮命中`,[{sourceId:s.id,amount:n}],'secondary');}
 // All committed shells arrive even if their firing ship has sunk.
 impactTime=1.1;const mainHits=new Map<string,number>(),mainSources=new Map<string,Contribution[]>(),providers=escortProviders();for(const shot of shots){const struck=g.ships.filter(s=>alive(s)&&hexDist(xyToHex(s.xy),shot.at)<=(shot.blast??0));const center=struck.find(s=>same(xyToHex(s.xy),shot.at));showEffect({kind:shot.blast?'main-blast':'main',at:shot.at},{time:1.1,team:shot.team,...(center?{targetId:center.id,position:center.xy}:{})});for(const s of struck){if(s!==center)showEffect({kind:'main',at:xyToHex(s.xy)},{time:1.1,team:s.team,targetId:s.id,position:s.xy});const amount=protectiveDamage(s,shot.damage*(same(xyToHex(s.xy),shot.at)?shot.centerMultiplier??1:1),providers);mainHits.set(s.id,(mainHits.get(s.id)||0)+amount);if(!mainSources.has(s.id))mainSources.set(s.id,[]);mainSources.get(s.id)!.push({sourceId:shot.sourceId,amount});}}for(const[id,n]of mainHits)damage(g.ships.find(s=>s.id===id)!,n,'遭主炮命中',mainSources.get(id),'main');
 const occupied=new Set();const stopped=g.ships.filter(s=>alive(s)&&motion[s.id].stopped);for(const s of g.ships.filter(s=>alive(s)&&!motion[s.id].stopped)){s.pos=xyToHex(s.xy);s.xy=hexToXY(s.pos);occupied.add(key(s.pos));}
 // Alternating initiative is reproducible and shares rollback priority between teams.
 stopped.sort((a,b)=>(a.team===r%2?-1:1)-(b.team===r%2?-1:1)||a.id.localeCompare(b.id));for(const s of stopped){const candidates=[...motion[s.id].visited].reverse();const h=candidates.find(h=>legal(g.map,h)&&!occupied.has(key(h)));if(h){s.pos=clone(h);s.xy=hexToXY(h);occupied.add(key(h));log(`${s.label} 沿原路回退`,h,s.team);}else{damage(s,s.hp,'碰撞搁浅',undefined,'grounding');}}
 // Snapshot all periodic effects before damage so neither side wins traversal priority.
 const statusTicks=[...g.ships,...g.planes].filter(alive).map(unit=>({unit,ticks:periodicStatusEffects(unit,r)}));
 for(const {unit,ticks}of statusTicks){const amount=ticks.reduce((n,t)=>n+t.damage,0);if(!amount)continue;
  const sources=ticks.filter(t=>t.damage>0).map(t=>({sourceId:t.source?.shipId??t.source?.unitId??null,amount:t.damage}));
  if(unit.kind==='ship')damage(unit,amount,'受到持续伤害',sources,'status');
  else {const hpBefore=unit.hp;unit.hp=Math.max(0,unit.hp-amount);showEffect({kind:'hit',at:xyToHex(unit.xy),text:`−${hpBefore-unit.hp}`},{team:unit.team,time:1.1});if(!unit.hp){const source=sources.slice().sort((a,b)=>b.amount-a.amount||String(a.sourceId).localeCompare(String(b.sourceId)))[0];const owner=g.ships.find(s=>s.id===source?.sourceId);if(owner&&owner.team!==unit.team)combat.shotDown(owner.id);}}
 }
 for(const {unit,ticks}of statusTicks)if(alive(unit)){const heal=ticks.reduce((n,t)=>n+t.heal,0);if(heal){const before=unit.hp;unit.hp=Math.min(unit.cfg.hp,unit.hp+heal);if(unit.hp>before)log(`${unit.kind==='ship'?unit.label:'飞机'} 状态治疗 +${unit.hp-before}`,xyToHex(unit.xy),unit.team);}}
 for(const s of g.ships)if(!alive(s))clearStatuses(s);
 for(const p of g.planes)if(!alive(p)){clearStatuses(p);if(!p.accounted&&!p.recovered){const mother=g.ships.find(s=>s.id===p.mother);if(mother)mother.destroyedPlanes++;p.accounted=true;}}
 for(const p of g.planes){const mother=g.ships.find(s=>s.id===p.mother);if(p.state==='return'&&(!mother||!alive(mother))){p.hp=0;if(mother&&!p.accounted)mother.destroyedPlanes++;p.accounted=true;log('返航飞机失去母舰',xyToHex(p.xy),p.team);}}
 g.planes=g.planes.filter(alive);
 for(const p of g.planes){const t=g.ships.find(s=>s.id===p.targetId);if(t&&p.tracking)p.target=clone(xyToHex(t.xy));p.tracking=false;}
 for(const s of g.ships.filter(alive))if(s.cfg.carrier)for(let i=0;i<s.airReady.length;i++)if(s.airReady[i]===r+1)s.airHP[i]=Math.min(planeForSlot(s.cfg,i).hp,s.airHP[i]+(s.cfg.carrier!.heal??1));
 if(options.termination!=='mission')settleDomination(g,input.ships);
 updateExploration(g);frames.push(frame(g,1.1,effects,deaths));scheduleSecondaryAnimations(frames,secondaryAnimations);const visualEnd=Math.max(1.1,...presentation.filter(e=>e.type==='effect'||e.type==='action'&&e.action==='dead').map(e=>e.time!+e.duration!));for(let tail=1.2;tail<visualEnd+.1;tail+=.1)frames.push(frame(g,Number(tail.toFixed(2)),[],deaths));for(const s of g.ships){delete s.guarding;delete s.escorting;}g.log=[...g.log,...events].slice(-300);const counts=[0,1].map(team=>{const ss=g.ships.filter(s=>s.team===team&&alive(s));return{count:ss.length,hp:ss.reduce((n,s)=>n+s.hp,0)}});const winner=options.termination==='mission'?null:g.domination?dominationWinner(g,counts):(!counts[0].count||!counts[1].count||r>=RULES.roundLimit)?(counts[0].count===counts[1].count?(counts[0].hp===counts[1].hp?'draw':counts[0].hp>counts[1].hp?0:1):counts[0].count>counts[1].count?0:1):null;for(const unit of [...g.ships,...g.planes])expireStatuses(unit,r);if(winner!==null){g.winner=winner;g.phase='ended';}else{g.round++;g.phase='plan';if(g.zones)g.zones=g.zones.filter(z=>z.expires>g.round);}return{game:g,frames,events,counts,presentation,...(torpedoWakes.length?{torpedoWakes}:{}),combatStats:combat.stats};}
function navigationDistances(map:GameMap,goal:Hex,range=0,within=false){const distances=new Map<string,number>(),queue:{h:Hex;d:number}[]=[];const k=(h:Hex,d:number)=>`${key(h)}:${d}`;for(const h of allHexes(map))if(legal(map,h)&&(within?hexDist(h,goal)<=range:hexDist(h,goal)===range&&hasLOS(map,h,goal)))for(let d=0;d<6;d++){distances.set(k(h,d),0);queue.push({h,d});}if(!queue.length)for(let d=0;d<6;d++){distances.set(k(goal,d),0);queue.push({h:goal,d});}for(let i=0;i<queue.length;i++){const {h,d}=queue[i],cost=distances.get(k(h,d))!+1;for(const turn of[-1,0,1])for(const forward of[true,false]){const previous=forward?add(h,mod(d+3)):h,hd=mod(d-turn),id=k(previous,hd);if(legal(map,previous)&&!distances.has(id)){distances.set(id,cost);queue.push({h:previous,d:hd});}}}return distances;}
// Preserve the original search pattern while fitting maps of other sizes.
const searchHex=(c:number,r:number,map:MapSize)=>fromCR(Math.round(c*(map.width-1)/(W-1)),Math.round(r*(map.height-1)/(H-1)));
export function planAI(game:Observation,team:number):Plans{const v=observe(game,team),friends=v.ships.filter(s=>s.team===team),enemies=v.ships.filter(s=>s.team!==team),plans:Plans={},reserved:Hex[]=[],assignments=new Map<string,number>();for(const s of friends.sort((a,b)=>effectiveSpeed(b,v.round)-effectiveSpeed(a,v.round)||a.id.localeCompare(b.id))){const p=emptyPlan();let at=clone(s.pos),heading=s.heading;const preferred=s.cfg.carrier?7:s.cfg.main?6:s.cfg.secondary?.range||2;const target=enemies.slice().sort((a,b)=>hexDist(at,a.pos)-hexDist(at,b.pos)||a.id.localeCompare(b.id))[0];const searchPoints=team===0?[[16,12],[14,5],[9,2],[3,6]]:[[2,12],[4,5],[9,2],[15,6]],search=searchPoints[Math.floor((v.round-1)/5)%searchPoints.length],legacyGoal=target?.pos||searchHex(search[0],Math.min(14,search[1]+Number(s.id.split('-')[1])%3),v.map);
 const objectives=v.domination?.points,available=objectives?.filter(p=>p.owner!==team||p.contested);
 const candidates=available?.length?available:objectives;
 const objective=candidates?.slice().sort((a,b)=>{
  const score=(point:typeof a)=>hexDist(s.pos,point.center)+(assignments.get(point.id)??0)*5-(point.progressTeam===team&&hexDist(s.pos,point.center)<=point.radius?12:0);
  return score(a)-score(b)||a.id.localeCompare(b.id);
 })[0];
 if(objective)assignments.set(objective.id,(assignments.get(objective.id)??0)+1);
 const goal=objective?.center??legacyGoal,navigation=navigationDistances(v.map,goal,objective?objective.radius:target?preferred:0,!!objective);
 for(let n=0;n<effectiveSpeed(s,v.round);n++){let best:{turn:number;forward:boolean;h:Hex;hd:number;score:number}|null=null;for(const turn of[-1,0,1])for(const forward of[true,false]){const hd=mod(heading+turn),h=forward?add(at,hd):at;if(!legal(v.map,h))continue;let score=-(navigation.get(`${key(h)}:${hd}`)??100)*2.5+(forward?.1:0)-Math.abs(turn)*.06;if(v.map.mines.some(m=>same(m,h))&&!s.cfg.contactSweep)score-=12;for(const f of friends)if(f.id!==s.id&&hexDist(h,f.pos)<1)score-=10;for(const r of reserved)if(hexDist(h,r)<1)score-=15;for(const torp of v.torpedoes){const th=xyToHex(torp.xy);for(let k=0;k<3;k++)if(same(h,{q:th.q+DIRS[torp.heading][0]*k,r:th.r+DIRS[torp.heading][1]*k}))score-=8;}if(!best||score>best.score)best={turn,forward,h,hd,score};}if(!best)break;p.moves.push({turn:best.turn,forward:best.forward});at=best.h;heading=best.hd;}if(s.cfg.guard&&target&&hexDist(s.pos,target.pos)<=2){p.guard=true;p.moves=[];at=clone(s.pos);}
 reserved.push(at);const nodes=route(s,p,v.map,v.round);if(s.cfg.torpedo&&s.torps&&enemies.length){const options=[];for(let w=0;w<nodes.length;w++)for(let d=0;d<6;d++){if([nodes[w].heading,mod(nodes[w].heading+3)].includes(d))continue;let h=nodes[w].pos,score=0;for(let k=1;k<=10;k++){h=add(h,d);if(!legal(v.map,h))break;if(friends.some(f=>f.id!==s.id&&same(f.pos,h)))score-=20;for(const enemy of enemies){if(same(enemy.pos,h))score+=12/(1+k*.1);const prediction=add(enemy.pos,enemy.heading);if(same(prediction,h))score+=6;}}if(score>3)options.push({window:w,dir:d,score});}options.sort((a,b)=>b.score-a.score);for(const o of options)if((p.torps.filter(t=>t.window===o.window).length<(s.cfg.torpedo!.perWindow??1)&&!p.torps.some(t=>t.window===o.window&&t.dir===o.dir))&&p.torps.length<Math.min(s.torps,s.cfg.torpedo!.max))p.torps.push(o);}
 if(s.cfg.main&&s.mainReady<=v.round){const targets=enemies.filter(e=>hexDist(s.pos,e.pos)<=s.cfg.main!.range);if(targets.length){const e=targets.sort((a,b)=>a.hp-b.hp)[0],pred=add(e.pos,e.heading);p.main=[clone(e.pos),clone(legal(v.map,pred)&&hexDist(s.pos,pred)<=s.cfg.main!.range?pred:e.pos),clone(e.pos)].slice(0,s.cfg.main.shots);}}
 if(s.cfg.carrier){const slots=s.airReady.map((n,i)=>({n,i})).filter(x=>x.n<=v.round).sort((a,b)=>s.airHP[b.i]-s.airHP[a.i]||a.i-b.i).slice(0,s.cfg.carrier.launch);for(const {i}of slots){const cfg=planeForSlot(s.cfg,i),extra=game.ruleset?{slot:i}:{};
 if(cfg.role==='fighter'||cfg.role==='scout'){const candidate=target?.pos??goal;const point=allHexes(v.map).filter(h=>length(hexToXY(s.pos),hexToXY(h))/Math.sqrt(3)<=cfg.range).sort((a,b)=>hexDist(a,candidate)-hexDist(b,candidate))[0];p.planes.push({...extra,mode:cfg.role==='fighter'?'patrol':'point',target:point});}
 else if(target)p.planes.push({...extra,mode:'target',targetId:target.id});else p.planes.push({...extra,mode:'point',target:searchHex(team===0?13:5,5+(Number(s.id.split('-')[1])+i*3)%8,v.map)});}}
 if(s.cfg.smoke&&(s.smokeLeft??0)>0&&target&&hexDist(s.pos,target.pos)<=5&&s.hp<s.cfg.hp*.7){p.smoke=true;p.torps=[];}
 if(s.cfg.escort&&target&&friends.some(f=>f.id!==s.id&&hexDist(s.pos,f.pos)<=2)){p.escort=true;p.moves=p.moves.slice(0,s.cfg.escort.steps);}
 if(s.cfg.radar&&(s.radarLeft??0)>0){const at=target?.pos??add(s.pos,s.heading);if(hexDist(s.pos,at)<=s.cfg.radar.range&&inBounds(at,v.map)&&!activeZones(game).some(z=>z.kind==='radar'&&z.team===team&&hexDist(at,z.center)<=z.radius))p.radar=clone(at);}
 if(s.cfg.minelayer&&(s.minesLeft??0)>0&&target&&hexDist(s.pos,target.pos)<=6)p.mineSteps=nodes.slice(1).flatMap((n,i)=>same(n.pos,nodes[i].pos)||v.map.mines.some(m=>same(m,nodes[i].pos))?[]:[i+1]).slice(0,Math.min(s.minesLeft??0,s.cfg.minelayer.max));
 if(s.cfg.secondary){const mine=v.map.mines.find(m=>hexDist(s.pos,m)<=s.cfg.secondary!.range&&hasLOS(v.map,s.pos,m)&&nodes.some(n=>hexDist(n.pos,m)<=1));if(mine&&!s.cfg.contactSweep)p.sweep=clone(mine);}plans[s.id]=validPlan(game.ruleset?v:game,s,p);}return plans;}
