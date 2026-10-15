// @vitest-environment happy-dom
import {mount,flushPromises} from '@vue/test-utils';
import {nextTick} from 'vue';
import {it,expect,vi,beforeEach,afterEach} from 'vitest';
import FleetSelection from '../src/FleetSelection.vue';
import ShipAbilityDemo from '../src/components/ShipAbilityDemo.vue';
import {runtimeAssets,assetClient} from '../src/assets/runtime.ts';
import {ABILITY_DEMO_SHIP_IDS} from '../shared/ability-demo.ts';
const original=runtimeAssets.abilityDemos;let wrapper:ReturnType<typeof mount>|undefined;
const settle=async()=>{await flushPromises();await nextTick();};
const NativeObserver=globalThis.IntersectionObserver;let initiallyInView=true,intersect:(visible:boolean)=>void;
beforeEach(()=>{
 Object.defineProperty(document,'hidden',{configurable:true,value:false});
 initiallyInView=true;
 globalThis.IntersectionObserver=class {constructor(private callback:IntersectionObserverCallback){}observe(target:Element){intersect=visible=>this.callback([{target,isIntersecting:visible} as IntersectionObserverEntry],this as unknown as IntersectionObserver);intersect(initiallyInView);}disconnect(){}unobserve(){}takeRecords(){return [];}root=null;rootMargin='';thresholds=[];} as unknown as typeof IntersectionObserver;
 runtimeAssets.abilityDemos=Object.fromEntries(ABILITY_DEMO_SHIP_IDS.map(id=>[id,{shipId:id,name:id,ability:'能力演示',width:768,height:960,duration:10,fps:30,webm:`ability-demo/${id}/webm`,mp4:`ability-demo/${id}/mp4`,poster:`ability-demo/${id}/poster`,cues:[{start:0,end:10,round:1,title:'第一阶段',detail:'真实结果'}]}]));
 for(const id of ABILITY_DEMO_SHIP_IDS)for(const kind of ['webm','mp4','poster'])runtimeAssets.files[`ability-demo/${id}/${kind}`]={path:`assets/runtime/${id}.${kind==='poster'?'webp':kind}`,sha256:'a'.repeat(64),bytes:10,contentType:kind==='poster'?'image/webp':`video/${kind}`};
 vi.spyOn(HTMLMediaElement.prototype,'canPlayType').mockReturnValue('probably');vi.spyOn(HTMLMediaElement.prototype,'play').mockResolvedValue();vi.spyOn(HTMLMediaElement.prototype,'pause').mockImplementation(()=>{});vi.spyOn(HTMLMediaElement.prototype,'load').mockImplementation(()=>{});
});
afterEach(()=>{wrapper?.unmount();wrapper=undefined;globalThis.IntersectionObserver=NativeObserver;runtimeAssets.abilityDemos=original;vi.restoreAllMocks();Object.defineProperty(document,'hidden',{configurable:true,value:false});document.body.innerHTML='';});
it('不依赖首帧事件才开始播放：严格只预载元数据的浏览器也能启动',async()=>{
 wrapper=mount(ShipAbilityDemo,{attachTo:document.body,props:{shipId:'dd-1'}});await settle();
 expect(HTMLMediaElement.prototype.play).toHaveBeenCalledTimes(1);
 await wrapper.get('video').trigger('loadeddata');await settle();expect(HTMLMediaElement.prototype.play).toHaveBeenCalledTimes(1);
});
it('舰名和能力与当前阶段解释组成视频上方的标题区域',async()=>{
 runtimeAssets.abilityDemos!['dd-1']={...runtimeAssets.abilityDemos!['dd-1']!,name:'测试舰',ability:'烟幕遮蔽',cues:[{start:0,end:4,round:1,title:'展开烟幕',detail:'第一回合形成遮蔽'},{start:4,end:10,round:2,title:'脱离烟幕',detail:'第二回合恢复视野'}]};
 wrapper=mount(ShipAbilityDemo,{attachTo:document.body,props:{shipId:'dd-1'}});await settle();
 expect(wrapper.find('header').exists()).toBe(true);const heading=wrapper.get('header'),video=wrapper.get('video');
 expect(heading.get('h3').text()).toBe('测试舰 · 烟幕遮蔽');expect(heading.text()).toContain('第一回合形成遮蔽');
 expect(video.element.compareDocumentPosition(heading.element)&Node.DOCUMENT_POSITION_PRECEDING).toBeTruthy();
 (video.element as HTMLVideoElement).currentTime=6;await video.trigger('timeupdate');expect(heading.text()).toContain('第 2 回合');expect(heading.text()).toContain('第二回合恢复视野');expect(heading.text()).not.toContain('第一回合形成遮蔽');
});
it('正常自动播放没有暂停、重播、放大或原生控件',async()=>{
 wrapper=mount(ShipAbilityDemo,{attachTo:document.body,props:{shipId:'dd-1'}});await settle();
 expect(wrapper.findAll('button')).toHaveLength(0);expect((wrapper.get('video').element as HTMLVideoElement).controls).toBe(false);expect(wrapper.find('dialog').exists()).toBe(false);
});
it('开关默认关且无媒体解析，打开只请求当前首选格式；切舰保留开关并释放旧视频，不产生编队事件',async()=>{
 const resolve=vi.spyOn(assetClient,'resolve');wrapper=mount(FleetSelection,{attachTo:document.body,props:{selected:[],disabled:true}});await settle();
 expect(wrapper.find('video').exists()).toBe(false);expect(resolve.mock.calls.flat(2).some(id=>String(id).startsWith('ability-demo/'))).toBe(false);
 const toggle=wrapper.get('[role="switch"][aria-label="能力演示"]');expect(toggle.attributes('aria-checked')).toBe('false');await toggle.trigger('click');await settle();
 const old=wrapper.get('video').element as HTMLVideoElement;expect(old.getAttribute('src')).toContain('dd-1.webm');expect(resolve.mock.calls.flat(2)).not.toContain('ability-demo/dd-1/mp4');
 await wrapper.get('[data-ship-id="cv-3"]').trigger('click');await settle();expect(wrapper.get('video').attributes('src')).toContain('cv-3.webm');expect(old.getAttribute('src')).toBeNull();expect(toggle.attributes('aria-checked')).toBe('true');
 for(const event of ['change','action','confirm','complete'])expect(wrapper.emitted(event)).toBeUndefined();
 await toggle.trigger('click');await settle();expect(wrapper.find('video').exists()).toBe(false);expect(wrapper.find('.portrait-visual').exists()).toBe(true);
});
it('远端坏媒体依次回退同格式本地、MP4远端、本地，穷尽后显示重试',async()=>{
 const resolve=vi.spyOn(assetClient,'resolve').mockImplementation(async ids=>Object.fromEntries(ids.map(id=>[id,{url:`https://media.invalid/${id}`,source:'remote' as const,expiresAt:Date.now()+10000}])));
 wrapper=mount(ShipAbilityDemo,{attachTo:document.body,props:{shipId:'bb-2'}});await settle();expect(wrapper.get('video').attributes('src')).toContain('https://media.invalid/');
 await wrapper.get('video').trigger('error');await settle();expect(wrapper.get('video').attributes('src')).toContain('/assets/runtime/bb-2.webm');
 await wrapper.get('video').trigger('error');await settle();expect(wrapper.get('video').attributes('src')).toContain('/mp4');
 await wrapper.get('video').trigger('error');await settle();expect(wrapper.get('video').attributes('src')).toContain('/assets/runtime/bb-2.mp4');
 await wrapper.get('video').trigger('error');await settle();expect(wrapper.text()).toContain('演示暂时无法加载');expect(wrapper.find('video').exists()).toBe(false);expect(resolve).toHaveBeenCalledTimes(2);
 await wrapper.get('[aria-label="重试能力演示"]').trigger('click');await settle();expect(wrapper.get('video').attributes('src')).toContain('https://media.invalid/');expect(wrapper.text()).not.toContain('演示暂时无法加载');
});
it('浏览器阻止自动播放只显示点击启动入口，成功后隐藏且不切换媒体',async()=>{
 const blocked=Object.assign(new Error('gesture required'),{name:'NotAllowedError'});vi.mocked(HTMLMediaElement.prototype.play).mockRejectedValueOnce(blocked);
 wrapper=mount(ShipAbilityDemo,{attachTo:document.body,props:{shipId:'bb-2'}});await settle();await wrapper.get('video').trigger('loadeddata');await settle();expect(wrapper.text()).toContain('点击播放');expect(wrapper.get('video').attributes('src')).toContain('.webm');
 expect(wrapper.findAll('button')).toHaveLength(1);const video=wrapper.get('video').element;
 Object.defineProperty(document,'hidden',{configurable:true,value:true});document.dispatchEvent(new Event('visibilitychange'));await settle();Object.defineProperty(document,'hidden',{configurable:true,value:false});document.dispatchEvent(new Event('visibilitychange'));await settle();expect(HTMLMediaElement.prototype.play).toHaveBeenCalledTimes(1);
 await wrapper.get('[aria-label="播放能力演示"]').trigger('click');await settle();expect(wrapper.get('video').element).toBe(video);expect(wrapper.findAll('button')).toHaveLength(0);expect(HTMLMediaElement.prototype.play).toHaveBeenCalledTimes(2);
});
it('晚到的旧舰解析不能覆盖当前舰船',async()=>{
 let release!:(value:any)=>void;const originalResolve=assetClient.resolve.bind(assetClient);vi.spyOn(assetClient,'resolve').mockImplementation(ids=>ids.some(id=>id.includes('dd-1'))?new Promise(r=>{release=r;}):originalResolve(ids));
 wrapper=mount(ShipAbilityDemo,{attachTo:document.body,props:{shipId:'dd-1'}});await settle();await wrapper.setProps({shipId:'cv-3'});await settle();expect(wrapper.get('video').attributes('src')).toContain('cv-3');release({'ability-demo/dd-1/webm':assetClient.local('ability-demo/dd-1/webm')});await settle();expect(wrapper.get('video').attributes('src')).toContain('cv-3');
});
it('进入后台暂停，回到前台自动继续，卸载释放src',async()=>{
 wrapper=mount(ShipAbilityDemo,{attachTo:document.body,props:{shipId:'cv-1'}});await settle();const video=wrapper.get('video');await video.trigger('loadeddata');await settle();expect(HTMLMediaElement.prototype.play).toHaveBeenCalledTimes(1);
 Object.defineProperty(document,'hidden',{configurable:true,value:true});document.dispatchEvent(new Event('visibilitychange'));await settle();expect(HTMLMediaElement.prototype.pause).toHaveBeenCalled();
 Object.defineProperty(document,'hidden',{configurable:true,value:false});document.dispatchEvent(new Event('visibilitychange'));await settle();expect(HTMLMediaElement.prototype.play).toHaveBeenCalledTimes(2);
 const element=video.element;wrapper.unmount();wrapper=undefined;expect(element.getAttribute('src')).toBeNull();
});
it('离屏时不启动视频，重新可见才继续播放，前后台切换不会抢占离屏媒体',async()=>{
 initiallyInView=false;wrapper=mount(ShipAbilityDemo,{attachTo:document.body,props:{shipId:'dd-1'}});await settle();expect(HTMLMediaElement.prototype.play).not.toHaveBeenCalled();
 intersect(true);await settle();expect(HTMLMediaElement.prototype.play).toHaveBeenCalledTimes(1);
 intersect(false);await settle();expect(HTMLMediaElement.prototype.pause).toHaveBeenCalled();
 Object.defineProperty(document,'hidden',{configurable:true,value:true});document.dispatchEvent(new Event('visibilitychange'));await settle();Object.defineProperty(document,'hidden',{configurable:true,value:false});document.dispatchEvent(new Event('visibilitychange'));await settle();expect(HTMLMediaElement.prototype.play).toHaveBeenCalledTimes(1);
 intersect(true);await settle();expect(HTMLMediaElement.prototype.play).toHaveBeenCalledTimes(2);
});
it('初始处于后台时等回到前台再自动播放',async()=>{
 Object.defineProperty(document,'hidden',{configurable:true,value:true});wrapper=mount(ShipAbilityDemo,{attachTo:document.body,props:{shipId:'dd-1'}});await settle();expect(HTMLMediaElement.prototype.play).not.toHaveBeenCalled();
 Object.defineProperty(document,'hidden',{configurable:true,value:false});document.dispatchEvent(new Event('visibilitychange'));await settle();expect(HTMLMediaElement.prototype.play).toHaveBeenCalledTimes(1);
});
it('播放请求尚未完成时切后台再返回，中止的旧请求结束后会恢复播放',async()=>{
 let abort!:(reason:Error)=>void;vi.mocked(HTMLMediaElement.prototype.play).mockImplementationOnce(()=>new Promise<void>((_,reject)=>{abort=reject;}));
 wrapper=mount(ShipAbilityDemo,{attachTo:document.body,props:{shipId:'dd-1'}});await settle();
 Object.defineProperty(document,'hidden',{configurable:true,value:true});document.dispatchEvent(new Event('visibilitychange'));await settle();Object.defineProperty(document,'hidden',{configurable:true,value:false});document.dispatchEvent(new Event('visibilitychange'));await settle();expect(HTMLMediaElement.prototype.play).toHaveBeenCalledTimes(1);
 abort(Object.assign(new Error('paused while starting'),{name:'AbortError'}));await settle();expect(HTMLMediaElement.prototype.play).toHaveBeenCalledTimes(2);expect(wrapper.find('.ability-poster').exists()).toBe(false);
});
it('用户开启能力演示后自动循环，不受减少动态效果的单次播放规则阻断',async()=>{
 vi.spyOn(window,'matchMedia').mockReturnValue({matches:true,addEventListener:()=>{},removeEventListener:()=>{}} as unknown as MediaQueryList);
 wrapper=mount(ShipAbilityDemo,{attachTo:document.body,props:{shipId:'dd-1'}});await settle();expect(HTMLMediaElement.prototype.play).toHaveBeenCalledTimes(1);expect((wrapper.get('video').element as HTMLVideoElement).loop).toBe(true);expect(wrapper.findAll('button')).toHaveLength(0);
});
it('明确不支持VP9时只解析MP4并自动循环',async()=>{
 vi.mocked(HTMLMediaElement.prototype.canPlayType).mockImplementation(type=>type.includes('webm')?'':'probably');const resolve=vi.spyOn(assetClient,'resolve');wrapper=mount(ShipAbilityDemo,{attachTo:document.body,props:{shipId:'cv-3'}});await settle();expect(wrapper.get('video').attributes('src')).toContain('.mp4');expect(resolve.mock.calls.flat(2)).not.toContain('ability-demo/cv-3/webm');expect((wrapper.get('video').element as HTMLVideoElement).loop).toBe(true);
});
