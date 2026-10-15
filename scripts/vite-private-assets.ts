import {existsSync,realpathSync} from 'node:fs';
import path from 'node:path';
import {loadEnv,type Plugin} from 'vite';
/** Development must never turn backend-only JSON credentials into public assets. */
export function privateAssetsGuard():Plugin {
 return {name:'private-asset-config',enforce:'pre',configResolved(config){
  const custom=process.env.ASSET_STORAGE_CONFIG??loadEnv(config.mode,config.envDir,'ASSET_STORAGE_CONFIG').ASSET_STORAGE_CONFIG;
  const paths=[path.resolve(config.root,'config/asset-storage.json'),path.resolve(config.root,'config/ai-models.json'),...(custom?[path.resolve(config.root,custom)]:[])];
  config.server.fs.deny.push('**/config/asset-storage*.json','**/config/ai-models.json',...paths.map(p=>p.split(path.sep).join('/')));
 },configureServer(server){
  const config=server.config,custom=process.env.ASSET_STORAGE_CONFIG??loadEnv(config.mode,config.envDir,'ASSET_STORAGE_CONFIG').ASSET_STORAGE_CONFIG;
  const privatePaths=[path.resolve(config.root,'config/asset-storage.json'),path.resolve(config.root,'config/ai-models.json'),...(custom?[path.resolve(config.root,custom)]:[])];
  const real=(p:string)=>{try{return existsSync(p)?realpathSync(p):p;}catch{return p;}};
  server.middlewares.use((req,res,next)=>{
   let pathname=(req.url??'/').split('?')[0];try{for(let i=0;i<3;i++){const decoded=decodeURIComponent(pathname);if(decoded===pathname)break;pathname=decoded;}}catch{res.statusCode=403;res.end('Forbidden');return;}
   const candidate=path.resolve(pathname.startsWith('/@fs/')?pathname.slice(4):path.join(config.root,pathname));
   const forbidden=/[/\\]config[/\\](?:asset-storage[^/\\]*\.json|ai-models\.json)$/.test(candidate)||privatePaths.some(p=>candidate===p||real(candidate)===real(p));
   if(forbidden){res.statusCode=403;res.setHeader('Cache-Control','no-store');res.end('Forbidden');return;}next();
  });
 }};
}
