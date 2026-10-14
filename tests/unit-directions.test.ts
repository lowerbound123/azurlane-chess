import {test} from 'vitest';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {readFileSync} from 'node:fs';
import {TacticalModels} from '../src/scene/tactical-models.ts';
import {Units} from '../src/scene/units.ts';
import {shipAtHex} from '../src/composables/use-battle-map.ts';
import {hexToXY} from '../src/engine.ts';
import type {MapModel, RenderPlane} from '../shared/render.ts';

test('ship selection follows occupied ground hex, including boundaries after rounding',()=>{
  const ships=[{id:'friendly',pos:{q:3,r:5}},{id:'enemy',pos:{q:4,r:5}}];
  assert.equal(shipAtHex(ships,{q:3,r:5}),ships[0]);
  assert.equal(shipAtHex(ships,{q:4,r:5}),ships[1]);
  assert.equal(shipAtHex(ships,{q:3,r:4}),undefined,'standee above the boat does not select it');
  assert.equal(shipAtHex(ships,null),undefined);
});

test('plane nose follows actual travel in all six directions instead of destination bearing',async()=>{
  const plane:RenderPlane={id:'p',kind:'plane',team:0,mother:'0-0',slot:0,hp:2,cfg:{hp:2,speed:6,vision:3,range:18,damage:25},xy:{x:0,y:0},mode:'point',target:{q:8,r:8},targetId:null,tracking:false,state:'outbound',traveled:0,waypoints:[],angle:0};
  const model:MapModel={cells:[],myTeam:0,ships:[],planes:[plane],torpedoes:[],mines:[],selected:'',phase:'execute',mode:'move',previews:[],mainTargets:[],rays:[],showPlans:false,showRanges:false,overlayType:'reach',busy:true,airRange:null,visuals:{}};
  const bytes=(name:string)=>{const b=readFileSync(new URL('../assets/models/'+name,import.meta.url));return b.buffer.slice(b.byteOffset,b.byteOffset+b.byteLength) as ArrayBuffer;};
  const library=await TacticalModels.fromBytes(bytes('aircraft.glb'),bytes('naval-mine.glb'));
  const units=new Units(new THREE.Scene(),library);
  try {
    units.update(model);
    for(const degrees of [0,60,120,180,240,300]) {
      const radians=degrees*Math.PI/180;
      plane.xy={x:plane.xy.x+Math.cos(radians),y:plane.xy.y+Math.sin(radians)};
      units.update(model);
      const body=units.cache.get('plane:p')!.userData.body;
      const nose=new THREE.Vector3(1,0,0).applyEuler(body.rotation);
      assert.ok(Math.abs(nose.x-Math.cos(radians))<1e-8);
      assert.ok(Math.abs(nose.z-Math.sin(radians))<1e-8);
      units.update(model);
      assert.ok(nose.distanceTo(new THREE.Vector3(1,0,0).applyEuler(body.rotation))<1e-8,'holding a frame preserves heading');
    }
    assert.ok(units.root.children.length===1);
  } finally {units.dispose();library.dispose();}
});
