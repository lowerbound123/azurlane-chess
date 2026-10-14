import type {ShipType} from '../shared/game.ts';
import {test,afterAll,afterEach} from 'vitest';
import assert from 'node:assert/strict';
import * as D from '../src/draft.ts';
import * as Catalog from '../src/ship-catalog.ts';
import {SHIPS, getShip, shipStats, catalogFleet, fleetError, sortFleet} from '../src/ship-catalog.ts';
import type { DraftState } from '../shared/draft.ts';

const guessed = (face = 0) => D.guessFirst(D.createDraft(), 0, 0, face, 0);
const act = (d: DraftState, id: string) => D.actDraft(d, D!.currentDraftTurn(d)!.team, id, d.revision);
function finish(d: DraftState, seed = 1) {
  while (d.status === 'draft') {
    const turn = D.currentDraftTurn(d);
    const choices = d.pool.filter((id) => !D.draftActionError(d, turn!.team, id));
    assert.ok(choices.length, 'every accepted operation leaves a playable draft');
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    d = act(d, choices[seed % choices.length]);
  }
  return d;
}
const small = (poolMode = 'independent') => ({poolMode, banTarget:'opponent', fleetLimits:{front:1,back:1}, steps:[{actor:'first',action:'pick',count:2},{actor:'second',action:'pick',count:2}]});

test('catalog has three distinct identities per class with independent combat stats', () => {
  assert.equal(SHIPS.length,15); assert.equal(new Set(SHIPS.map(s=>s.id)).size,15);
  for(const template of ['dd','cl','ca','bb','cv']) {
    const ships=SHIPS.filter(s=>s.template===template);assert.equal(ships.length,3);
    ships.forEach(s=>assert.equal(s.name,shipStats(s.id).name));assert.equal(new Set(ships.map(s=>JSON.stringify(shipStats(s.id)))).size,3);
  }
  assert.deepEqual(catalogFleet(['dd','dd','dd','bb','cv']),['dd-1','dd-2','dd-3','bb-1','cv-1']);
  assert.throws(()=>catalogFleet(['dd-1','dd-1']));assert.throws(()=>catalogFleet(['unknown']));
  assert.equal(fleetError(sortFleet(['cv-2','ca-3','bb-3','dd-2','cl-1'])), '');
});

test('PVP rejects a fourth front ship without changing state', () => {
  let d=guessed();d=act(d,'cv-3');d=act(d,'dd-1');d=act(d,'cv-3');
  d=act(d,'dd-1');d=act(d,'dd-2');d=act(d,'bb-3');d=act(d,'bb-2');
  d=act(d,'dd-2');d=act(d,'dd-3');d=act(d,'bb-3');d=act(d,'bb-2');
  d=act(d,'dd-3');const before=structuredClone(d);
  assert.throws(()=>act(d,'cl-1'), {code:'INVALID_FLEET'});assert.deepEqual(d,before);
});

test('PVP rejects a third back ship and bans which remove the last required back candidate', () => {
  let d=guessed();d=act(d,'cv-3');d=act(d,'bb-1');d=act(d,'cv-3');
  d=act(d,'bb-1');d=act(d,'bb-2');d=act(d,'cv-2');d=act(d,'cv-1');
  d=act(d,'bb-2');
  assert.throws(()=>act(d,'bb-3'),{code:'INVALID_FLEET'});
  let b=D.guessFirst(D.createDraft({poolMode:'independent',banTarget:'opponent',fleetLimits:{front:1,back:1},steps:[{actor:'second',action:'ban',count:1},{actor:'first',action:'pick',count:2},{actor:'second',action:'pick',count:2}]},['dd-1','dd-2','bb-1']),0,0,0,0);
  assert.equal(D!.draftActionError(b,1,'bb-1')!.code,'FLEET_UNAVAILABLE');
  assert.throws(()=>act(b,'bb-1'),{code:'FLEET_UNAVAILABLE'});
  assert.equal(D.draftActionError(b,1,'dd-1'),null);
});

test('default order is exact and both coin outcomes yield two legal five-ship fleets', () => {
  const expected=['second:ban:1','first:pick:1','first:ban:1','second:pick:2','second:ban:2','first:pick:2','first:ban:2','second:pick:2','second:ban:2','first:pick:2','first:ban:2','second:pick:1'];
  assert.deepEqual(D.DEFAULT_DRAFT_RULES.steps.map(s=>`${s.actor}:${s.action}:${s.count}`),expected);
  for(let seed=1;seed<=128;seed++) {
    let d=finish(guessed(seed%2),seed);assert.equal(d.history.length,20);assert.equal(d.firstTeam,seed%2);
    assert.deepEqual(d.bans.map((b)=>b.length),[5,5]);d.picks.forEach((ids)=>assert.equal(fleetError(ids),''));
    d.history.forEach((h)=>{const step=d.rules.steps[h.stepIndex];assert.equal(h.team,step.actor==='first'?d.firstTeam:1-d!.firstTeam!);assert.equal(h.targetTeam,h.action==='ban'?1-h.team:h.team);});
    assert.equal(D.currentDraftTurn(d),null);
    d=D.confirmDraft(d,0,d.revision);d=D.confirmDraft(d,1,d.revision);assert.deepEqual(d.ready,[true,true]);
  }
});

test('independent pools allow the same pick on both sides and ban only the target', () => {
  let d=guessed();d=act(d,'cv-3');assert.deepEqual(d.bans,[['cv-3'],[]]);
  assert.ok(!D.draftUnavailable(d,1).has('cv-3'));d=act(d,'dd-1');d=act(d,'cv-3');d=act(d,'dd-1');
  assert.deepEqual(d.picks,[['dd-1'],['dd-1']]);assert.throws(()=>act(d,'dd-1'),{code:'SHIP_UNAVAILABLE'});
});

test('guess, revision, actor, identity and confirmation gates preserve input', () => {
  const initial=D.createDraft();const copy=structuredClone(initial);
  assert.throws(()=>D.guessFirst(initial,1,0,0,0),{code:'WRONG_TURN'});
  assert.throws(()=>D.guessFirst(initial,0,2,0,0),{code:'INVALID_GUESS'});
  assert.throws(()=>D.guessFirst(initial,0,0,0,1),{code:'STALE_DRAFT'});assert.deepEqual(initial,copy);
  let d=guessed();assert.throws(()=>D.actDraft(d,0,'dd-1',d.revision),{code:'WRONG_TURN'});
  assert.throws(()=>act(d,'unknown'),{code:'SHIP_UNAVAILABLE'});
  assert.throws(()=>D.confirmDraft(d,0,d.revision),{code:'WRONG_STAGE'});
  assert.throws(()=>D.actDraft(d,1,'dd-1',0),{code:'STALE_DRAFT'});
  const old=structuredClone(d);d=act(d,'dd-1');assert.deepEqual(old.picks,[[],[]]);assert.deepEqual(old.bans,[[],[]]);
  d=finish(d);d=D.confirmDraft(d,0,d.revision);assert.throws(()=>D.confirmDraft(d,0,d.revision),{code:'WRONG_STAGE'});
  assert.throws(()=>D.confirmDraft(d,1,d.revision-1),{code:'STALE_DRAFT'});
});

test('configurable rules validate role supply, counts, limits, catalog and shared competition', () => {
  assert.throws(()=>D.createDraft({...small(),fleetLimits:{front:3,back:2}}),{code:'INVALID_RULES'});
  assert.throws(()=>D.createDraft({...small(),fleetLimits:{front:-1,back:3}}),{code:'INVALID_RULES'});
  assert.throws(()=>D.createDraft(small(),['dd-1','bad']),{code:'INVALID_RULES'});
  assert.throws(()=>D.createDraft(small('shared'),['dd-1','bb-1','bb-2','bb-3']),{code:'INVALID_RULES'});
  assert.throws(()=>D.createDraft({...small(),steps:[{actor:'first',action:'pick',count:10}]}),{code:'INVALID_RULES'});
  const rules=small('shared');let d=D.guessFirst(D.createDraft(rules,['dd-1','dd-2','bb-1','bb-2']),0,0,0,0);
  rules.steps[0].count=99;assert.equal(d.rules.steps[0].count,2);
  d=act(d,'dd-1');assert.throws(()=>act(d,'dd-2'),{code:'INVALID_FLEET'});d=act(d,'bb-1');
  assert.throws(()=>act(d,'dd-1'),{code:'SHIP_UNAVAILABLE'});d=finish(d);assert.deepEqual(d.picks.map(p=>p.length),[2,2]);
});

test('catalog restore retains valid identities and falls back atomically for old or inconsistent saves', () => {
  const roster:ShipType[]=['dd','cl','ca','bb','cv'];const ids=['dd-3','cl-2','ca-1','bb-2','cv-3'];
  const ships=ids.map((catalogId,i)=>({catalogId,template:roster[i],team:0}));
  assert.deepEqual(Catalog.restoreFleet(ships,roster),ids);
  assert.deepEqual(Catalog.restoreFleet(ships.map(({catalogId,...s})=>s),roster),catalogFleet(roster));
  assert.deepEqual(Catalog.restoreFleet(ships.map((s,i)=>i===0?{...s,catalogId:'bb-1'}:s),roster),catalogFleet(roster));
});

test('new catalog identities round-trip in existing save schema', async () => {
  const E=await import('../src/engine.ts'),S=await import('../src/save.ts');
  const ids=['dd-3','cl-2','ca-1','bb-2','cv-3'];const game=E.createGame();Catalog.nameFleet(game.ships,ids,0);
  const save=S.createSave({game,plans:{},selected:'0-0',roster:[...E.DEFAULT_ROSTER],seed:game.seed});
  const loaded=S.validateSave(JSON.parse(JSON.stringify(save)));
  assert.equal(loaded.schemaVersion,1);assert.deepEqual(Catalog.restoreFleet(loaded.state.game.ships,loaded.state.roster),ids);
});

test('shared bans preserve both sides competing for the last role candidates', () => {
  const rules={...small('shared'),steps:[{actor:'second',action:'ban',count:1},...small().steps]};
  const d=D.guessFirst(D.createDraft(rules,['dd-1','dd-2','dd-3','bb-1','bb-2']),0,0,0,0);
  assert.equal(D!.draftActionError(d,1,'bb-1')!.code,'FLEET_UNAVAILABLE');assert.equal(D.draftActionError(d,1,'dd-1'),null);
  assert.equal(finish(act(d,'dd-1')).status,'complete');
});

test('malformed step objects return INVALID_RULES rather than an uncaught type error', () => {
  for(const step of [null,undefined,1,'pick'])assert.throws(()=>D.createDraft({...small(),steps:[step]}),{code:'INVALID_RULES'});
});

test('self-targeted bans consume only the acting side and preserve role completion', () => {
  const rules={...small(),banTarget:'self',steps:[{actor:'first',action:'ban',count:1},...small().steps]};
  const d=act(D.guessFirst(D.createDraft(rules,['dd-1','dd-2','bb-1']),0,0,0,0),'dd-1');
  assert.deepEqual(d.bans,[['dd-1'],[]]);assert.equal(finish(d).status,'complete');
});
