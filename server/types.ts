import type {BattleMode} from '../shared/domination.ts';
import type {PublicModel,CommandReply} from '../shared/network.ts';
import type { Game, Plans, RoundResult, CombatStats } from '../shared/game.ts';
import type { DraftRules, DraftState } from '../shared/draft.ts';
import type { ClientResult, MatchRecord, User } from '../shared/network.ts';
import type { AIRoundMemory } from './ai-history.ts';
export interface SessionUser extends User {sessionHash:string;expiresAt:number}
export interface StoredUser extends User {password_hash:string;salt:string}
export interface NewUser extends User {key:string;hash:string;salt:string;createdAt:number}
export interface StoredMatch extends Omit<MatchRecord,'myTeam'|'participants'> {participants:{team:number;accountId:string|null;nickname:string;roster:string[];ships:NonNullable<MatchRecord['participants'][number]['ships']>}[]}
export interface ModelConfig {id:string;name:string;baseURL:string;model:string;apiKey:string;protocol:'chat'|'responses';structuredOutput?:boolean;timeoutMs?:number;maxOutputTokens?:number;reasoning_effort?:string;fast?:'none'|'fast'}
export interface Logger {info?:(data:object)=>void;error?:(data:object)=>void}
export type Send=(message:Record<string,unknown>)=>void;
export type Close=(code?:number,reason?:string)=>void;
export interface Command {v:2;id:string;type:string;payload?:Record<string,unknown>;matchId?:string;round?:number}
export interface Player {id:string;token:string;nickname:string;accountId:string|null;sessionHash:string|null;room:string|null;match:string|null;queued:boolean;connected:boolean;send:Send|null;close:Close|null;requests:Map<string,{fingerprint:string;reply:CommandReply}>;touched:number;roster?:string[];battleMode?:BattleMode}
export interface Room {battleMode?:BattleMode;code:string;hostId:string;players:string[];rosters:Record<string,string[]>;ready:Record<string,boolean>;turnSeconds:number;created:number}
export interface SeatInput {playerId:string|null;roster:string[]}
export interface Seat extends SeatInput {accountId:string|null;nickname:string;timeouts:number;remainingMs:number;disconnectedAt:number|null}
export interface Match {battleMode?:BattleMode;id:string;kind:'ai'|'pvp';mode:string;modelId:string|null;aiMode:'standard'|'full';aiHistory:AIRoundMemory[];seats:Seat[];game:Game|null;draft:DraftState|null;stage:'draft'|'deploy'|'plan'|'resolving'|'playback'|'ended';turnSeconds:number;deadline:number|null;playbackUntil:number|null;pauseSince:number|null;submitted:boolean[];orders:Plans[];result:{winner:Game['winner'];reason:string}|null;aiStatus:string|null;aiError:string|null;created:number;timedOut:boolean[];aiAbort?:AbortController;lastRound?:{round:number;projected:ClientResult[]};endedAt:number;combatStats:Record<string,CombatStats>;roundsResolved:number;recordSnapshot?:StoredMatch;recordAttempts:number;recordRetryAt:number|null;recordStatus?:'saved'|'failed'|'pending'}
export interface BattleExecutor {resolve:(game:Game,plans:Plans)=>Promise<RoundResult>;close?:()=>Promise<void>}
export interface GenerateOptions {game:Game;team:number;modelId:string|null;matchId?:string|null;signal?:AbortSignal;aiMode?:'standard'|'full';history?:AIRoundMemory[]}
export interface AIExecutor {generate:(options:GenerateOptions)=>Promise<Plans>}
export interface ServiceOptions {pool?:BattleExecutor;ai?:AIExecutor;models?:PublicModel[];draftRules?:DraftRules;draftPool?:string[];now?:()=>number;autoTick?:boolean;logger?:Logger}
