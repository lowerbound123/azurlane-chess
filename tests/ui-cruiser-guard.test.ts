// @vitest-environment happy-dom
import {test,expect,afterAll} from 'vitest';
import {mountGame,settleGame} from './helpers/mount-game.ts';
import {deserializeSave,createSave,serializeSave} from '../src/save.ts';
import * as E from '../src/engine.ts';
document.body.innerHTML='<div id="app"></div>';
const {wrapper,session,router}=await mountGame();
const button=(name:string)=>[...document.querySelectorAll<HTMLButtonElement>('button')].find(b=>b.textContent.replace(/\s/g,'').includes(name.replace(/\s/g,'')))!;
const click=async(name:string)=>{button(name).click();await settleGame();};
afterAll(()=>wrapper.unmount());
test('guard toggle clears movement, disables movement controls and supports undo, autosave and reset',async()=>{
 await click('新游戏');await click('本地游玩');await click('进入部署');await click('完成部署');
 await click('欧根亲王');await click('前进 W');
 expect(session.plan.moves).toHaveLength(1);
 await click('海域封锁');
 expect(session.plan.guard).toBe(true);expect(session.plan.moves).toEqual([]);
 expect(button('前进 W').disabled).toBe(true);expect(button('原地等待').disabled).toBe(true);
 expect(deserializeSave(localStorage.getItem('azurlane-chess:v1:auto')!).state.plans['0-2'].guard).toBe(true);
 await click('撤销修改');expect(session.plan.guard).toBeUndefined();expect(session.plan.moves).toHaveLength(1);
 await click('重做修改');expect(session.plan.guard).toBe(true);
 await click('清空全部');expect(session.plan.guard).toBeUndefined();expect(button('前进 W').disabled).toBe(false);
 await click('岛风');expect(button('海域封锁')).toBeUndefined();
});
test('old saves retain their original heavy cruiser rules while keeping the same save format and input intact',()=>{
 const game=E.createGame();for(const s of game.ships.filter(s=>s.template==='ca')){delete s.cfg.guard;s.cfg.secondary!.multi=true;}
 const state={game,plans:{},selected:'0-0',roster:[...E.DEFAULT_ROSTER],seed:game.seed};
 const old=createSave(state),loaded=deserializeSave(serializeSave(old));
 expect(loaded.schemaVersion).toBe(1);expect(loaded.state.game.ships[2].cfg.guard).toBeUndefined();
 expect(loaded.state.game.ships[2].cfg.secondary!.multi).toBe(true);expect(old.state.game.ships[2].cfg.guard).toBeUndefined();
});
