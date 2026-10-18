// @vitest-environment happy-dom
import {afterEach,expect,test} from 'vitest';
import {mountGame,settleGame} from './helpers/mount-game.ts';
import {createFleetGame} from '../src/engine.ts';
let mounted:Awaited<ReturnType<typeof mountGame>>|undefined;
afterEach(()=>{mounted?.wrapper.unmount();mounted=undefined;localStorage.clear();window.history.replaceState({},'','/');});
const button=(label:string)=>document.querySelector<HTMLButtonElement>(`button[aria-label="${label}"]`)!;
async function setup(){document.body.innerHTML='<div id="app"></div>';mounted=await mountGame();await settleGame();return mounted;}
test('BGM and own voice mute buttons are independent, accessible, and survive route changes and reload',async()=>{
 const {router}=await setup();expect(button('静音背景音乐').getAttribute('aria-pressed')).toBe('false');
 button('静音背景音乐').click();await settleGame();expect(button('开启背景音乐').getAttribute('aria-pressed')).toBe('true');expect(button('静音角色语音').getAttribute('aria-pressed')).toBe('false');
 await router.push('/new/local');await settleGame();button('静音角色语音').click();await settleGame();
 expect(button('开启角色语音').getAttribute('aria-pressed')).toBe('true');
 mounted!.wrapper.unmount();mounted=undefined;await setup();
 expect(button('开启背景音乐').getAttribute('aria-pressed')).toBe('true');expect(button('开启角色语音').getAttribute('aria-pressed')).toBe('true');
 button('开启背景音乐').click();await settleGame();expect(button('静音背景音乐').getAttribute('aria-pressed')).toBe('false');expect(button('开启角色语音').getAttribute('aria-pressed')).toBe('true');
});
test('loading a save explicitly changes the audio battle instance even when seed and round match',async()=>{
 const {session,router}=await setup();session.game=createFleetGame();await router.push('/battle/local');await settleGame();
 const state=session.snapshot(),epoch=session.audioEpoch;
 session.applySavedState(state,false);await settleGame();
 expect(session.audioEpoch).toBe(epoch+1);expect(session.game?.seed).toBe(state.game.seed);expect(session.game?.round).toBe(state.game.round);
});
