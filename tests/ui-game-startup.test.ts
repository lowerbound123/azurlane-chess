// @vitest-environment happy-dom
import {expect,it} from 'vitest';
import {mount,flushPromises} from '@vue/test-utils';
import GameStartup from '../src/components/GameStartup.vue';
import {AssetPreloadError,type PreloadProgress} from '../src/assets/preload.ts';

it('blocks every game entry until preparation resolves, even if reported bytes already reach 100 percent',async()=>{
 let finish!:()=>void;let report!:(value:PreloadProgress)=>void;
 const wrapper=mount(GameStartup,{props:{prepare:update=>{report=update;return new Promise<void>(done=>{finish=done;});}},slots:{default:'<button>开始游戏</button>'}});
 expect(wrapper.find('button').exists()).toBe(false);
 expect(wrapper.find('[role="progressbar"]').attributes('aria-valuenow')).toBe('0');
 report({loaded:2,total:2,loadedBytes:10,totalBytes:10,failed:0});await flushPromises();
 expect(wrapper.find('button').exists()).toBe(false);
 finish();await flushPromises();
 expect(wrapper.find('button').text()).toBe('开始游戏');
 expect(wrapper.find('[role="progressbar"]').exists()).toBe(false);wrapper.unmount();
});

it('keeps the game unavailable after an error and opens it only after a successful retry',async()=>{
 let attempt=0;const wrapper=mount(GameStartup,{props:{prepare:async()=>{if(++attempt===1)throw new AssetPreloadError(1);}},slots:{default:'<nav>游戏入口</nav>'}});
 await flushPromises();expect(wrapper.find('nav').exists()).toBe(false);
 expect(wrapper.find('[role="alert"]').text()).toContain('1 项资源未能加载');
 await wrapper.get('button').trigger('click');await flushPromises();
 expect(wrapper.find('nav').text()).toBe('游戏入口');wrapper.unmount();
});

it('requires a document refresh after code or stylesheet failure instead of reusing a failed import',async()=>{
 const wrapper=mount(GameStartup,{props:{prepare:async()=>{throw Error('Unable to preload CSS');}},slots:{default:'<nav>游戏入口</nav>'}});
 await flushPromises();expect(wrapper.find('nav').exists()).toBe(false);
 expect(wrapper.get('button').text()).toBe('刷新重试');wrapper.unmount();
});
