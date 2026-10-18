import {expect,test,vi} from 'vitest';
import * as THREE from 'three';
import type {MapModel,WakeTimeline} from '../shared/render.ts';
import {Wakes} from '../src/scene/wakes.ts';

const timeline:WakeTimeline={endTime:2,segments:[
 {kind:'ship',from:{x:0,y:0},to:{x:2,y:0},start:0,end:.5,distance:0},
 {kind:'ship',from:{x:2,y:0},to:{x:2,y:2},start:.5,end:1,distance:2},
 {kind:'torpedo',from:{x:0,y:1},to:{x:4,y:1},start:0,end:.7,distance:0},
]};
const model=(patch:Partial<MapModel>={}):MapModel=>({cells:[],myTeam:0,ships:[],planes:[],torpedoes:[],mines:[],selected:'',phase:'execute',mode:'move',previews:[],mainTargets:[],rays:[],showPlans:false,showRanges:false,overlayType:'',busy:true,airRange:null,visuals:{},round:1,visualTime:0,wakeTimeline:timeline,...patch});
const meshes=(wakes:Wakes)=>wakes.root.children as THREE.Mesh<THREE.BufferGeometry,THREE.ShaderMaterial>[];

test('turn-long wake geometry survives late replay, then remains animated and faded throughout planning and resolution',()=>{
 const wakes=new Wakes(new THREE.Scene());
 try{
  wakes.update(model());wakes.tick(10);
  expect(meshes(wakes)).toHaveLength(2);
  const originals=meshes(wakes).map(m=>m.geometry);
  wakes.update(model({visualTime:1.9}));wakes.tick(12);
  expect(meshes(wakes).map(m=>m.geometry)).toEqual(originals);
  expect(meshes(wakes).every(m=>m.material.uniforms.replayTime.value===1.9)).toBe(true);
  wakes.update(model({busy:false,phase:'plan',round:2,visualTime:undefined}));
  wakes.tick(13);wakes.tick(1000);
  expect(meshes(wakes).map(m=>m.geometry)).toEqual(originals);
  expect(meshes(wakes).every(m=>m.visible&&m.material.uniforms.fading.value===1)).toBe(true);
  expect(meshes(wakes).every(m=>m.material.uniforms.time.value===1000)).toBe(true);
  wakes.update(model({round:2,visualTime:undefined}));
  expect(meshes(wakes).map(m=>m.geometry)).toEqual(originals);
  expect(meshes(wakes).every(m=>m.material.uniforms.fading.value===1)).toBe(true);
 }finally{wakes.dispose();}
});

test('the next playback clears every old wake even when the new round contains no movement',()=>{
 const scene=new THREE.Scene(),wakes=new Wakes(scene);
 wakes.update(model({visualTime:1}));
 const disposals=meshes(wakes).map(m=>vi.spyOn(m.geometry,'dispose'));
 wakes.update(model({busy:false,phase:'plan',visualTime:undefined,round:2}));
 expect(meshes(wakes)).toHaveLength(2);
 wakes.update(model({round:2,wakeTimeline:{endTime:1.1,segments:[]}}));
 expect(wakes.root.children).toHaveLength(0);expect(disposals.every(spy=>spy.mock.calls.length===1)).toBe(true);
 wakes.dispose();expect(scene.children).toHaveLength(0);
});

test('restarting a replay replaces its geometry and resets fading without retaining the previous round',()=>{
 const wakes=new Wakes(new THREE.Scene());
 try{
  wakes.update(model({visualTime:2}));wakes.tick(10);
  wakes.update(model({busy:false,phase:'plan',visualTime:undefined}));wakes.tick(11);
  const previous=meshes(wakes).map(m=>m.geometry);
  wakes.update(model({round:2,wakeTimeline:{...timeline,segments:timeline.segments.slice(2)}}));
  expect(meshes(wakes)).toHaveLength(1);expect(previous).not.toContain(meshes(wakes)[0].geometry);
  expect(meshes(wakes)[0].material.uniforms.fading.value).toBe(0);
  expect(meshes(wakes)[0].material.uniforms.replayTime.value).toBe(0);
 }finally{wakes.dispose();}
});

test('reduced motion freezes water texture motion while still changing to the planning shape',()=>{
 const wakes=new Wakes(new THREE.Scene());
 try{
  wakes.update(model({visualTime:1}));wakes.tick(10);
  wakes.update(model({busy:false,phase:'plan',visualTime:undefined}));wakes.tick(11,false);
  expect(meshes(wakes).every(m=>m.material.uniforms.fading.value===1)).toBe(true);
  expect(meshes(wakes).every(m=>m.material.uniforms.time.value===10)).toBe(true);
 }finally{wakes.dispose();}
});

test('rebuilding the map during planning restores the same fading paths from the session model',()=>{
 const first=new Wakes(new THREE.Scene());first.update(model({visualTime:2}));first.dispose();
 const restored=new Wakes(new THREE.Scene());
 try{
  restored.update(model({busy:false,phase:'plan',visualTime:undefined,round:2}));restored.tick(10);
  expect(meshes(restored)).toHaveLength(2);
  expect(meshes(restored).every(m=>m.material.uniforms.fading.value===1&&m.material.uniforms.replayTime.value===2)).toBe(true);
 }finally{restored.dispose();}
});
