// @vitest-environment happy-dom
import {test,expect,afterAll} from 'vitest';
import * as THREE from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import {applyDesktopMouseButtons} from '../src/composables/use-battle-map.ts';
import {mountGame,settleGame} from './helpers/mount-game.ts';
import * as E from '../src/engine.ts';

test('real OrbitControls pans with left/middle, orbits only shift-middle and ignores right drag',()=>{
 for(const [button,shiftKey,rotate]of [[0,false,false],[0,true,false],[1,false,false],[1,true,true],[2,false,false]] as const){
  const canvas=document.createElement('canvas');document.body.append(canvas);canvas.setPointerCapture=()=>{};canvas.releasePointerCapture=()=>{};Object.defineProperties(canvas,{clientWidth:{value:800},clientHeight:{value:500}});
  const camera=new THREE.OrthographicCamera(-20,20,15,-15,.1,250);camera.position.set(0,32,24);camera.lookAt(0,0,0);const controls=new OrbitControls(camera,canvas);controls.screenSpacePanning=false;
  canvas.addEventListener('pointerdown',e=>applyDesktopMouseButtons(controls,e),true);
  const before=camera.position.clone(),orientation=camera.quaternion.clone();
  const send=(target:EventTarget,type:string,x:number)=>target.dispatchEvent(new PointerEvent(type,{bubbles:true,pointerId:1,pointerType:'mouse',button,buttons:type==='pointerup'?0:button===0?1:button===1?4:2,shiftKey,clientX:x,clientY:100}));
  send(canvas,'pointerdown',100);send(document,'pointermove',180);send(document,'pointerup',180);
  expect(camera.position.distanceTo(before)>0).toBe(button!==2);expect(camera.quaternion.angleTo(orientation)>1e-6).toBe(rotate);controls.dispose();canvas.remove();
 }
});

document.body.innerHTML='<div id="app"></div>';
const {session:vm,router,wrapper}=await mountGame();afterAll(()=>wrapper.unmount());
test('right click undoes the selected ship latest weapon or movement edit and respects locked phases',async()=>{
 await router.push('/new/local');await settleGame();vm.start(true);await settleGame();vm.begin();await settleGame();vm.game!.map.islands=[];vm.game!.map.mines=[];
 const bb=vm.game!.ships.find(s=>s.team===0&&s.cfg.main)!;vm.choose(bb);vm.addMove(0,false);vm.setMode('main');vm.clickHex(bb.pos,undefined);await settleGame();
 expect(vm.plan.main).toHaveLength(1);expect(vm.plan.moves).toHaveLength(1);
 const right=async()=>{document.querySelector('[data-map-cell]')!.dispatchEvent(new MouseEvent('contextmenu',{bubbles:true,cancelable:true,button:2}));await settleGame();};
 await right();expect(vm.plan.main).toHaveLength(0);expect(vm.plan.moves).toHaveLength(1);
 await right();expect(vm.plan.moves).toHaveLength(0);
 vm.historyChange('redo');await settleGame();expect(vm.plan.moves).toHaveLength(1);
 vm.busy=true;await right();expect(vm.plan.moves).toHaveLength(1);vm.busy=false;
 vm.game!.phase='deploy';await right();expect(vm.plan.moves).toHaveLength(1);
 vm.game!.phase='plan';vm.choose(vm.game!.ships[0]);await right();expect(vm.plans[bb.id].moves).toHaveLength(1);
});

test('mouse selects friendly hulls in weapon modes while Shift targets their cell; touch keeps weapon targeting',async()=>{
 vm.start(true);await settleGame();vm.begin();await settleGame();vm.game!.map.islands=[];vm.game!.map.mines=[];
 const bb=vm.game!.ships.find(s=>s.team===0&&s.cfg.main)!,ally=vm.game!.ships[0];
 bb.pos=E.fromCR(8,8);bb.xy=E.hexToXY(bb.pos);ally.pos=E.fromCR(9,8);ally.xy=E.hexToXY(ally.pos);
 const event=(pointerType:string,shiftKey=false)=>new PointerEvent('pointerup',{pointerType,button:0,shiftKey});
 vm.choose(bb);vm.setMode('main');vm.shipClick(ally,event('mouse'));expect(vm.selected).toBe(ally.id);expect(vm.plans[bb.id]?.main??[]).toHaveLength(0);
 vm.choose(bb);vm.setMode('main');vm.shipClick(ally,event('mouse',true));expect(vm.selected).toBe(bb.id);expect(vm.plan.main).toEqual([ally.pos]);
 vm.resetPlan();vm.shipClick(ally,event('touch'));expect(vm.selected).toBe(bb.id);expect(vm.plan.main).toEqual([ally.pos]);
 vm.resetPlan();vm.setMode('move');vm.clickHex(ally.pos,event('mouse',true));expect(vm.selected).toBe(bb.id);expect(vm.plan.moves.length).toBeGreaterThan(0);
 vm.setMode('main');vm.clickHex(ally.pos,event('mouse'));expect(vm.selected).toBe(ally.id);
});
