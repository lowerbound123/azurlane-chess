// @vitest-environment happy-dom
import {afterEach,beforeEach,describe,expect,it,vi} from 'vitest';
import {flushPromises,mount} from '@vue/test-utils';
import type {FrameShip} from '../shared/game.ts';
import type {CharacterAsset} from '../src/characters/spine.ts';
import {CharacterLibrary,ShipCharacter} from '../src/characters/spine.ts';
import BattleSettlement from '../src/components/BattleSettlement.vue';

const resources=vi.hoisted(()=>({fail:false,failRender:false,contexts:[] as {disposed:boolean;lost:boolean;canvas:HTMLCanvasElement}[]}));
vi.mock('three',async importOriginal=>{
 const three=await importOriginal<typeof import('three')>();
 return {...three,WebGLRenderer:class {
  domElement=document.createElement('canvas');
  resource={disposed:false,lost:false,canvas:this.domElement};
  constructor(){if(resources.fail)throw new Error('WebGL unavailable');resources.contexts.push(this.resource);}
  setPixelRatio(){}setSize(){}setClearColor(){}render(){if(resources.failRender)throw new Error('GPU context lost');}
  dispose(){this.resource.disposed=true;}
  forceContextLoss(){this.resource.lost=true;}
 }};
});

const ships:FrameShip[]=[
 {id:'1-0',team:1,label:'我方后排',template:'bb',hp:100,cfg:{name:'我方后排',role:'back',hp:100,speed:1,vision:3,collision:1,radius:1},pos:{q:0,r:0},xy:{x:0,y:0},heading:0},
 {id:'1-1',team:1,label:'我方阵亡前排',template:'dd',hp:0,cfg:{name:'我方阵亡前排',role:'front',hp:100,speed:1,vision:3,collision:1,radius:1},pos:{q:1,r:0},xy:{x:1,y:0},heading:0},
 {id:'0-0',team:0,label:'敌方阵亡舰',template:'cv',hp:0,cfg:{name:'敌方阵亡舰',role:'back',hp:100,speed:1,vision:3,collision:1,radius:1},pos:{q:3,r:0},xy:{x:3,y:0},heading:3},
];
let wrapper:ReturnType<typeof mount>|undefined;
let frames:Map<number,FrameRequestCallback>,observers:Set<unknown>;
beforeEach(()=>{
 resources.fail=false;resources.failRender=false;resources.contexts.length=0;frames=new Map();observers=new Set();let nextFrame=0;
 vi.spyOn(CharacterLibrary.prototype,'loadProfile').mockImplementation(()=>new Promise(()=>{}));
 vi.stubGlobal('requestAnimationFrame',(callback:FrameRequestCallback)=>{const id=++nextFrame;frames.set(id,callback);return id;});
 vi.stubGlobal('cancelAnimationFrame',(id:number)=>{frames.delete(id);});
 vi.stubGlobal('ResizeObserver',class {observe(){observers.add(this);}unobserve(){}disconnect(){observers.delete(this);}});
 vi.spyOn(HTMLDialogElement.prototype,'showModal').mockImplementation(function(this:HTMLDialogElement){this.open=true;});
 vi.spyOn(HTMLDialogElement.prototype,'close').mockImplementation(function(this:HTMLDialogElement){this.open=false;this.dispatchEvent(new Event('close'));});
});
afterEach(()=>{wrapper?.unmount();wrapper=undefined;vi.restoreAllMocks();vi.unstubAllGlobals();document.body.innerHTML='';});
const open=()=>{wrapper=mount(BattleSettlement,{attachTo:document.body,props:{ships,myTeam:1,winner:1}});return wrapper;};

describe('battle settlement screen',()=>{
 it('胜负按我方视角显示，完整阵容包含双方阵亡舰，只有回看战场操作',async()=>{
  const screen=open();await flushPromises();
  expect(screen.get('[role="dialog"]').attributes('aria-label')).toContain('战后结算');
  expect(screen.get('[data-settlement-team="friendly"]').text()).toContain('我方胜利');
  expect(screen.get('[data-settlement-team="enemy"]').text()).toContain('敌方战败');
  expect(screen.findAll('[data-settlement-ship]').map(node=>node.attributes('data-settlement-ship'))).toEqual(['1-0','1-1','0-0']);
  expect(screen.text()).toContain('我方阵亡前排');expect(screen.text()).toContain('敌方阵亡舰');
  expect(screen.findAll('button').map(button=>button.text()).some(text=>/再战/.test(text))).toBe(false);
  expect(screen.get('button[data-settlement-close]').text()).toContain('继续查看战场');
 });

 it('胜败动作交给真实角色对象，平局更新后双方都使用yun',async()=>{
  const action=vi.spyOn(ShipCharacter.prototype,'setAction');open();await flushPromises();
  expect(action.mock.calls.map(call=>call[0])).toEqual(['dance','dance','yun']);
  await wrapper!.setProps({winner:'draw'});await flushPromises();
  expect(wrapper!.text()).toContain('双方平局');
  expect(action.mock.calls.slice(-3).map(call=>call[0])).toEqual(['yun','yun','yun']);
 });

 it('点击回看会立即释放动画、监听、角色和GPU，异步素材晚到也会释放',async()=>{
  let complete!:(asset:CharacterAsset)=>void;
  vi.mocked(CharacterLibrary.prototype.loadProfile).mockImplementation(()=>new Promise(resolve=>{complete=resolve;}));
  const disposeActor=vi.spyOn(ShipCharacter.prototype,'dispose'),screen=open();await flushPromises();
  expect(frames.size).toBe(1);expect(observers.size).toBe(1);expect(screen.find('canvas').exists()).toBe(true);
  await screen.get('button[data-settlement-close]').trigger('click');
  expect(screen.emitted('close')).toHaveLength(1);expect(frames.size).toBe(0);expect(observers.size).toBe(0);
  expect(disposeActor).toHaveBeenCalledTimes(ships.length);
  expect(resources.contexts[0]).toMatchObject({disposed:true,lost:true});expect(document.contains(resources.contexts[0]!.canvas)).toBe(false);
  const disposed=vi.fn();complete({manager:{dispose:disposed}} as unknown as CharacterAsset);await flushPromises();
  expect(disposed).toHaveBeenCalledOnce();
 });

 it('Escape与组件卸载都能结束场景，焦点回到进入结算前的控件',async()=>{
  const trigger=document.createElement('button');document.body.append(trigger);trigger.focus();
  open();await flushPromises();
  await wrapper!.get('dialog').trigger('cancel');expect(wrapper!.emitted('close')).toHaveLength(1);
  wrapper!.unmount();wrapper=undefined;
  expect(document.activeElement).toBe(trigger);expect(frames.size).toBe(0);expect(observers.size).toBe(0);
 });

 it('WebGL初始化失败仍显示完整参战名册和回看入口',async()=>{
  resources.fail=true;const screen=open();await flushPromises();
  expect(screen.get('[role="status"]').text()).toContain('暂时无法显示');
  expect(screen.text()).toContain('敌方阵亡舰');
  await screen.get('button[data-settlement-close]').trigger('click');expect(screen.emitted('close')).toHaveLength(1);
  expect(frames.size).toBe(0);expect(observers.size).toBe(0);
 });

 it('首帧渲染失败不会在降级后重新注册动画帧和尺寸监听',async()=>{
  resources.failRender=true;const screen=open();await flushPromises();
  expect(screen.get('[role="status"]').text()).toContain('暂时无法显示');
  expect(resources.contexts[0]).toMatchObject({disposed:true,lost:true});
  expect(frames.size).toBe(0);expect(observers.size).toBe(0);
 });
});
