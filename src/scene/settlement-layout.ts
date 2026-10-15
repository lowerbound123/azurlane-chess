import type {FrameShip} from '../../shared/game.ts';

export interface SettlementSlot {
 ship:FrameShip;role:'front'|'back';row:number;column:number;rows:number;x:number;y:number;
}

/** Normalized positions mark each ship's caption baseline; no HP filter is applied. */
export function settlementFormation(ships:readonly FrameShip[],team:number,friendly:boolean):SettlementSlot[] {
 const roles:('front'|'back')[]=friendly?['back','front']:['front','back'];
 const rows:{role:'front'|'back';ships:FrameShip[]}[]=[];
 for(const role of roles){
  const members=ships.filter(ship=>ship.team===team&&ship.cfg.role===role),capacity=role==='front'?3:2;
  // Reserve an empty role row so a sparse fleet still keeps its front/back orientation.
  for(let start=0;start<Math.max(1,members.length);start+=capacity)rows.push({role,ships:members.slice(start,start+capacity)});
 }
 return rows.flatMap((row,index)=>row.ships.map((ship,column)=>({ship,role:row.role,row:index,column,rows:rows.length,x:(column+1)/(row.ships.length+1),y:(index+.9)/rows.length})));
}

export function settlementAction(team:number,winner:number|'draw'|null):'dance'|'yun' {
 return winner===team?'dance':'yun';
}
