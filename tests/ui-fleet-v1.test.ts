// @vitest-environment happy-dom
import {test,expect,afterAll} from 'vitest';
import {mountGame,settleGame} from './helpers/mount-game.ts';
const {wrapper,session}=await mountGame();afterAll(()=>wrapper.unmount());
test('new skill controls support undo and mixed slot selection',async()=>{
 session.setFleet(['dd-1','dd-3','cl-3','cv-2','cv-3']);session.start(true);session.begin();await settleGame();
 session.choose(session.game!.ships[1]);session.toggleSmoke();expect(session.plan.smoke).toBe(true);
 session.historyChange('undo');expect(session.plan.smoke).toBeUndefined();
 session.historyChange('redo');expect(session.plan.smoke).toBe(true);
 session.choose(session.game!.ships[0]);session.addMove(0,true);session.toggleMineStep(1);expect(session.plan.mineSteps).toEqual([1]);
 session.trimRoute(0);expect(session.plan.mineSteps??[]).toEqual([]);
 session.choose(session.game!.ships[3]);session.selectAirRole('fighter');session.setMode('plane');session.clickHex(session.ship!.pos,undefined);
 expect(session.plan.planes[0]).toMatchObject({slot:0,mode:'patrol'});
 session.resetPlan();expect(session.plan.planes).toEqual([]);session.ship!.airHP[0]=1;session.clickHex(session.ship!.pos,undefined);expect(session.plan.planes[0].slot).toBe(1);
});
