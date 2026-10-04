import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=name=>fs.readFileSync(path.join(root,name),'utf8');
const pkg=JSON.parse(read('package.json'));
const [major,minor,patch]=pkg.version.split('.').map(Number);
const args=process.argv.slice(2);
if(args.length && (args.length!==2||args[0]!=='--set'||!/^\d+\.\d+\.\d+$/.test(args[1])))throw new Error('Usage: npm run version:next, or node scripts/bump-version.mjs --set x.y.z');
const next=args[1]||`${major}.${minor}.${patch+1}`;
const oldLabels=[`v${pkg.version}`,...(patch===0?[`v${major}.${minor}`]:[])];
const updates=new Map();
for(const name of ['src/main.js','src/screens.js','index.html','README.md']){
 let text=read(name);
 for(const label of oldLabels)text=text.replace(new RegExp(label.replaceAll('.','\\.')+'(?![\\d.])','g'),`v${next}`);
 updates.set(name,text);
}
pkg.version=next;updates.set('package.json',JSON.stringify(pkg)+'\n');
const lock=JSON.parse(read('package-lock.json'));lock.version=next;lock.packages[''].version=next;
updates.set('package-lock.json',JSON.stringify(lock,null,2)+'\n');
for(const [name,text]of updates)fs.writeFileSync(path.join(root,name),text);
console.log(`Version: ${next}`);
