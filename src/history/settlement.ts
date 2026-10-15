import type {FrameShip} from '../../shared/game.ts';
import type {HistoricalDefinition,HistoricalState} from '../../shared/history.ts';
import {hexToXY} from '../engine.ts';
/** Extracted ships leave combat state, but remain participants in the final formation. */
export function historicalSettlementShips(ships:FrameShip[],state:HistoricalState|null,definition:HistoricalDefinition|undefined):FrameShip[]{
 if(!state||!definition)return ships;
 const current=new Map(ships.map(s=>[s.id,s]));
 const roster=definition.units.map(unit=>current.get(unit.id)??{id:unit.id,team:unit.team,label:unit.name,template:unit.template,cfg:unit.cfg,hp:state.extracted[unit.id]?.hp??0,pos:{...unit.pos},xy:hexToXY(unit.pos),heading:unit.heading});
 const ids=new Set(roster.map(s=>s.id));return [...roster,...ships.filter(s=>!ids.has(s.id))];
}
