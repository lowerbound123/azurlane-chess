import {effectiveSpeed,projectStatuses} from '../shared/status.ts';
import type {Game,Hex,XY,Ship,FrameShip,Plane,Torpedo,RoundResult,Plans} from '../shared/game.ts';
import type {ClientShip,ClientFlying,ClientGame,ClientResult} from '../shared/network.ts';
import {Value} from 'typebox/value';
import schemas from '../shared/contracts.generated.json' with {type:'json'};
import Type from 'typebox';
import type {SubmittedPlans} from '../shared/network.ts';
const SubmittedPlansSchema=Type.Unsafe<SubmittedPlans>(schemas.SubmittedPlans);
import {SHIP_DEFINITIONS} from '../src/ship-definitions.ts';
import * as E from '../src/engine.ts';
import { sampleBattleVisuals } from '../src/battle-visuals.ts';

const copy = E.clone;
const point = (p:Hex) => ({ q: p.q, r: p.r });
const xy = (p:XY) => ({ x: p.x, y: p.y });
const seen = (unit:{xy:XY}, visible:Set<string>) => visible.has(E.key(E.xyToHex(unit.xy)));
function publicCfg(ship:FrameShip):ClientShip['cfg'] {
  const cfg:ClientShip['cfg'] = copy(ship.catalogId&&SHIP_DEFINITIONS[ship.catalogId]?SHIP_DEFINITIONS[ship.catalogId]:{...E.TEMPLATES[ship.template],radius:E.RULES.shipRadius});
  cfg.radius = E.RULES.shipRadius;
  if (cfg.torpedo) delete cfg.torpedo.reserve;
  return cfg;
}
function shipView(ship:FrameShip|Ship, team:number,knownIds:Set<string>):ClientShip {
  const out:ClientShip = { id: ship.id, kind: 'ship', team: ship.team, label: ship.label, template: ship.template,
    cfg: ship.team === team ? copy(ship.cfg) : publicCfg(ship), hp: ship.hp,
    pos: point(ship.pos || E.xyToHex(ship.xy)), xy: xy(ship.xy), heading: ship.heading,...(ship.guarding?{guarding:true}:{}),...(ship.escorting?{escorting:true}:{}),...(ship.catalogId?{catalogId:ship.catalogId}:{}) };
  if(ship.statuses?.length)out.statuses=projectStatuses(ship.statuses,knownIds);
  if (ship.team === team) {
    if('torps' in ship){for(const k of ['minesLeft','smokeLeft','radarLeft'] as const)if(ship[k]!==undefined)out[k]=ship[k];out.torps=ship.torps;out.mainReady=ship.mainReady;out.airHP=copy(ship.airHP);out.destroyedPlanes=ship.destroyedPlanes;out.airReady=ship.airReady.map(n=>n===Infinity?null:n);}
  }
  return out;
}
function flyingView(unit:Plane|Torpedo, kind:'plane'|'torpedo', team:number,knownIds:Set<string>):ClientFlying {
  // Enemy ownership and all flight targets/waypoints remain private.
  const out:ClientFlying = {cfg:{}, id: unit.id, kind, team: unit.team, xy: xy(unit.xy) };
  if(unit.kind==='plane'&&unit.statuses?.length)out.statuses=projectStatuses(unit.statuses,knownIds);
  if('hp' in unit){out.hp=unit.hp;out.state=unit.state;}if('heading' in unit)out.heading=unit.heading;
  if ('mother' in unit && unit.team === team) {
    if (Number.isFinite(unit.traveled)) out.traveled = unit.traveled;
    if (typeof unit.mother === 'string') out.mother = unit.mother;
    if (Number.isInteger(unit.slot)) out.slot = unit.slot;if(unit.cfg.role){out.mode=unit.mode;out.target=point(unit.target);out.targetId=unit.targetId;}if(unit.patrolRemaining!==undefined)out.patrolRemaining=unit.patrolRemaining;if(unit.attackRound!==undefined)out.attackRound=unit.attackRound;
  }
  out.cfg={};for(const k of ['hp','speed','vision','range','damage','role','rearm','attack','life'] as const)if(k in unit.cfg)Object.assign(out.cfg,{[k]:copy(Reflect.get(unit.cfg,k))});if(unit.kind==='torpedo'){delete out.cfg.reserve;delete out.cfg.max;}
  return out;
}
const mineView=(m:Game['map']['mines'][number])=>({...point(m),...(m.armedRound!==undefined?{armedRound:m.armedRound}:{})});
function zoneView(zones:NonNullable<Game['zones']>,team:number,visible:Set<string>,map:Game['map']){return zones.flatMap(z=>z.team===team?[copy(z)]:z.kind==='smoke'?E.allHexes(map).filter(h=>visible.has(E.key(h))&&E.hexDist(h,z.center)<=z.radius).map(h=>({...z,center:h,radius:0})):[]);}
export function playerView(game:Game, team:number):ClientGame {
  const visible = E.visibleCells(game, team), explored = new Set(game.explored?.[team] || visible);
  const visibleShips=game.ships.filter(s=>game.phase==='ended'||s.team===team||E.alive(s)&&E.shipVisible(game,s,team,visible)),visiblePlanes=game.planes.filter(p=>p.team===team||seen(p,visible));
  const knownIds=new Set([...visibleShips,...visiblePlanes].map(u=>u.id));
  const ownExplored:string[][] = [[], []]; ownExplored[team] = [...explored];
  return { ...(game.battleMode?{battleMode:game.battleMode}:{}),...(game.domination?{domination:copy(game.domination)}:{}),...(game.ruleset?{ruleset:game.ruleset,zones:zoneView(E.activeZones(game),team,visible,game.map)}:{}),round: game.round, phase: game.phase, nextId: 0, winner: game.winner, log: [],
    visible: [...visible], explored: ownExplored,
    map: { width: game.map.width, height: game.map.height, islands: game.map.islands.filter(k => explored.has(k)), mines: game.map.mines.filter(m=>explored.has(E.key(m))).map(mineView) },
    ships: visibleShips.map(s => shipView(s, team,knownIds)),
    planes: visiblePlanes.map(p => flyingView(p, 'plane', team,knownIds)),
    torpedoes: game.torpedoes.filter(p => E.torpedoVisible(p, team, visible, explored)).map(p => flyingView(p, 'torpedo', team,knownIds)) };
}

// Exact interval union of segment intersections with visible hex footprints.
// A gap means interpolation could display a unit inside concealed fog.
function safeSegment(a:XY, b:XY, visible:Iterable<string>) {
  const ranges:number[][] = [], normals = Array.from({ length: 6 }, (_, i) => ({ x: Math.cos(i * Math.PI / 3), y: Math.sin(i * Math.PI / 3) }));
  for (const k of visible) {
    const [q, r] = k.split(',').map(Number), c = E.hexToXY({ q, r }); let lo = 0, hi = 1;
    for (const n of normals) {
      const start = (a.x - c.x) * n.x + (a.y - c.y) * n.y, delta = (b.x - a.x) * n.x + (b.y - a.y) * n.y;
      if (Math.abs(delta) < 1e-12) { if (start > Math.sqrt(3) / 2 + 1e-10) { hi = -1; break; } }
      else { const cut = (Math.sqrt(3) / 2 - start) / delta; if (delta > 0) hi = Math.min(hi, cut); else lo = Math.max(lo, cut); }
    }
    if (lo <= hi) ranges.push([lo, hi]);
  }
  ranges.sort((a, b) => a[0] - b[0]); let end = 0;
  for (const [lo, hi] of ranges) { if (lo > end + 1e-9) return false; end = Math.max(end, hi); if (end >= 1 - 1e-9) return true; }
  return false;
}
export function playerResult(before:Game, result:RoundResult, team:number):ClientResult {
  const sourceShips = new Map([...before.ships, ...result.game.ships].map(s => [s.id, s]));
  const actionIds=new Map<string,string>(),projectileIds=new Map<string,string>(),effectIds=new Map<string,string>();
  const opaque=(map:Map<string,string>,id:string,prefix:string)=>{if(!map.has(id))map.set(id,`${prefix}${map.size}`);return map.get(id)!;};
  const frames:ClientResult['frames'] = result.frames.slice(0, 96).map(frame => {
    const visible = new Set(frame.visibleByTeam?.[team] || (team === 0 ? frame.visible : []) || []);
    const explored = new Set(frame.exploredByTeam?.[team] || (team === 0 ? frame.explored : []) || []);
    const knownIds=new Set([...frame.ships.filter(u=>u.team===team||(frame.visibleShipIdsByTeam?frame.visibleShipIdsByTeam[team].includes(u.id):seen(u,visible))),...frame.planes.filter(u=>u.team===team||seen(u,visible))].map(u=>u.id));
    const ships=frame.ships.filter(u=>u.team===team||(frame.visibleShipIdsByTeam?frame.visibleShipIdsByTeam[team].includes(u.id):seen(u,visible))).map(u=>shipView(u,team,knownIds));
    const planes=frame.planes.filter(u=>u.team===team||seen(u,visible)).map(u=>flyingView(u,'plane',team,knownIds));
    const torpedoes=frame.torpedoes.filter(u=>E.torpedoVisible(u,team,visible,explored)).map(u=>flyingView(u,'torpedo',team,knownIds));
    const visuals = sampleBattleVisuals(result.presentation || [], frame.t, E.presentationCells(visible,frame.zones), team,[...ships,...planes]);
    const visibleIds=new Set(ships.map(s=>s.id));
    visuals.actions=(visuals.actions||[]).filter(a=>visibleIds.has(a.shipId)).map(a=>{
      if(!actionIds.has(a.id))actionIds.set(a.id,`a${actionIds.size}`);
      return {...a,id:actionIds.get(a.id)!};
    });
    // Presentation IDs may contain hidden source IDs. Opaque IDs remain stable across frames.
    visuals.projectiles = visuals.projectiles.map(p => ({ ...p, id: opaque(projectileIds,p.id,'v') }));
    visuals.effects = visuals.effects.map(p => ({ ...p, id: opaque(effectIds,p.id,'e'), text: /^−?\d+$/.test(p.text) ? p.text : '' }));
    return { ...(frame.round!==undefined?{round:frame.round}:{}),...(frame.domination?{domination:copy(frame.domination)}:{}),...(frame.zones?{zones:zoneView(frame.zones,team,visible,result.game.map)}:{}),t: frame.t, visible: [...visible], explored: [...explored],
      ships, planes, torpedoes,
      mines: frame.mines.filter(m=>explored.has(E.key(m))).map(mineView), effects: [] as [], visuals };
  });
  for (let i = frames.length - 2; i >= 0; i--) for (const name of (['ships', 'planes', 'torpedoes'] as const)) {
    const next = new Map(frames[i + 1][name].map(u => [u.id, u]));
    const kept = frames[i][name].filter(u => !next.has(u.id) || (u.team === team && name !== 'torpedoes') || safeSegment(u.xy, next.get(u.id)!.xy, u.team === team ? frames[i].explored : frames[i].visible));
    if(name==='ships')frames[i].ships=kept.filter((u):u is ClientShip=>u.kind==='ship');else frames[i][name]=kept.filter((u):u is ClientFlying=>u.kind!=='ship');
  }
  const events = (result.events || []).filter(e => {
    const frame = [...frames].reverse().find(f => f.t <= (e.t??0)) || frames[0];
    return e.at && frame?.visible.includes(E.key(e.at));
  }).slice(-300).map(e => ({ round: e.round, t: e.t, at: point(e.at!), team: null, text: '可见区域发生战斗事件' }));
  return { game: playerView(result.game, team), frames, events, presentation: [] };
}

function invalid(reason='请检查己方单位、指令格式和已知地图。'):never {throw Object.assign(new Error(`作战指令无效：${reason}`),{code:'INVALID_ORDERS'});}
const object=(x:unknown):x is Record<string,unknown>=>x!==null&&typeof x==='object'&&!Array.isArray(x)&&[Object.prototype,null].includes(Object.getPrototypeOf(x));
const fields=(o:unknown,names:string[])=>object(o)&&Object.keys(o).every(k=>names.includes(k));
const hex=(h:Hex,map:Game['map'])=>fields(h,['q','r'])&&Number.isInteger(h.q)&&Number.isInteger(h.r)&&E.inBounds(h,map);
export function validateOrders(game:Game, team:number, value:unknown):Plans {
  if(!Value.Check(SubmittedPlansSchema,value))invalid();
  const submitted=value;
  if (!object(submitted) || Object.keys(submitted).length > game.ships.length) invalid();
  const friends = game.ships.filter(s => s.team === team && E.alive(s)), ids = new Set(friends.map(s => s.id));
  if (Object.keys(submitted).some(id => !ids.has(id))) invalid();
  const view = playerView(game, team), normalized:Plans = {};
  for (const ship of friends) {
    const input = Object.hasOwn(submitted, ship.id) ? submitted[ship.id] : E.emptyPlan();
    if (!fields(input, ['moves', 'torps', 'main', 'planes', 'sweep', 'segments', 'guard', 'smoke', 'radar', 'escort', 'mineSteps'])) invalid();
    const p = E.emptyPlan();
    p.moves=Array.from(input.moves??[]);p.torps=Array.from(input.torps??[]);p.main=Array.from(input.main??[]);p.planes=Array.from(input.planes??[]);
    if([p.moves,p.torps,p.main,p.planes].some(items=>items.length>20))invalid();
    p.sweep = input.sweep ?? null;
    if(input.guard!==undefined){if(typeof input.guard!=='boolean'||input.guard&&(!ship.cfg.guard||p.moves.length))invalid();if(input.guard)p.guard=true;}
    for(const k of ['smoke','radar','escort','mineSteps'] as const)if(input[k]!==undefined&&input[k]!==null)Object.assign(p,{[k]:copy(input[k])});
    if (p.moves.length > effectiveSpeed(ship,game.round) || p.moves.some(m => !fields(m, ['turn', 'forward']) || ![-1, 0, 1].includes(m.turn) || typeof m.forward !== 'boolean')) invalid();
    const nodes = E.route(ship, p, view.map,game.round);
    if (nodes.length !== p.moves.length + 1) invalid();
    if (p.torps.length > Math.min(ship.torps, ship.cfg.torpedo?.max || 0)) invalid();
    const windows = new Set();
    for (const t of p.torps) {
      if (!fields(t, ['window', 'dir']) || !Number.isInteger(t.window) || t.window < 0 || !nodes[t.window] || !Number.isInteger(t.dir) || t.dir < 0 || t.dir > 5 || windows.has(ship.cfg.torpedo?.perWindow?`${t.window}:${t.dir}`:t.window)||p.torps.filter(x=>x.window===t.window).length>(ship.cfg.torpedo?.perWindow??1) || [nodes[t.window].heading, E.mod(nodes[t.window].heading + 3)].includes(t.dir)) invalid();
      windows.add(ship.cfg.torpedo?.perWindow?`${t.window}:${t.dir}`:t.window);
    }
    if (p.main.length && ship.mainReady > game.round) invalid(`${ship.label}主炮正在装填，第 ${ship.mainReady} 回合可用；请删除本回合主炮落点。`);
    if (p.main.length > (ship.cfg.main?.shots || 0)) invalid(`${ship.label}主炮发射数量超过本回合上限。`);
    if (p.main.some(h => !hex(h,game.map) || E.hexDist(ship.pos, h) > ship.cfg.main!.range)) invalid(`${ship.label}主炮落点格式无效或超出回合初射程。`);
    if (p.planes.length > Math.min(ship.cfg.carrier?.launch || 0, ship.airReady?.filter(n => n <= game.round).length || 0)) invalid();
    for (const order of p.planes) {
      if (order?.mode === 'point'||order?.mode === 'patrol') { if (!fields(order, ['mode', 'target','slot']) || !hex(order.target,game.map)) invalid(); }
      else if (order?.mode === 'target') { if (!fields(order, ['mode', 'targetId','slot']) || typeof order.targetId !== 'string' || !view.ships.some(s => s.id === order.targetId && s.team !== team && E.alive(s))) invalid(); }
      else invalid();
    }
    if (p.sweep !== null && (!hex(p.sweep,game.map) || !ship.cfg.secondary || E.hexDist(ship.pos, p.sweep) > ship.cfg.secondary.range || !view.map.mines.some(h => E.same(h, p.sweep!)) || !E.hasLOS(view.map, ship.pos, p.sweep))) invalid();
    if (input.segments !== undefined && (!Array.isArray(input.segments) || input.segments.length > effectiveSpeed(ship,game.round) || input.segments.some(s => !fields(s, ['start', 'end', 'target']) || !Number.isInteger(s.start) || !Number.isInteger(s.end) || s.start < 0 || s.end <= s.start || s.end > p.moves.length || !hex(s.target,game.map)))) invalid();
    const checked=E.validPlan({...game,map:view.map},ship,p);
    for(const k of ['smoke','radar','escort','mineSteps','torps','planes'] as const){
      const requested=p[k];if((requested===false||Array.isArray(requested)&&!requested.length)&&checked[k]===undefined)continue;
      if(JSON.stringify(requested)!==JSON.stringify(checked[k]))invalid(`${ship.label} 的 ${k} 指令与能力、可用次数、机型或航线不符。`);
    }
    normalized[ship.id] = copy(p);
  }
  return normalized;
}
