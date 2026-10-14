import {test,expect} from 'vitest';
import * as E from '../src/engine.ts';
import * as S from '../src/save.ts';
const state=()=>{const game=E.createFleetGame(undefined,42,undefined,'domination');return {game,plans:{},selected:'0-0',roster:[...E.DEFAULT_ROSTER],seed:game.seed};};
test('expanded objective save roundtrips deployment, progress and edge coordinates',()=>{
 const input=state();expect(S.deserializeSave(S.serializeSave(S.createSave(input))).state).toEqual(input);
 input.game.phase='plan';input.game.map.islands=[];input.game.map.mines=[];
 const ship=input.game.ships[0];ship.pos=E.fromCR(4,5);ship.xy=E.hexToXY(ship.pos);
 input.game=E.resolveRound(input.game).game;
 input.game.ships[1].pos=E.fromCR(20,16);input.game.ships[1].xy=E.hexToXY(input.game.ships[1].pos);
 input.game.explored[0].push(E.key(E.fromCR(20,16)));
 input.game.explored[0]=[...new Set(input.game.explored[0])];
 const loaded=S.deserializeSave(S.serializeSave(S.createSave(input))).state;
 expect(loaded.game.domination?.points[0].progress).toBe(50);
 expect(E.resolveRound(loaded.game).game).toEqual(E.resolveRound(input.game).game);
});
test('malformed objective data and unsupported map/mode combinations are rejected',()=>{
 for(const mutate of [
  (s:ReturnType<typeof state>)=>{s.game.domination!.scores[0]=-5;},
  (s:ReturnType<typeof state>)=>{s.game.domination!.points[0].progress=25 as 50;},
  (s:ReturnType<typeof state>)=>{s.game.domination!.points[0].center.q++;},
  (s:ReturnType<typeof state>)=>{s.game.domination!.lastRound=1;},
  (s:ReturnType<typeof state>)=>{delete s.game.domination;},
  (s:ReturnType<typeof state>)=>{delete s.game.battleMode;},
  (s:ReturnType<typeof state>)=>{s.game.map.width=19;},
 ]){const input=state();mutate(input);expect(()=>S.createSave(input)).toThrow();}
 expect(()=>S.createSave({...state(),game:E.createFleetGame(undefined,42)})).not.toThrow();
});
