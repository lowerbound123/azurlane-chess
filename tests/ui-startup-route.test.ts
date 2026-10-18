// @vitest-environment happy-dom
import {afterEach,expect,it} from 'vitest';
import {mountGame,settleGame} from './helpers/mount-game.ts';
let mounted:Awaited<ReturnType<typeof mountGame>>|undefined;
afterEach(()=>{mounted?.wrapper.unmount();mounted=undefined;localStorage.clear();window.history.replaceState({},'','/');});

it('initializes a direct campaign entry when routing completed during resource preparation',async()=>{
 mounted=await mountGame({resolvedRoute:'/tutorial/campaign'});await settleGame();
 expect(mounted.session.campaign?.status).toBe('playing');
 expect(mounted.session.game?.map.height).toBe(72);
 expect(mounted.wrapper.find('.campaign-coach').exists()||document.querySelector('.campaign-coach')).toBeTruthy();
});

it('restores local battle guards after a delayed application mount',async()=>{
 mounted=await mountGame({resolvedRoute:'/battle/local'});await settleGame();
 expect(mounted.router.currentRoute.value.path).toBe('/new/local');
 expect(mounted.wrapper.find('.ship-card').exists()).toBe(true);
});

it('initializes a direct historical battle after the loader delays application mount',async()=>{
 mounted=await mountGame({resolvedRoute:'/history/river-plate'});await settleGame();
 expect(mounted.session.historical?.scenarioId).toBe('river-plate');
 expect(mounted.session.game?.ships.length).toBeGreaterThan(0);
 expect(mounted.wrapper.find('.historical-battle').exists()).toBe(true);
});
