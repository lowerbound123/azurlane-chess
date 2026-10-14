import type {Manifest} from 'vite';
let warmup:Promise<void>|undefined;

async function preloadSpineCode() {
  const response=await fetch(import.meta.env.BASE_URL+'assets/spine-assets.json',{priority:'low'});
  if(!response.ok)throw new Error(`Spine 资源清单加载失败：${response.status}`);
  const manifest=await response.json() as Manifest,files=new Set<string>(),seen=new Set<string>();
  const collect=(key:string)=>{
    if(seen.has(key))return;
    seen.add(key);
    const chunk=manifest[key];
    if(!chunk)throw new Error(`Spine 资源清单缺少模块：${key}`);
    files.add(chunk.file);
    chunk.imports?.forEach(collect);
  };
  collect('node_modules/@esotericsoftware/spine-threejs/dist/index.js');
  await Promise.all([...files].map(async file=>{
    const asset=await fetch(import.meta.env.BASE_URL+file,{priority:'low',cache:'force-cache'});
    if(!asset.ok)throw new Error(`Spine 代码预加载失败：${asset.status}`);
    await asset.arrayBuffer();
  }));
}

export function scheduleSpinePreload() {
  if(warmup)return ()=>{};
  let idle:number|undefined,timer:number|undefined;
  const preload=()=>{
    warmup=preloadSpineCode().catch(error=>{
      warmup=undefined;
      console.warn('Spine 预加载失败，进入战场时将按需加载：',error);
    });
  };
  const schedule=()=>{
    if(window.requestIdleCallback)idle=window.requestIdleCallback(preload,{timeout:3000});
    else timer=window.setTimeout(preload,1000);
  };
  if(document.readyState==='complete')schedule();
  else window.addEventListener('load',schedule,{once:true});
  return ()=>{
    window.removeEventListener('load',schedule);
    if(idle!==undefined)window.cancelIdleCallback(idle);
    if(timer!==undefined)window.clearTimeout(timer);
  };
}
