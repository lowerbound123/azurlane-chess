// @vitest-environment happy-dom
import {test,vi} from 'vitest';
import assert from 'node:assert/strict';
import {mount,flushPromises} from '@vue/test-utils';
import ProgressiveImage from '../src/components/ProgressiveImage.vue';

test('image starts with a preview, lazily decodes full WebP, resets on reuse and reports errors',async()=>{
  vi.stubGlobal('IntersectionObserver',undefined);
  const wrapper=mount(ProgressiveImage,{props:{path:'portraits/default-ship.webp',alt:'舰船立绘'}});
  try {
    await flushPromises();
    const full=wrapper.get('img.image-full');
    assert.equal(full.attributes('loading')!,'lazy');assert.equal(full.attributes('decoding')!,'async');
    assert.match(full.attributes('src')!,/\.webp$/);assert.match(full.attributes('srcset')!,/128w/);
    assert.equal(full.attributes('alt')!,'舰船立绘');
    assert.match(wrapper.get('img.image-preview').attributes('src')!,/preview-[a-f0-9]{16}\.webp$/);
    assert.ok(!wrapper.classes().includes('image-loaded'));
    await full.trigger('load');assert.ok(wrapper.classes().includes('image-loaded'));
    await wrapper.setProps({size:'avatar'});assert.ok(!wrapper.classes().includes('image-loaded'));
    await flushPromises();
    assert.ok(!wrapper.get('img.image-full').attributes('srcset')!.includes('960w'));
    await wrapper.get('img.image-full').trigger('error');assert.equal(wrapper.get('[role="status"]').text(),'图片加载失败');
  } finally {wrapper.unmount();vi.unstubAllGlobals();}
});
