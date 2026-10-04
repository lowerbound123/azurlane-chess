import {parentPort,workerData} from 'node:worker_threads';
import {resolveRound} from '../src/engine.js';
try { parentPort.postMessage({result:resolveRound(workerData.game,workerData.plans)}); }
catch { parentPort.postMessage({error:'回合结算失败'}); }
