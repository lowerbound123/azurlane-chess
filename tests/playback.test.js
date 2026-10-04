import test from 'node:test';
import assert from 'node:assert/strict';
import { interpolateFrame, playFrames } from '../src/playback.js';
const frame = x => ({ ships:[{id:'s',xy:{x,y:0},hp:100}],torpedoes:[{id:'t',xy:{x,y:2}}],planes:[{id:'p',xy:{x,y:4}}],visible:['old'],effects:[] });
test('interpolation moves all units without changing discrete combat state or sources',()=>{
 const a=frame(0),b=frame(10);b.ships[0].hp=50;b.visible=['new'];b.planes.push({id:'new',xy:{x:99,y:99}});
 const middle=interpolateFrame(a,b,.5);
 for(const type of ['ships','torpedoes','planes'])assert.equal(middle[type][0].xy.x,5);
 assert.equal(middle.ships[0].hp,100);assert.deepEqual(middle.visible,['old']);assert.equal(middle.planes.length,1);assert.equal(a.ships[0].xy.x,0);
 b.ships=[];assert.equal(interpolateFrame(a,b,.5).ships[0],a.ships[0]);
});
test('animation uses elapsed time, supports speed changes, holds final frame and stops cleanly',()=>{
 let callback,last,done=0,rate=1,cancelled=0;
 const stop=playFrames([frame(0),frame(10)],{speed:()=>rate,render:(f,p)=>last={f,p},complete:()=>done++,request:cb=>(callback=cb,1),cancel:()=>cancelled++,now:()=>0});
 callback(55);assert.equal(last.f.ships[0].xy.x,5);
 rate=2;callback(82.5);assert.equal(last.f.ships[0].xy.x,10);assert.equal(done,0);
 callback(137.5);assert.equal(done,1);callback(200);assert.equal(done,1);
 stop();assert.equal(cancelled,1);
 let completed=false;
 const stopEarly=playFrames([frame(0)],{speed:()=>1,render:()=>{},complete:()=>completed=true,request:cb=>(callback=cb,2),cancel:()=>{},now:()=>0});
 stopEarly();callback(500);assert.equal(completed,false);
});
test('1x playback renders every 60 Hz frame with distinct interpolated positions',()=>{
 let callback;const positions=[];
 playFrames(Array.from({length:12},(_,i)=>frame(i*10)),{speed:()=>1,render:f=>positions.push(f.ships[0].xy.x),complete:()=>{},request:cb=>(callback=cb,1),cancel:()=>{},now:()=>0});
 for(let tick=1;tick<=60;tick++)callback(tick*1000/60);
 assert.equal(positions.length,61);
 assert.equal(new Set(positions).size,61);
 assert.ok(Math.abs(positions.at(-1)-1000/110*10)<1e-8);
});
test('interpolated frame time drives projectiles at the same continuous clock as ships',()=>{
 const a={...frame(0),t:.1},b={...frame(10),t:.2};
 assert.equal(interpolateFrame(a,b,.5).t,.15000000000000002);
 assert.equal(interpolateFrame(a,null,.5).t,.1);
 assert.equal(a.t,.1);
});
test('final impact frame continues its visual clock during the existing hold without delaying completion',()=>{
 let callback,last,done=0;
 playFrames([{...frame(0),t:1},{...frame(10),t:1.1}],{speed:()=>1,render:f=>last=f,complete:()=>done++,request:cb=>(callback=cb,1),cancel:()=>{},now:()=>0});
 callback(110);assert.equal(last.t,1.1);
 callback(165);assert(Math.abs(last.t-1.15)<1e-12);assert.equal(last.ships[0].xy.x,10);assert.equal(done,0);
 callback(220);assert.equal(done,1);
});
test('position-only legacy frames do not acquire an invalid clock',()=>{
 assert.equal('t' in interpolateFrame(frame(0),frame(10),.5),false);
});
