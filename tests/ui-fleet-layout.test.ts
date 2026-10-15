// @vitest-environment happy-dom
import {test,expect,afterAll} from 'vitest';
import {mountGame,settleGame} from './helpers/mount-game.ts';
const {session,router,wrapper}=await mountGame();afterAll(()=>wrapper.unmount());
test('new game mode uses a title-row slider and fleet commands live beside ordered front/back rows',async()=>{
 await router.push('/new');await settleGame();
 const mode=document.querySelector<HTMLElement>('[role="radiogroup"][aria-label="对战模式"]');expect(mode).not.toBeNull();expect(mode!.closest('.page-head')).not.toBeNull();
 const domination=mode!.querySelector<HTMLElement>('[data-mode-value="domination"]')!;domination.click();await settleGame();expect(session.battleMode).toBe('domination');expect(session.onlineBattleMode).toBe('domination');
 await router.push('/new/local');await settleGame();expect(document.querySelector('.battle-mode-select')).toBeNull();
 const fleet=document.querySelector<HTMLElement>('[aria-label="我方已选舰船"]')!;
 expect(fleet.querySelector('[data-formation="front"] [data-selected-ship="dd-2"]')).not.toBeNull();
 expect(fleet.querySelector('[data-formation="back"] [data-selected-ship="bb-1"]')).not.toBeNull();
 expect(fleet.querySelector('[role="separator"]')).not.toBeNull();expect(fleet.querySelector('.selection-actions [aria-label="地图种子"]')).not.toBeNull();expect(fleet.querySelector('.complete-fleet')).not.toBeNull();
 expect(document.querySelector('.selection-main > .selection-actions')).toBeNull();
});
