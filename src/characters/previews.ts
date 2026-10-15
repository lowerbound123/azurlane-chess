import * as THREE from 'three';
import {CharacterLibrary,ShipCharacter} from './spine.ts';
import {profileFor,type CharacterProfile} from './config.ts';

type Renderer=Pick<THREE.WebGLRenderer,'setSize'|'setClearColor'|'domElement'|'render'|'dispose'|'forceContextLoss'>;
// Explicit authoring exporter only: one renderer, one fixed snapshot per profile.
export class SpinePreviews {
  private entries=new Map<CharacterProfile,Promise<string|null>>();
  private urls=new Set<string>();
  private queue=Promise.resolve();
  private renderer?:Renderer;
  private disposed=false;
  constructor(private library:Pick<CharacterLibrary,'load'|'dispose'>=new CharacterLibrary({source:true}),
    private rendererFactory:()=>Renderer=()=>new THREE.WebGLRenderer({alpha:true,antialias:true,preserveDrawingBuffer:true,powerPreference:'low-power'})){}
  load(template:string):Promise<string|null> {return this.loadProfile(profileFor(template));}
  loadProfile(profile:CharacterProfile):Promise<string|null> {
    if(this.disposed)return Promise.resolve(null);
    const existing=this.entries.get(profile);
    if(existing)return existing;
    const pending=this.queue.then(()=>this.snapshot(profile));
    this.entries.set(profile,pending);
    this.queue=pending.then(()=>{},()=>{});
    return pending;
  }
  private async snapshot(profile:CharacterProfile) {
    if(this.disposed)return null;
    const actor=new ShipCharacter(this.library,'',0x8eefe3,profile);
    try {
      await actor.ready;
      if(this.disposed)return null;
      const mesh=actor.mesh;
      if(!mesh||actor.profile!==profile)throw new Error('Spine 角色素材加载失败');
      actor.seek(.15);
      const bounds=mesh.skeleton.getBoundsRect(),scale=mesh.scale.x;
      if(!(bounds.width>0&&bounds.height>0))throw new Error('Spine 角色没有可显示的图形');
      const centerX=mesh.position.x+(bounds.x+bounds.width/2)*scale;
      const centerY=mesh.position.y+(bounds.y+bounds.height/2)*scale;
      const aspect=256/320,halfHeight=Math.max(bounds.height*scale/2,bounds.width*scale/2/aspect)*1.08;
      const camera=new THREE.OrthographicCamera(-halfHeight*aspect,halfHeight*aspect,halfHeight,-halfHeight,.1,100);
      camera.position.set(centerX,centerY,10);camera.lookAt(centerX,centerY,0);
      const scene=new THREE.Scene();scene.add(actor.root);
      this.renderer??=this.rendererFactory();
      this.renderer.setSize(256,320,false);this.renderer.setClearColor(0x000000,0);
      this.renderer.render(scene,camera);
      const blob=await new Promise<Blob>((resolve,reject)=>this.renderer!.domElement.toBlob(value=>value?resolve(value):reject(new Error('Spine 缩略图生成失败')),'image/webp',.88));
      if(this.disposed)return null;
      const url=URL.createObjectURL(blob);this.urls.add(url);return url;
    } finally {actor.dispose();}
  }
  releaseGPU() {
    this.renderer?.dispose();this.renderer?.forceContextLoss();this.renderer=undefined;
    this.library.dispose();
  }
  dispose() {
    this.disposed=true;this.releaseGPU();
    for(const url of this.urls)URL.revokeObjectURL(url);
    this.urls.clear();this.entries.clear();
  }
}
