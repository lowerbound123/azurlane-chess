// @vitest-environment happy-dom
import {test,vi,beforeEach} from 'vitest';
import assert from 'node:assert/strict';
import {mount,flushPromises} from '@vue/test-utils';
import {defineComponent,h} from 'vue';
import {useSpineThumbnails} from '../src/composables/use-spine-thumbnails.ts';
import SpineThumbnail from '../src/components/SpineThumbnail.vue';
import {characterConfig} from '../src/characters/config.ts';

const io=vi.hoisted(()=>({create:vi.fn(),load:vi.fn(async(_template:string)=> 'blob:custom-spine'),release:vi.fn(),dispose:vi.fn()}));
vi.mock('../src/characters/previews.ts',()=>({SpinePreviews:class {
  constructor(){io.create();}load(template:string){return io.load(template);}releaseGPU(){io.release();}dispose(){io.dispose();}
}}));
beforeEach(()=>vi.clearAllMocks());
const host=(templates:string[])=>defineComponent({setup(){const {sources,errors}=useSpineThumbnails(templates);return()=>templates.map(template=>h(SpineThumbnail,{template,name:template,src:sources.value[template],error:errors.value[template]}));}});
test('compiled default thumbnails are available immediately and never instantiate Spine',async()=>{
  const wrapper=mount(host(['dd','cv']));
  try {
    for(const image of wrapper.findAll('img'))assert.match(image.attributes('src')!,/^\/assets\/images\/spine-sailor-[a-f0-9]{16}\.webp$/);
    await flushPromises();assert.equal(io.create.mock.calls.length,0);
    assert.equal(wrapper.get('[data-spine-template="dd"]').attributes('data-spine-status'),'loading');
    await wrapper.get('img').trigger('load');assert.equal(wrapper.get('[data-spine-template="dd"]').attributes('data-spine-status'),'ready');
  }finally{wrapper.unmount();}
  assert.equal(io.dispose.mock.calls.length,0);
});
test('a newly mapped profile uses the existing renderer while cached profiles remain static',async()=>{
  characterConfig.profiles.testFresh={...characterConfig.profiles.sailor};characterConfig.templates.cv='testFresh';
  const wrapper=mount(host(['dd','cv']));
  try {
    await flushPromises();assert.deepEqual(io.load.mock.calls,[['cv']]);
    assert.match(wrapper.get('[data-spine-template="dd"] img').attributes('src')!,/spine-sailor/);
    assert.equal(wrapper.get('[data-spine-template="cv"] img').attributes('src'),'blob:custom-spine');
    assert.equal(io.release.mock.calls.length,1);
  }finally{wrapper.unmount();delete characterConfig.templates.cv;delete characterConfig.profiles.testFresh;}
  assert.equal(io.dispose.mock.calls.length,1);
});
test('thumbnail download errors are displayed rather than reported ready',async()=>{
  const wrapper=mount(SpineThumbnail,{props:{template:'dd',name:'驱逐-1',src:'/missing.webp'}});
  try {
    await wrapper.get('img').trigger('error');assert.equal(wrapper.attributes('data-spine-status'),'error');assert.match(wrapper.text(),/素材失败/);
  }finally{wrapper.unmount();}
});
