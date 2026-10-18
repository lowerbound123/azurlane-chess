export interface BattleAudioRequest {key:string;kind:string;id?:string;name?:string;usage?:string;voiceId?:string;bundle:string;}
export function planBattleAudio(config:any):BattleAudioRequest[];
export function checkBattleAudio(root?:string,config?:any):Promise<{problems:string[];entries:number;voices:number;clips:number}>;
export function syncBattleAudio(options?:{root?:string;config?:any;resolveSource?:(requests:BattleAudioRequest[],stage:string)=>Promise<any>;dryRun?:boolean}):Promise<any>;
