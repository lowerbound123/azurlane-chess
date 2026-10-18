import ChoiceSelect from '../../src/components/ChoiceSelect.vue';
import type {VueWrapper} from '@vue/test-utils';
import {mount,flushPromises} from '@vue/test-utils';
import {createPinia} from 'pinia';
import {defineComponent,h,provide,proxyRefs} from 'vue';
import {createGameRouter} from '../../src/router.ts';
import {createWebHistory} from 'vue-router';
import {createAppSession} from '../../src/app-session.ts';
import {SESSION_KEY} from '../../src/session-context.ts';
import App from '../../src/App.vue';
import {BattleMap3D} from './battle-map-test-adapter.ts';
import {vi} from 'vitest';
import {resolveRound,planAI} from '../../src/engine.ts';
import {resolveHistoricalRound} from '../../src/history/index.ts';
import type {LocalRoundRequest} from '../../src/workers/battle-api.ts';
vi.mock('../../src/BattleMap3D.vue',async()=>({default:(await import('./battle-map-test-adapter.ts')).BattleMap3D}));
// DOM runner has no browser Worker. The public calculator boundary is replaced,
// while worker transport/timeout/disposal have independent tests and browser QA.
vi.mock('../../src/composables/battle-computer.ts',()=>({BattleComputer:class {
 private reject:((error:Error)=>void)|null=null;private timer:ReturnType<typeof setTimeout>|undefined;
 resolve({game,plans,opponentPlans,resolution,historical}:LocalRoundRequest){return new Promise<import('../../shared/game.ts').RoundResult>((resolve,reject)=>{this.reject=reject;this.timer=setTimeout(()=>{this.reject=null;try{resolve(historical?resolveHistoricalRound(game,historical,plans):resolveRound(game,{...plans,...(opponentPlans??planAI(game,1))},resolution));}catch(error){reject(error);}},60);});}
 dispose(){clearTimeout(this.timer);this.reject?.(new Error('取消'));this.reject=null;}
}}));

let currentWrapper:VueWrapper|undefined;
export async function chooseSelect(label:string,value:string|number){const select=currentWrapper?.findAllComponents(ChoiceSelect).find(component=>(component.props() as {label?:string}).label===label);if(!select)throw new Error('缺少选项控件: '+label);select.vm.$emit('update:modelValue',value);select.vm.$emit('change',value);await settleGame();}
let navigation:Promise<unknown>=Promise.resolve();
export async function settleGame(){for(let attempt=0;attempt<10;attempt++){const pending=navigation;await pending;await flushPromises();await new Promise(resolve=>setTimeout(resolve,0));await flushPromises();if(pending===navigation)return;}throw new Error('路由未稳定');}
export async function mountGame(options:{resolvedRoute?:string}={}){
  const router=createGameRouter(createWebHistory('/'));const pinia=createPinia();
 const push=router.push.bind(router),replace=router.replace.bind(router);router.push=target=>{const pending=push(target);navigation=pending;return pending;};router.replace=target=>{const pending=replace(target);navigation=pending;return pending;};
  if(options.resolvedRoute)await router.push(options.resolvedRoute);
  let session:ReturnType<typeof proxyRefs<ReturnType<typeof createAppSession>>>|undefined;
  const Host=defineComponent({setup(){const controller=createAppSession(router);provide(SESSION_KEY,controller);session=proxyRefs(controller);return()=>h(App);}});
  const wrapper=mount(Host,{attachTo:document.querySelector('#app')??document.body,global:{plugins:[pinia,router]}});
  currentWrapper=wrapper;
  await router.isReady();await flushPromises();await new Promise(resolve=>setTimeout(resolve,0));
  if(!session)throw new Error('会话初始化失败');
  return {session,router,wrapper,pinia};
}
