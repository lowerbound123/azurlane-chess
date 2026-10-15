import * as THREE from 'three';

// The untyped boundary is confined to the vendored Spine 3.8 runtime.
export async function loadLegacySpine(core:any,renderer:any,version:string,profile:{format:'json'|'binary';premultipliedAlpha?:boolean},skeletonURL:string,atlasURL:string,aliases:Record<string,string>={},isDisposed:()=>boolean=()=>false) {
  const textures:THREE.Texture[]=[];
  const controller=new AbortController();
  let released=false;
  const manager={dispose(){released=true;controller.abort();for(const texture of textures.splice(0))texture.dispose();}};
  const timer=setTimeout(()=>controller.abort(),10000);
  try {
    if(isDisposed())throw new Error('Character scene disposed');
    const read=async(url:string)=>{const response=await fetch(url,{signal:controller.signal});if(!response.ok)throw new Error(`角色素材加载失败: ${response.status}`);return response;};
    const [source,atlasText]=await Promise.all([read(skeletonURL).then(async(r):Promise<string|Uint8Array>=>profile.format==='binary'?new Uint8Array(await r.arrayBuffer()):await r.text()),read(atlasURL).then(r=>r.text())]);
    const names=[...atlasText.trimStart().matchAll(/(?:^|\n\s*\n)([^\n]+)\n(?:size|format):/g)].map(m=>m[1].trim());
    const pages=new Map<string,unknown>();
    await Promise.all(names.map(async name=>{
      const url=aliases[name]||new URL(name,new URL(atlasURL,location.href)).href;
      const blob=await read(url).then(r=>r.blob());
      const image=await new Promise<HTMLImageElement>((resolve,reject)=>{
        const image=new Image(),objectURL=URL.createObjectURL(blob);
        const cleanup=()=>{URL.revokeObjectURL(objectURL);controller.signal.removeEventListener('abort',abort);};
        const abort=()=>{cleanup();reject(new Error('角色素材加载超时或场景已释放'));};
        controller.signal.addEventListener('abort',abort,{once:true});
        image.onload=()=>{cleanup();resolve(image);};
        image.onerror=()=>{cleanup();reject(new Error('Spine atlas page decode failed'));};
        if(controller.signal.aborted)abort();else image.src=objectURL;
      });
      if(released||isDisposed())throw new Error('Character scene disposed');
      const wrapper=new renderer.ThreeJsTexture(image);
      wrapper.texture.colorSpace=THREE.NoColorSpace;
      // Decode straight PNGs to PMA on upload; already-PMA exports opt out.
      wrapper.texture.premultiplyAlpha=!profile.premultipliedAlpha;
      textures.push(wrapper.texture);pages.set(name,wrapper);
    }));
    if(released||isDisposed())throw new Error('Character scene disposed');
    const {skeletonVersion}=await import('./parse.mjs');
    const sourceVersion=profile.format==='binary'?skeletonVersion(source as Uint8Array):JSON.parse(source as string).skeleton?.spine;
    if(!sourceVersion?.startsWith('3.8.'))throw new Error(`需要 Spine 3.8 导出素材: ${sourceVersion}`);
    const atlas=new core.TextureAtlas(atlasText,(name:string)=>pages.get(name));
    const loader=new core.AtlasAttachmentLoader(atlas);
    const data=profile.format==='binary'?new core.SkeletonBinary(loader).readSkeletonData(source):new core.SkeletonJson(loader).readSkeletonData(source);
    if(!data.version?.startsWith(version+'.'))throw new Error(`需要 Spine ${version} 导出素材`);
    class SkeletonMesh extends renderer.SkeletonMesh {
      constructor(options:{skeletonData:unknown}) {
        super(options.skeletonData);
        this.zOffset=.001;
        this.skeleton.getBoundsRect=()=>{const offset=new core.Vector2(),size=new core.Vector2();this.skeleton.getBounds(offset,size,[]);return {x:offset.x,y:offset.y,width:size.x,height:size.y};};
      }
    }
    return {spine:{SkeletonMesh},manager,data};
  } catch(error){manager.dispose();throw error;}
  finally {clearTimeout(timer);}
}
