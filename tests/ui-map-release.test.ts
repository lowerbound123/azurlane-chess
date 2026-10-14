import {vi} from 'vitest';
import {mockFetch} from './helpers/fetch.ts';
import {TestSocket} from './helpers/socket.ts';
import type {OnlineState,User} from '../shared/network.ts';
import {flushPromises} from '@vue/test-utils';
// @vitest-environment happy-dom
import {mountGame,settleGame,chooseSelect} from './helpers/mount-game.ts';
import {test,afterAll,afterEach} from 'vitest';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
document.body.innerHTML='<div id="app"></div>';
const {session:vm,router,wrapper}=await mountGame();
const flush=async()=>{await settleGame();await settleGame();await new Promise(r=>setTimeout(r,0));};
const click=async (text:string)=>{const button=[...document.querySelectorAll<HTMLButtonElement>('button')].find(b=>b.textContent.includes(text));assert.ok(button);button.click();await flush();};
test('ship selection releases real OrbitControls before subsequent hover, in deployment and planning',async()=>{
 await click('新游戏');await click('本地游玩');await click('进入部署');
 for(const phase of ['deploy','plan']) {
  if(phase==='plan')await click('完成部署');
  // The semantic renderer forwards the same native pointerup as the WebGL picker.
  const marker=document.querySelector<HTMLElement>('[data-map-ship="0-2"]');
  marker!.setPointerCapture=()=>{};marker!.releasePointerCapture=()=>{};
  Object.defineProperties(marker,{clientWidth:{value:800,configurable:true},clientHeight:{value:500,configurable:true}});
  const camera=new THREE.OrthographicCamera(-20,20,15,-15,.1,250);camera.position.set(0,32,24);camera.lookAt(0,0,0);
  const controls=new OrbitControls(camera,marker);controls.mouseButtons.LEFT=THREE.MOUSE.PAN;
  let ends=0;controls.addEventListener('end',()=>ends++);
  const send=(target: Document|HTMLElement|null,type: string,x: number,buttons: number)=>target!.dispatchEvent(new window.PointerEvent(type,{bubbles:true,pointerId:1,pointerType:'mouse',button:0,buttons,clientX:x,clientY:100}));
  try {
   send(marker,'pointerdown',100,1);send(marker,'pointerup',100,0);await flush();
   assert.match(document!.querySelector<HTMLElement>('.orders-sidebar')!.textContent,/欧根亲王/);
   assert.equal(ends,1,`${phase}: pointerup must reach OrbitControls document listener`);
   const position=camera.position.clone();send(document,'pointermove',180,0);controls.update();
   assert.ok(camera.position.distanceTo(position)<1e-9,'released hover must not pan camera');
   send(marker,'pointerdown',100,1);send(document,'pointermove',180,1);send(document,'pointerup',180,0);
   assert.ok(camera.position.distanceTo(position)>0,'deliberate subsequent drag still works');
  } finally {controls.dispose();}
 }
});

afterAll(()=>wrapper.unmount());
