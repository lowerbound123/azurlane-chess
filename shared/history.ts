import type {Game,GameMap,Hex,Plans,ShipConfig,ShipType,Team} from './game.ts';
export type HistoricalId='river-plate'|'narvik'|'denmark-strait'|'midway'|'samar';
export interface HistoricalUnitDefinition {id:string;team:Team;template:ShipType;name:string;cfg:ShipConfig;pos:Hex;heading:number;controlled:boolean;hp?:number;airReady?:number[]}
export interface HistoricalRegion {id:string;label:string;kind:'exit'|'enemy-exit'|'control'|'intel';cells:Hex[]}
export interface HistoricalDefinition {id:HistoricalId;title:string;subtitle:string;date:string;description:string;history:string;sources:{title:string;url:string}[];difficulty:string;minutes:string;roundLimit:number;map:GameMap;units:HistoricalUnitDefinition[];regions:HistoricalRegion[];objectives:string[];bonusObjectives:string[]}
export interface HistoricalState {version:1;scenarioId:HistoricalId;status:'playing'|'won'|'lost';lastResolvedRound:number;stage:string;counters:Record<string,number>;events:string[];extracted:Record<string,{id:string;label:string;team:Team;hp:number;round:number}>;contacts:Record<string,{at:Hex;heading:number;round:number}>;convoyRoute:'central'|'east';convoyWait:boolean;convoyWaitLastRound:number;result?:{won:boolean;stars:number;round:number;reason:string;bonus:boolean[]}}
export interface HistoricalSave {state:HistoricalState;game:Game;plans:Plans;selected:string}
export interface HistoricalObjective {id:string;label:string;current:number;target:number;complete:boolean}
