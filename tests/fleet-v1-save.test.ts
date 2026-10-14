import {it,expect} from 'vitest';
import type {Game} from '../shared/game.ts';
import * as E from '../src/engine.ts';
import {createSave,serializeSave,deserializeSave} from '../src/save.ts';
const state=(game:Game)=>({game,plans:{},selected:'0-0',roster:game.ships.filter(s=>s.team===0).map(s=>s.template),seed:game.seed});
it('legacy save remains format1 and does not grant guard on load',()=>{
 const g=E.createGame();delete g.ships[2].cfg.guard;g.ships[2].cfg.secondary!.multi=true;
 const save=createSave(state(g));expect(save.schemaVersion).toBe(1);
 expect(deserializeSave(serializeSave(save)).state.game).toEqual(g);
});
it('fleet save format2 preserves mixed aircraft and zones',()=>{
 const g=E.createFleetGame(['dd-1','cl-3','ca-2','cv-2','cv-3']);
 g.zones=[{kind:'smoke',team:0,center:g.ships[0].pos,radius:1,expires:3}];
 g.ships[4].airHP[2]=2;
 const save=createSave(state(g));expect(save.schemaVersion).toBe(2);
 expect(deserializeSave(serializeSave(save)).state.game).toEqual(g);
});
it('rejects corrupt fleet resources',()=>{
 const g=E.createFleetGame(['dd-1','cl-3','ca-2','cv-2','cv-3']);g.ships[0].minesLeft=99;
 expect(()=>createSave(state(g))).toThrow();
});
it('saves a valid speculative minelaying route without probing hidden islands',()=>{
 const g=E.createFleetGame(['dd-1','cl-3','ca-2','cv-2','cv-3']);g.phase='plan';const s=g.ships[0];s.pos={q:0,r:7};s.xy=E.hexToXY(s.pos);s.heading=0;
 g.map.islands=['2,7'];g.map.mines=[];g.explored[0]=['0,7','1,7'];
 const saved={...state(g),plans:{[s.id]:{...E.emptyPlan(),moves:[{turn:0,forward:true},{turn:0,forward:true}],mineSteps:[2]}}};
 expect(()=>createSave(saved)).not.toThrow();
});
