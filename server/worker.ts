import { parentPort } from 'node:worker_threads';
import { resolveRound } from '../src/engine.ts';
import type { Game, Plans, RoundResult } from '../shared/game.ts';
export default function resolveBattle({id,game,plans}:{id:string;game:Game;plans:Plans}):RoundResult{
  parentPort?.postMessage({type:'battle:start',id});
  return resolveRound(game,plans);
}
