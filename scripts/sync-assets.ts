import {readFile} from 'node:fs/promises';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
import {projectRoot} from '../server/paths.ts';
import {loadAssetStorageConfig} from '../server/asset-storage-config.ts';
import type {AssetStorageConfig} from '../server/asset-storage-config.ts';
import type {RuntimeAsset,RuntimeAssetManifest} from '../shared/assets.ts';
import {validateRuntime,safePath,digest} from './runtime-assets.mjs';
import {createAssetUploader,storageStatus} from './asset-uploaders.ts';
import type {AssetUploader} from './asset-uploaders.ts';
export const CACHE_CONTROL='public, max-age=31536000, immutable';
export type SyncItem=RuntimeAsset&{file:string;key:string};
type Event={action:'plan'|'upload'|'skip'|'fail'|'local';key?:string;bytes?:number;status?:number};
type Summary={planned:number;uploaded:number;skipped:number;failed:number;bytes:number};
type SyncOptions={dryRun?:boolean;concurrency?:number;log?:(event:Event)=>void};
export function buildSyncPlan(root:string,manifest:RuntimeAssetManifest,prefix:string):SyncItem[]{
 const unique=new Map<string,SyncItem>();
 // Keep valid prefixes byte-for-byte identical to the read-side object key.
 if(prefix.includes('..')||/[\\?#\x00-\x1f]/.test(prefix))throw new Error('资源存储 prefix 无效');
 for(const record of Object.values(manifest.files)){
  if(!safePath(record.path)||!record.path.startsWith('assets/runtime/')||!/^([a-f0-9]{64})$/.test(record.sha256)||!Number.isSafeInteger(record.bytes)||record.bytes<0||typeof record.contentType!=='string'||!record.contentType)throw new Error('上传清单包含无效资源记录');
  const existing=unique.get(record.path);
  if(existing&&(existing.sha256!==record.sha256||existing.bytes!==record.bytes||existing.contentType!==record.contentType))throw new Error('同一发布路径存在冲突的资源记录');
  unique.set(record.path,{...record,file:path.join(root,'assets/runtime/files',record.path),key:[prefix,record.path].filter(Boolean).join('/')});
 }
 return [...unique.values()].sort((a,b)=>a.key.localeCompare(b.key));
}
export async function syncAssets(plan:SyncItem[],uploader:AssetUploader,options:SyncOptions={}):Promise<Summary>{
 const result:Summary={planned:plan.length,uploaded:0,skipped:0,failed:0,bytes:0},log=options.log??(()=>{}),concurrency=options.concurrency??4;
 if(!Number.isInteger(concurrency)||concurrency<1||concurrency>16)throw new Error('同步并发数必须为 1 至 16');
 let next=0;
 await Promise.all(Array.from({length:Math.min(concurrency,plan.length)},async()=>{
  while(next<plan.length){const item=plan[next++];
   if(options.dryRun){log({action:'plan',key:item.key,bytes:item.bytes});continue;}
   try{
    const remote=await uploader.head(item.key);
    if(remote?.sha256===item.sha256&&remote.bytes===item.bytes&&remote.contentType===item.contentType&&remote.cacheControl===CACHE_CONTROL){result.skipped++;log({action:'skip',key:item.key});continue;}
    const body=await readFile(item.file);
    if(body.length!==item.bytes||digest(body)!==item.sha256)throw new Error('固定素材在校验后发生变化');
    await uploader.put(item.key,body,{sha256:item.sha256,bytes:item.bytes,contentType:item.contentType,cacheControl:CACHE_CONTROL});
    result.uploaded++;result.bytes+=item.bytes;log({action:'upload',key:item.key,bytes:item.bytes});
   }catch(error){result.failed++;log({action:'fail',key:item.key,status:storageStatus(error)});}
  }
 }));
 return result;
}
export async function runAssetSync(options:SyncOptions&{root?:string;config?:AssetStorageConfig;validate?:typeof validateRuntime;createUploader?:typeof createAssetUploader}={}):Promise<Summary>{
 const root=options.root??projectRoot,config=options.config??loadAssetStorageConfig({root,staticRoot:path.join(root,'dist')});
 if(config.provider==='local'){options.log?.({action:'local'});return {planned:0,uploaded:0,skipped:0,failed:0,bytes:0};}
 const manifest=await (options.validate??validateRuntime)(root),plan=buildSyncPlan(root,manifest,config.prefix);
 if(options.dryRun){for(const item of plan)options.log?.({action:'plan',key:item.key,bytes:item.bytes});return {planned:plan.length,uploaded:0,skipped:0,failed:0,bytes:0};}
 const uploader=await (options.createUploader??createAssetUploader)(config);
 try{return await syncAssets(plan,uploader,options);}finally{uploader.close();}
}
async function main(){
 const args=process.argv.slice(2);
 if(args.some(arg=>!['--dry-run','--help'].includes(arg)))throw new Error('参数无效：支持 --dry-run、--help');
 if(args.includes('--help')){console.log('用法：npm run assets:sync [-- --dry-run]\n使用 config/asset-storage.json 或 ASSET_STORAGE_CONFIG；--dry-run 仅列出本地清单，不连接桶。相同文件跳过，不删除桶中旧文件。');return;}
 const result=await runAssetSync({dryRun:args.includes('--dry-run'),log:event=>{
  if(event.action==='local'){console.log('当前为本地资源模式，未执行桶同步。请先配置远程 provider。');return;}
  const label={plan:'待同步',upload:'已上传',skip:'已跳过',fail:'失败'}[event.action];
  console.log(`${label} ${event.key}${event.bytes===undefined?'':` (${event.bytes} bytes)`}${event.status?` HTTP ${event.status}`:''}`);
 }});
 console.log(`资源 ${result.planned}，上传 ${result.uploaded}，跳过 ${result.skipped}，失败 ${result.failed}，上传字节 ${result.bytes}`);
 if(result.failed)process.exitCode=1;
}
if(process.argv[1]&&import.meta.url===pathToFileURL(path.resolve(process.argv[1])).href){
 main().catch(error=>{ // Only our own validation messages are printable; SDK initialization details are not.
  const message=error instanceof Error?error.message:'';
  console.error(/^(资源存储|固定美术|Spine 缩略图|非法发布|上传清单|同一发布|参数无效)/.test(message)?message:'资源同步失败，请检查本地资源、存储配置及访问权限。');process.exitCode=1;
 });
}
