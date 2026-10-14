import {vi,test,afterAll,afterEach} from 'vitest';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {Effects} from '../src/scene/effects.ts';
test('hits create only outlined number sprites, stacked at their current location; no impact meshes',()=>{
 const previous=globalThis.document,calls:string[]=[];
 vi.stubGlobal('document',{createElement(){return{getContext(){return{strokeText(t:string){calls.push(t)},fillText(t:string){calls.push(t)},createLinearGradient(){return{addColorStop(){}}}}}}}});
 try{
  const effects=new Effects(new THREE.Scene());
  effects.update({effects:[{id:'splash',kind:'main',at:{q:0,r:0},age:0,text:''},{id:'hit1',kind:'hit',at:{q:0,r:0},age:.2,text:'−60'},{id:'hit2',kind:'hit',at:{q:0,r:0},age:.4,text:'−8'}]});
  assert.equal(effects.cache.size,2);assert.deepEqual(calls,['60','60','60','8','8','8']);
  let meshes=0,sprites=0;effects.root.traverse(o=>{if(o instanceof THREE.Mesh)meshes++;if(o instanceof THREE.Sprite)sprites++;});assert.equal(meshes,0);assert.equal(sprites,2);
  const first=effects.cache.get('e:hit1'),second=effects.cache.get('e:hit2');assert(second!.position.y>first!.position.y);
  effects.update({effects:[{id:'hit1',kind:'hit',at:{q:3,r:1},age:.9,text:'−60'}]});assert.notEqual(first!.position.x,0);assert.ok(first!.children[0] instanceof THREE.Sprite);assert(first!.children[0].material.opacity<1);
  effects.dispose();assert.equal(effects.root.children.length,0);
 }finally{vi.unstubAllGlobals();}
});
