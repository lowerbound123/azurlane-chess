import type {Game,Hex,Plans,PlaneConfig} from '../shared/game.ts';
import type {ClientGame,ClientResult,ClientFrame,ClientShip,ClientFlying} from '../shared/network.ts';
export interface MemoryUnit extends Record<string,unknown> {id:string;kind:string;team:number;pos:Hex;hp?:number;heading?:number;label?:string;template?:string;state?:string;mother?:string;slot?:number;cfg?:Partial<Omit<ClientShip['cfg'],'role'> & Omit<PlaneConfig,'role'>> & {role?:string};torps?:number;mainReady?:number;airReady?:(number|null)[];airHP?:number[];destroyedPlanes?:number;traveled?:number}
interface Change {domination?:Game['domination'];t:number;appeared?:MemoryUnit[];changed?:MemoryUnit[];removed?:{id:string;kind:string}[];lost?:{id:string;kind:string}[];mines?:Game['map']['mines'];zones?:Game['zones']}
export interface AIRoundMemory {round:number;start:ReturnType<typeof compactView>;orders:Plans;observations:Change[];end:ReturnType<typeof compactView>}
import { xyToHex } from '../src/engine.ts';
import { playerView, validateOrders } from './views.ts';

const groups = [['ships', 'ship'], ['planes', 'plane'], ['torpedoes', 'torpedo']] as const;
const same = (a:unknown, b:unknown) => JSON.stringify(a) === JSON.stringify(b);
const copy = <T>(value:T):T => structuredClone(value);

// Only read fields already exposed by playerView/playerResult. Historical input
// must never be rebuilt from omniscient engine events or combat statistics.
function unitState(unit:ClientShip|ClientFlying, kind:string, team:number, capabilities = false):MemoryUnit {
  const state:MemoryUnit = { id: unit.id, kind, team: unit.team,
    pos: xyToHex(unit.xy) };
  const fields:Record<string,unknown>={...unit};
  for (const field of ['label', 'template', 'hp', 'heading', 'state']) {
    if (fields[field] !== undefined) state[field] = copy(fields[field]);
  }
  if (unit.team === team) {
    for (const field of ['mother', 'slot']) if (fields[field] !== undefined) state[field] = copy(fields[field]);
  }
  if (capabilities) {
    if (unit.cfg) state.cfg = copy(unit.cfg);
    if (unit.team === team) {
      for (const field of ['torps', 'mainReady', 'airReady', 'airHP', 'destroyedPlanes', 'traveled','minesLeft','smokeLeft','radarLeft','patrolRemaining','attackRound']) {
        if (fields[field] !== undefined) state[field] = copy(fields[field]);
      }
    }
  }
  return state;
}

function compactView(view:ClientGame, team:number) {
  const state:{battleMode?:Game['battleMode'];domination?:Game['domination'];zones?:Game['zones'];round:number;phase:Game['phase'];winner:Game['winner'];map:Game['map'];visible:string[];explored:string[];ships:MemoryUnit[];planes:MemoryUnit[];torpedoes:MemoryUnit[]} = {ships:[],planes:[],torpedoes:[], round: view.round, phase: view.phase, winner: view.winner,
    ...(view.battleMode?{battleMode:view.battleMode}:{}),...(view.domination?{domination:copy(view.domination)}:{}),...(view.zones?{zones:copy(view.zones)}:{}),map: copy(view.map), visible: copy(view.visible), explored: copy(view.explored[team]) };
  for (const [group, kind] of groups) state[group] = view[group].map(unit => unitState(unit, kind, team, true));
  return state;
}

function visibleUnits(view:ClientGame|ClientFrame, team:number):Map<string,MemoryUnit> {
  return new Map(groups.flatMap(([group, kind]) => view[group]
    .map(unit => [`${kind}:${unit.id}`, unitState(unit, kind, team)] as [string,MemoryUnit])));
}

function deepFreeze<T>(value:T):T {
  if (value && typeof value === 'object') {
    for (const child of Object.values(value)) deepFreeze(child);
    Object.freeze(value);
  }
  return value;
}

/** One completed round, restricted to this team's observations at that time. */
export function createAIRoundMemory(before:Game, projectedResult:ClientResult, team:number, ownOrders:unknown):AIRoundMemory {
  const initial = playerView(before, team);
  const orders = validateOrders(before, team, ownOrders);
  const observations:Change[] = [];
  let previous = visibleUnits(initial, team), previousMines = initial.map.mines,previousZones=initial.zones,previousDomination=initial.domination;
  for (const frame of projectedResult.frames) {
    const current = visibleUnits(frame, team);
    const change:Change = { t: frame.t };
    for (const [id, unit] of current) {
      if (!previous.has(id)) (change.appeared ||= []).push(unit);
      else if (!same(unit, previous.get(id))) (change.changed ||= []).push(unit);
    }
    for (const [id, unit] of previous) {
      if (current.has(id)) continue;
      // Enemy loss can mean fog, death, or interpolation filtering. Own planes
      // can disappear on recovery. Neither category asserts a confirmed kill.
      const field = unit.team === team ? 'removed' : 'lost';
      (change[field] ||= []).push({ id: unit.id, kind: unit.kind });
    }
    if(!same(frame.domination,previousDomination)){change.domination=copy(frame.domination);previousDomination=frame.domination;}
    if(!same(frame.zones,previousZones)){change.zones=copy(frame.zones??[]);previousZones=frame.zones;}
    if (!same(frame.mines, previousMines)) change.mines = copy(frame.mines);
    if (Object.keys(change).length > 1) observations.push(change);
    previous = current;
    previousMines = frame.mines;
  }
  return deepFreeze({ round: before.round, start: compactView(initial, team), orders,
    observations, end: compactView(projectedResult.game, team) });
}
