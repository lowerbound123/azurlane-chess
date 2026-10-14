// @vitest-environment happy-dom
import {test,expect,vi} from 'vitest';
import {mountGame,settleGame} from './helpers/mount-game.ts';
import {createGame,emptyPlan} from '../src/engine.ts';
test('leaving a battle disposes its calculator while retaining the local draft for resume',async()=>{
 const {session,router,wrapper}=await mountGame();
 try{
  session.game=createGame();session.game.phase='plan';session.plans={'0-0':{...emptyPlan(),moves:[{turn:0,forward:true}]}};
  await router.push('/battle/local');await settleGame();const dispose=vi.spyOn(session.computer,'dispose');
  await session.goHome();await settleGame();expect(dispose).toHaveBeenCalledTimes(1);
  await session.resumeLocal();await settleGame();expect(session.plans['0-0'].moves).toHaveLength(1);expect(session.game.round).toBe(1);
 }finally{wrapper.unmount();}
});
