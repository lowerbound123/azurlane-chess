import type {Hex, XY, Plane, FrameShip} from '../../shared/game.ts';

import * as E from "../engine.ts";

import type {SessionCore} from './session-core.ts';
import type {SessionActions} from './session-actions.ts';
export function useMap(core:SessionCore,actions:SessionActions){
const {game, playFrame, hover, mapView, ship}=core;
function locateShip() { if(ship.value) mapView.value?.focus(E.hexToXY(ship.value.pos)); }
function planeAngle(p: Plane) {
    const units = playFrame.value?.ships || game.value?.ships || [];
    const destination = p.state === 'return'
      ? units.find(s => s.id === p.mother)?.xy
      : (p.tracking ? units.find(s => s.id === p.targetId)?.xy : null) || (p.target ? E.hexToXY(p.target) : null);
    return destination ? Math.atan2(destination.y-p.xy.y, destination.x-p.xy.x)*180/Math.PI : 0;
  }
const point = (h: Hex) => {
    const p = E.hexToXY(h);
    return { x: p.x * 25 + 35, y: p.y * 25 + 35 };
  };
const xy = (p: XY) => ({ x: p.x * 25 + 35, y: p.y * 25 + 35 });
const polygon = (h: Hex) => {
    const p = point(h);
    return Array.from({ length: 6 }, (_, i) => {
      const a = (i * 60 - 30) * Math.PI / 180;
      return `${p.x + 24.3 * Math.cos(a)},${p.y + 24.3 * Math.sin(a)}`;
    }).join(" ");
  };
function mapHex({hex,event,forceMove}: {hex:Hex;event:PointerEvent;forceMove:boolean}) { actions.clickHex(hex,event,forceMove); }
function mapShip({ship:unit,event}: {ship:FrameShip;event:PointerEvent}) { actions.shipClick(unit,event); }
function mapNode({index,shipId}: {index:number;shipId:string}) { actions.truncateNode(index,shipId); }
function mapHover(hex: Hex|null) { if(hex) actions.inspectCell(hex,false); else hover.value=null; }
return {locateShip,planeAngle,point,xy,polygon,mapHex,mapShip,mapNode,mapHover};
}
