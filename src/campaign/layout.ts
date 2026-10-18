import type {Hex} from '../../shared/game.ts';
import {fromCR,toCR} from '../engine.ts';

// Preserve each exercise's axial geometry while giving every checkpoint its
// own northbound handoff. Even offsets preserve the staggered column labels.
const anchors:Record<string,[source:number,row:number]>={
 forward:[70,70],turn:[70,68],exit:[70,66],secondary:[65,63],memory:[65,61],
 rendezvous:[60,56],split:[60,52],
 'torpedo-start':[55,49],'torpedo-node':[55,47],'torpedo-spread':[55,45],'torpedo-persist':[55,43],
 'contact-sweep':[49,41],'remote-sweep':[49,39],'lay-mine':[49,37],
 'north-carolina':[42,36],musashi:[42,34],richelieu:[42,32],
 smoke:[35,31],radar:[35,29],guard:[28,28],escort:[28,26],'advance-salvo':[28,22],
 scout:[19,19],bomber:[19,17],aa:[19,15],fighter:[19,13],heavy:[19,11],final:[8,8],
};
export const CAMPAIGN_CHAPTER_ROWS:[number,number][]=[
 [64,71],[57,65],[49,59],[40,52],[34,44],[26,38],[26,34],[17,31],[4,24],[0,11],
];
export function campaignOffset(id:string):Hex{
 const [source,row]=anchors[id],r=row-source;return{q:-r/2,r};
}
export const campaignSourceRow=(id:string)=>anchors[id][0];
export function campaignPoint(id:string,point:Hex):Hex{
 const delta=campaignOffset(id);return{q:point.q+delta.q,r:point.r+delta.r};
}
export const campaignCell=(id:string,c:number,r:number)=>campaignPoint(id,fromCR(c,r));
export const campaignFocusPoint=(id:string)=>fromCR(6,anchors[id][1]-(id==='final'?2:1));
export function campaignCellLabel(id:string,c:number,r:number){
 const at=toCR(campaignCell(id,c,r));return `第 ${at.r+1} 行、第 ${at.c+1} 列`;
}
