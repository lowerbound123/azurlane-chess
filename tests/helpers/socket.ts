/** A complete in-memory WebSocket transport for testing the public client API. */
export class TestSocket extends EventTarget implements WebSocket {
 static readonly CONNECTING=0;static readonly OPEN=1;static readonly CLOSING=2;static readonly CLOSED=3;
 readonly CONNECTING=0;readonly OPEN=1;readonly CLOSING=2;readonly CLOSED=3;
 binaryType:BinaryType='blob';bufferedAmount=0;extensions='';protocol='';url='';
 readyState=1;onopen:()=>void=()=>{};onmessage:(event:{data:string})=>void=()=>{};onclose:(event?:{code?:number})=>void=()=>{};onerror:()=>void=()=>{};
 send(_data:string|ArrayBufferLike|Blob|ArrayBufferView){}
 close(){this.readyState=3;this.onclose();}
}
