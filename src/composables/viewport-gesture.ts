import {createCamera} from '../map-viewport.ts';
export interface ViewportHost {setPointerCapture:(id:number)=>void;bounds:()=>Pick<DOMRect,'left'|'top'|'width'|'height'>;render:(viewBox:string,zoom:number)=>void}
export type GestureEvent=Pick<PointerEvent,'pointerId'|'clientX'|'clientY'|'pointerType'|'type'|'preventDefault'>;
export function createViewportGesture(host:ViewportHost){
 const camera=createCamera(),pointers=new Map<number,{x:number;y:number;cx:number;cy:number;sx:number;sy:number}>();let blockClick=false,dragging=false;
 const renderCamera=()=>host.render(camera.viewBox(),camera.state.zoom);
 const position=(e:GestureEvent)=>{const r=host.bounds(),fit=Math.min(r.width/900,r.height/615)||1;return{x:(e.clientX-r.left-(r.width-900*fit)/2)/fit,y:(e.clientY-r.top-(r.height-615*fit)/2)/fit,cx:e.clientX,cy:e.clientY};};
 const down=(e:GestureEvent)=>{if(e.pointerType==='mouse'){if(!pointers.size)blockClick=false;return;}if(!pointers.size){blockClick=false;dragging=false;}const p=position(e);pointers.set(e.pointerId,{...p,sx:p.cx,sy:p.cy});if(pointers.size>1){blockClick=true;dragging=true;}};
 const move=(e:GestureEvent)=>{const old=pointers.get(e.pointerId);if(!old)return;const next={...position(e),sx:old.sx,sy:old.sy},before=[...pointers.values()];if(Math.hypot(next.cx-old.sx,next.cy-old.sy)>8)dragging=true;if(!dragging)return;blockClick=true;e.preventDefault();try{host.setPointerCapture(e.pointerId);}catch{}pointers.set(e.pointerId,next);if(before.length>=2){const after=[...pointers.values()],[a,b]=before,[n,m]=after,d=Math.hypot(a.x-b.x,a.y-b.y),nd=Math.hypot(n.x-m.x,n.y-m.y);if(d>0)camera.zoomAt(camera.state.zoom*nd/d,(a.x+b.x)/2,(a.y+b.y)/2,(n.x+m.x)/2,(n.y+m.y)/2);}else camera.pan(next.x-old.x,next.y-old.y);renderCamera();};
 const up=(e:GestureEvent)=>{if(!pointers.has(e.pointerId))return;if(e.type==='pointercancel')blockClick=true;pointers.delete(e.pointerId);if(blockClick)e.preventDefault();};
 const cancel=()=>{if(pointers.size)blockClick=true;pointers.clear();};
 const captureClick=(e:Pick<Event,'preventDefault'|'stopImmediatePropagation'>)=>{if(blockClick){e.preventDefault();e.stopImmediatePropagation();}};
 return {camera,pointers,down,move,up,cancel,captureClick,renderCamera,get blockClick(){return blockClick;},set blockClick(value:boolean){blockClick=value;}};
}
