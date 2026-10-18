import fs from 'node:fs';
import ts from 'typescript';
import Type from 'typebox';
const files=['shared/status.ts','shared/audio.ts','shared/assets.ts','shared/game.ts','shared/history.ts','shared/domination.ts','shared/draft.ts','shared/network.ts'];
let declarations='';
for(const file of files){const source=fs.readFileSync(file,'utf8'),ast=ts.createSourceFile(file,source,99,true);for(const node of ast.statements)if(ts.isInterfaceDeclaration(node)||ts.isTypeAliasDeclaration(node)){let text=node.getText(ast).replace(/^export /,'').replace("import('./game.ts').Plan",'Plan').replace(/import\('\.\/(?:domination|assets|status|history|ability-demo|audio)\.ts'\)\./g,'');if(text.includes("import('../src/battle-visuals.ts')"))text=`interface ClientVisuals {projectiles:{id:string;kind:string;team:number|null;position:Point3|null;trail:Point3[]}[];effects:{id:string;kind:string;at:Hex;age:number;text:string}[];actions:{id:string;shipId:string;action:string;age:number;soundOnly?:boolean}[]}`;declarations+=text+'\n';}}
const schemas=Type.Script(declarations);
const selected=Object.fromEntries(['PublicConfig','Identity','User','OnlineState','RoundMessage','MatchList','MatchRecord','Plans','SubmittedPlans'].map(k=>[k,schemas[k]]));
for(const [name,schema] of Object.entries(selected))if(!schema||JSON.stringify(schema)==='{}')throw new Error('Invalid generated schema: '+name);
fs.writeFileSync('shared/contracts.generated.json',JSON.stringify(selected));
