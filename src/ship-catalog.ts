import type {Ship,ShipType} from "../shared/game.ts";
export interface CatalogShip {id:string;template:ShipType;name:string;avatar:string;portrait:string}
import { SHIP_DEFINITIONS, DEFAULT_FLEET } from './ship-definitions.ts';

// A catalog identity is independent of its combat template and future artwork.
export const SHIPS = Object.freeze(Object.entries(SHIP_DEFINITIONS).map(([id,cfg])=>Object.freeze({id,template:id.split('-')[0] as ShipType,name:cfg.name,avatar:'portraits/default-ship.png',portrait:'portraits/default-ship.png'})));
export const SHIP_BY_ID = Object.freeze(Object.fromEntries(SHIPS.map(ship => [ship.id, ship])));
export const getShip = (id: string) => Object.hasOwn(SHIP_BY_ID, id) ? SHIP_BY_ID[id] : null;
export const shipStats = (id: string) => SHIP_DEFINITIONS[id];
export function catalogFleet(roster: string[] = DEFAULT_FLEET) {
  const used = new Set();
  return roster.map(value => {
    const ship = getShip(value) || SHIPS.find(s => s.template === value && !used.has(s.id));
    if (!ship || used.has(ship.id)) throw new Error('舰船编队包含无效或重复的舰船');
    used.add(ship.id); return ship.id;
  });
}
export function fleetError(ids: unknown) {
  if (!Array.isArray(ids) || ids.some(id => !getShip(id)) || new Set(ids).size !== ids.length) return '请选择有效且不重复的舰船';
  const front = ids.filter(id => shipStats(id).role === 'front').length;
  return ids.length === 5 && front === 3 ? '' : '需要 3 艘前排和 2 艘后排';
}
export function sortFleet(ids: string[]) { return [...ids].sort((a, b) => Number(shipStats(a).role === 'back') - Number(shipStats(b).role === 'back')); }
export function nameFleet(ships: Ship[], ids: string[], team: number) {
  ships.filter(s => s.team === team).forEach((ship, index) => {
    const entry = getShip(ids[index]);
    if (entry) { ship.catalogId = entry.id; ship.label = entry.name; }
  });
}

export function restoreFleet(ships:Pick<Ship,'team'|'template'|'catalogId'>[], roster: ShipType[]) {
  const own = ships.filter(ship => ship.team === 0);
  const ids = own.map(ship => ship.catalogId ?? "");
  return !fleetError(ids) && own.every((ship, index) => getShip(ids[index])!.template === ship.template && ship.template === roster[index])
    ? ids : catalogFleet(roster);
}
