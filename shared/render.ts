import type {Hex,Ship,FrameShip,Plane,Torpedo,Plan,RouteNode,GameMap} from './game.ts';
import type {DominationState} from './domination.ts';
import type {SampledVisuals} from '../src/battle-visuals.ts';
export interface MapCell extends Hex {k?:string;known:boolean;visible:boolean;island:boolean;deploy?:boolean;overlay?:string|null;tutorial?:boolean;hovered?:boolean}
export interface RenderShip extends FrameShip {tutorial?:boolean}
export interface RenderPlane extends Plane {angle?:number}
export interface Preview {ship:Ship;plan:Plan;nodes:RouteNode[];selected:boolean;torps:{window:number;dir:number;origin:Hex;end:Hex;fullEnd:Hex}[];planes:{target:Hex}[]}
export interface MapFocusRegion {center:Hex;radius?:number}
export interface MapModel {domination?:DominationState;map?:Pick<GameMap,'width'|'height'>;focusRegion?:MapFocusRegion;cells:MapCell[];myTeam:number;ships:RenderShip[];planes:RenderPlane[];torpedoes:Torpedo[];mines:import('./game.ts').Mine[];zones?:import('./game.ts').Zone[];round?:number;selected:string;phase:string|undefined;mode:string;previews:Preview[];mainTargets:{at:Hex;count:number;selected:boolean}[];rays:{origin:Hex;fullEnd:Hex;roundEnd:Hex}[];showPlans:boolean;showRanges:boolean;overlayType:string;busy:boolean;airRange:{origin:Hex;radius:number}|null;visuals:Partial<SampledVisuals>}
export interface MapNode {type?:'node';pos:Hex;editable:boolean;index:number;shipId:string}
