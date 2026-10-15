import type {Game,Ship,Plan} from '../../shared/game.ts';
import {createCatalogShip,emptyPlan,updateExploration,fromCR} from '../engine.ts';
export const demoShip=(id:string,team:number,index:number,q:number,r:number)=>createCatalogShip(id,team,index,{q,r});
export const demoPlan=(p:Partial<Plan>):Plan=>({...emptyPlan(),...p});
export function demoGame(ships:Ship[]):Game {const g:Game={seed:20261015,round:1,ruleset:'fleet-v1',zones:[],map:{width:13,height:11,islands:[],mines:[]},ships,planes:[],torpedoes:[],nextId:0,log:[],winner:null,phase:'plan',explored:[[],[]]};updateExploration(g);return g;}
export const demoBase={fps:30,width:768,height:960,focus:fromCR(6,5),radius:5};
