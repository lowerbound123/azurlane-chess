import {wrap,releaseProxy,type Remote} from 'comlink';
import battleWorkerUrl from '../workers/battle.worker.ts?worker&url';
import type {BattleWorkerAPI,LocalRoundRequest} from '../workers/battle-api.ts';
import type {RoundResult} from '../../shared/game.ts';
export interface BattleWorkerHandle {api:BattleWorkerAPI;dispose:()=>void}
export const createBattleWorker=():BattleWorkerHandle=>{
 const worker=new Worker(battleWorkerUrl,{type:'module'});
 const api:Remote<BattleWorkerAPI>=wrap(worker);
 return {api,dispose:()=>{api[releaseProxy]();worker.terminate();}};
};
/** One owned worker per session controller. Timeout kills work, it never falls back onto the UI thread. */
export class BattleComputer {
 private handle:BattleWorkerHandle|null=null;
 private rejectActive:((error:Error)=>void)|null=null;
 private timer:ReturnType<typeof setTimeout>|undefined;
 pending=false;
 private readonly factory:()=>BattleWorkerHandle;
 private readonly timeoutMs:number;
 constructor(factory=createBattleWorker,timeoutMs=30000){this.factory=factory;this.timeoutMs=timeoutMs;}
 async resolve(request:LocalRoundRequest):Promise<RoundResult>{
  if(this.pending)throw new Error('正在计算本回合，请稍候');
  this.pending=true;
  try{
   this.handle??=this.factory();
   const timeout=new Promise<never>((_,reject)=>{this.rejectActive=reject;this.timer=setTimeout(()=>this.dispose(new Error('本地计算超时，请重试；指令已保留')),this.timeoutMs);});
   return await Promise.race([this.handle.api.resolve(request),timeout]);
  }finally{clearTimeout(this.timer);this.rejectActive=null;this.pending=false;}
 }
 dispose(error=new Error('本地计算已取消')){clearTimeout(this.timer);this.rejectActive?.(error);this.rejectActive=null;this.handle?.dispose();this.handle=null;}
}
