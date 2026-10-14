import type {Game,Hex,Ship} from './game.ts';

export type BattleMode = 'annihilation' | 'domination';
export interface CapturePoint {
  id:'A'|'B'|'C'; center:Hex; radius:2; owner:0|1|null;
  progressTeam:0|1|null; progress:0|50; capturedRound:number|null; contested:boolean;
}
export interface DominationState {
  points:CapturePoint[]; scores:[number,number]; lastRound:number;
  lastGain:{round:number;points:[number,number];ships:[number,number]};
}
export const DOMINATION_RULES=Object.freeze({width:21,height:17,radius:2,target:100,pointIncome:5,sinkingIncome:15,roundLimit:30});
export const CAPTURE_CENTERS:ReadonlyArray<{id:CapturePoint['id'];center:Hex}>=Object.freeze([
  {id:'A',center:{q:2,r:5}},{id:'B',center:{q:6,r:8}},{id:'C',center:{q:11,r:11}},
]);
export const pointDistance=(a:Hex,b:Hex)=>Math.max(Math.abs(a.q-b.q),Math.abs(a.r-b.r),Math.abs(a.q+a.r-b.q-b.r));
export function createDominationState():DominationState {
  return {points:CAPTURE_CENTERS.map(p=>({...p,center:{...p.center},radius:2,owner:null,progressTeam:null,progress:0,capturedRound:null,contested:false})),scores:[0,0],lastRound:0,lastGain:{round:0,points:[0,0],ships:[0,0]}};
}
/** Only settled, public objective data is exposed; no contributing unit IDs. */
export function settleDomination(game:Game,beforeShips:readonly Pick<Ship,'id'|'hp'|'team'>[]):void {
  const state=game.domination;
  if(!state||game.battleMode!=='domination'||state.lastRound>=game.round)return;
  const gain:DominationState['lastGain']={round:game.round,points:[0,0],ships:[0,0]};
  const before=new Set(beforeShips.filter(s=>s.hp>0).map(s=>s.id));
  for(const s of game.ships)if(s.hp<=0&&before.has(s.id))gain.ships[1-s.team]+=DOMINATION_RULES.sinkingIncome;
  for(const p of state.points){
    const present=[0,1].map(team=>game.ships.some(s=>s.team===team&&s.hp>0&&pointDistance(s.pos,p.center)<=p.radius));
    p.contested=present[0]&&present[1];
    if(p.owner!==null){
      const enemy=(1-p.owner) as 0|1;
      if(p.contested)continue;
      if(present[enemy]){p.owner=null;p.capturedRound=null;p.progressTeam=enemy;p.progress=50;}
      else if(p.capturedRound!==null&&p.capturedRound<game.round)gain.points[p.owner]+=DOMINATION_RULES.pointIncome;
      continue;
    }
    if(p.contested)continue;
    if(!present[0]&&!present[1]){p.progress=0;p.progressTeam=null;continue;}
    const team=(present[0]?0:1) as 0|1;
    if(p.progressTeam===team&&p.progress===50){p.owner=team;p.capturedRound=game.round;p.progress=0;p.progressTeam=null;}
    else {p.progressTeam=team;p.progress=50;}
  }
  for(const team of [0,1])state.scores[team]+=gain.points[team]+gain.ships[team];
  state.lastRound=game.round;state.lastGain=gain;
}
export function dominationWinner(game:Game,counts:readonly {count:number;hp:number}[]):Game['winner'] {
  const s=game.domination!;
  if(counts[0].count===0&&counts[1].count>0)return 1;
  if(counts[1].count===0&&counts[0].count>0)return 0;
  if(counts.every(c=>c.count>0)&&game.round<DOMINATION_RULES.roundLimit&&s.scores.every(n=>n<DOMINATION_RULES.target))return null;
  for(const pair of [s.scores,counts.map(c=>c.count),counts.map(c=>c.hp)])if(pair[0]!==pair[1])return pair[0]>pair[1]?0:1;
  return 'draw';
}
export const dominationIncome=(state:DominationState,team:number)=>state.points.filter(p=>p.owner===team&&!p.contested).length*DOMINATION_RULES.pointIncome;
export function dominationTurnsToWin(state:DominationState,team:number):number|null {
  const remaining=Math.max(0,DOMINATION_RULES.target-state.scores[team]),income=dominationIncome(state,team);
  return remaining===0?0:income?Math.ceil(remaining/income):null;
}
