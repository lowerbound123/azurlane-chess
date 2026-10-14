import {Piscina} from 'piscina';
import { availableParallelism } from 'node:os';
import { randomUUID } from 'node:crypto';
import type { Game, Plans, RoundResult } from '../shared/game.ts';
interface BattleTask { id:string; game:Game; plans:Plans }
interface PendingTask {controller:AbortController;timer?:ReturnType<typeof setTimeout>}
/** Bounded, reusable workers. The business layer does not depend on Piscina. */
export class BattlePool {
  readonly size:number;
  private readonly pool:Piscina<BattleTask,RoundResult>;
  private readonly pending=new Map<string,PendingTask>();
  private closed=false;
  constructor(size=Math.max(1,Math.min(2,availableParallelism()-1)),{workerURL,runTimeoutMs=30000}:{workerURL?:URL;runTimeoutMs?:number}={}) {
    this.size=size;
    const extension=import.meta.url.endsWith('.ts')?'.ts':'.js';
    this.pool=new Piscina({filename:(workerURL??new URL(`./worker${extension}`,import.meta.url)).href,
      minThreads:0,maxThreads:size,maxQueue:200,concurrentTasksPerWorker:1,idleTimeout:60000});
    this.pool.on('message',(message:unknown)=>{
      if(!message||typeof message!=='object'||!('type' in message)||message.type!=='battle:start'||!('id' in message)||typeof message.id!=='string')return;
      const task=this.pending.get(message.id);
      if(task&&!task.timer)task.timer=setTimeout(()=>task.controller.abort(),runTimeoutMs);
    });
  }
  get threadIds():number[]{return this.pool.threads.map(worker=>worker.threadId);}
  async resolve(game:Game,plans:Plans):Promise<RoundResult>{
    if(this.closed)throw new Error('服务器正在关闭');
    if(this.pool.queueSize>=200)throw new Error('结算队列已满');
    const id=randomUUID(),task:PendingTask={controller:new AbortController()};this.pending.set(id,task);
    try{return await this.pool.run({id,game,plans},{signal:task.controller.signal});}
    catch(error){
      if(this.closed)throw new Error('服务器已关闭');
      if(task.controller.signal.aborted)throw new Error('结算超时');
      throw error;
    }finally{clearTimeout(task.timer);this.pending.delete(id);}
  }
  async close():Promise<void>{this.closed=true;for(const task of this.pending.values())clearTimeout(task.timer);await this.pool.destroy();}
}
