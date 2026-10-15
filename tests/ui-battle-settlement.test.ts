// @vitest-environment happy-dom
import {test,expect,vi} from 'vitest';
import {defineComponent} from 'vue';
import {mountGame,settleGame} from './helpers/mount-game.ts';
import * as E from '../src/engine.ts';
vi.mock('../src/components/BattleSettlement.vue',()=>({default:defineComponent({name:'BattleSettlement',props:['ships','myTeam','winner'],emits:['close'],template:'<section data-settlement><span>{{ships.length}} participants</span><button @click="$emit(\'close\')">关闭结算</button></section>'})}));
test('opens after playback completes, includes sunk ships, and can close and reopen',async()=>{
 document.body.innerHTML='<div id="app"></div>';const {session:vm,wrapper}=await mountGame();
 try{
  const g=E.createGame(undefined,23);g.phase='plan';vm.game=g;vm.screen='battle';await settleGame();expect(wrapper.find('[data-settlement]').exists()).toBe(false);
  vm.busy=true;vm.game={...g,phase:'ended',winner:0,ships:g.ships.map(s=>({...s,hp:s.team===1?0:s.hp}))};await settleGame();expect(wrapper.find('[data-settlement]').exists()).toBe(false);
  vm.busy=false;await settleGame();expect(wrapper.find('[data-settlement]').exists()).toBe(true);expect(wrapper.find('[data-settlement]').text()).toContain('10 participants');
  await wrapper.find('[data-settlement] button').trigger('click');await settleGame();expect(wrapper.find('[data-settlement]').exists()).toBe(false);
  const open=wrapper.findAll('button').find(b=>b.text().includes('查看结算'));expect(open).toBeDefined();await open!.trigger('click');await settleGame();expect(wrapper.find('[data-settlement]').exists()).toBe(true);
 }finally{wrapper.unmount();}
});
