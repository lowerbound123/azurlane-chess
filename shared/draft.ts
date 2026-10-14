export interface FleetLimits {front:number;back:number}
export interface DraftStep {actor:'first'|'second';action:'pick'|'ban';count:number}
export interface DraftRules {id?:string;poolMode:'shared'|'independent';banTarget:'self'|'opponent';fleetLimits:FleetLimits;steps:readonly DraftStep[]}
export interface DraftState {
 rules:DraftRules;pool:string[];status:'guess'|'draft'|'complete';firstTeam:number|null;coin:{guess:number;face:number}|null;
 stepIndex:number;stepCount:number;revision:number;picks:string[][];bans:string[][];
 history:{team:number;targetTeam:number;action:'pick'|'ban';shipId:string;stepIndex:number}[];ready:boolean[];
}
