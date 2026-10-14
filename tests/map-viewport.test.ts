import {test,afterAll,afterEach} from 'vitest';
import assert from 'node:assert/strict';
import {createCamera} from '../src/map-viewport.ts';
import {createViewportGesture} from '../src/composables/viewport-gesture.ts';
test('camera zoom anchors stay under fingers and panning clamps to bounds',()=>{
 const c=createCamera();c.zoomAt(2,450,307.5);
 assert.equal(c.state.x+450/2,450);assert.equal(c.state.y+307.5/2,307.5);
 c.pan(100,40);assert.equal(c.state.x,175);assert.equal(c.state.y,133.75);
 c.pan(10000,10000);assert.equal(c.state.x,0);assert.equal(c.state.y,0);
 c.zoomAt(99);assert.equal(c.state.zoom,3);c.focus({x:899,y:614});assert.equal(c.state.x,600);assert.equal(c.state.y,410);
 c.reset();assert.equal(c.viewBox(),'0 0 900 615');
});
function harness(){return createViewportGesture({setPointerCapture(){},bounds:()=>({left:0,top:0,width:900,height:615}),render(){}});}
const event=(id: number,x: number,y: number,type='pointermove')=>({pointerId:id,clientX:x,clientY:y,pointerType:'touch',type,preventDefault(){}});
test('tap remains actionable while drag, pinch, cancellation and multi-touch tails suppress clicks',()=>{
 const h=harness();const blocked=()=>{let b=false;h.captureClick({preventDefault(){b=true},stopImmediatePropagation(){}});return b};
 h.down(event(1,400,300));h.move(event(1,405,300));h.up(event(1,405,300,'pointerup'));assert(!blocked());
 h.down(event(1,400,300));h.move(event(1,410,300));h.up(event(1,410,300,'pointerup'));assert(blocked());
 h.down(event(1,400,300));h.down(event(2,500,300));h.move(event(2,600,300));assert.equal(h.camera.state.zoom,2);h.up(event(2,600,300,'pointerup'));h.move(event(1,410,300));h.up(event(1,410,300,'pointerup'));assert(blocked());
 h.down(event(1,400,300));h.up(event(1,400,300,'pointercancel'));assert(blocked());
 h.down(event(1,400,300));h.up(event(1,400,300,'pointerup'));assert(!blocked(),'a new genuine tap works immediately after a gesture');
 h.blockClick=true;h.down({...event(9,400,300),pointerType:'mouse'});assert(!blocked(),'switching to mouse does not leave hybrid devices blocked');
});
