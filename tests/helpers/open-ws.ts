import type {FastifyInstance} from 'fastify';
import type {OutgoingHttpHeaders} from 'node:http';
import {once} from 'node:events';
import WebSocket from 'ws';
/** Real sockets exercise trusted proxy handling and ordered asynchronous limits. */
export async function openWS(app:FastifyInstance,path='/ws',context:{headers?:OutgoingHttpHeaders}={}) {
 if(!app.server.listening)await app.listen({host:'127.0.0.1',port:0});
 const address=app.server.address();
 if(!address||typeof address==='string')throw new Error('缺少测试监听地址');
 const ws=new WebSocket(`ws://127.0.0.1:${address.port}${path}`,{headers:context.headers});
 await once(ws,'open');return ws;
}
