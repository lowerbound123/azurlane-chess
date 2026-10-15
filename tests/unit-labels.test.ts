// @vitest-environment happy-dom
import {afterEach,expect,test,vi} from 'vitest';
import {label} from '../src/scene/resources.ts';

afterEach(()=>vi.restoreAllMocks());

test('long unit names widen their plate and sprite instead of squeezing the glyphs',()=>{
 const painted:unknown[][]=[];
 // Happy DOM has no Canvas 2D renderer. Supply measured glyph widths at that boundary.
 const context={fillRect(){},strokeRect(){},measureText(text:string){return {width:[...text].length*90};},fillText(...args:unknown[]){painted.push(args);}};
 vi.spyOn(HTMLCanvasElement.prototype,'getContext').mockReturnValue(context as unknown as CanvasRenderingContext2D);
 const short=label('岛风',{width:2.2,height:.65,hp:.5}),long=label('北卡罗来纳战列舰',{width:2.2,height:.65,hp:.5});
 try{
  expect(short.scale.x).toBe(2.2);
  expect(long.scale.x).toBeGreaterThan(short.scale.x);
  expect(long.scale.y).toBe(short.scale.y);
  expect((long.material.map!.image as HTMLCanvasElement).width).toBeGreaterThan((short.material.map!.image as HTMLCanvasElement).width);
  expect(painted.every(args=>args.length===3)).toBe(true);
 }finally{for(const sprite of [short,long]){sprite.material.map!.dispose();sprite.material.dispose();}}
});
