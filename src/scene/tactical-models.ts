import * as THREE from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import aircraftURL from '../../assets/models/aircraft.glb?url';
import mineURL from '../../assets/models/naval-mine.glb?url';
import {disposeTree} from './resources.ts';

let downloads:Promise<[ArrayBuffer,ArrayBuffer]>|undefined;
async function download(url:string){
 const response=await fetch(url);if(!response.ok)throw new Error(`战场模型下载失败：${response.status}`);
 return response.arrayBuffer();
}
/** Only immutable bytes persist across map visits; every map owns its GPU resources. */
export class TacticalModels {
 private constructor(private readonly aircraft:THREE.Group,private readonly mine:THREE.Group){}
 static async fromBytes(aircraft:ArrayBuffer,mine:ArrayBuffer){
  const loader=new GLTFLoader();const [a,m]=await Promise.all([loader.parseAsync(aircraft,''),loader.parseAsync(mine,'')]);
  return new TacticalModels(a.scene,m.scene);
 }
 static async load(){
  downloads??=Promise.all([download(aircraftURL),download(mineURL)]).catch(error=>{downloads=undefined;throw error;});
  const [a,m]=await downloads;return TacticalModels.fromBytes(a,m);
 }
 create(kind:'aircraft'|'mine'){
  const instance=(kind==='aircraft'?this.aircraft:this.mine).clone(true);
  instance.traverse(object=>{if(object instanceof THREE.Mesh){object.geometry=object.geometry.clone();object.material=Array.isArray(object.material)?object.material.map(mat=>mat.clone()):object.material.clone();}});
  return instance;
 }
 dispose(){disposeTree(this.aircraft);disposeTree(this.mine);}
}
