import {describe,it,expect} from 'vitest';
import {readFileSync} from 'node:fs';
import {parseSkeleton} from '../src/vendor/parse.mjs';
import {DEFAULT_CHARACTER_PROFILE} from '../src/characters/default-profile.ts';
const json=readFileSync('public/characters/default/sailor.json','utf8'),atlas=readFileSync('public/characters/default/sailor.atlas','utf8');
describe('original default Spine 3.8 sailor',()=>{
 it('parses native skins with genuine 3.8 core and transparent WebP page',()=>{
  const {data}=parseSkeleton(json,atlas,{},'json');expect(data.version).toBe('3.8.99');expect(data.bones.length).toBeGreaterThan(8);expect(Array.isArray(JSON.parse(json).skins)).toBe(true);expect(atlas).toContain('sailor.webp');expect(readFileSync('public/characters/default/sailor.webp').subarray(8,12).toString()).toBe('WEBP');
 });
 it('has six distinct changing skeletal poses with bounded silhouettes',()=>{
  const {data,core}=parseSkeleton(json,atlas,{},'json');const signatures=new Set<string>();
  for(const name of ['idle','move','fire','torpedo','hit','aircraft']){
   const skeleton=new core.Skeleton(data),state=new core.AnimationState(new core.AnimationStateData(data));state.setAnimation(0,name,true);state.update(.25);state.apply(skeleton);skeleton.updateWorldTransform();
   signatures.add(JSON.stringify(skeleton.bones.map((b:{rotation:number;x:number;y:number})=>[b.rotation,b.x,b.y])));
   const offset=new core.Vector2(),size=new core.Vector2();skeleton.getBounds(offset,size,[]);expect(size.y*DEFAULT_CHARACTER_PROFILE.scale).toBeLessThan(1.6);expect(size.x*DEFAULT_CHARACTER_PROFILE.scale).toBeLessThan(1.6);
  }expect(signatures.size).toBe(6);
 });
});
