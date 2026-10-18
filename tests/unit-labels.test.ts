// @vitest-environment happy-dom
import {afterEach,expect,test,vi} from 'vitest';
import type {ShipType} from '../shared/game.ts';
import {label} from '../src/scene/resources.ts';

afterEach(()=>{vi.restoreAllMocks();vi.unstubAllGlobals();});

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

for(const [shipType,name] of Object.entries({dd:'岛风',cl:'克利夫兰',ca:'欧根亲王',bb:'北卡罗来纳战列舰',cv:'企业'}))test(`${shipType} nameplate uses a text abbreviation in its measured width`,()=>{
 const painted:unknown[][]=[];
 const context={fillRect(){},strokeRect(){},save(){},restore(){},translate(){},scale(){},stroke(){},measureText(text:string){return {width:[...text].length*90};},fillText(...args:unknown[]){painted.push(args);}};
 vi.stubGlobal('Path2D',class{});
 vi.spyOn(HTMLCanvasElement.prototype,'getContext').mockReturnValue(context as unknown as CanvasRenderingContext2D);
 const sprite=label(name,{shipType:shipType as ShipType,width:2.2,height:.65,hp:.5});
 try{
  const caption=shipType.toUpperCase()+name;
  expect(painted[0][0]).toBe(caption);
  expect(painted[0]).toHaveLength(3);
  expect((sprite.material.map!.image as HTMLCanvasElement).width).toBe(Math.max(512,caption.length*90+60));
  expect(sprite.scale.x).toBeGreaterThanOrEqual(2.2);
 }finally{sprite.material.map!.dispose();sprite.material.dispose();}
});
