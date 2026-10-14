import {Storage} from 'happy-dom';
import {beforeAll,afterAll,vi} from 'vitest';
if(typeof window!=='undefined'){
  const storage=new Storage();
  Object.defineProperty(window,'localStorage',{configurable:true,value:storage});
  vi.stubGlobal('localStorage',storage);
  vi.stubGlobal('fetch',async()=>new Response(JSON.stringify({protocolVersion:2,models:[],auth:{enabled:false},user:null}),{headers:{'Content-Type':'application/json'}}));
  beforeAll(()=>{window.scrollTo=()=>{};if(!globalThis.ResizeObserver)globalThis.ResizeObserver=class {observe(){}unobserve(){}disconnect(){}};});
  afterAll(()=>vi.restoreAllMocks());
}
