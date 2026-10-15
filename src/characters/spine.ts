import type {CharacterProfile} from './config.ts';
import type {SkeletonData} from './types.ts';
export type {SkeletonData} from './types.ts';
interface AnimationEntry {trackTime:number;mixTime?:number}
export interface SkeletonMesh extends THREE.Object3D {
 skeleton:{data:SkeletonData;setSkinByName(name:string):void;setSlotsToSetupPose():void;getBoundsRect():{x:number;y:number;width:number;height:number}};
 state:{data:{defaultMix:number};setAnimation(track:number,name:string,loop:boolean):AnimationEntry|null;addAnimation(track:number,name:string,loop:boolean,delay:number):unknown;getCurrent(track:number):AnimationEntry|null};
 update(delta:number):void;dispose():void;
}
export interface CharacterAsset {spine:{SkeletonMesh:new(options:{skeletonData:SkeletonData;twoColorTint?:boolean;materialFactory?:(parameters:THREE.MeshBasicMaterialParameters)=>THREE.Material})=>SkeletonMesh};manager:{dispose():void};data:SkeletonData}
import * as THREE from 'three';
import {assetClient,runtimeAssets} from '../assets/runtime.ts';
import { characterConfig, profileFor, animationFor } from './config.ts';
import {PoseParticles} from './pose-particles.ts';
import {DEATH_DISSOLVE_DURATION} from '../../shared/character-presentation.ts';

// A scene owns its atlases. Removing one ship must not dispose another ship's textures.
export class CharacterLibrary {
 entries:Map<CharacterProfile,Promise<CharacterAsset>>;disposed:boolean;
  constructor(private readonly options:{source?:boolean}={}) { this.entries = new Map(); this.disposed = false; }
  load(profile:CharacterProfile):Promise<CharacterAsset> {
    if (this.entries.has(profile)) return this.entries.get(profile)!;
    const pending = this.loadProfile(profile);
    this.entries.set(profile, pending);
    return pending;
  }
  async loadProfile(profile:CharacterProfile) {
    if(this.options.source){
      const root=`${import.meta.env?.BASE_URL||'/'}public/`;
      return this.loadFiles(profile,root+profile.skeleton,root+profile.atlas);
    }
    const id=Object.entries(characterConfig.profiles).find(([,value])=>value===profile)?.[0];
    const entry=id?runtimeAssets.spine[id]:undefined;
    if(!entry)throw new Error('缺少已发布角色素材');
    return assetClient.load([entry.skeleton,entry.atlas,...Object.values(entry.pages)],urls=>this.loadFiles(profile,urls[entry.skeleton],urls[entry.atlas],Object.fromEntries(Object.entries(entry.pages).map(([name,id])=>[name,urls[id]]))));
  }
  private async loadFiles(profile:CharacterProfile,skeletonURL:string,atlasURL:string,fileAlias?:Record<string,string>) {
    if(profile.runtimeVersion && profile.runtimeVersion!=='3.8')throw new Error('仅支持 Spine 3.8 素材');
    const {loadSpine38}=await import('../vendor/spine38/adapter.ts');
    return await loadSpine38(profile,skeletonURL,atlasURL,fileAlias,()=>this.disposed) as CharacterAsset;
  }

  dispose() { this.disposed=true; for(const pending of this.entries.values())pending.then(asset=>asset.manager.dispose(),()=>{}); this.entries.clear(); }
}

export class ShipCharacter {
 root:THREE.Group;disposed:boolean;profile:CharacterProfile;action:string;token:string|null;fallback:THREE.Group;ready:Promise<void|undefined>;mesh:SkeletonMesh|undefined;age=0;sampled=false;
 private facingAngle=0;private facingFrom=0;private facingTarget:number|undefined;private facingElapsed=.28;
 private deathParticles?:PoseParticles;
  constructor(library:Pick<CharacterLibrary,'load'>, template:string, color:THREE.ColorRepresentation, profile?:CharacterProfile) {
    this.root=new THREE.Group(); this.disposed=false; this.profile=profile??profileFor(template); this.action='idle'; this.token=null;
    // Immediately visible, pickable fallback while assets load (and if even defaults fail).
    const material=new THREE.MeshBasicMaterial({color,depthWrite:false,side:THREE.DoubleSide});
    this.fallback=new THREE.Group();
    const head=new THREE.Mesh(new THREE.CircleGeometry(.23,20),material);head.position.y=.9;
    const body=new THREE.Mesh(new THREE.PlaneGeometry(.42,.55),material);body.position.y=.48;
    this.fallback.add(head,body);this.root.add(this.fallback);
    this.ready=this.load(library,this.profile).catch(()=>{
      if(this.disposed)return;
      console.warn('舰船角色加载失败，使用默认角色');
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
    if(this.action==='dead'&&action!=='dead'&&!force)return;
    if(!force && this.action===action && this.token===token)return;
    this.age=age;this.sampled=false;
    this.action=action;this.token=token;
    if(!this.mesh)return;
    if(action!=='dead'){this.deathParticles?.dispose();this.deathParticles=undefined;this.mesh.visible=true;}
    const name=animationFor(this.mesh.skeleton.data,this.profile,action);if(!name)return;
    const loop=['idle','move','dance','yun'].includes(action);
    const entry=this.mesh.state.setAnimation(0,name,loop);if(entry){entry.trackTime=Math.max(0,age);entry.mixTime=Math.max(0,age);}
    if(!loop&&action!=='dead'){const idle=animationFor(this.mesh.skeleton.data,this.profile,'idle');if(idle)this.mesh.state.addAnimation(0,idle,true,0);}
    this.mesh!.update(0);
    if(action==='dead')this.applyDeathAge(age);
  }
  seek(age:number) {
    this.sampled=true;this.age=age;
    if(this.action==='dead'){this.applyDeathAge(age);return;}
    const entry=this.mesh?.state.getCurrent(0);
    if(entry){entry.trackTime=Math.max(0,age);entry.mixTime=Math.max(0,age);this.mesh!.update(0);}
  }
  private applyDeathAge(age:number){
    if(!this.mesh)return;
    const name=animationFor(this.mesh.skeleton.data,this.profile,'dead');
    const duration=this.mesh.skeleton.data.animations.find(a=>a.name===name)?.duration??1;
    const entry=this.mesh.state.getCurrent(0);if(entry){entry.trackTime=Math.min(duration,Math.max(0,age));entry.mixTime=Math.max(0,age);}this.mesh.update(0);
    if(age>=duration){if(!this.deathParticles){this.deathParticles=new PoseParticles(this.mesh);this.root.add(this.deathParticles.root);}this.mesh.visible=false;this.deathParticles.seek((age-duration)/DEATH_DISSOLVE_DURATION);}
    else {this.mesh.visible=true;if(this.deathParticles)this.deathParticles.root.visible=false;}
  }
  setHeading(heading:number,animate=true) {
    const direction=((Math.round(heading)%6)+6)%6;
    const target=direction===0||direction===1||direction===5?0:Math.PI;
    if(target===this.facingTarget)return;
    if(this.facingTarget===undefined||!animate){this.facingAngle=target;this.facingElapsed=.28;}
    else {this.facingFrom=this.facingAngle;this.facingElapsed=0;}
    this.facingTarget=target;
  }
  tick(delta:number,camera:THREE.Camera) {
    const dt=Math.min(.1,Math.max(0,delta));
    if(this.facingTarget!==undefined&&this.facingElapsed<.28){
      this.facingElapsed=Math.min(.28,this.facingElapsed+dt);
      const t=this.facingElapsed/.28,ease=t*t*(3-2*t);
      this.facingAngle=this.facingFrom+(this.facingTarget-this.facingFrom)*ease;
    }
    this.root.quaternion.copy(camera.quaternion);this.root.rotateY(this.facingAngle);
    if(this.mesh && !this.sampled){if(this.action==='dead'){this.age+=dt;this.applyDeathAge(this.age);}else this.mesh.update(dt);}
  }
  dispose() {
    this.disposed=true;this.deathParticles?.dispose();this.mesh?.dispose();this.mesh?.removeFromParent();
    this.fallback.traverse(o=>{if(o instanceof THREE.Mesh)o.geometry.dispose();});const first=this.fallback.children[0];if(first instanceof THREE.Mesh&&!Array.isArray(first.material))first.material.dispose();this.root.clear();
  }
}
