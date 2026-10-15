// @vitest-environment happy-dom
import {test,vi,beforeEach,afterEach,expect,type MockInstance} from 'vitest';
let scheduleSpinePreload:typeof import('../src/characters/preload.ts').scheduleSpinePreload;
const manifest={'src/vendor/spine38/adapter.ts':{file:'assets/spine-test.js',imports:['_three.js']},'_three.js':{file:'assets/three-test.js'}};
let load:MockInstance<typeof fetch>;
let idleCallback:IdleRequestCallback,cancel:()=>void;
const idle=vi.fn((callback:IdleRequestCallback)=>{idleCallback=callback;return 7;}),cancelIdle=vi.fn();
const originalIdle=Object.getOwnPropertyDescriptor(window,'requestIdleCallback'),originalCancel=Object.getOwnPropertyDescriptor(window,'cancelIdleCallback');
beforeEach(async()=>{
  vi.resetModules();({scheduleSpinePreload}=await import('../src/characters/preload.ts'));
  vi.useFakeTimers();idle.mockClear();cancelIdle.mockClear();
  load=vi.spyOn(globalThis,'fetch').mockImplementation(async input=>new Response(String(input).endsWith('spine-assets.json')?JSON.stringify(manifest):'export {};'));
  Object.defineProperty(window,'requestIdleCallback',{value:idle,configurable:true});
  Object.defineProperty(window,'cancelIdleCallback',{value:cancelIdle,configurable:true});
});
afterEach(()=>{
  cancel();vi.useRealTimers();vi.restoreAllMocks();
  for(const [name,descriptor] of [['requestIdleCallback',originalIdle],['cancelIdleCallback',originalCancel]] as const)
    if(descriptor)Object.defineProperty(window,name,descriptor);else Reflect.deleteProperty(window,name);
});
const runIdle=()=>idleCallback({didTimeout:false,timeRemaining:()=>30});
test('homepage load must finish before idle downloads can warm the runtime cache',async()=>{
  vi.spyOn(document,'readyState','get').mockReturnValue('loading');
  cancel=scheduleSpinePreload();expect(idle).not.toHaveBeenCalled();expect(load).not.toHaveBeenCalled();
  window.dispatchEvent(new Event('load'));expect(idle).toHaveBeenCalledTimes(1);expect(load).not.toHaveBeenCalled();
  window.dispatchEvent(new Event('load'));expect(idle).toHaveBeenCalledTimes(1);
  runIdle();await vi.waitFor(()=>expect(load).toHaveBeenCalledTimes(3));
  expect(load).toHaveBeenCalledWith('/assets/spine-test.js',{priority:'low',cache:'force-cache'});
  expect(load).toHaveBeenCalledWith('/assets/three-test.js',{priority:'low',cache:'force-cache'});
  cancel();cancel=scheduleSpinePreload();expect(idle).toHaveBeenCalledTimes(1);expect(load).toHaveBeenCalledTimes(3);
});
test('production shared chunks can retain the adapter name under a generated manifest key',async()=>{
  vi.spyOn(document,'readyState','get').mockReturnValue('complete');
  const builtManifest={
    '_adapter-build.js':{file:'assets/adapter-build.js',name:'adapter',isDynamicEntry:true,imports:['_runtime-build.js','index.html']},
    '_runtime-build.js':{file:'assets/runtime-build.js',imports:['_adapter-build.js']},
    'index.html':{file:'assets/index-build.js',isEntry:true},
  };
  load.mockImplementation(async input=>new Response(String(input).endsWith('spine-assets.json')?JSON.stringify(builtManifest):'export {};'));
  const warn=vi.spyOn(console,'warn').mockImplementation(()=>{});
  cancel=scheduleSpinePreload();runIdle();
  await vi.waitFor(()=>expect(load).toHaveBeenCalledTimes(4));
  for(const file of ['adapter','runtime','index'])expect(load).toHaveBeenCalledWith(`/assets/${file}-build.js`,{priority:'low',cache:'force-cache'});
  expect(warn).not.toHaveBeenCalled();
});
test('leaving the homepage before page load removes its pending listener',()=>{
  vi.spyOn(document,'readyState','get').mockReturnValue('loading');
  cancel=scheduleSpinePreload();cancel();window.dispatchEvent(new Event('load'));
  expect(idle).not.toHaveBeenCalled();expect(load).not.toHaveBeenCalled();
});
test('leaving the homepage cancels a queued idle callback',()=>{
  vi.spyOn(document,'readyState','get').mockReturnValue('complete');
  cancel=scheduleSpinePreload();expect(idle).toHaveBeenCalledTimes(1);cancel();
  expect(cancelIdle).toHaveBeenCalledWith(7);expect(load).not.toHaveBeenCalled();
});
test('without idle callbacks, wait one second and allow navigation to cancel the timer',async()=>{
  vi.spyOn(document,'readyState','get').mockReturnValue('complete');
  Object.defineProperty(window,'requestIdleCallback',{value:undefined,configurable:true});
  cancel=scheduleSpinePreload();vi.advanceTimersByTime(999);expect(load).not.toHaveBeenCalled();
  vi.advanceTimersByTime(1);await vi.waitFor(()=>expect(load).toHaveBeenCalledTimes(3));cancel();
  cancel=scheduleSpinePreload();cancel();vi.advanceTimersByTime(1000);expect(load).toHaveBeenCalledTimes(3);
});
test('failed background loading is visible in a warning without an unhandled rejection',async()=>{
  vi.spyOn(document,'readyState','get').mockReturnValue('complete');
  const error=new Error('offline'),warn=vi.spyOn(console,'warn').mockImplementation(()=>{});load.mockRejectedValueOnce(error);
  cancel=scheduleSpinePreload();runIdle();
  await vi.waitFor(()=>expect(warn).toHaveBeenCalledWith('Spine 预加载失败，进入战场时将按需加载：',error));
});
