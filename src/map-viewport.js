// Camera state is presentation-only and never enters a game save.
export function createCamera() {
  const c = { x: 0, y: 0, zoom: 1 };
  const clamp = () => {
    c.zoom = Math.max(1, Math.min(3, c.zoom));
    c.x = Math.max(0, Math.min(900 - 900 / c.zoom, c.x));
    c.y = Math.max(0, Math.min(615 - 615 / c.zoom, c.y));
  };
  return { state: c, clamp, reset() { c.x = c.y = 0; c.zoom = 1; },
    pan(dx, dy) { c.x -= dx / c.zoom; c.y -= dy / c.zoom; clamp(); },
    zoomAt(zoom, px = 450, py = 307.5, nextX = px, nextY = py) {
      const ax = c.x + px / c.zoom, ay = c.y + py / c.zoom;
      c.zoom = Math.max(1, Math.min(3, zoom));
      c.x = ax - nextX / c.zoom; c.y = ay - nextY / c.zoom; clamp();
    },
    focus(p) { c.zoom = 3; c.x = p.x - 150; c.y = p.y - 102.5; clamp(); },
    viewBox() { return `${c.x} ${c.y} ${900 / c.zoom} ${615 / c.zoom}`; }
  };
}
export const MapViewport = {
  emits: ['zoom'],
  mounted() {
    this.camera = createCamera(); this.pointers = new Map(); this.blockClick = false;
    this.observer = typeof ResizeObserver === 'function' ? new ResizeObserver(() => { this.cancel(); this.renderCamera(); }) : null;
    this.observer?.observe(this.$el); this.renderCamera();
  },
  beforeUnmount() { this.observer?.disconnect(); this.pointers.clear(); },
  methods: {
    renderCamera() { this.camera.clamp(); this.$el.querySelector('svg')?.setAttribute('viewBox', this.camera.viewBox()); this.$emit('zoom', this.camera.state.zoom); },
    reset() { this.cancel(); this.camera.reset(); this.renderCamera(); },
    focus(p) { this.cancel(); this.camera.focus(p); this.renderCamera(); },
    zoomBy(factor) { this.camera.zoomAt(this.camera.state.zoom * factor); this.renderCamera(); },
    position(e) {
      const r = this.$el.querySelector('svg').getBoundingClientRect(), fit = Math.min(r.width / 900, r.height / 615) || 1;
      return { x: (e.clientX-r.left-(r.width-900*fit)/2)/fit, y: (e.clientY-r.top-(r.height-615*fit)/2)/fit, cx:e.clientX, cy:e.clientY };
    },
    down(e) {
      if (e.pointerType === 'mouse') { if(!this.pointers.size) this.blockClick=false; return; }
      if (!this.pointers.size) { this.blockClick = false; this.dragging = false; }
      const p = this.position(e); this.pointers.set(e.pointerId, { ...p, sx:p.cx, sy:p.cy });
      if (this.pointers.size > 1) { this.blockClick = true; this.dragging = true; }
    },
    move(e) {
      const old = this.pointers.get(e.pointerId); if (!old) return;
      const next = {...this.position(e), sx:old.sx, sy:old.sy};
      const before = [...this.pointers.values()];
      if (Math.hypot(next.cx-old.sx,next.cy-old.sy)>8) this.dragging = true;
      if (!this.dragging) return;
      this.blockClick = true; e.preventDefault();
      // Capture only after a drag starts, so a normal tap still reaches its SVG target.
      try { this.$el.setPointerCapture(e.pointerId); } catch {}
      this.pointers.set(e.pointerId,next);
      if (before.length>=2) {
        const after=[...this.pointers.values()], a=before[0],b=before[1],n=after[0],m=after[1];
        const d=Math.hypot(a.x-b.x,a.y-b.y), nd=Math.hypot(n.x-m.x,n.y-m.y);
        if(d>0) this.camera.zoomAt(this.camera.state.zoom*nd/d,(a.x+b.x)/2,(a.y+b.y)/2,(n.x+m.x)/2,(n.y+m.y)/2);
      } else this.camera.pan(next.x-old.x,next.y-old.y);
      this.renderCamera();
    },
    up(e) {
      if (!this.pointers.has(e.pointerId)) return;
      if(e.type==='pointercancel') this.blockClick=true;
      this.pointers.delete(e.pointerId);
      if(this.blockClick) e.preventDefault();
    },
    lost(e) { if(e.target===this.$el) this.up(e); },
    cancel() { if(this.pointers?.size) this.blockClick=true; this.pointers?.clear(); },
    captureClick(e) { if(this.blockClick) {e.preventDefault();e.stopImmediatePropagation();} }
  },
  template: `<div class="map-scroll" @pointerdown="down" @pointermove="move" @pointerup="up" @pointercancel="up" @lostpointercapture="lost" @click.capture="captureClick" @contextmenu.capture="captureClick"><slot /></div>`
};
