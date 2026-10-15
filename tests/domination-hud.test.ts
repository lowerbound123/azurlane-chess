// @vitest-environment happy-dom
import {expect,test} from 'vitest';
import {mount} from '@vue/test-utils';
import DominationPanel from '../src/components/DominationPanel.vue';
import {createDominationState} from '../shared/domination.ts';

test('three compact objective indicators retain ownership, contested and capture progress descriptions',async()=>{
 const state=createDominationState();
 Object.assign(state.points[0],{owner:0,capturedRound:1});
 Object.assign(state.points[1],{owner:null,progressTeam:0,progress:50,contested:true});
 Object.assign(state.points[2],{progressTeam:0,progress:50});
 const wrapper=mount(DominationPanel,{props:{state,myTeam:0}});
 try{
  const indicators=wrapper.findAll('button[data-capture-point]');
  expect(indicators).toHaveLength(3);
  expect(indicators[0].attributes('aria-label')).toContain('A · 我方已占领');
  expect(indicators[1].attributes('aria-label')).toContain('争夺中');
  expect(indicators[2].attributes('aria-label')).toContain('我方占领 50%');
  expect(indicators[0].classes()).toContain('friendly');
  await indicators[1].trigger('click');
  expect(wrapper.get('[data-capture-detail]').text()).toContain('我方占领 50% · 进度暂停');
  window.dispatchEvent(new KeyboardEvent('keydown',{key:'Escape',bubbles:true}));
  await wrapper.vm.$nextTick();
  expect(wrapper.find('[data-capture-detail]').exists()).toBe(false);
  await indicators[1].trigger('click');
  document.body.dispatchEvent(new PointerEvent('pointerdown',{bubbles:true}));
  await wrapper.vm.$nextTick();
  expect(wrapper.find('[data-capture-detail]').exists()).toBe(false);
  await wrapper.setProps({myTeam:1});
  expect(indicators[0].attributes('aria-label')).toContain('敌方已占领');
  expect(indicators[0].classes()).toContain('enemy');
 }finally{wrapper.unmount();}
});
