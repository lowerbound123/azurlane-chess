import {it,expect} from 'vitest';
import {createHistoricalBattle,historicalFriendlyPlans,resolveHistoricalRound} from '../src/history/index.ts';
import {historicalEnemyPlans,navigateHistorical} from '../src/history/ai.ts';
import {fromCR,hexToXY,route,legal,emptyPlan} from '../src/engine.ts';
it('changing an unseen real player position does not change enemy plans',()=>{const s=createHistoricalBattle('midway');const a=historicalEnemyPlans(s.game,s.state);s.game.ships[0].pos=fromCR(25,19);s.game.ships[0].xy=hexToXY(s.game.ships[0].pos);expect(historicalEnemyPlans(s.game,s.state)).toEqual(a);});
it('friendly previews are deterministic and player submissions cannot commandeer an NPC',()=>{const s=createHistoricalBattle('samar');const a=historicalFriendlyPlans(s.game,s.state);const b=structuredClone(s);b.plans['0-3']=emptyPlan();expect(historicalFriendlyPlans(b.game,b.state)).toEqual(a);const out=resolveHistoricalRound(s.game,s.state,b.plans);const nodes=route(s.game.ships[3],a['0-3'],s.game.map);expect(out.game.ships.find(x=>x.id==='0-3')!.pos).toEqual(nodes.at(-1)!.pos);});
it('Narvik heading-aware navigation actually reaches both inner branches without islands',()=>{const s=createHistoricalBattle('narvik');for(const goal of [fromCR(4,3),fromCR(13,3)]){const ship=structuredClone(s.game.ships[0]);for(let r=0;r<25;r++){const moves=navigateHistorical(s.game.map,ship,goal);const nodes=route(ship,{moves},s.game.map);expect(nodes.every(n=>legal(s.game.map,n.pos))).toBe(true);Object.assign(ship,nodes.at(-1)!);}expect(ship.pos).toEqual(goal);}});
it('allows waiting on the first round but forbids consecutive convoy waiting',()=>{const s=createHistoricalBattle('samar');s.state.convoyWait=true;const first=historicalFriendlyPlans(s.game,s.state);expect(Object.values(first).every(p=>p.moves.length===0)).toBe(true);const out=resolveHistoricalRound(s.game,s.state,{});const h=out.historical;expect(h.convoyWaitLastRound).toBe(1);h.convoyWait=true;const second=historicalFriendlyPlans(out.game,h);expect(Object.values(second).some(p=>p.moves.length>0)).toBe(true);});
it('the eastern convoy choice really takes a longer heading-aware detour',()=>{
 const rounds=[];
 for(const choice of ['central','east'] as const){
  let s=createHistoricalBattle('samar');s.game.ships.filter(s=>s.team===1).forEach(s=>s.hp=0);s.state.convoyRoute=choice;
  for(let i=0;i<16&&s.state.status==='playing';i++){const out=resolveHistoricalRound(s.game,s.state,{});s={...s,game:out.game,state:out.historical};}
  expect(s.state.status).toBe('won');expect(Object.keys(s.state.extracted)).toHaveLength(3);rounds.push(s.state.result!.round);
 }
 expect(rounds[1]).toBeGreaterThan(rounds[0]);
});
