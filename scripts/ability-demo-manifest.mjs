import {createHash} from 'node:crypto';
import {readFile,readdir,stat} from 'node:fs/promises';
import path from 'node:path';
export const OUTPUT_FILES=['demo.webm','demo.mp4','poster.webp','contact.webp','evidence.json'];
export const digest=bytes=>createHash('sha256').update(bytes).digest('hex');
export async function artifactRecord(dir,fingerprint){
 const files={};for(const name of OUTPUT_FILES){const bytes=await readFile(path.join(dir,name));files[name]={bytes:bytes.length,sha256:digest(bytes)};}return {fingerprint,files};
}
export async function isArtifactCurrent(dir,record,fingerprint){
 if(record?.fingerprint!==fingerprint)return false;
 try{for(const name of OUTPUT_FILES){const bytes=await readFile(path.join(dir,name));if(!bytes.length||record.files?.[name]?.sha256!==digest(bytes))return false;}return true;}catch{return false;}
}
/** Follow literal source imports from the recording entry, plus fixed art and toolchain inputs. */
export async function sourceFingerprint(root){
 const {default:ts}=await import('typescript'),inputs=new Map();
 async function visit(relative){
  relative=relative.split(path.sep).join('/');if(inputs.has(relative))return;
  if(relative==='assets/runtime'){await visit('assets/runtime/manifest.json');const base=JSON.parse(await readFile(path.join(root,relative,'manifest.json'),'utf8'));for(const [id,asset]of Object.entries(base.files??{}))if(!id.startsWith('ability-demo/'))await visit(path.posix.join(relative,'files',asset.path));return;}
  const absolute=path.join(root,relative),info=await stat(absolute);
  if(info.isDirectory()){for(const name of (await readdir(absolute)).sort())await visit(path.posix.join(relative,name));return;}
  let bytes=await readFile(absolute);
  if(relative==='assets/runtime/manifest.json'){const manifest=JSON.parse(bytes);delete manifest.abilityDemos;for(const id of Object.keys(manifest.files??{}))if(id.startsWith('ability-demo/'))delete manifest.files[id];bytes=Buffer.from(JSON.stringify(manifest));}
  if(relative==='package-lock.json'){
   const lock=JSON.parse(bytes);delete lock.version;if(lock.packages?.[''])delete lock.packages[''].version;bytes=Buffer.from(JSON.stringify(lock));
  }
  inputs.set(relative,bytes);
  if(/\.(?:[cm]?js|tsx?)$/.test(relative)){
   const file=ts.createSourceFile(relative,bytes.toString(),ts.ScriptTarget.Latest,true),imports=new Set();
   const inspect=node=>{
    if((ts.isImportDeclaration(node)||ts.isExportDeclaration(node))&&node.moduleSpecifier&&ts.isStringLiteral(node.moduleSpecifier))imports.add(node.moduleSpecifier.text);
    if(ts.isCallExpression(node)&&node.expression.kind===ts.SyntaxKind.ImportKeyword&&node.arguments[0]&&ts.isStringLiteral(node.arguments[0]))imports.add(node.arguments[0].text);
    if(ts.isImportTypeNode(node)&&ts.isLiteralTypeNode(node.argument)&&ts.isStringLiteral(node.argument.literal))imports.add(node.argument.literal.text);
    ts.forEachChild(node,inspect);
   };inspect(file);
   for(const specifier of imports)if(specifier.startsWith('.')||specifier.startsWith('@/')){
    const dependency=specifier.startsWith('@/')?'src/'+specifier.slice(2):path.posix.normalize(path.posix.join(path.posix.dirname(relative),specifier));
    if(dependency.startsWith('../'))throw new Error('演示依赖越过项目根目录');await visit(dependency);
   }
  }
 }
 for(const relative of ['src/ability-demos/render.ts','assets/runtime','tools/ship-ability-demos.html','tools/ship-ability-demos.ts','scripts/render-ability-demos.mjs','scripts/ability-demo-manifest.mjs','scripts/ability-demo-io.mjs','vite.config.ts','package-lock.json'])await visit(relative);
 const manifest=JSON.parse(await readFile(path.join(root,'assets/runtime/manifest.json'),'utf8'));
 for(const relative of Object.keys(manifest.sources??{}))await visit(relative);
 const hash=createHash('sha256');for(const [relative,bytes]of [...inputs].sort(([a],[b])=>a.localeCompare(b))){hash.update(relative+'\0');hash.update(bytes);hash.update('\0');}return hash.digest('hex');
}
