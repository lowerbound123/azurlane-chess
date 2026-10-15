import {describe,it,expect} from 'vitest';
import {parseSkeleton,skeletonVersion} from '../src/vendor/parse.mjs';
const atlas='page.webp\nsize: 64,64\nformat: RGBA8888\nfilter: Linear,Linear\nrepeat: none\n';
describe('Spine 3.8 only parser',()=>{
 it.each(['3.6.53','4.2.120','4.1.00'])('rejects %s before parsing the body',version=>{
  expect(()=>parseSkeleton(JSON.stringify({skeleton:{spine:version}}),atlas,{},'json')).toThrow('Unsupported Spine version');
  const header=new Uint8Array([1,version.length+1,...new TextEncoder().encode(version)]);expect(skeletonVersion(header)).toBe(version);expect(()=>parseSkeleton(header,atlas)).toThrow('Unsupported Spine version');
 });
 it('rejects malformed binary headers without unbounded reading',()=>{expect(()=>skeletonVersion(new Uint8Array([255]))).toThrow();});
});
