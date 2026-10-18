import {access,writeFile} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {spawn} from 'node:child_process';

const project=fileURLToPath(new URL('../',import.meta.url));

export function activeIds(config){
  return [...new Set([...Object.values(config.catalog),
    ...Object.values(config.historical).flatMap(Object.values),...Object.values(config.templates)])].sort();
}

async function run(command,args,options={}){
  return new Promise((resolve,reject)=>{
    const child=spawn(command,args,{cwd:project,...options});let stdout='';
    child.stdout.on('data',bytes=>{stdout+=bytes;});
    child.stderr.on('data',bytes=>process.stderr.write(bytes));
    child.on('error',reject);
    child.on('close',code=>code===0?resolve(stdout):reject(Error(`${command} 退出码 ${code}`)));
  });
}

export async function runPythonProvider({root,script,request,output}){
  const python=path.join(root,'.generated/ship-assets-python/bin/python');
  try{await access(python);}catch(error){
    if(error.code!=='ENOENT')throw error;
    await run('uv',['sync','--project',path.join(project,'scripts/ship-assets'),'--frozen','--python','3.11'],
      {env:{...process.env,UV_PROJECT_ENVIRONMENT:path.join(root,'.generated/ship-assets-python')}});
  }
  const requestFile=output+'.request.json';
  await writeFile(requestFile,JSON.stringify(request));
  return JSON.parse(await run(python,[path.join(project,'scripts/ship-assets',script),
    '--request',requestFile,'--output',output]));
}
