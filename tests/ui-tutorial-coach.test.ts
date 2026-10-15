// @vitest-environment happy-dom
import {afterAll,test} from 'vitest';
import assert from 'node:assert/strict';
import {mountGame,settleGame} from './helpers/mount-game.ts';

window.document.body.innerHTML='<div id="app"></div>';
const {session,wrapper}=await mountGame();
const coach=()=>document.querySelector<HTMLElement>('[aria-label="交互教学提示"]');
const toggle=()=>coach()?.querySelector<HTMLButtonElement>('.coach-toggle');
const click=async(element:HTMLElement|null|undefined)=>{
  assert.ok(element,'the tutorial control is rendered');
  element.click();
  await settleGame();
};

test('tutorial hints can be collapsed on every viewport without losing progress or the lesson gate',async()=>{
  session.startLesson('select-deploy');
  await settleGame();
  assert.ok(toggle(),'the coach has its own collapse control on desktop and mobile');
  assert.equal(coach()?.parentElement,document.body,'the viewport overlay is outside clipped battle containers');
  assert.equal(toggle()?.getAttribute('aria-expanded'),'true');
  assert.ok(coach()?.querySelector('.coach-details'));
  assert.equal(coach()?.querySelector<HTMLButtonElement>('.coach-next')?.disabled,true,'next lesson stays action gated');

  await click(toggle());
  assert.equal(toggle()?.getAttribute('aria-expanded'),'false');
  assert.equal(coach()?.querySelector('.coach-details'),null,'collapsed instructions do not consume the overlay height');
  assert.match(coach()?.textContent??'',/选舰与部署/,'the lesson remains identifiable when collapsed');

  await click(document.querySelector<HTMLElement>('.ship-row'));
  assert.equal(toggle()?.getAttribute('aria-expanded'),'false','progress updates preserve the collapsed state');
  assert.match(coach()?.textContent??'',/选中了/,'collapsed hints retain immediate teaching feedback');
  await click(toggle());
  assert.equal(toggle()?.getAttribute('aria-expanded'),'true');
  assert.match(coach()?.querySelector('.coach-details')?.textContent??'',/调整部署/,'expanding shows the current step');
  assert.match(coach()?.querySelector('.coach-notice')?.textContent??'',/选中了/,'teaching feedback stays inside the scrollable instructions instead of covering course buttons');
  assert.equal(coach()?.querySelector<HTMLButtonElement>('.coach-next')?.disabled,true);
  await click(coach()?.querySelector<HTMLElement>('.coach-exit'));
  assert.equal(coach(),null,'exiting a lesson removes the floating coach');
});

afterAll(()=>wrapper.unmount());
