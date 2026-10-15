// @vitest-environment happy-dom
import {test,vi} from 'vitest';
import assert from 'node:assert/strict';
import {mount,flushPromises} from '@vue/test-utils';
import {defineComponent,h,ref,reactive,nextTick} from 'vue';
import type {MapModel} from '../shared/render.ts';
import {TacticalModels} from '../src/scene/tactical-models.ts';
import {useBattleMap} from '../src/composables/use-battle-map.ts';

const observed=vi.hoisted(()=>({water:[] as number[]}));
// happy-dom has no GPU. Keep the real board, shader uniforms and animation loop;
// observe the time submitted to the GPU instead of replacing the sea animation.
vi.mock('three',async importOriginal=>{
 const three=await importOriginal<typeof import('three')>();
 return {...three,WebGLRenderer:class {
  domElement=document.createElement('canvas');
  setPixelRatio(){} setClearColor(){} setSize(){} dispose(){} forceContextLoss(){}
  render(scene:import('three').Scene){scene.traverse(object=>{
   if(object instanceof three.Mesh&&object.material instanceof three.ShaderMaterial&&object.material.uniforms.time)
    observed.water.push(object.material.uniforms.time.value);
  });}
 }};
});

test('sea time remains continuous across planning, accelerated replay, completion and the next round',async()=>{
 const animation=new Map<number,FrameRequestCallback>();let handle=0;
 vi.stubGlobal('requestAnimationFrame',(cb:FrameRequestCallback)=>(animation.set(++handle,cb),handle));
 vi.stubGlobal('cancelAnimationFrame',(id:number)=>animation.delete(id));
 const models=vi.spyOn(TacticalModels,'load').mockResolvedValue({dispose(){}} as TacticalModels);
 const props=reactive<{model:MapModel}>({model:{cells:[],myTeam:0,ships:[],planes:[],torpedoes:[],mines:[],selected:'',phase:'plan',mode:'move',previews:[],mainTargets:[],rays:[],showPlans:false,showRanges:false,overlayType:'',busy:false,airRange:null,visuals:{},round:1}});
 let error!:ReturnType<typeof useBattleMap>['error'];
 const wrapper=mount(defineComponent({setup(){const host=ref<HTMLElement|null>(null);({error}=useBattleMap(host,props,()=>{}));return()=>h('div',{ref:host});}}));
 const step=async(now:number,patch:Partial<MapModel>={})=>{
  props.model={...props.model,...patch};await nextTick();
  const callbacks=[...animation.values()];animation.clear();callbacks.forEach(cb=>cb(now));
  assert.equal(error.value,'');return observed.water.at(-1)!;
 };
 try{
  await flushPromises();assert.equal(error.value,'');
  assert.equal(await step(10000),10);
  assert.equal(await step(10050,{busy:true,visualTime:0}),10.05);
  assert.equal(await step(10100,{visualTime:.4}),10.1);
  assert.equal(await step(10150,{visualTime:3.2}),10.15);
  assert.equal(await step(10200,{busy:false,visualTime:undefined,round:2}),10.2);
  assert.equal(await step(10250,{busy:true,visualTime:0}),10.25);
 }finally{wrapper.unmount();models.mockRestore();vi.unstubAllGlobals();observed.water.length=0;}
});
