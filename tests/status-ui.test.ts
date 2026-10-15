// @vitest-environment happy-dom
import {test,expect} from 'vitest';
import {mount} from '@vue/test-utils';
import {nextTick} from 'vue';
import UnitStatusStrip from '../src/components/UnitStatusStrip.vue';
import {statusGroups} from '../src/status-presentation.ts';
import {applyStatus,type StatusCarrier} from '../shared/status.ts';
function fixture(){const unit:StatusCarrier={};for(let i=0;i<6;i++)applyStatus(unit,{id:`test-${i}`,name:`状态${i}`,kind:i%2?'debuff':'buff',icon:i?'eye':'not-an-icon',description:'示例说明',effects:[{kind:'speed',value:1}]},{round:5,duration:2});return unit;}
test('status groups show current numeric effects, absolute timing, pending and suppressed sources',()=>{
 const u=fixture();applyStatus(u,{id:'test-0',name:'状态0',kind:'buff',icon:'up',description:'测试',strength:2,effects:[{kind:'speed',value:2}]},{round:5,duration:1,source:{unitId:'visible',name:'友舰'}});
 const group=statusGroups(u.statuses,5)[0];expect(group.effects).toContain('航速 +2');expect(group.instances.some(s=>s.state==='suppressed')).toBe(true);expect(group.instances[0].timing).toContain('第 6 回合');
 expect(statusGroups(u.statuses,4).every(s=>s.pending)).toBe(true);expect(statusGroups(u.statuses,8)).toEqual([]);
});
test('real status strip groups overflow and handles focus, escape and event isolation',async()=>{
 const u=fixture(),wrapper=mount(UnitStatusStrip,{props:{statuses:u.statuses,round:5,unitName:'岛风'},attachTo:document.body});
 expect(wrapper.findAll('button')).toHaveLength(5);expect(wrapper.text()).toContain('+2');
 const first=wrapper.find('button');await first.trigger('focus');await new Promise(r=>setTimeout(r,200));await nextTick();
 expect(document.body.textContent).toContain('航速 +1');expect(document.body.textContent).toContain('第 6 回合结束');
 await first.trigger('keydown',{key:'Escape'});await nextTick();
 let leaked=0;const parent=wrapper.element.parentElement!;const count=()=>leaked++;parent.addEventListener('pointerup',count);await first.trigger('pointerup');expect(leaked).toBe(0);parent.removeEventListener('pointerup',count);
 parent.addEventListener('keydown',count);await first.trigger('keydown',{key:'Enter'});await first.trigger('keydown',{key:' '});expect(leaked).toBe(0);parent.removeEventListener('keydown',count);
 await wrapper.setProps({statuses:undefined});expect(wrapper.findAll('button')).toHaveLength(0);wrapper.unmount();
});
