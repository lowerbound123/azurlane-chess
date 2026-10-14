// @vitest-environment happy-dom
import {test,vi} from 'vitest';
import {mount} from '@vue/test-utils';
import {nextTick} from 'vue';
import assert from 'node:assert/strict';
import AccountUI from '../src/AccountUI.vue';
import {AccountClient} from '../src/account-client.ts';
test('locked account notices expire, restart their lifetime and clean up on unmount',async()=>{
 vi.useFakeTimers({toFake:['setTimeout','clearTimeout']});
 const wrapper=mount(AccountUI,{attachTo:document.body,props:{client:new AccountClient(),state:{enabled:true,loaded:true,user:{id:'u1',username:'A'}},locked:true}});
 const logout=async()=>{await wrapper.findAll('button').find(button=>button.text()==='退出登录')!.trigger('click');};
 try{
  await logout();assert.ok(document.querySelector('.account-notice'));
  vi.advanceTimersByTime(4000);await nextTick();assert.ok(document.querySelector('.account-notice'));
  await logout();vi.advanceTimersByTime(1000);await nextTick();assert.ok(document.querySelector('.account-notice'),'new notice must not inherit the old expiry');
  vi.advanceTimersByTime(4000);await nextTick();assert.ok(!document.querySelector('.account-notice'),'expired notice is removed');
  await logout();wrapper.unmount();assert.ok(!document.querySelector('.account-notice'));assert.equal(vi.getTimerCount(),0);
 }finally{wrapper.unmount();vi.useRealTimers();}
});
