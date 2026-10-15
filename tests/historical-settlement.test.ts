import {test,expect} from 'vitest';
import {createHistoricalBattle,getHistoricalDefinition} from '../src/history/index.ts';
import {historicalSettlementShips} from '../src/history/settlement.ts';
test('historical result restores extracted participants with their last HP without changing the game',()=>{
 const battle=createHistoricalBattle('denmark-strait'),initial=battle.game.ships,departed=initial[0];battle.state.extracted[departed.id]={id:departed.id,label:departed.label,team:departed.team,hp:123,round:2};battle.game.ships=initial.filter(s=>s.id!==departed.id);
 const ships=historicalSettlementShips(battle.game.ships,battle.state,getHistoricalDefinition('denmark-strait'));
 expect(ships).toHaveLength(initial.length);expect(ships.find(s=>s.id===departed.id)?.hp).toBe(123);expect(battle.game.ships).toHaveLength(initial.length-1);
});
