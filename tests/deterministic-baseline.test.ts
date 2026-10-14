import {test,afterAll,afterEach} from 'vitest';import assert from 'node:assert/strict';import {createHash} from 'node:crypto';import {readFileSync} from 'node:fs';
import {createGame,planAI,resolveRound} from '../src/engine.ts';
const samples=JSON.parse(readFileSync(new URL('./fixtures/deterministic-v050.json',import.meta.url),'utf8'));
for(const {seed,hash} of samples)test(`legacy capability profile retains v0.5.0 deterministic result for seed ${seed}`,()=>{
 const game=createGame(undefined,seed);game.phase='plan';
 // Historical hashes describe the old capability profile. New cruiser rules
 // have explicit behavior tests; keep this fixture as a simulation regression.
 for(const ship of game.ships.filter(s=>s.template==='ca')){ship.cfg.secondary!.multi=true;delete ship.cfg.guard;}
 const result=resolveRound(game,{...planAI(game,0),...planAI(game,1)});
 assert.equal(createHash('sha256').update(JSON.stringify(result)).digest('hex'),hash);
});
