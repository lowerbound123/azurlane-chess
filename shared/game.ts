/** Domain state is never an unfiltered network view. Keep these types pure. */
export type Team = number;
export type ShipType = 'dd' | 'cl' | 'ca' | 'bb' | 'cv';
export interface Hex { q: number; r: number }
export interface XY { x: number; y: number }
export interface Point3 extends XY { z: number }
export type AirRole = 'bomber' | 'heavy' | 'fighter' | 'scout';
export interface PlaneConfig { role?: AirRole; rearm?: number; attack?: {range:number;damage:number}; hp: number; speed: number; vision: number; range: number; damage: number }
export interface TorpedoConfig { speed: number; damage: number; life: number; reserve: number; max: number; perWindow?:number }
export interface ShipConfig {
 name: string; role: 'front' | 'back'; hp: number; speed: number; vision: number; collision: number; radius: number;
 secondary?: { damage: number; range: number; multi: boolean; targets?:number; advanceSalvo?:boolean };
 torpedo?: TorpedoConfig; aa?: {range: number; damage: number; inner?:{range:number;damage:number}}; contactSweep?: boolean;
 main?: {range: number; shots: number; damage: number; reload: number; blast?:number; centerMultiplier?:number};
 carrier?: {stock: number; launch: number; rearm: number; heal?: number; plane: PlaneConfig; slots?:PlaneConfig[]};
 guard?: {range:number;torpedoReduction:number; gunReduction?:number};
 minelayer?:{reserve:number;max:number;damage:number}; smoke?:{charges:number;radius:number;duration:number}; radar?:{charges:number;range:number;radius:number;duration:number}; escort?:{range:number;reduction:number;steps:number};
}
export interface Ship {
 statuses?:import('./status.ts').StatusInstance[];
 id: string; kind: 'ship'; team: Team; label: string; template: ShipType; cfg: ShipConfig;
 hp: number; pos: Hex; xy: XY; heading: number; torps: number; mainReady: number;
 airReady: number[]; airHP: number[]; destroyedPlanes: number; catalogId?: string; name?: string; avatar?: string; portrait?: string;
 guarding?: boolean; escorting?:boolean; minesLeft?:number; smokeLeft?:number; radarLeft?:number;
}
export interface Torpedo {
 id: string; kind: 'torpedo'; team: Team; owner: string; xy: XY; heading: number; age: number; launched: number;
 birth: number; armed: boolean; cfg: TorpedoConfig;
}
/** Presentation-only final motion, including torpedoes lost between snapshots. */
export interface TorpedoWake {team:Team;from:XY;to:XY;start:number;end:number}
export interface Plane {
 statuses?:import('./status.ts').StatusInstance[];
 id: string; kind: 'plane'; team: Team; mother: string; slot: number; hp: number; cfg: PlaneConfig; xy: XY;
 mode: 'point' | 'target' | 'patrol'; patrolRemaining?:number; attackRound?:number; target: Hex; targetId: string | null; tracking: boolean;
 state: 'outbound' | 'return'; traveled: number; waypoints: Hex[]; recovered?: boolean; accounted?: boolean;
}
export interface Mine extends Hex { armedRound?:number; sourceId?:string; team?:Team; damage?:number }
export interface Zone {kind:'smoke'|'radar';team:Team;center:Hex;radius:number;expires:number}
export interface GameMap { width: number; height: number; islands: string[]; mines: Mine[] }
export interface BattleLog { round: number; t?: number; text: string; at: Hex | null; team: Team | null }
export interface Game {
 battleMode?:import('./domination.ts').BattleMode; domination?:import('./domination.ts').DominationState;
 ruleset?:'fleet-v1'; zones?:Zone[];
 seed: number; round: number; map: GameMap; ships: Ship[]; torpedoes: Torpedo[]; planes: Plane[];
 nextId: number; log: BattleLog[]; winner: Team | 'draw' | null; phase: 'deploy' | 'plan' | 'ended'; explored: string[][];
}
export type Observation = Pick<Game, 'round' | 'map' | 'ships' | 'torpedoes' | 'planes'> & Partial<Pick<Game, 'explored'|'ruleset'|'zones'|'battleMode'|'domination'>>;
export interface Move { turn: number; forward: boolean }
export interface TorpedoOrder { window: number; dir: number; score?: number }
export type PlaneOrder = ({mode:'point'|'patrol';target:Hex;targetId?:never} | {mode:'target';targetId:string;target?:never}) & {slot?:number};
export interface Plan { moves: Move[]; torps: TorpedoOrder[]; main: Hex[]; planes: PlaneOrder[]; sweep: Hex | null; guard?:boolean; escort?:boolean; smoke?:boolean; radar?:Hex; mineSteps?:number[]; segments?: {start: number;end: number;target: Hex}[] }
export type Plans = Record<string, Plan>;
export interface RouteNode { pos: Hex; heading: number }
export interface Effect {kind:string;at:Hex;from?:Hex;text?:string}
interface PresentationBase {id:string;team:Team|null;at:Hex;sourceId?:string}
export interface EffectPresentation extends PresentationBase {type:'effect';kind:string;time:number;duration:number;text?:string;targetId?:string;position?:XY;from?:never;to?:never;start?:never;end?:never;shipId?:never;action?:never}
export interface ProjectilePresentation extends PresentationBase {type:'projectile';kind:string;from:XY;to:XY;start:number;end:number;targetId?:string;time?:never;duration?:never;text?:never;shipId?:never;action?:never}
export interface ActionPresentation extends PresentationBase {type:'action';shipId:string;action:string;time:number;duration:number;soundOnly?:boolean;kind?:never;text?:never;from?:never;to?:never;start?:never;end?:never}
export type Presentation = EffectPresentation | ProjectilePresentation | ActionPresentation;
export interface FrameShip extends Pick<Ship,'id'|'team'|'label'|'template'|'hp'|'cfg'|'pos'|'xy'|'heading'|'guarding'|'escorting'|'catalogId'|'statuses'> {}
export interface BattleFrame {
 round?:number;
 domination?:import('./domination.ts').DominationState;
 t: number; ships: FrameShip[]; torpedoes: Torpedo[]; planes: Plane[]; mines: Mine[]; zones?:Zone[]; visibleShipIdsByTeam?:string[][];
 visibleByTeam?: string[][]; exploredByTeam?: string[][]; visible: string[]; explored: string[]; effects: Effect[];
}
export type DamageType = 'main'|'secondary'|'torpedo'|'air'|'collision'|'environment'|'grounding'|'mine'|'status';
export interface Contribution {sourceId:string|null;amount:number}
export interface CombatStats {
 damageDealt:number;friendlyDamage:number;damageTaken:{enemy:number;friendly:number;environment:number};
 shipsSunk:number;planesShotDown:number;damageBySource:Record<string,{dealt:number;friendly:number;taken:number}>;
}
export interface RoundResult {
 torpedoWakes?:TorpedoWake[];
 historical?:import('./history.ts').HistoricalState;
 game: Game; frames: BattleFrame[]; events: BattleLog[]; counts:{count:number;hp:number}[];
 presentation: Presentation[]; combatStats:Record<string,CombatStats>;
}
export interface PlanHistory {undo:Plan[];redo:Plan[]}
export interface Motion {nodes:RouteNode[];stopped:boolean;visited:Hex[];fired:Set<number>}
