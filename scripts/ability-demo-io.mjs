import {existsSync} from 'node:fs';
import {writeFile,rename,rm} from 'node:fs/promises';
import path from 'node:path';
import {randomUUID} from 'node:crypto';
export function createCancellation(){let cancelled=false;return {cancel(){cancelled=true;},check(){if(cancelled)throw new Error('录制已取消');}};}
/** Stage beside the output: directory and manifest renames must share its device. */
export async function installArtifact(staging,destination,manifestPath,manifest){
 const backup=`${destination}.previous-${randomUUID()}`,next=path.join(path.dirname(manifestPath),`.manifest-${randomUUID()}.json`),had=existsSync(destination);let movedOld=false,installed=false;
 try{
  await writeFile(next,JSON.stringify(manifest,null,2)+'\n');
  if(had){await rename(destination,backup);movedOld=true;}
  await rename(staging,destination);installed=true;
  await rename(next,manifestPath);
 }catch(error){
  if(installed)await rename(destination,staging);
  if(movedOld)await rename(backup,destination);
  throw error;
 }finally{await rm(next,{force:true});}
 if(movedOld)await rm(backup,{recursive:true,force:true});
}
