import {createHash} from 'node:crypto';
import {readFile} from 'node:fs/promises';
import path from 'node:path';
export const OUTPUT_FILES=['demo.webm','demo.mp4','poster.webp','contact.webp','evidence.json'];
export const digest=bytes=>createHash('sha256').update(bytes).digest('hex');
export async function artifactRecord(dir){
 const files={};for(const name of OUTPUT_FILES){const bytes=await readFile(path.join(dir,name));files[name]={bytes:bytes.length,sha256:digest(bytes)};}return {files};
}
export async function isArtifactCurrent(dir,record){
 if(!record?.files)return false;
 try{for(const name of OUTPUT_FILES){const bytes=await readFile(path.join(dir,name));if(!bytes.length||record.files?.[name]?.sha256!==digest(bytes))return false;}return true;}catch{return false;}
}
