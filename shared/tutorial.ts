import type {Game,Plans,Move,Hex} from './game.ts';
export type TutorialHighlight={kind:'ship';shipId:string}|{kind:'control';id:string}|{kind:'cell';cell:Hex};
export type TutorialCondition=
 |{kind:'all';conditions:TutorialCondition[]}
 |{kind:'event';types:string[];shipId?:string;cell?:Hex;saved?:boolean}
 |{kind:'selected';shipId:string}|{kind:'shipAt';shipId:string;cell:Hex}|{kind:'phase';value:Game['phase']}
 |{kind:'planMoves'|'mainCount'|'torpCount';shipId:string;count:number}
 |{kind:'routeEnd';shipId:string;cell:Hex}|{kind:'moveAt';shipId:string;index:number;turn:number;forward:boolean}
 |{kind:'overlay';rangeMode:string}|{kind:'visibleCell';cell:Hex;value:boolean}|{kind:'fogCell';cell:Hex;state:string}
 |{kind:'round';atLeast:number}|{kind:'reload';shipId:string;value:boolean}|{kind:'mainStack';shipId:string;cell:Hex;count:number}
 |{kind:'collisionResolved';shipIds:string[]}|{kind:'secondaryResolved';shipId:string}|{kind:'mainResolved';shipId:string;targetId:string;damage:number}
 |{kind:'torpAt';shipId:string;window:number;dir:number}|{kind:'torpedoResolved';shipId:string;count:number}|{kind:'planePoint';shipId:string;cell:Hex;count:number}
 |{kind:'aircraftAAResolved';mother:string}|{kind:'sweep'|'mineResolved';shipId:string;cell:Hex};
export interface TutorialStep {id:string;title:string;instruction:string;hint:string;success:string;highlights:TutorialHighlight[];condition:TutorialCondition}
export interface TutorialLesson {id:string;section:string;title:string;duration:string;goal:string;figure:string;description:string;steps:TutorialStep[]}
export interface TutorialState {lessonId:string;stepIndex:number;attempts:number;complete:boolean}
export interface TutorialContext {game:Game;plans:Plans;selected:string;mode:string;rangeMode:string;showRanges:boolean}
export interface TutorialAction {type:string;shipId?:string;target?:Hex;cell?:Hex;saved?:boolean;[key:string]:unknown}
export interface TutorialFixture {game:Game;plans:Plans;selected:string;mode:'move';rangeMode:string;showRanges:boolean;opponentPlans:Plans;tutorialOnly:boolean}
export type EngineAPI=typeof import('../src/engine.ts');
