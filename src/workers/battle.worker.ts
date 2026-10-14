import {expose} from 'comlink';
import {planAI,resolveRound} from '../engine.ts';
import type {BattleWorkerAPI} from './battle-api.ts';
const api:BattleWorkerAPI={async resolve({game,plans,opponentPlans,resolution}){return resolveRound(game,{...plans,...(opponentPlans??planAI(game,1))},resolution);}};
expose(api);
