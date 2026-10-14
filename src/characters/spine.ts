import type {AssetManager,SkeletonData,SkeletonMesh,TextureAtlas} from '@esotericsoftware/spine-threejs';
import type {CharacterProfile} from './config.ts';
export interface CharacterAsset {spine:typeof import('@esotericsoftware/spine-threejs');manager:AssetManager;data:SkeletonData}
import * as THREE from 'three';
import { characterConfig, profileFor, animationFor } from './config.ts';

// A scene owns its atlases. Removing one ship must not dispose another ship's textures.
export class CharacterLibrary {
 entries:Map<CharacterProfile,Promise<CharacterAsset>>;disposed:boolean;
  constructor() { this.entries = new Map(); this.disposed = false; }
  load(profile:CharacterProfile):Promise<CharacterAsset> {
    if (this.entries.has(profile)) return this.entries.get(profile)!;
    const pending = this.loadProfile(profile);
    this.entries.set(profile, pending);
    return pending;
  }
  async loadProfile(profile:CharacterProfile) {
    const spine = await import('@esotericsoftware/spine-threejs');
    if (this.disposed) throw new Error('Character scene disposed');
    // 4.2.120's internal disposal passes cached absolute keys to remove(),
    // which adds pathPrefix again. Resolve URLs at loading time instead.
    const manager = new spine.AssetManager();
    const assetPath = (path:string) => `${import.meta.env?.BASE_URL || '/'}${path}`;
    let timer:ReturnType<typeof setTimeout>|undefined,abandoned=false,settled:Promise<PromiseSettledResult<unknown>[]>|undefined;
    try {
      const skeleton=new Promise<string|Uint8Array>((resolve,reject)=>{const fail=(_:string,message:string)=>reject(new Error(message));if(profile.format==='binary')manager.loadBinary(assetPath(profile.skeleton),(_,value)=>resolve(value),fail);else manager.loadText(assetPath(profile.skeleton),(_,value)=>resolve(value),fail);});
      const atlasPromise=new Promise<TextureAtlas>((resolve,reject)=>manager.loadTextureAtlas(assetPath(profile.atlas),(_,value)=>resolve(value),(_,message)=>reject(new Error(message))));
      settled=Promise.allSettled([skeleton,atlasPromise]);
      settled.then(()=>{if(this.disposed||abandoned)manager.dispose();});
      const [source,atlas]=await Promise.race([Promise.all([skeleton,atlasPromise]),new Promise<never>((_,reject)=>{timer=setTimeout(()=>reject(new Error('角色素材加载超时')),10000);})]);
      if(this.disposed)throw new Error('Character scene disposed');
      const loader=new spine.AtlasAttachmentLoader(atlas);
      const data=profile.format==='binary'?new spine.SkeletonBinary(loader).readSkeletonData(source instanceof Uint8Array?source:new TextEncoder().encode(source)):new spine.SkeletonJson(loader).readSkeletonData(source);
      if(!data.version?.startsWith(characterConfig.runtimeVersion+'.')) throw new Error(`需要 Spine ${characterConfig.runtimeVersion} 导出素材`);
      return { spine, manager, data };
    } catch(error) { abandoned=true;manager.dispose();settled?.then(()=>manager.dispose());throw error; }
    finally { clearTimeout(timer); }
  }
  dispose() { this.disposed=true; for(const pending of this.entries.values())pending.then(asset=>asset.manager.dispose(),()=>{}); this.entries.clear(); }
}

export class ShipCharacter {
 root:THREE.Group;disposed:boolean;profile:CharacterProfile;action:string;token:string|null;fallback:THREE.Group;ready:Promise<void|undefined>;mesh:SkeletonMesh|undefined;age=0;sampled=false;
  constructor(library:Pick<CharacterLibrary,'load'>, template:string, color:THREE.ColorRepresentation) {
    this.root=new THREE.Group(); this.disposed=false; this.profile=profileFor(template); this.action='idle'; this.token=null;
    // Immediately visible, pickable fallback while assets load (and if even defaults fail).
    const material=new THREE.MeshBasicMaterial({color,depthWrite:false});
    this.fallback=new THREE.Group();
    const head=new THREE.Mesh(new THREE.CircleGeometry(.23,20),material);head.position.y=.9;
    const body=new THREE.Mesh(new THREE.PlaneGeometry(.42,.55),material);body.position.y=.48;
    this.fallback.add(head,body);this.root.add(this.fallback);
    this.ready=this.load(library,this.profile).catch(error=>{
      if(this.disposed)return;
      console.warn('舰船角色加载失败，使用默认角色：',error.message);
      const fallback=characterConfig.profiles[characterConfig.defaultProfile];
      return this.profile===fallback ? undefined : this.load(library,fallback).catch(()=>{});
    });
  }
  async load(library:Pick<CharacterLibrary,'load'>,profile:CharacterProfile) {
    const asset=await library.load(profile); if(this.disposed)return;
    const mesh=new asset.spine.SkeletonMesh({skeletonData:asset.data,twoColorTint:true,materialFactory:p=>new THREE.MeshBasicMaterial({...p,depthWrite:false,side:THREE.DoubleSide})});
    if(profile.skin && asset.data.findSkin(profile.skin))mesh.skeleton.setSkinByName(profile.skin);
    mesh.skeleton.setSlotsToSetupPose();mesh.scale.setScalar(profile.scale || .014);mesh.position.set(...(profile.offset || [0,0]),0);
    mesh.state.data.defaultMix=.12;this.mesh=mesh;this.profile=profile;
    this.root.add(mesh);this.fallback.visible=false;this.setAction(this.action,this.token,this.age || 0,true);
  }
  setAction(action='idle',token:string|null=null,age=0,force=false) {
    this.age=age;this.sampled=false;
    if(!force && this.action===action && this.token===token)return;
    this.action=action;this.token=token;
    if(!this.mesh)return;
    const name=animationFor(this.mesh.skeleton.data,this.profile,action);if(!name)return;
    const loop=action==='idle'||action==='move';
    const entry=this.mesh.state.setAnimation(0,name,loop);if(entry)entry.trackTime=Math.max(0,age);
    if(!loop){const idle=animationFor(this.mesh.skeleton.data,this.profile,'idle');if(idle)this.mesh.state.addAnimation(0,idle,true,0);}
    this.mesh!.update(0);
  }
  seek(age:number) {
    this.sampled=true;this.age=age;
    const entry=this.mesh?.state.getCurrent(0);
    if(entry){if(entry)entry.trackTime=Math.max(0,age);this.mesh!.update(0);}
  }
  tick(delta:number,camera:THREE.Camera) { this.root.quaternion.copy(camera.quaternion);if(this.mesh && !this.sampled)this.mesh.update(Math.min(.1,Math.max(0,delta))); }
  dispose() {
    this.disposed=true;this.mesh?.dispose();this.mesh?.removeFromParent();
    this.fallback.traverse(o=>{if(o instanceof THREE.Mesh)o.geometry.dispose();});const first=this.fallback.children[0];if(first instanceof THREE.Mesh&&!Array.isArray(first.material))first.material.dispose();this.root.clear();
  }
}
