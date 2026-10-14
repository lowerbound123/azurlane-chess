import type {Game,Plans,RoundResult} from '../../shared/game.ts';
import type {RoundResolutionOptions} from '../engine.ts';
export interface LocalRoundRequest {game:Game;plans:Plans;opponentPlans?:Plans;resolution?:RoundResolutionOptions}
export interface BattleWorkerAPI {resolve(request:LocalRoundRequest):Promise<RoundResult>}
