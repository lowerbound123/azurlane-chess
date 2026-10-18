// @vitest-environment happy-dom
import {afterEach,expect,test} from 'vitest';
import {toRaw} from 'vue';
import {mountGame,settleGame} from './helpers/mount-game.ts';
import * as E from '../src/engine.ts';

let mounted:Awaited<ReturnType<typeof mountGame>>|undefined;
afterEach(()=>{mounted?.wrapper.unmount();mounted=undefined;localStorage.clear();window.history.replaceState({},'','/');});

test('map retains its last wake timeline through planning and menu navigation, and replaces it on the next replay',async()=>{
 document.body.innerHTML='<div id="app"></div>';mounted=await mountGame();
 const vm=mounted.session,game=E.createGame();game.phase='plan';game.map.islands=[];game.map.mines=[];
 const mover=game.ships[0];mover.pos={q:3,r:6};mover.xy=E.hexToXY(mover.pos);mover.heading=0;
 E.updateExploration(game);vm.game=game;vm.selected=mover.id;
 const result=E.resolveRound(game,{[mover.id]:{...E.emptyPlan(),moves:[{turn:0,forward:true}],torps:[{window:0,dir:5}]}});
 vm.finished=result;vm.busy=true;vm.playFrame=result.frames[0];await settleGame();
 const timeline=vm.mapModel.wakeTimeline!;
 expect(timeline.segments.some(s=>s.kind==='ship')).toBe(true);expect(timeline.segments.some(s=>s.kind==='torpedo')).toBe(true);
 vm.playFrame=result.frames.at(-1)!;await settleGame();expect(vm.mapModel.wakeTimeline).toBe(timeline);
 vm.complete();await settleGame();expect(vm.phase).toBe('plan');expect(vm.mapModel.wakeTimeline).toBe(timeline);
 await mounted.router.push('/');await mounted.router.push('/battle/local');await settleGame();expect(vm.mapModel.wakeTimeline).toBe(timeline);
 const second=E.resolveRound(toRaw(vm.game!));vm.finished=second;vm.busy=true;vm.playFrame=second.frames[0];await settleGame();
 expect(vm.mapModel.wakeTimeline).not.toBe(timeline);
 vm.complete();await settleGame();
 vm.applySavedState({game,plans:{},selected:mover.id,roster:[...E.DEFAULT_ROSTER],seed:game.seed},false);await settleGame();
 expect(vm.mapModel.wakeTimeline).toBeUndefined();
});
