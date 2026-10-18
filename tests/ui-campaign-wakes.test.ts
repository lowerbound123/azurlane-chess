// @vitest-environment happy-dom
import {afterEach,expect,test,vi} from 'vitest';
import * as THREE from 'three';
import {mountGame,settleGame} from './helpers/mount-game.ts';
import * as C from '../src/campaign/index.ts';
import {Wakes} from '../src/scene/wakes.ts';

let mounted:Awaited<ReturnType<typeof mountGame>>|undefined;
afterEach(()=>{mounted?.wrapper.unmount();mounted=undefined;vi.restoreAllMocks();localStorage.clear();window.history.replaceState({},'','/');});
async function setup(){document.body.innerHTML='<div id="app"></div>';mounted=await mountGame();return mounted.session;}
function clock(){
 let serial=0,time=performance.now();const frames=new Map<number,FrameRequestCallback>();
 vi.spyOn(window,'requestAnimationFrame').mockImplementation(callback=>{frames.set(++serial,callback);return serial;});
 vi.spyOn(window,'cancelAnimationFrame').mockImplementation(id=>{frames.delete(id);});
 return async()=>{const next=frames.entries().next().value as [number,FrameRequestCallback]|undefined;if(!next)throw Error('没有正在播放的动画');frames.delete(next[0]);time+=110;next[1](time);await settleGame();};
}

test('automatic sailing replaces the previous round wake and reveals only the current travelled path',async()=>{
 const step=clock(),vm=await setup();vm.startCampaign(false);await settleGame();
 vm.campaignSuggest();await vm.execute();await settleGame();
 const previous=vm.mapModel.wakeTimeline!,settled={...vm.finished!.game.ships[0].xy};
 expect(previous.segments.length).toBeGreaterThan(0);
 const wakes=new Wakes(new THREE.Scene());wakes.update(vm.mapModel);
 const old=wakes.root.children.map(mesh=>(mesh as THREE.Mesh).geometry),disposed=old.map(geometry=>vi.spyOn(geometry,'dispose'));
 try{
  vm.complete();await settleGame();
  expect(vm.campaignTransit).toBe(true);
  const current=vm.mapModel.wakeTimeline!;
  expect(current).not.toBe(previous);
  expect(current.segments.length).toBeGreaterThan(0);
  expect(current.segments[0].from).toEqual(settled);
  expect(current.segments.every(segment=>segment.kind==='ship')).toBe(true);
  wakes.update(vm.mapModel);expect(disposed.every(spy=>spy.mock.calls.length===1)).toBe(true);
  const mesh=wakes.root.children[0] as THREE.Mesh<THREE.BufferGeometry,THREE.ShaderMaterial>;
  expect(old).not.toContain(mesh.geometry);expect(mesh.material.uniforms.replayTime.value).toBe(0);
  for(let i=0;i<30&&vm.playFrame!.t<current.segments[0].end;i++)await step();
  wakes.update(vm.mapModel);
  expect(vm.mapModel.wakeTimeline).toBe(current);
  expect(mesh.material.uniforms.replayTime.value).toBe(vm.playFrame!.t);
  expect(mesh.material.uniforms.fading.value).toBe(0);
  vm.finishCampaignTransit();await settleGame();wakes.update(vm.mapModel);
  expect(vm.campaignTransit).toBe(false);expect(vm.mapModel.wakeTimeline).toBeUndefined();
  expect(wakes.root.children).toHaveLength(0);
 }finally{wakes.dispose();}
});

test('changing the final tutorial fleet also produces sailing wakes from deployment and clears them on arrival',async()=>{
 clock();const vm=await setup();vm.startCampaign(false);await settleGame();
 const state={...C.createCampaignState(),chapter:9},fixture=C.createCampaignFixture(state);
 vm.campaign=state;vm.game=fixture.game;vm.plans=fixture.plans;vm.selected=fixture.selected;await settleGame();
 expect(vm.game?.phase).toBe('deploy');expect(vm.mapModel.wakeTimeline).toBeUndefined();
 vm.setCampaignFleet(['dd-1','cl-1','ca-3','bb-2','cv-2']);await settleGame();
 expect(vm.campaignTransit).toBe(true);expect(vm.mapModel.phase).toBe('execute');
 expect(vm.mapModel.wakeTimeline?.segments.some(segment=>segment.kind==='ship')).toBe(true);
 const wakes=new Wakes(new THREE.Scene());
 try{wakes.update(vm.mapModel);expect(wakes.root.children.length).toBeGreaterThan(0);
  vm.finishCampaignTransit();await settleGame();wakes.update(vm.mapModel);
  expect(vm.game?.phase).toBe('deploy');expect(vm.mapModel.wakeTimeline).toBeUndefined();expect(wakes.root.children).toHaveLength(0);
 }finally{wakes.dispose();}
});
