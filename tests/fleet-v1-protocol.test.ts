import {it,expect} from 'vitest';
import {OnlineClient} from '../src/online.ts';
import {TestSocket} from './helpers/socket.ts';
it('stops before session or socket creation when protocol mismatches',async()=>{
 const urls:string[]=[];
 class Socket extends TestSocket{constructor(){super();throw new Error('socket must not open')}}
 const client=new OnlineClient({storage:null,WebSocketImpl:Socket,location:{protocol:'http:',host:'localhost'},fetchImpl:async url=>{urls.push(String(url));return new Response(JSON.stringify({serverId:'a',models:[],protocolVersion:1}));}});
 await expect(client.connect()).rejects.toThrow('版本不匹配');expect(urls).toEqual(['/api/config']);expect(client.stopped).toBe(true);
});
