import {resolveHistoricalRound} from '../history/index.ts';
import {expose} from 'comlink';
import {planAI,resolveRound} from '../engine.ts';
import type {BattleWorkerAPI} from './battle-api.ts';
const api:BattleWorkerAPI={async resolve({game,plans,opponentPlans,resolution,historical}){if(historical)return resolveHistoricalRound(game,historical,plans);return resolveRound(game,{...plans,...(opponentPlans??planAI(game,1))},resolution);}};
expose(api);
