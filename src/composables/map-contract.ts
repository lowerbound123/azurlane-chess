import type {XY} from '../../shared/game.ts';
export interface MapHandle {reset:()=>void;focus:(point:XY)=>void;zoomBy:(factor:number)=>void;toggleRotate:()=>void}
