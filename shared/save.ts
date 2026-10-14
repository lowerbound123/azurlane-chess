import type {Game,Plans,ShipType} from './game.ts';
export interface SaveState {game:Game;plans:Plans;selected:string;roster:ShipType[];seed:number;metadata?:{showPlans?:boolean;showRanges?:boolean;rangeMode?:string;[key:string]:unknown};[key:string]:unknown}
export interface SaveEnvelope {magic:string;schemaVersion:number;timestamp:string;label:string;state:SaveState}
export interface SaveOptions {label?:string;timestamp?:string}
export interface SaveFailure {ok:false;error:{code:string;message:string}}
export type SaveResult<T> = ({ok:true}&T)|SaveFailure;
export interface SaveRecord {id:string;save:SaveEnvelope|null;error:SaveFailure['error']|null}
export type StorageLike=Pick<Storage,'getItem'|'setItem'|'removeItem'>;
