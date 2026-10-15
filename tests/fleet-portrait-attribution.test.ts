// @vitest-environment happy-dom
import {test,expect,vi} from 'vitest';
import {mount} from '@vue/test-utils';
import {defineComponent,h,nextTick} from 'vue';
vi.mock('../src/characters/ships.generated.json',()=>({default:{profiles:{},templates:{},historical:{},catalog:{'dd-1':'imported'},identities:{imported:{name:'导入舰船',avatar:'portraits/imported.webp',portrait:'portraits/imported.webp'}}}}));
import FleetSelection from '../src/FleetSelection.vue';
const ImageStub=defineComponent({props:['path','alt'],setup:props=>()=>h('img',{src:props.path,alt:props.alt})});
test('imported identity portrait uses neutral attribution and the original default uses its own attribution',async()=>{
 const wrapper=mount(FleetSelection,{global:{stubs:{ProgressiveImage:ImageStub,SpineThumbnail:true}}});
 try{
 expect(wrapper.find('.ship-portrait img').attributes('src')).toBe('portraits/imported.webp');
 expect(wrapper.find('.ship-portrait figcaption').text()).toBe('基础立绘');
 expect(wrapper.find('.ship-portrait img').attributes('alt')).toBe('导入舰船 · 基础立绘');
 expect(wrapper.find('.ship-portrait').text()).not.toContain('AI');
 await wrapper.find('[data-ship-id="dd-2"]').trigger('click');await nextTick();
 expect(wrapper.find('.ship-portrait img').attributes('src')).toBe('portraits/default-ship.webp');
 expect(wrapper.find('.ship-portrait figcaption').text()).toBe('原创默认立绘');
 expect(wrapper.find('.ship-portrait img').attributes('alt')).toContain('原创默认人物立绘');
 }finally{wrapper.unmount();}
});
