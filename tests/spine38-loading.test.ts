// @vitest-environment happy-dom
import {test,expect,vi,afterEach} from 'vitest';
import {OneFactor} from 'three';
import {loadSpine38} from '../src/vendor/spine38/adapter.ts';
const atlas=['body','head'].map(name=>`${name}.webp\nsize: 16,16\nformat: RGBA8888\nfilter: Linear,Linear\nrepeat: none\n${name}\n  rotate: false\n  xy: 0,0\n  size: 16,16\n  orig: 16,16\n  offset: 0,0\n  index: -1`).join('\n\n');
const json={skeleton:{spine:'3.8.99'},bones:[{name:'root'}],slots:[{name:'body',bone:'root',attachment:'body'},{name:'head',bone:'root',attachment:'head',blend:'additive'}],skins:[{name:'default',attachments:{body:{body:{width:16,height:16}},head:{head:{width:16,height:16,y:16}}}}],animations:{idle:{bones:{root:{rotate:[{time:0,angle:0},{time:1,angle:30}]}}}}};
function setup(decode=true){
 const requests:string[]=[];vi.stubGlobal('fetch',async(url:string)=>{requests.push(url);return new Response(url.endsWith('.json')?JSON.stringify(json):url.endsWith('.atlas')?atlas:new Uint8Array([1]));});
 vi.stubGlobal('Image',class {width=16;height=16;onload=()=>{};set src(_url:string){if(decode)queueMicrotask(()=>this.onload());}});
 vi.spyOn(URL,'createObjectURL').mockReturnValue('blob:fixture');vi.spyOn(URL,'revokeObjectURL').mockImplementation(()=>{});return requests;
}
afterEach(()=>{vi.useRealTimers();vi.restoreAllMocks();vi.unstubAllGlobals();});
test('3.8 loader retains distinct atlas pages, animates, uses PMA blending and releases shared textures once',async()=>{
 const requests=setup(),asset=await loadSpine38({format:'json'},'/actor.json','/actor.atlas');
 expect(requests).toHaveLength(4);const mesh=new asset.spine.SkeletonMesh({skeletonData:asset.data});mesh.update(0);
 mesh.state.setAnimation(0,'idle',true);mesh.update(.5);expect(mesh.skeleton.bones[0].rotation).toBeCloseTo(15);
 const materials:any[]=[];mesh.traverse((o:any)=>{if(o.material)materials.push(...(Array.isArray(o.material)?o.material:[o.material]));});
 const textures=new Set(materials.map(m=>m.uniforms?.map?.value).filter(Boolean));expect(textures.size).toBe(2);expect(materials.some(m=>m.blendDst===OneFactor)).toBe(true);
 let disposed=0;for(const texture of textures){expect(texture.premultiplyAlpha).toBe(true);texture.addEventListener('dispose',()=>disposed++);}
 mesh.dispose();expect(disposed).toBe(0);asset.manager.dispose();asset.manager.dispose();expect(disposed).toBe(2);
});
test('3.8 image decoding timeout aborts and revokes page URLs',async()=>{
 vi.useFakeTimers();setup(false);const pending=loadSpine38({format:'json'},'/actor.json','/actor.atlas');
 const assertion=expect(pending).rejects.toThrow(/超时|释放/);await vi.advanceTimersByTimeAsync(10001);await assertion;expect(URL.revokeObjectURL).toHaveBeenCalledTimes(2);
});
test('3.8 load cannot complete after its scene is disposed',async()=>{
 setup();let disposed=false;const promise=loadSpine38({format:'json'},'/actor.json','/actor.atlas',{},()=>disposed);disposed=true;await expect(promise).rejects.toThrow(/disposed/);
});
