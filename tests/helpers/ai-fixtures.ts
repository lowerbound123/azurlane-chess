import type {ClientGame} from '../../shared/network.ts';
import type {Plan,Hex} from '../../shared/game.ts';
import type {AIRoundMemory} from '../../server/ai-history.ts';
export interface SchemaFixture {type?:string;strict?:boolean;maxItems?:number;properties:Record<string,SchemaFixture>;items:SchemaFixture;anyOf:SchemaFixture[];enum:unknown[]}
export interface RequestFixture {
 input:{role:string;content:string}[];messages:{role:string;content:string}[];
 response_format:{json_schema:{strict:boolean;schema:SchemaFixture}};text?:unknown;
 reasoning?:{effort:string};reasoning_effort?:string;service_tier?:string;previous_response_id?:string;conversation?:string;
}
export interface ContextFixture {view:ClientGame;commandGuide:Record<string,{maxMain:number;maxMoves:number;maxTorps:number;maxPlanes:number;visibleEnemyIds:string[];firstMoves:{forward:boolean}[];mainTargetSuggestions:Hex[];sweepTargets:Hex[];suggestedPlan:Plan;suggestedRoute:{heading:number;torpedoDirs:number[]}[]}>}
export function requestFixture(init:RequestInit|undefined):RequestFixture {return JSON.parse(String(init?.body)) as RequestFixture;}
export function historyFixture(round:number):AIRoundMemory {
 const state={round,phase:'plan' as const,winner:null,map:{width:19,height:15,islands:[],mines:[]},visible:[],explored:[],ships:[],planes:[],torpedoes:[]};
 return {round,start:structuredClone(state),end:{...structuredClone(state),round:round+1},orders:{},observations:[]};
}
interface Fingerprint {bytes:number;sha256:string}
interface BillingFixture {cost:number;currency:string;input_price:number;cost_details:Record<string,number>}
export interface LogFixture {
 logVersion:number;matchId:string;modelId:string;model:string;endpoint:string;round:number;team:number;aiMode:string;historyRounds:number;attempt:number;generationId:string;requestId:string;startedAt:string;finishedAt:string;status:number;outcome:string;latencyMs:number;serviceTier:string|null;
 request:{reasoningEffort:string|null;serviceTier:string|null;maxOutputTokens:number;structuredOutput:boolean;timeoutMs:number;bodyBytes:number;context:Fingerprint&{messageCount:number;messages:Fingerprint[]}};
 response:{requestId:string|null;id:string|null;model:string|null;processingMs:number|null;status:string|null;createdAt:number;bodyBytes:number;output:Fingerprint;finishReason:string|null;incompleteReason?:string|null;error?:{code:string;type:string}|null};
 usage:Record<string,unknown>&{input_tokens_details:Record<string,number>;output_tokens_details:Record<string,number>;completion_tokens_details:Record<string,number>};providerBilling:Record<string,BillingFixture>;
}
