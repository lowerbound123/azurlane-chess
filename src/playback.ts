import {DEATH_PRESENTATION_DURATION} from '../shared/character-presentation.ts';
interface PositionedUnit {id:string;xy:{x:number;y:number}}
export interface PlaybackFrame {t?:number;cameraFocus?:{x:number;y:number;radius?:number};visibilityBarrier?:boolean;zones?:{kind:string}[];ships:PositionedUnit[];torpedoes:PositionedUnit[];planes:PositionedUnit[];visuals?:{actions:{age:number;action?:string}[];effects?:{age:number;duration?:number}[]}}
interface PlaybackOptions<F extends PlaybackFrame> {speed:()=>number;render:(frame:F,fraction:number)=>void;complete:()=>void;interpolate?:boolean;request?:(callback:FrameRequestCallback)=>number;cancel?:(id:number)=>void;now?:()=>number}
// Interpolate presentation positions only. Combat, visibility and damage remain
// the engine's discrete snapshots; no interpolated data enters the saved game.
export function interpolateFrame<F extends PlaybackFrame>(from:F,to:F|null|undefined,fraction:number):F {
  if (!to || fraction <= 0) return from;
  const mix = <T extends {id:string;xy:{x:number;y:number}}>(list:T[],nextList:T[]):T[] => {
    const next=new Map(nextList.map(unit=>[unit.id,unit]));
    return list.map(unit=>{const target=next.get(unit.id);return !target||('hp' in unit&&unit.hp===0)?unit:{...unit,xy:{x:unit.xy.x+(target.xy.x-unit.xy.x)*fraction,y:unit.xy.y+(target.xy.y-unit.xy.y)*fraction}};});
  };
  const clockDelta=typeof from.t==='number'&&typeof to.t==='number'?to.t-from.t:0;
  return { ...from, ...(from.cameraFocus&&to.cameraFocus?{cameraFocus:{...(from.cameraFocus.radius!==undefined&&to.cameraFocus.radius!==undefined?{radius:from.cameraFocus.radius+(to.cameraFocus.radius-from.cameraFocus.radius)*fraction}:{}),x:from.cameraFocus.x+(to.cameraFocus.x-from.cameraFocus.x)*fraction,y:from.cameraFocus.y+(to.cameraFocus.y-from.cameraFocus.y)*fraction}}:{}), ...(from.visuals?.actions && typeof from.t==='number' && typeof to.t==='number' ? {visuals:{...from.visuals,...(from.visuals.effects?{effects:from.visuals.effects.map(e=>({...e,age:e.age+(e.duration?clockDelta*fraction/e.duration:0)})).filter(e=>e.age<=1)}:{}),actions:from.visuals.actions.map(a=>({...a,age:a.age+clockDelta*fraction})).filter(a=>a.age<=(a.action==='dead'?DEATH_PRESENTATION_DURATION:.65))}}:{}), ...(typeof from.t==='number' && typeof to.t==='number' && Number.isFinite(from.t) && Number.isFinite(to.t) ? { t: from.t + (to.t - from.t) * fraction } : {}), ships: ([...(from.zones??[]),...(to.zones??[])].some(z=>z.kind==='smoke')?from.ships:mix(from.ships,to.ships)), torpedoes: mix(from.torpedoes,to.torpedoes), planes: mix(from.planes,to.planes) };
}

export function playFrames<F extends PlaybackFrame>(frames:F[], { speed, render, complete, interpolate = true,
  request = callback => window.requestAnimationFrame(callback),
  cancel = id => window.cancelAnimationFrame(id),
  now = () => performance.now(),
}:PlaybackOptions<F>) {
  let stopped=false,handle=0,elapsed=0,previous=now();
  if(!frames.length){complete();return ()=>{};}
  const duration = frames.length * 110;
  const barriers=frames.flatMap((frame,index)=>index>0&&frame.visibilityBarrier?[index]:[]);let barrier=0;
  render(frames[0], 0);
  const tick = (timestamp: number) => {
    if (stopped) return;
    // A background tab or a long render must not skip the entire battle.
    elapsed += Math.min(110, Math.max(0, timestamp - previous)) * speed();
    previous = timestamp;
    // First contact must be presented before later frames can activate its vision,
    // even at 4x speed or after a slow/background animation frame.
    if(barrier<barriers.length&&elapsed>=barriers[barrier]*110)elapsed=barriers[barrier++]*110;
    elapsed = Math.min(elapsed, duration);
    const position = elapsed / 110, index = Math.min(Math.floor(position), frames.length - 1);
    const fraction = position - index;
    let frame = interpolate ? interpolateFrame(frames[index], frames[index + 1], fraction) : frames[index];
    // The last discrete snapshot is held for the original 110 ms. Continue its
    // presentation clock so terminal damage numbers rise during that hold.
    if (interpolate && index === frames.length - 1 && typeof frame.t==='number' && Number.isFinite(frame.t)) {
      frame = { ...frame, t: frame.t + .1 * fraction };
    }
    render(frame, elapsed / duration);
    // Let the final frame and 100% progress reach the screen before the caller
    // switches back to planning and removes the progress indicator.
    handle = request(elapsed === duration ? () => {
      if (stopped) return;
      stopped = true; complete();
    } : tick);
  };
  handle = request(tick);
  return () => { stopped = true; cancel(handle); };
}
