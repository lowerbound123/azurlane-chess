// Camera state is presentation-only and never enters a game save.
export function createCamera() {
  const c = { x: 0, y: 0, zoom: 1 };
  const clamp = () => {
    c.zoom = Math.max(1, Math.min(3, c.zoom));
    c.x = Math.max(0, Math.min(900 - 900 / c.zoom, c.x));
    c.y = Math.max(0, Math.min(615 - 615 / c.zoom, c.y));
  };
  return { state: c, clamp, reset() { c.x = c.y = 0; c.zoom = 1; },
    pan(dx:number, dy:number) { c.x -= dx / c.zoom; c.y -= dy / c.zoom; clamp(); },
    zoomAt(zoom:number, px = 450, py = 307.5, nextX = px, nextY = py) {
      const ax = c.x + px / c.zoom, ay = c.y + py / c.zoom;
      c.zoom = Math.max(1, Math.min(3, zoom));
      c.x = ax - nextX / c.zoom; c.y = ay - nextY / c.zoom; clamp();
    },
    focus(p:{x:number;y:number}) { c.zoom = 3; c.x = p.x - 150; c.y = p.y - 102.5; clamp(); },
    viewBox() { return `${c.x} ${c.y} ${900 / c.zoom} ${615 / c.zoom}`; }
  };
}
