import {parentPort} from 'node:worker_threads';
export default async function task({id,game}:{id:string;game:{seed:number}}):Promise<never>{
 parentPort?.postMessage({type:'battle:start',id});
 if(game.seed===1)throw new Error('fixture task failure');
 return new Promise(()=>{});
}
