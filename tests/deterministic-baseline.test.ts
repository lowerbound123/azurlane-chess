import {test} from 'vitest';import assert from 'node:assert/strict';import {createHash} from 'node:crypto';import {readFileSync} from 'node:fs';
import {createGame,planAI,resolveRound} from '../src/engine.ts';
const samples=JSON.parse(readFileSync(new URL('./fixtures/deterministic-v050.json',import.meta.url),'utf8'));
for(const {seed,simulationHash} of samples)test(`legacy capability profile retains v0.5.0 deterministic simulation for seed ${seed}`,()=>{
 const game=createGame(undefined,seed);game.phase='plan';
 // Historical hashes describe the old capability profile. New cruiser rules
 // have explicit behavior tests; keep this fixture as a simulation regression.
 for(const ship of game.ships.filter(s=>s.template==='ca')){ship.cfg.secondary!.multi=true;delete ship.cfg.guard;}
 const plans={...planAI(game,0),...planAI(game,1)},result=resolveRound(game,plans);
 // Hashes were extracted from the original engine after checking its complete
 // results against the historical hashes. Cosmetic effects and replay tail
 // length may change; simulation snapshots through the final state may not.
 const simulation={game:result.game,events:result.events,counts:result.counts,combatStats:result.combatStats,frames:result.frames.filter(f=>f.t<=1.1).map(({effects,...frame})=>frame)};
 assert.equal(createHash('sha256').update(JSON.stringify(simulation)).digest('hex'),simulationHash);
 assert.deepEqual(resolveRound(game,plans).presentation,result.presentation);
});
