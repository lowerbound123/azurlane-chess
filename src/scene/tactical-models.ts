import * as THREE from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {assetClient,runtimeAssets} from '../assets/runtime.ts';
import {disposeTree} from './resources.ts';
import type {AirRole} from '../../shared/game.ts';

let downloads:Promise<[ArrayBuffer,ArrayBuffer,ArrayBuffer]>|undefined;
function validateAircraft(root:THREE.Object3D){
 for(const role of ['bomber','heavy','fighter','scout'] as const){
  if(!root.getObjectByName(`Aircraft_${role}`))throw new Error(`飞机模型缺失：${role}`);
 }
}
async function downloadValidated(url:string,aircraft=false,torpedo=false){
 const response=await fetch(url);if(!response.ok)throw new Error(`战场模型下载失败：${response.status}`);
 const bytes=await response.arrayBuffer();
 // Only cache bytes after the real loader accepts them. A 200 response can
 // still contain corrupt GLB data, which must trigger the same bounded retry.
 const parsed=await new GLTFLoader().parseAsync(bytes,'');
 const validationRoot=new THREE.Group();validationRoot.add(...parsed.scenes);
 try{if(aircraft)validateAircraft(parsed.scene);if(torpedo&&!parsed.scene.getObjectByName('Torpedo_mk14'))throw new Error('标准鱼雷模型缺失');}finally{disposeTree(validationRoot);}
 return bytes;
}
/** Only immutable bytes persist across map visits; every map owns its GPU resources. */
export class TacticalModels {
 private constructor(private readonly aircraft:THREE.Group,private readonly mine:THREE.Group,private readonly torpedo?:THREE.Group){}
 static async fromBytes(aircraft:ArrayBuffer,mine:ArrayBuffer,torpedo?:ArrayBuffer){
  const loader=new GLTFLoader(),results=await Promise.allSettled([aircraft,mine,...(torpedo?[torpedo]:[])].map(bytes=>loader.parseAsync(bytes,'')));
  const loaded=results.flatMap(r=>r.status==='fulfilled'?[r.value.scene]:[]);
  try{const failed=results.find(r=>r.status==='rejected');if(failed?.status==='rejected')throw failed.reason;validateAircraft(loaded[0]);if(torpedo&&!loaded[2].getObjectByName('Torpedo_mk14'))throw new Error('标准鱼雷模型缺失');return new TacticalModels(loaded[0],loaded[1],loaded[2]);}catch(error){loaded.forEach(disposeTree);throw error;}
 }
 static async load(){
  downloads??=Promise.all([assetClient.load([runtimeAssets.models.aircraft],urls=>downloadValidated(urls[runtimeAssets.models.aircraft],true)),assetClient.load([runtimeAssets.models.mine],urls=>downloadValidated(urls[runtimeAssets.models.mine])),assetClient.load([runtimeAssets.models.torpedo],urls=>downloadValidated(urls[runtimeAssets.models.torpedo],false,true))]).catch(error=>{downloads=undefined;throw error;});
  const [a,m,t]=await downloads;return TacticalModels.fromBytes(a,m,t);
 }
 create(kind:'aircraft'|'mine'|'torpedo',role:AirRole='bomber'){
  const template=kind==='aircraft'?this.aircraft.getObjectByName(`Aircraft_${role}`):kind==='mine'?this.mine:this.torpedo;
  if(!template)throw new Error(`飞机模型缺失：${role}`);
  const instance=template.clone(true);
  instance.traverse(object=>{if(object instanceof THREE.Mesh){object.geometry=object.geometry.clone();object.material=Array.isArray(object.material)?object.material.map(mat=>mat.clone()):object.material.clone();}});
  return instance;
 }
 dispose(){disposeTree(this.aircraft);disposeTree(this.mine);if(this.torpedo)disposeTree(this.torpedo);}
}
