import { defineComponent, h, onMounted, onBeforeUnmount, ref, watch } from 'vue';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { xyToHex, inBounds } from './engine.js';
import { Board } from './scene/board.js';
import { Units } from './scene/units.js';
import { Effects } from './scene/effects.js';

// Interaction state is independent of camera controls: a gesture can never become an order.
export function movedPointer(start, event, threshold = 6) {
  return Math.hypot(event.clientX - start.x, event.clientY - start.y) > threshold;
}
export function pickAction({ node, ship, hex, mode, phase, button = 0 }) {
  if (!hex && !ship && !node) return null;
  if (button === 2) return node?.pos || hex ? { type: 'hex', hex: node?.pos || hex, forceMove: true } : null;
  if (button !== 0) return null;
  if (node) {
    if (node.editable && mode === 'move' && phase === 'plan') return { type: 'node', index: node.index, shipId: node.shipId };
    if (node.pos) return { type: 'hex', hex: node.pos, forceMove: false };
  }
  if (ship) return { type: 'ship', ship };
  return hex ? { type: 'hex', hex, forceMove: false } : null;
}
export function applyCameraMode(controls, canvas, enabled) {
  const rotating = !!enabled;
  if (controls) { controls.mouseButtons.LEFT = rotating ? THREE.MOUSE.ROTATE : THREE.MOUSE.PAN; controls.touches.ONE = rotating ? THREE.TOUCH.ROTATE : THREE.TOUCH.PAN; }
  if (canvas) canvas.dataset.cameraMode = rotating ? 'rotate' : 'pan';
  return rotating;
}
export const BattleMap3D = defineComponent({
  name: 'BattleMap3D', props: { model: { type: Object, required: true } },
  emits: ['zoom', 'rotate', 'hex', 'ship', 'node', 'hover', 'home'],
  setup(props, { emit, expose }) {
    const host = ref(null), error = ref('');
    let renderer, scene, camera, controls, board, units, effects, observer, frame = 0;
    let dirty = true, syncNeeded = true, rotating = false, listeners = [], width = 1, height = 1;
    const center = new THREE.Vector3(15.9, 0, 10.5), raycaster = new THREE.Raycaster(), pointer = new THREE.Vector2();
    const seaPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0), hit = new THREE.Vector3();
    const pointers = new Map(); let gestureSuppressed = false;
    function listen(target, name, fn, options) { target.addEventListener(name, fn, options); listeners.push(() => target.removeEventListener(name, fn, options)); }
    function fit() {
      if (!camera) return;
      camera.updateMatrixWorld();
      // Fit the complete board plus the standees in the current camera orientation.
      const corners = [];
      for (const x of [-2, 34.5]) for (const y of [0, 2.2]) for (const z of [-2, 23]) corners.push(new THREE.Vector3(x, y, z).sub(center).applyQuaternion(camera.quaternion.clone().invert()));
      const halfX = Math.max(...corners.map(p => Math.abs(p.x))) * 1.05, halfY = Math.max(...corners.map(p => Math.abs(p.y))) * 1.05;
      const aspect = width / height, half = Math.max(halfY, halfX / aspect);
      camera.left = -half * aspect; camera.right = half * aspect; camera.top = half; camera.bottom = -half; camera.updateProjectionMatrix(); dirty = true;
    }
    function reset() {
      setRotate(false);
      if (!camera) return;
      camera.position.copy(center).add(new THREE.Vector3(0, 32, 24)); camera.up.set(0, 1, 0); camera.lookAt(center);
      controls.target.copy(center); camera.zoom = 1; controls.update(); fit(); emit('zoom', 1); dirty = true;
    }
    function focus(pos) {
      if (!controls || !pos) return;
      const target = new THREE.Vector3(pos.x, 0, pos.y), delta = target.clone().sub(controls.target);
      camera.position.add(delta); controls.target.copy(target); camera.zoom = 3; camera.updateProjectionMatrix(); controls.update(); emit('zoom', camera.zoom); dirty = true;
    }
    function zoomBy(factor) {
      if (!camera || !Number.isFinite(factor) || factor <= 0) return;
      camera.zoom = THREE.MathUtils.clamp(camera.zoom * factor, 1, 3); camera.updateProjectionMatrix(); dirty = true; emit('zoom', camera.zoom);
    }
    function setRotate(enabled) {
      rotating = applyCameraMode(controls, renderer?.domElement, enabled); emit('rotate', rotating); return rotating;
    }
    function toggleRotate() { return setRotate(!rotating); }
    expose({ reset, focus, zoomBy, toggleRotate });
    function readPointer(event) {
      const bounds = renderer.domElement.getBoundingClientRect();
      pointer.set((event.clientX - bounds.left) / bounds.width * 2 - 1, -(event.clientY - bounds.top) / bounds.height * 2 + 1);
      camera.updateMatrixWorld(); raycaster.setFromCamera(pointer, camera);
      const ground = raycaster.ray.intersectPlane(seaPlane, hit); const hex = ground ? xyToHex({ x: hit.x, y: hit.z }) : null;
      return hex && inBounds(hex) ? hex : null;
    }
    function pick(event) {
      const hex = readPointer(event);
      const node = raycaster.intersectObjects(board.nodes, false)[0]?.object.userData;
      const ship = raycaster.intersectObjects(units.picks, false)[0]?.object.userData.ship;
      const action = pickAction({ node, ship, hex: event.button === 2 && ship ? xyToHex(ship.xy) : hex, mode: props.model.mode, phase: props.model.phase, button: event.button });
      if (!action || props.model.busy) return;
      if (action.type === 'node') emit('node', { index: action.index, shipId: action.shipId });
      else if (action.type === 'ship') emit('ship', { ship: action.ship, event });
      else emit('hex', { hex: action.hex, event, forceMove: action.forceMove });
    }
    function resize() {
      if (!renderer || !host.value) return;
      const rect = host.value.getBoundingClientRect(); width = Math.max(1, rect.width); height = Math.max(1, rect.height);
      renderer.setSize(width, height, false); fit();
    }
    function update() {
      if (!renderer || error.value) return;
      board.update(props.model); units.update(props.model); effects.update(props.model.visuals);
      Object.assign(renderer.domElement.dataset, { rendererStatus: 'ready', cellCount: String(props.model.cells.length), shipCount: String(props.model.ships.length), planeCount: String(props.model.planes?.length || 0), projectileCount: String(props.model.visuals?.projectiles?.length || 0), effectCount: String(props.model.visuals?.effects?.length || 0) });
      syncNeeded = false; dirty = true;
    }
    function animate() {
      frame = 0; if (!renderer || error.value || document.hidden) return;
      try { if (syncNeeded) update(); const changed = controls.update(); if (dirty || changed) { renderer.render(scene, camera); dirty = false; } }
      catch (e) { fail(e); return; }
      frame = requestAnimationFrame(animate);
    }
    function fail(e) { error.value = e?.message || 'WebGL 场景不可用'; if (renderer) renderer.domElement.dataset.rendererStatus = 'error'; cancelAnimationFrame(frame); frame = 0; }
    function cleanup() {
      cancelAnimationFrame(frame); frame = 0; observer?.disconnect(); observer = null; listeners.forEach(fn => fn()); listeners = [];
      controls?.dispose(); board?.dispose(); units?.dispose(); effects?.dispose();
      if (renderer) { renderer.dispose(); renderer.forceContextLoss(); renderer.domElement.remove(); }
      renderer = controls = board = units = effects = scene = camera = null; pointers.clear(); gestureSuppressed = false;
    }
    function initialize() {
      cleanup(); setRotate(false); error.value = ''; syncNeeded = true; dirty = true;
      try {
        renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' }); renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
        renderer.setClearColor(0x071724); renderer.outputColorSpace = THREE.SRGBColorSpace;
        const canvas = renderer.domElement; canvas.className = 'battle-map-canvas'; canvas.setAttribute('aria-label', '三维六角海战地图：点按选格，拖动平移，滚轮缩放'); canvas.setAttribute('role', 'img'); canvas.tabIndex = 0; canvas.style.touchAction = 'none'; canvas.dataset.cameraMode = rotating ? 'rotate' : 'pan'; host.value.prepend(canvas);
        scene = new THREE.Scene(); scene.add(new THREE.HemisphereLight(0xc7ebf6, 0x244255, 2)); const sun = new THREE.DirectionalLight(0xffeedb, 2.2); sun.position.set(-12, 35, 15); scene.add(sun);
        camera = new THREE.OrthographicCamera(-20, 20, 15, -15, .1, 250);
        controls = new OrbitControls(camera, canvas); controls.enableDamping = false; controls.minZoom = 1; controls.maxZoom = 3; controls.minPolarAngle = .15; controls.maxPolarAngle = Math.PI / 2.65; controls.screenSpacePanning = false;
        controls.mouseButtons = { LEFT: rotating ? THREE.MOUSE.ROTATE : THREE.MOUSE.PAN, MIDDLE: THREE.MOUSE.ROTATE, RIGHT: THREE.MOUSE.PAN }; controls.touches = { ONE: rotating ? THREE.TOUCH.ROTATE : THREE.TOUCH.PAN, TWO: THREE.TOUCH.DOLLY_PAN };
        controls.addEventListener('change', () => { dirty = true; emit('zoom', camera.zoom); });
        board = new Board(scene); units = new Units(scene); effects = new Effects(scene);
        listen(canvas, 'pointerdown', e => { if (!pointers.size) gestureSuppressed = false; pointers.set(e.pointerId, { x: e.clientX, y: e.clientY, button: e.button }); if (pointers.size > 1) gestureSuppressed = true; }, true);
        listen(canvas, 'pointermove', e => { const start = pointers.get(e.pointerId); if (start && movedPointer(start, e)) gestureSuppressed = true; if (!pointers.size) emit('hover', readPointer(e)); }, true);
        listen(canvas, 'pointerup', e => { const start = pointers.get(e.pointerId); if (!start) return; const suppress = gestureSuppressed || movedPointer(start, e) || pointers.size > 1; pointers.delete(e.pointerId); if (!suppress) pick(e); }, true);
        listen(canvas, 'pointercancel', e => { gestureSuppressed = true; pointers.delete(e.pointerId); }, true);
        listen(canvas, 'lostpointercapture', e => { if (pointers.has(e.pointerId)) { gestureSuppressed = true; pointers.delete(e.pointerId); } }, true);
        listen(canvas, 'pointerleave', () => emit('hover', null)); listen(canvas, 'contextmenu', e => e.preventDefault());
        listen(canvas, 'webglcontextlost', e => { e.preventDefault(); fail(new Error('图形上下文已中断，请重试加载战场。')); });
        listen(document, 'visibilitychange', () => { if (document.hidden) { cancelAnimationFrame(frame); frame = 0; } else if (!frame && !error.value) { dirty = true; animate(); } });
        observer = new ResizeObserver(resize); observer.observe(host.value); reset(); resize(); update(); animate();
      } catch (e) { fail(e); }
    }
    watch(() => props.model, () => { syncNeeded = true; }, { flush: 'sync' });
    onMounted(initialize); onBeforeUnmount(cleanup);
    return () => h('div', { ref: host, class: 'battle-map-3d map-scroll' }, error.value ? [h('div', { class: 'map-render-error', role: 'alert' }, [h('strong', '三维战场暂时无法显示'), h('p', error.value), h('button', { onClick: initialize }, '重试加载'), h('button', { onClick: () => emit('home') }, '返回菜单')])] : []);
  },
});
