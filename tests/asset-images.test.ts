// @vitest-environment happy-dom
import {test,expect,vi,beforeEach} from 'vitest';
vi.mock('../src/characters/ships.generated.json',()=>({default:{profiles:{},catalog:{},historical:{},templates:{},identities:{}}}));
import {mount,flushPromises} from '@vue/test-utils';
import {defineComponent,h} from 'vue';
import {AssetClient} from '../src/assets/client.ts';
import type {RuntimeAssetManifest} from '../shared/assets.ts';
const state=vi.hoisted(()=>({client:null as unknown as AssetClient,manifest:null as unknown as RuntimeAssetManifest}));
vi.mock('../src/assets/runtime.ts',()=>({get assetClient(){return state.client;},get runtimeAssets(){return state.manifest;}}));
import ProgressiveImage from '../src/components/ProgressiveImage.vue';
import SpineThumbnail from '../src/components/SpineThumbnail.vue';
import {useSpineThumbnails} from '../src/composables/use-spine-thumbnails.ts';
let requests:string[][];
beforeEach(()=>{
 requests=[];vi.stubGlobal('IntersectionObserver',undefined);
 state.manifest={version:1,files:Object.fromEntries(['small','large','preview','thumb'].map(id=>[id,{path:`assets/runtime/${id}-123.webp`,sha256:'abc',bytes:1,contentType:'image/webp'}])),images:{'test.png':{src:'large',preview:'preview',width:800,height:1000,variants:[{src:'small',width:128,height:160,bytes:1},{src:'large',width:800,height:1000,bytes:1}]}},spinePreviews:{sailor:'thumb'},spine:{},models:{aircraft:'small',mine:'large',torpedo:'large'},sources:{},spineFingerprints:{}};
 state.client=new AssetClient(state.manifest,{baseUrl:'/game/',fetchImpl:async(url,init)=>{if(url==='/api/config')return new Response(JSON.stringify({assetStorage:{provider:'s3'}}));const {ids}=JSON.parse(String(init?.body));requests.push(ids);return new Response(JSON.stringify({assets:Object.fromEntries(ids.map((id:string)=>[id,{url:`https://bucket/${id}?signature=yes`,expiresAt:Date.now()+60000,source:'remote'}]))}));}});
});
test('resolves preview and every srcset candidate, then removes remote candidates on download failure',async()=>{
 const wrapper=mount(ProgressiveImage,{props:{path:'test.png',alt:'舰船'}});try{
  await flushPromises();expect(wrapper.get('.image-preview').attributes('src')).toBe('https://bucket/preview?signature=yes');
  expect(wrapper.get('.image-full').attributes('srcset')).toBe('https://bucket/small?signature=yes 128w, https://bucket/large?signature=yes 800w');
  await wrapper.get('.image-full').trigger('error');await flushPromises();
  expect(wrapper.get('.image-full').attributes('src')).toBe('/game/assets/runtime/large-123.webp');expect(wrapper.get('.image-full').attributes('srcset')).not.toContain('https:');expect(requests).toHaveLength(2);
  await wrapper.get('.image-full').trigger('error');await flushPromises();expect(wrapper.text()).toContain('图片加载失败');expect(requests).toHaveLength(2);
 }finally{wrapper.unmount();}
});
test('does not resolve lazy images until they approach the viewport',async()=>{
 let intersect!:(entries:{isIntersecting:boolean}[])=>void;
 vi.stubGlobal('IntersectionObserver',class{constructor(callback:typeof intersect){intersect=callback;}observe(){}disconnect(){}});
 const wrapper=mount(ProgressiveImage,{props:{path:'test.png',alt:'舰船'}});try{
  await flushPromises();expect(requests).toHaveLength(0);expect(wrapper.find('.image-full').exists()).toBe(false);
  intersect([{isIntersecting:true}]);await flushPromises();expect(wrapper.get('.image-full').attributes('src')).toContain('https://bucket/');
 }finally{wrapper.unmount();}
});
test('fixed thumbnails retry downloads through the resolver without rendering temporary images',async()=>{
 const Host=defineComponent({setup(){const {sources,errors,onError}=useSpineThumbnails(['dd']);return()=>h(SpineThumbnail,{template:'dd',name:'船',src:sources.value.dd,error:errors.value.dd,onError:()=>onError('dd')});}});
 const wrapper=mount(Host);try{
  await flushPromises();expect(wrapper.get('img').attributes('src')).toBe('https://bucket/thumb?signature=yes');
  await wrapper.get('img').trigger('error');await flushPromises();expect(wrapper.get('img').attributes('src')).toBe('/game/assets/runtime/thumb-123.webp');
  await wrapper.get('img').trigger('load');expect(wrapper.get('[data-spine-template]').attributes('data-spine-status')).toBe('ready');
 }finally{wrapper.unmount();}
});
