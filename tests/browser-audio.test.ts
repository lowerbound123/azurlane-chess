// @vitest-environment happy-dom
import {afterEach,expect,test,vi} from 'vitest';
import {BrowserAudioBackend} from '../src/audio/browser.ts';
import type {AssetClient} from '../src/assets/client.ts';
const descriptor=Object.getOwnPropertyDescriptor(window,'AudioContext');
afterEach(()=>{if(descriptor)Object.defineProperty(window,'AudioContext',descriptor);else delete (window as unknown as Record<string,unknown>).AudioContext;});
test('a real user gesture resumes a Web Audio context after a Safari interruption',async()=>{
 let context:Context;
 class Context {
  state='suspended';destination={};resume=vi.fn(async()=>{this.state='running';});close=vi.fn(async()=>{this.state='closed';});
  constructor(){context=this;}
  createGain(){return {gain:{value:1},connect(){}};}
 }
 Object.defineProperty(window,'AudioContext',{configurable:true,value:Context});
 const backend=new BrowserAudioBackend({} as AssetClient);await backend.unlock();expect(backend.ready).toBe(true);
 context!.state='interrupted';expect(backend.ready).toBe(false);await backend.unlock();
 expect(context!.resume).toHaveBeenCalledTimes(2);expect(backend.ready).toBe(true);backend.dispose();
});
