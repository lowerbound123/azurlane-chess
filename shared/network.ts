import type {BattleMode,DominationState} from './domination.ts';
import type {Game,FrameShip,ShipConfig,XY,Hex,Plans,BattleLog,CombatStats,RoundResult,Plane,Torpedo} from './game.ts';
import type {DraftState} from './draft.ts';
export const PROTOCOL_VERSION=2;
export type ConnectionStatus='connected'|'connecting'|'reconnecting'|'disconnected';
export interface PublicModel {id:string;name:string}
export interface PublicConfig {assetStorage?:{provider:import('./assets.ts').AssetProvider};battleModes?:BattleMode[];serverId?:string;models:PublicModel[];roomLimits?:number[];auth?:{enabled:boolean};protocolVersion?:number}
export interface User {id:string;username:string}
export interface AccountState {enabled:boolean;loaded:boolean;user:User|null}
export interface Identity {playerId?:string;nickname?:string;id?:string;token:string;serverId:string;identityType?:'guest'|'account';accountId?:string}
/** Resources and targets of hostile units are intentionally absent from the wire view. */
export interface ClientShip extends Omit<FrameShip,'cfg'> {cfg:Omit<ShipConfig,'torpedo'>&{torpedo?:Omit<NonNullable<ShipConfig['torpedo']>,'reserve'>&{reserve?:number}};kind:'ship';torps?:number;mainReady?:number;airReady?:(number|null)[];airHP?:number[];destroyedPlanes?:number;minesLeft?:number;smokeLeft?:number;radarLeft?:number;catalogId?:string}
export interface ClientFlying {statuses?:import('./status.ts').StatusInstance[];id:string;kind:'plane'|'torpedo';team:number;xy:XY;cfg:Partial<Plane['cfg']&Torpedo['cfg']>;hp?:number;heading?:number;state?:Plane['state'];traveled?:number;mother?:string;slot?:number;mode?:Plane['mode'];target?:Hex;targetId?:string|null;patrolRemaining?:number;attackRound?:number}
export interface ClientGame {battleMode?:BattleMode;domination?:DominationState;ruleset?:Game['ruleset'];zones?:Game['zones'];round:number;phase:Game['phase'];nextId:number;winner:Game['winner'];log:BattleLog[];visible:string[];explored:string[][];map:Game['map'];ships:ClientShip[];planes:ClientFlying[];torpedoes:ClientFlying[]}
export type ClientVisuals=import('../src/battle-visuals.ts').SampledVisuals;
export interface ClientFrame {round?:number;domination?:DominationState;t:number;visible:string[];explored:string[];ships:ClientShip[];planes:ClientFlying[];torpedoes:ClientFlying[];mines:Game['map']['mines'];zones?:Game['zones'];effects:[];visuals:ClientVisuals}
export interface ClientResult {game:ClientGame;frames:ClientFrame[];events:BattleLog[];presentation:[]}
export interface RoomPlayer {id:string;nickname:string;ready:boolean;roster?:string[]}
export interface ClientRoom {battleMode?:BattleMode;code:string;hostId:string;turnSeconds:number;players:RoomPlayer[]}
export interface ClientMatch {battleMode?:BattleMode;id:string;kind:'ai'|'pvp';myTeam:number;round:number;stage:'draft'|'deploy'|'plan'|'resolving'|'playback'|'ended';game:ClientGame|null;draft?:DraftState|null;deadline?:number|null;paused?:boolean;pausedAt?:number|null;disconnects:{team:number;remainingMs:number}[];submitted:boolean[];plans?:Plans;result?:{winner:number|'draw'|null;reason:string}|null;recordStatus?:string;aiName?:string|null;aiMode?:'standard'|'full';aiHistoryRounds?:number;aiStatus?:string|null;aiError?:string|null;playbackUntil?:number|null}
export interface OnlineState {type?:'state';player:{id:string;nickname:string}|null;room:ClientRoom|null;queue:{position:number;battleMode?:BattleMode}|null;match:ClientMatch|null}
export interface RoundMessage {type:'round';matchId:string;round:number;result:ClientResult}
export type SubmittedPlans=Record<string,Partial<Omit<import('./game.ts').Plan,'radar'>> & {radar?:Hex|null}>;
export type CommandPayload=Record<string,unknown>;
export interface RecordShip extends CombatStats {id:string;catalogId?:string;name:string;template:string;hp:number;maxHp:number;alive:boolean}
export interface MatchRecord {battleMode?:BattleMode;domination?:DominationState;id:string;mode:string;modelId?:string|null;createdAt:number;endedAt:number;durationMs:number;rounds:number;endStage:string;enteredBattle:boolean;winner:number|'draw'|null;reason:string;myTeam:number;participants:{team:number;nickname:string;roster:string[];ships?:RecordShip[]}[]}
export interface MatchList {items:MatchRecord[];nextCursor:string|null}
/** UI planning uses a materialized observation. These defaults never become authoritative server state. */
export function materializeObservation(view:ClientGame):Game&{visible:string[]} {
 return {...view,seed:0,ships:view.ships.map(s=>({...s,cfg:{...s.cfg,torpedo:s.cfg.torpedo?{...s.cfg.torpedo,reserve:s.cfg.torpedo.reserve??0}:undefined},torps:s.torps??0,mainReady:s.mainReady??Infinity,airReady:(s.airReady??[]).map(n=>n??Infinity),airHP:s.airHP??[],destroyedPlanes:s.destroyedPlanes??0})),planes:view.planes.map(p=>({...p,kind:'plane' as const,mother:p.mother??'',slot:p.slot??0,hp:p.hp??0,cfg:{hp:0,speed:0,vision:0,range:0,damage:0,...p.cfg},state:p.state??'outbound',target:p.target??{q:0,r:0},targetId:p.targetId??null,mode:p.mode??'point' as const,tracking:false,traveled:p.traveled??0,waypoints:[]})),torpedoes:view.torpedoes.map(p=>({...p,kind:'torpedo' as const,owner:'',heading:p.heading??0,cfg:{speed:0,damage:0,life:0,reserve:0,max:0,...p.cfg},age:0,launched:0,birth:0,armed:true}))};
}
export function materializeResult(result:ClientResult):RoundResult {
 return {...result,game:materializeObservation(result.game),counts:[],combatStats:{},frames:result.frames.map(f=>({...f,ships:materializeObservation({...result.game,ships:f.ships}).ships,planes:materializeObservation({...result.game,planes:f.planes}).planes,torpedoes:materializeObservation({...result.game,torpedoes:f.torpedoes}).torpedoes}))};
}

export interface CommandReply extends Record<string,unknown> {type:'ack'|'error';id:string;ok?:boolean;data?:{code:string};code?:string;message?:string}
