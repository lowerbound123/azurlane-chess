import {onMounted, onBeforeUnmount, ref, watch, type Ref} from 'vue';
import {useEventListener} from '@vueuse/core';
import type {MapModel, MapNode, RenderShip} from '../../shared/render.ts';
import type {Hex, XY} from '../../shared/game.ts';

import {errorMessage} from '../lib/errors.ts';
import * as THREE from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import {xyToHex, inBounds, same} from '../engine.ts';
import {TacticalModels} from '../scene/tactical-models.ts';
import {Board,mapViewBounds,mapCameraDistance} from '../scene/board.ts';
import {Units} from '../scene/units.ts';
import {Effects} from '../scene/effects.ts';

// Interaction state is independent of camera controls: a gesture can never become an order.
export function movedPointer(start:XY,event:Pick<PointerEvent,'clientX'|'clientY'>,threshold=6) {
  return Math.hypot(event.clientX - start.x, event.clientY - start.y) > threshold;
}
type MapPick<S extends Pick<RenderShip,'id'>>={type:'undo'}|{type:'node';index:number;shipId:string}|{type:'ship';ship:S}|{type:'hex';hex:Hex;forceMove:boolean};
export function pickAction<S extends Pick<RenderShip,'id'>&Partial<Pick<RenderShip,'team'>>>({node,ship,hex,mode,phase,button=0,pointerType,myTeam}:{node?:MapNode;ship?:S;hex?:Hex|null;mode?:string;phase?:string;button?:number;pointerType?:string;myTeam?:number}):MapPick<S>|null {
  if (button === 2) return phase === 'plan' ? {type:'undo'} : null;
  if (!hex && !ship && !node) return null;
  if (button !== 0) return null;
  // A friendly hull wins over overlapping route markers on desktop.
  if (pointerType==='mouse'&&myTeam!==undefined&&ship?.team===myTeam) return {type:'ship',ship};
  if (node) {
    if (node.editable && mode === 'move' && phase === 'plan') return { type: 'node', index: node.index, shipId: node.shipId };
    if (node.pos) return { type: 'hex', hex: node.pos, forceMove: false };
  }
  if (ship) return { type: 'ship', ship };
  return hex ? { type: 'hex', hex, forceMove: false } : null;
}
export function shipAtHex<S extends Pick<RenderShip,'pos'>>(ships:S[],hex:Hex|null) {
  return hex ? ships.find(ship=>same(ship.pos,hex)) : undefined;
}
export function applyCameraMode(controls:Pick<OrbitControls,'mouseButtons'|'touches'>|null,canvas:Pick<HTMLCanvasElement,'dataset'>|null,enabled:boolean) {
  const rotating = !!enabled;
  if (controls) { controls.mouseButtons = {LEFT:THREE.MOUSE.PAN,MIDDLE:THREE.MOUSE.PAN,RIGHT:null}; controls.touches.ONE = rotating ? THREE.TOUCH.ROTATE : THREE.TOUCH.PAN; }
  if (canvas) canvas.dataset.cameraMode = rotating ? 'rotate' : 'pan';
  return rotating;
}
// OrbitControls swaps PAN and ROTATE for Ctrl/Meta/Shift internally. Compensate
// at pointerdown so desktop bindings are exact and remain fixed for the gesture.
export function applyDesktopMouseButtons(controls:Pick<OrbitControls,'mouseButtons'>,event:Pick<PointerEvent,'shiftKey'|'ctrlKey'|'metaKey'>) {
  const modified=event.shiftKey||event.ctrlKey||event.metaKey;
  controls.mouseButtons.LEFT=modified?THREE.MOUSE.ROTATE:THREE.MOUSE.PAN;
  controls.mouseButtons.MIDDLE=event.shiftKey!==modified?THREE.MOUSE.ROTATE:THREE.MOUSE.PAN;
  controls.mouseButtons.RIGHT=null;
}
type MapEvents=HTMLElementEventMap&DocumentEventMap&{webglcontextlost:Event};
type MapEmits={ (event:'zoom',value:number):void;(event:'rotate',value:boolean):void;(event:'hex',value:{hex:Hex;event:PointerEvent;forceMove:boolean}):void;(event:'ship',value:{ship:RenderShip;event:PointerEvent}):void;(event:'node',value:{index:number;shipId:string}):void;(event:'hover',value:Hex|null):void;(event:'home'):void;(event:'undo'):void};
export function useBattleMap(host:Ref<HTMLElement|null>,props:{model:MapModel},emit:MapEmits){
    const error=ref(''),loading=ref(false);let generation=0,models:TacticalModels|null=null;
    let renderer:THREE.WebGLRenderer|null=null,scene:THREE.Scene|null=null,camera:THREE.OrthographicCamera|null=null,controls:OrbitControls|null=null,board:Board|null=null,units:Units|null=null,effects:Effects|null=null,observer:ResizeObserver|null=null,frame=0;
    let dirty = true, syncNeeded = true, rotating = false, listeners:(()=>void)[] = [], width = 1, height = 1;
    const center = new THREE.Vector3(15.9, 0, 10.5), raycaster = new THREE.Raycaster(), pointer = new THREE.Vector2();
    const seaPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0), hit = new THREE.Vector3();
    const pointers=new Map<number,XY&{button:number}>(); let gestureSuppressed = false;
    let viewSignature='';
    function listen<K extends keyof MapEvents>(target:EventTarget,name:K,fn:(event:MapEvents[K])=>void,options?:boolean){listeners.push(useEventListener(target,name,fn as EventListener,options));}

    function fit() {
      if (!camera) return;
      camera!.updateMatrixWorld();
      // Fit the complete board plus the standees in the current camera orientation.
      const corners = [];
      const bounds=mapViewBounds(props.model.map,props.model.focusRegion);
      for (const x of [bounds.minX, bounds.maxX]) for (const y of [0, 3]) for (const z of [bounds.minZ, bounds.maxZ]) corners.push(new THREE.Vector3(x, y, z).sub(center).applyQuaternion(camera!.quaternion.clone().invert()));
      const halfX = Math.max(...corners.map(p => Math.abs(p.x))) * 1.05, halfY = Math.max(...corners.map(p => Math.abs(p.y))) * 1.05;
      const aspect = width / height, half = Math.max(halfY, halfX / aspect);
      camera!.left = -half * aspect; camera!.right = half * aspect; camera!.top = half; camera!.bottom = -half; camera!.updateProjectionMatrix(); dirty = true;
    }
    function reset() {
      setRotate(false);
      if (!camera) return;
      const bounds=mapViewBounds(props.model.map,props.model.focusRegion);center.set(bounds.center.x,0,bounds.center.y);
      const distance=mapCameraDistance(mapViewBounds(props.model.map,props.model.focusRegion));
      camera!.far=Math.max(250,distance*3);
      camera!.position.copy(center).add(new THREE.Vector3(0, 32, 24).multiplyScalar(distance/40)); camera!.up.set(0, 1, 0); camera!.lookAt(center);
      controls!.target.copy(center); camera!.zoom = 1; controls!.update(); fit(); emit('zoom', 1); dirty = true;
    }
    function focus(pos:XY) {
      if (!controls || !pos) return;
      const target = new THREE.Vector3(pos.x, 0, pos.y), delta = target.clone().sub(controls!.target);
      camera!.position.add(delta); controls!.target.copy(target); camera!.zoom = 3; camera!.updateProjectionMatrix(); controls!.update(); emit('zoom', camera!.zoom); dirty = true;
    }
    function zoomBy(factor:number) {
      if (!camera || !Number.isFinite(factor) || factor <= 0) return;
      camera!.zoom = THREE.MathUtils.clamp(camera!.zoom * factor, 1, 3); camera!.updateProjectionMatrix(); dirty = true; emit('zoom', camera!.zoom);
    }
    function setRotate(enabled:boolean) {
      rotating = applyCameraMode(controls, renderer?.domElement??null, enabled); emit('rotate', rotating); return rotating;
    }
    function toggleRotate() { return setRotate(!rotating); }
    
    function readPointer(event:PointerEvent) {
      const bounds = renderer!.domElement.getBoundingClientRect();
      pointer.set((event.clientX - bounds.left) / bounds.width * 2 - 1, -(event.clientY - bounds.top) / bounds.height * 2 + 1);
      camera!.updateMatrixWorld(); raycaster.setFromCamera(pointer,camera!);
      const ground = raycaster.ray.intersectPlane(seaPlane, hit); const hex = ground ? xyToHex({ x: hit.x, y: hit.z }) : null;
      return hex && inBounds(hex,props.model.map) ? hex : null;
    }
    function pick(event:PointerEvent) {
      const hex = readPointer(event);
      const node=raycaster.intersectObjects(board!.nodes,false)[0]?.object.userData as MapNode|undefined;
      const ship=shipAtHex(props.model.ships,hex);
      const action = pickAction({ node, ship, hex, mode: props.model.mode, phase: props.model.phase, button: event.button, pointerType:event.pointerType, myTeam:props.model.myTeam });
      if (!action || props.model.busy) return;
      if (action.type === 'undo') emit('undo');
      else if (action.type === 'node') emit('node', { index: action.index, shipId: action.shipId });
      else if (action.type === 'ship') emit('ship', { ship: action.ship, event });
      else emit('hex', { hex: action.hex, event, forceMove: action.forceMove });
    }
    function resize() {
      if (!renderer || !host.value) return;
      const rect = host.value.getBoundingClientRect(); width = Math.max(1, rect.width); height = Math.max(1, rect.height);
      renderer!.setSize(width, height, false); fit();
    }
    function update() {
      if (!renderer || error.value) return;
      const nextViewSignature=JSON.stringify([props.model.map,props.model.focusRegion]);
      if(nextViewSignature!==viewSignature){viewSignature=nextViewSignature;reset();}
      board!.update(props.model); units!.update(props.model); effects!.update(props.model.visuals);
      Object.assign(renderer!.domElement.dataset, { rendererStatus: 'ready', cellCount: String(props.model.cells.length), shipCount: String(props.model.ships.length), planeCount: String(props.model.planes?.length || 0), projectileCount: String(props.model.visuals?.projectiles?.length || 0), effectCount: String(props.model.visuals?.effects?.length || 0) });
      syncNeeded = false; dirty = true;
    }
    let lastSeaFrame = 0, lastCharacterFrame=0;
    function animate(now = 0) {
      frame = 0; if (!renderer || error.value || document.hidden) return;
      try { if (syncNeeded) update(); const changed = controls!.update(); const characterChanged=now-lastCharacterFrame>=1000/30; if(characterChanged){units!.tick((now-lastCharacterFrame)/1000,camera!);lastCharacterFrame=now;} const seaChanged = now-lastSeaFrame >= 1000/30 && !window.matchMedia?.('(prefers-reduced-motion: reduce)').matches; if(seaChanged){board!.tick(now/1000);lastSeaFrame=now;} if (dirty || changed || seaChanged || characterChanged) { renderer!.render(scene!,camera!); dirty = false; } }
      catch (e) { fail(e); return; }
      frame = requestAnimationFrame(animate);
    }
    function fail(e:unknown) { error.value = errorMessage(e); if (renderer) renderer!.domElement.dataset.rendererStatus = 'error'; cancelAnimationFrame(frame); frame = 0; }
    function cleanup() {
      generation++;loading.value=false;
      cancelAnimationFrame(frame); frame = 0; observer?.disconnect(); observer = null; listeners.forEach(fn => fn()); listeners = [];
      controls?.dispose(); board?.dispose(); units?.dispose(); effects?.dispose();models?.dispose();models=null;
      if (renderer) { renderer!.dispose(); renderer!.forceContextLoss(); renderer!.domElement.remove(); }
      renderer=null;controls=null;board=null;units=null;effects=null;scene=null;camera=null; pointers.clear(); gestureSuppressed = false;
    }
    async function initialize() {
      cleanup(); setRotate(false); error.value = ''; syncNeeded = true; dirty = true;
      const epoch=generation;loading.value=true;
      try {
        const loaded=await TacticalModels.load();if(epoch!==generation){loaded.dispose();return;}models=loaded;loading.value=false;
        renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' }); renderer!.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
        renderer!.setClearColor(0x071724); renderer!.outputColorSpace = THREE.SRGBColorSpace;
        const canvas = renderer!.domElement; canvas.className = 'battle-map-canvas'; canvas.setAttribute('aria-label', '三维六角海战地图：左键点选下令，左键或中键拖动平移，Shift加中键旋转，右键撤销，滚轮缩放'); canvas.setAttribute('role', 'img'); canvas.tabIndex = 0; canvas.style.touchAction = 'none'; canvas.dataset.cameraMode = rotating ? 'rotate' : 'pan'; host.value!.prepend(canvas);
        scene = new THREE.Scene(); scene.add(new THREE.HemisphereLight(0xc7ebf6, 0x244255, 2)); const sun = new THREE.DirectionalLight(0xffeedb, 2.2); sun.position.set(-12, 35, 15); scene.add(sun);
        camera = new THREE.OrthographicCamera(-20, 20, 15, -15, .1, 250);
        controls = new OrbitControls(camera, canvas); controls!.enableDamping = false; controls!.minZoom = 1; controls!.maxZoom = 3; controls!.minPolarAngle = .15; controls!.maxPolarAngle = Math.PI / 2.65; controls!.screenSpacePanning = false;
        controls!.mouseButtons = { LEFT: THREE.MOUSE.PAN, MIDDLE: THREE.MOUSE.PAN, RIGHT: null }; controls!.touches = { ONE: rotating ? THREE.TOUCH.ROTATE : THREE.TOUCH.PAN, TWO: THREE.TOUCH.DOLLY_PAN };
        controls!.addEventListener('change', () => { dirty = true; emit('zoom', camera!.zoom); });
        board = new Board(scene,models); units = new Units(scene,models); effects = new Effects(scene);
        listen(canvas, 'pointerdown', e => { if(e.pointerType==='mouse'){applyDesktopMouseButtons(controls!,e);if(e.button===1||e.button===2)e.preventDefault();} if (!pointers.size) gestureSuppressed = false; pointers.set(e.pointerId, { x: e.clientX, y: e.clientY, button: e.button }); if (pointers.size > 1) gestureSuppressed = true; }, true);
        listen(canvas, 'pointermove', e => { const start = pointers.get(e.pointerId); if (start && movedPointer(start, e)) gestureSuppressed = true; if (!pointers.size) emit('hover', readPointer(e)); }, true);
        listen(canvas, 'pointerup', e => { const start = pointers.get(e.pointerId); if (!start) return; const suppress = gestureSuppressed || movedPointer(start, e) || pointers.size > 1; pointers.delete(e.pointerId); if (!suppress) pick(e); }, true);
        listen(canvas, 'pointercancel', e => { gestureSuppressed = true; pointers.delete(e.pointerId); }, true);
        listen(canvas, 'lostpointercapture', e => { if (pointers.has(e.pointerId)) { gestureSuppressed = true; pointers.delete(e.pointerId); } }, true);
        listen(canvas, 'pointerleave', () => emit('hover', null)); listen(canvas, 'contextmenu', e => e.preventDefault()); listen(canvas, 'auxclick', e => e.preventDefault());
        listen(canvas, 'webglcontextlost', e => { e.preventDefault(); fail(new Error('图形上下文已中断，请重试加载战场。')); });
        listen(document, 'visibilitychange', () => { if (document.hidden) { cancelAnimationFrame(frame); frame = 0; } else if (!frame && !error.value) { dirty = true; animate(); } });
        observer = new ResizeObserver(resize); observer.observe(host.value!); reset(); resize(); update(); animate();
      } catch (e) { if(epoch===generation){loading.value=false;fail(e);} }
    }
    watch(() => props.model, () => { syncNeeded = true; }, { flush: 'sync' });
    onMounted(initialize);onBeforeUnmount(cleanup);
    return {error,loading,initialize,reset,focus,zoomBy,toggleRotate};

}
