import { Worker } from 'node:worker_threads';
import { availableParallelism } from 'node:os';
export class BattlePool {
  constructor(size = Math.max(1, Math.min(2, availableParallelism() - 1))) {
    this.size = size; this.queue = []; this.workers = new Set(); this.closed = false;
  }
  resolve(game, plans) {
    if (this.closed) return Promise.reject(new Error('服务器正在关闭'));
    if (this.queue.length >= 200) return Promise.reject(new Error('结算队列已满'));
    return new Promise((resolve, reject) => { this.queue.push({game, plans, resolve, reject}); this.pump(); });
  }
  pump() {
    while (!this.closed && this.queue.length && this.workers.size < this.size) {
      const job = this.queue.shift();
      const worker = new Worker(new URL('./worker.js', import.meta.url), {workerData:{game:job.game,plans:job.plans}});
      this.workers.add(worker); let settled = false;
      const finish = (error, result) => {
        if (settled) return; settled = true; clearTimeout(timer); this.workers.delete(worker);
        error ? job.reject(error) : job.resolve(result); void worker.terminate(); this.pump();
      };
      const timer = setTimeout(() => finish(new Error('结算超时')), 30000);
      worker.once('message', value => value.error ? finish(new Error(value.error)) : finish(null,value.result));
      worker.once('error', error => finish(error));
      worker.once('exit', () => finish(new Error('结算线程已退出')));
    }
  }
  async close() { this.closed=true; for(const job of this.queue.splice(0)) job.reject(new Error('服务器已关闭')); await Promise.all([...this.workers].map(w=>w.terminate())); }
}
