// Interpolate presentation positions only. Combat, visibility and damage remain
// the engine's discrete snapshots; no interpolated data enters the saved game.
export function interpolateFrame(from, to, fraction) {
  if (!to || fraction <= 0) return from;
  const mix = name => {
    const next = new Map(to[name].map(unit => [unit.id, unit]));
    return from[name].map(unit => {
      const target = next.get(unit.id);
      if (!target) return unit;
      return { ...unit, xy: {
        x: unit.xy.x + (target.xy.x - unit.xy.x) * fraction,
        y: unit.xy.y + (target.xy.y - unit.xy.y) * fraction,
      } };
    });
  };
  return { ...from, ...(Number.isFinite(from.t) && Number.isFinite(to.t) ? { t: from.t + (to.t - from.t) * fraction } : {}), ships: mix('ships'), torpedoes: mix('torpedoes'), planes: mix('planes') };
}

export function playFrames(frames, { speed, render, complete,
  request = callback => window.requestAnimationFrame(callback),
  cancel = id => window.cancelAnimationFrame(id),
  now = () => performance.now(),
}) {
  let stopped = false, handle, elapsed = 0, previous = now();
  const duration = frames.length * 110;
  render(frames[0], 0);
  const tick = timestamp => {
    if (stopped) return;
    elapsed += Math.max(0, timestamp - previous) * speed();
    previous = timestamp;
    if (elapsed >= duration) { stopped = true; complete(); return; }
    const position = elapsed / 110, index = Math.floor(position);
    const fraction = position - index;
    let frame = interpolateFrame(frames[index], frames[index + 1], fraction);
    // The last discrete snapshot is held for the original 110 ms. Continue its
    // presentation clock so the terminal explosion expands during that hold.
    if (index === frames.length - 1 && Number.isFinite(frame.t)) {
      frame = { ...frame, t: frame.t + .1 * fraction };
    }
    render(frame, elapsed / duration);
    handle = request(tick);
  };
  handle = request(tick);
  return () => { stopped = true; cancel(handle); };
}
