import type {Hex,Torpedo,Plane} from '../../shared/game.ts';
import {RULES,hexToXY} from '../../src/engine.ts';
export function torpedoFixture(id:string,team:number,pos:Hex):Torpedo {return {id,kind:'torpedo',team,owner:`${team}-0`,xy:hexToXY(pos),heading:0,age:0,launched:0,birth:0,armed:true,cfg:{...RULES.torpedo,reserve:8,max:2}};}
export function planeFixture(id:string,team:number,pos:Hex,extra:Partial<Plane>={}):Plane{return {id,kind:'plane',team,mother:`${team}-0`,slot:0,hp:2,cfg:{...RULES.plane},xy:hexToXY(pos),mode:'point',target:pos,targetId:null,tracking:false,state:'outbound',traveled:0,waypoints:[],...extra};}
