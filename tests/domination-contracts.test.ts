import {test,expect} from 'vitest';
import {contracts,parseContract} from '../shared/contracts.ts';
import {createFleetGame,resolveRound} from '../src/engine.ts';
import {playerView,playerResult} from '../server/views.ts';
test('generated wire contracts accept real objective views and reject malformed objective state',()=>{
 const game=createFleetGame(undefined,42,undefined,'domination');game.phase='plan';
 const state={player:{id:'qa',nickname:'QA'},room:null,queue:null,match:{id:'match',kind:'ai',battleMode:'domination',myTeam:0,round:1,stage:'plan',game:playerView(game,0),disconnects:[],submitted:[false,false]}};
 expect(()=>parseContract(contracts.OnlineState,state)).not.toThrow();
 const bad=structuredClone(state);bad.match.game.domination!.scores[0]='100' as unknown as number;
 expect(()=>parseContract(contracts.OnlineState,bad)).toThrow();
 const round={type:'round',matchId:'match',round:1,result:playerResult(game,resolveRound(game),0)};
 expect(()=>parseContract(contracts.RoundMessage,round)).not.toThrow();
 expect(()=>parseContract(contracts.PublicConfig,{models:[],battleModes:['annihilation','domination']})).not.toThrow();
 expect(()=>parseContract(contracts.PublicConfig,{models:[],battleModes:['unknown']})).toThrow();
 expect(()=>parseContract(contracts.PublicConfig,{models:[]})).not.toThrow();
});
