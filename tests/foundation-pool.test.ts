import {test,afterAll,afterEach} from 'vitest';
import assert from 'node:assert/strict';
import { BattlePool } from '../server/pool.ts';
import { createGame } from '../src/engine.ts';
test('battle pool keeps an initialized worker for successive rounds', async () => {
  const pool = new BattlePool(1); const game = createGame(); game.phase = 'plan';
  try {
    await pool.resolve(game, {});
    const first = pool.threadIds;
    assert.ok(Array.isArray(first) && first.length === 1, 'an idle worker remains ready for reuse');
    await pool.resolve(game, {});
    assert.deepEqual(pool.threadIds, first, 'the next round reuses the initialized worker');
  } finally { await pool.close(); }
});

test('worker exceptions and runtime timeout leave the pool usable and shutdown rejects active work',async()=>{
 const pool=new BattlePool(1,{workerURL:new URL('./fixtures/pool-failure.ts',import.meta.url),runTimeoutMs:30});
 const game=createGame();
 try{
  game.seed=1;await assert.rejects(pool.resolve(game,{}),/fixture task failure/);
  game.seed=2;await assert.rejects(pool.resolve(game,{}),/结算超时/);
  game.seed=1;await assert.rejects(pool.resolve(game,{}),/fixture task failure/);
  game.seed=2;const active=pool.resolve(game,{});const rejected=assert.rejects(active,/服务器已关闭/);
  await pool.close();await rejected;await assert.rejects(pool.resolve(game,{}),/正在关闭/);
 }finally{await pool.close();}
});
