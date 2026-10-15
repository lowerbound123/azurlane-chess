import {test,afterAll,afterEach} from 'vitest';
import assert from 'node:assert/strict';
import { interpolateFrame, playFrames } from '../src/playback.ts';
const frame = (x:number) => ({ ships:[{id:'s',xy:{x,y:0},hp:100}],torpedoes:[{id:'t',xy:{x,y:2}}],planes:[{id:'p',xy:{x,y:4}}],visible:['old'],effects:[] });
test('sailing camera follows the same continuous clock without interpolating future visibility',()=>{
 const a={...frame(0),cameraFocus:{x:2,y:10,radius:5}},b={...frame(10),cameraFocus:{x:6,y:14,radius:8},visible:['future']};
 const middle=interpolateFrame(a,b,.5);assert.deepEqual(middle.cameraFocus,{x:4,y:12,radius:6.5});assert.deepEqual(middle.visible,['old']);
});
test('fast playback cannot skip a first-contact frame before a reinforcement expands vision',()=>{
 let callback:FrameRequestCallback=()=>{},last=frame(0),done=false;
 const contact={...frame(1),visibilityBarrier:true},expanded={...frame(2),visible:['old','reinforcement']};
 playFrames([frame(0),contact,expanded],{speed:()=>4,render:f=>last=f,complete:()=>done=true,request:cb=>(callback=cb,1),cancel:()=>{},now:()=>0});
 callback(110);assert.equal(done,false);assert.deepEqual(last.visible,['old']);assert.equal(last.ships[0].xy.x,1);
 callback(220);assert.equal(done,false);callback(237);assert.equal(done,true);
});
test('interpolation moves all units without changing discrete combat state or sources',()=>{
 const a=frame(0),b=frame(10);b.ships[0].hp=50;b.visible=['new'];b.planes.push({id:'new',xy:{x:99,y:99}});
 const middle=interpolateFrame(a,b,.5);
 for(const type of ['ships','torpedoes','planes'] as const)assert.equal(middle[type][0].xy.x,5);
 assert.equal(middle.ships[0].hp,100);assert.deepEqual(middle.visible,['old']);assert.equal(middle.planes.length,1);assert.equal(a.ships[0].xy.x,0);
 b.ships=[];assert.equal(interpolateFrame(a,b,.5).ships[0],a.ships[0]);
});
test('animation uses elapsed time, supports speed changes, holds final frame and stops cleanly',()=>{
 let callback:FrameRequestCallback=()=>{},last!:{f:ReturnType<typeof frame>;p:number},done=0,rate=1,cancelled=0;
 const stop=playFrames([frame(0),frame(10)],{speed:()=>rate,render:(f,p)=>last={f,p},complete:()=>done++,request:cb=>(callback=cb,1),cancel:()=>cancelled++,now:()=>0});
 callback!(55);assert.equal(last!.f.ships[0].xy.x,5);
 rate=2;callback!(82.5);assert.equal(last!.f.ships[0].xy.x,10);assert.equal(done,0);
 callback!(137.5);assert.equal(last!.p,1);assert.equal(done,0);callback!(154);assert.equal(done,1);callback!(200);assert.equal(done,1);
 stop();assert.equal(cancelled,1);
 let completed=false;
 const stopEarly=playFrames([frame(0)],{speed:()=>1,render:()=>{},complete:()=>completed=true,request:cb=>(callback=cb,2),cancel:()=>{},now:()=>0});
 stopEarly();callback!(500);assert.equal(completed,false);
});
test('1x playback renders every 60 Hz frame with distinct interpolated positions',()=>{
 let callback:FrameRequestCallback=()=>{};const positions:number[]=[];
 playFrames(Array.from({length:12},(_,i)=>frame(i*10)),{speed:()=>1,render:f=>positions.push(f.ships[0].xy.x),complete:()=>{},request:cb=>(callback=cb,1),cancel:()=>{},now:()=>0});
 for(let tick=1;tick<=60;tick++)callback!(tick*1000/60);
 assert.equal(positions.length,61);
 assert.equal(new Set(positions).size,61);
 assert.ok(Math.abs(positions.at(-1)!-1000/110*10)<1e-8);
});
test('interpolated frame time drives projectiles at the same continuous clock as ships',()=>{
 const a={...frame(0),t:.1},b={...frame(10),t:.2};
 assert.equal(interpolateFrame(a,b,.5).t,.15000000000000002);
 assert.equal(interpolateFrame(a,null,.5).t,.1);
 assert.equal(a.t,.1);
});
test('final impact frame continues its visual clock during the existing hold without delaying completion',()=>{
 let callback:FrameRequestCallback=()=>{},last!:ReturnType<typeof frame>&{t:number},done=0;
 playFrames([{...frame(0),t:1},{...frame(10),t:1.1}],{speed:()=>1,render:f=>last=f,complete:()=>done++,request:cb=>(callback=cb,1),cancel:()=>{},now:()=>0});
 callback!(110);assert.equal(last!.t,1.1);
 callback!(165);assert(Math.abs(last!.t-1.15)<1e-12);assert.equal(last!.ships[0].xy.x,10);assert.equal(done,0);
 callback!(220);assert.equal(done,0);callback!(237);assert.equal(done,1);
});
test('position-only legacy frames do not acquire an invalid clock',()=>{
 assert.equal('t' in interpolateFrame(frame(0),frame(10),.5),false);
});
test('a stalled animation callback cannot consume the entire replay',()=>{
 let callback:FrameRequestCallback=()=>{},last!:{f:ReturnType<typeof frame>;p:number},done=0;
 playFrames(Array.from({length:12},(_,i)=>frame(i)),{speed:()=>1,render:(f,p)=>last={f,p},complete:()=>done++,request:cb=>(callback=cb,1),cancel:()=>{},now:()=>0});
 callback!(10000);assert.equal(done,0);assert.ok(last!.p<.2);assert.ok(last!.f.ships[0].xy.x<2);
});
test('discrete playback never interpolates a visibility-clipped unit between snapshots',()=>{
 let callback:FrameRequestCallback=()=>{},last!:ReturnType<typeof frame>;
 playFrames([frame(0),frame(10)],{interpolate:false,speed:()=>1,render:f=>last=f,complete:()=>{},request:cb=>(callback=cb,1),cancel:()=>{},now:()=>0});
 callback!(55);assert.equal(last!.ships[0].xy.x,0);callback!(110);assert.equal(last!.ships[0].xy.x,10);
});
test('terminal progress is painted at 100 percent before replay completion removes the bar',()=>{
 let callback:FrameRequestCallback=()=>{},progress=0,done=0;
 const stop=playFrames([frame(0),frame(10)],{speed:()=>1,render:(_f,p)=>progress=p,complete:()=>done++,request:cb=>(callback=cb,1),cancel:()=>{},now:()=>0});
 for(const now of [55,110,165,220])callback(now);
 assert.equal(progress,1);assert.equal(done,0,'keep the terminal frame until the next animation frame');
 callback(237);assert.equal(done,1);callback(254);assert.equal(done,1);
 stop();
});
test('stopping at 100 percent suppresses a completion callback already taken from the RAF queue',()=>{
 let callback:FrameRequestCallback=()=>{},progress=0,done=0,handle=0,cancelled=0;
 const stop=playFrames([frame(0),frame(10)],{speed:()=>4,render:(_f,p)=>progress=p,complete:()=>done++,request:cb=>(callback=cb,++handle),cancel:id=>cancelled=id,now:()=>0});
 callback(110);assert.equal(progress,1);assert.equal(done,0);
 const staleCompletion=callback;stop();staleCompletion(127);
 assert.equal(cancelled,2);assert.equal(done,0);
});
