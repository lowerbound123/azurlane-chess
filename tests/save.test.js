import test from 'node:test';
import assert from 'node:assert/strict';
import * as E from '../src/engine.js';
import * as S from '../src/save.js';

const NOW='2026-10-03T19:20:00.000Z';
const state=(game=E.createGame())=>({game,plans:{},selected:'0-0',roster:[...E.DEFAULT_ROSTER],seed:game.seed});
const save=(input=state())=>S.createSave(input,{timestamp:NOW,label:'第一舰队'});
const clone=value=>structuredClone(value);
const throwsCode=(callback,code)=>assert.throws(callback,error=>error instanceof S.SaveError&&error.code===code);
function memoryStorage(){const map=new Map();return{getItem:key=>map.get(key)??null,setItem:(key,value)=>map.set(key,String(value)),removeItem:key=>map.delete(key),map};}

// Removing deep validation, fog persistence, or Infinity handling must fail these tests.
test('fresh deployment snapshot roundtrips without changing source or storing transient playback',()=>{
 const input=state();input.busy=true;input.playFrame={effects:['not stable']};input.progress=.3;input.finished={frames:[1]};input.metadata={sessionName:'Test'};
 const expected=clone(input);for(const key of ['busy','playFrame','progress','finished'])delete expected[key];
 const original=clone(input),envelope=save(input),json=S.serializeSave(envelope),loaded=S.deserializeSave(json);
 assert.deepEqual(loaded.state,expected);assert.deepEqual(input,original);assert.equal(loaded.schemaVersion,1);assert.equal(loaded.magic,'azurlane-chess');assert.equal(loaded.label,'第一舰队');assert.equal(loaded.timestamp,NOW);
 assert.notEqual(loaded.state.game,input.game);assert.ok(!json.includes('not stable'));
});
test('roundtrips airborne aircraft, Infinity readiness, explored fog, orders and route metadata',()=>{
 const game=E.createGame();game.phase='plan';const carrier=game.ships.find(s=>s.team===0&&s.cfg.carrier);const launched=E.resolveRound(game,{[carrier.id]:{...E.emptyPlan(),planes:[{mode:'point',target:E.fromCR(15,1)}]}}).game;
 assert.ok(launched.planes.length);assert.ok(launched.ships.find(s=>s.id===carrier.id).airReady.includes(Infinity));
 const input=state(launched);input.selected=carrier.id;input.plans['0-0']={...E.emptyPlan(),moves:[{turn:1,forward:false},{turn:0,forward:true}],segments:[{start:0,end:2,target:E.fromCR(1,11),label:'waypoint'}],routeMetadata:{waypoints:[E.fromCR(1,11)],editing:0}};
 input.game.metadata={balance:'prototype',nested:[{value:null}]};input.game.explored[0]=[...new Set([...input.game.explored[0],'0,0'])];
 const loaded=S.deserializeSave(S.serializeSave(save(input)));assert.deepEqual(loaded.state,input);assert.equal(loaded.state.game.ships.find(s=>s.id===carrier.id).airReady[0],Infinity);
 const next=E.resolveRound(loaded.state.game,loaded.state.plans).game,original=E.resolveRound(input.game,input.plans).game;assert.deepEqual(next,original);
});
test('every stable state of a full game, including ended, can be saved and continued',()=>{
 let game=E.createGame(E.DEFAULT_ROSTER,42),rounds=0;
 while(game.phase!=='ended'){
  const before=save(state(game));game=S.deserializeSave(S.serializeSave(before)).state.game;
  const result=E.resolveRound(game,{...E.planAI(game,0),...E.planAI(game,1)});game=result.game;assert.ok(++rounds<=30);
 }
 assert.equal(S.deserializeSave(S.serializeSave(save(state(game)))).state.game.phase,'ended');
});
test('validate and migrate return independent current-schema envelopes',()=>{
 const original=save();assert.deepEqual(S.validateSave(original),original);const migrated=S.migrateSave(original);assert.deepEqual(migrated,original);assert.notEqual(migrated,original);
 migrated.state.game.round=2;assert.equal(original.state.game.round,1);
});
test('corrupt, wrong-app, wrong-version and oversized imports fail safely',()=>{
 throwsCode(()=>S.deserializeSave('{oops'),'INVALID_JSON');throwsCode(()=>S.deserializeSave('null'),'INVALID_SAVE');
 let bad=clone(save());bad.magic='other';throwsCode(()=>S.deserializeSave(JSON.stringify(bad)),'INVALID_SAVE');
 bad=clone(save());bad.schemaVersion=2;throwsCode(()=>S.deserializeSave(JSON.stringify(bad)),'UNSUPPORTED_VERSION');
 throwsCode(()=>S.deserializeSave(' '.repeat(2_000_001)),'SAVE_TOO_LARGE');
});
test('rejects malformed concrete engine, missing fog and unstable execution state',()=>{
 const edits=[s=>s.game.phase='execute',s=>delete s.game.explored,s=>s.game.map.width=20,s=>s.game.ships[0].hp='100',s=>s.game.ships[0].heading=6,s=>s.game.ships[0].cfg.speed=100000,s=>s.game.ships[0].pos.q=300,s=>s.game.ships[0].xy.x=NaN,s=>s.game.ships[0].airReady=[null],s=>s.game.ships[4].airReady[0]=-1,s=>s.game.ships[4].airReady[0]=1.5,s=>s.game.ships[4].airReady[0]=Number.MAX_SAFE_INTEGER,s=>s.game.ships[0].mainReady=Infinity,s=>s.game.nextId=-1,s=>s.game.winner=2,s=>s.roster=['cv'],s=>s.selected='1-0',s=>s.game.ships[1].id=s.game.ships[0].id];
 for(const edit of edits){const input=state();edit(input);throwsCode(()=>save(input),'INVALID_STATE');}
});
test('rejects unsafe keys, prototype pollution, accessors, class instances, cycles and enormous arrays',()=>{
 const original=save(),polluted=JSON.stringify(original).replace('"label":"第一舰队"','"label":"第一舰队","__proto__":{"polluted":true}');throwsCode(()=>S.deserializeSave(polluted),'INVALID_SAVE');assert.equal({}.polluted,undefined);
 for(const key of ['constructor','prototype','__proto__']){const input=state();input.metadata=Object.fromEntries([[key,{polluted:true}]]);throwsCode(()=>save(input),'INVALID_STATE');}
 for(const extra of [new Date(),new Map(),()=>42,Symbol('x')]){const input=state();input.metadata={extra};throwsCode(()=>save(input),'INVALID_STATE');}
 const accessor=state();let invoked=false;Object.defineProperty(accessor,'metadata',{enumerable:true,get(){invoked=true;return{};}});throwsCode(()=>save(accessor),'INVALID_STATE');assert.equal(invoked,false);
 const cyclic=state();cyclic.metadata=cyclic;throwsCode(()=>save(cyclic),'INVALID_STATE');const huge=state();huge.metadata={items:new Array(10001).fill(0)};throwsCode(()=>save(huge),'INVALID_STATE');
 const deep=state();let cursor=deep;for(let i=0;i<40;i++)cursor=cursor.metadata={};throwsCode(()=>save(deep),'INVALID_STATE');
});
test('only airReady accepts the sentinel and prototype pollution within plans is rejected',()=>{
 const good=save();const json=S.serializeSave(good);const malformed=JSON.parse(json);malformed.state.game.ships[4].airReady[0]={Infinity:true};throwsCode(()=>S.deserializeSave(JSON.stringify(malformed)),'INVALID_SAVE');
 const input=state();input.plans['__proto__']=E.emptyPlan();Object.setPrototypeOf(input.plans,{malicious:true});throwsCode(()=>save(input),'INVALID_STATE');
});
test('manual slots and autosave remain separate and a failed import never replaces saved progress',()=>{
 const storage=memoryStorage(),adapter=S.createSaveStorage({storage,now:()=>NOW});
 assert.equal(adapter.write('slot-1',state(),{label:'手动 1'}).ok,true);const next=state();next.game.round=2;next.game.phase='plan';assert.equal(adapter.write('auto',next,{label:'自动'}).ok,true);
 assert.equal(adapter.read('slot-1').save.state.game.round,1);assert.equal(adapter.read('auto').save.state.game.round,2);
 const records=adapter.list();assert.deepEqual(records.map(r=>r.id),S.SAVE_SLOTS);assert.equal(records.filter(r=>r.save).length,2);
 const old=adapter.read('slot-1').save;assert.equal(adapter.import('slot-1','bad json').ok,false);assert.deepEqual(adapter.read('slot-1').save,old);
 assert.equal(adapter.import('slot-2',S.serializeSave(old)).ok,true);assert.deepEqual(adapter.read('slot-2').save,old);
 assert.equal(adapter.remove('auto').ok,true);assert.equal(adapter.read('auto').error.code,'SAVE_NOT_FOUND');assert.equal(adapter.read('slot-1').ok,true);
});
test('storage corruption is isolated per slot and list surfaces it without deleting data',()=>{
 const storage=memoryStorage(),adapter=S.createSaveStorage({storage,now:()=>NOW});adapter.write('slot-2',state());storage.setItem('azurlane-chess:v1:slot-1','corrupted');
 const records=adapter.list();assert.equal(records.find(r=>r.id==='slot-1').error.code,'INVALID_JSON');assert.ok(records.find(r=>r.id==='slot-2').save);assert.equal(storage.getItem('azurlane-chess:v1:slot-1'),'corrupted');
});
test('storage security/private-mode and quota errors are surfaced as safe results',()=>{
 const inaccessible={getItem(){throw new DOMException('Blocked','SecurityError');},setItem(){throw new DOMException('Blocked','SecurityError');},removeItem(){throw new DOMException('Blocked','SecurityError');}},blocked=S.createSaveStorage({storage:inaccessible});
 for(const result of [blocked.read('auto'),blocked.write('auto',state()),blocked.remove('auto'),blocked.import('auto',S.serializeSave(save()))])assert.equal(result.error.code,'STORAGE_UNAVAILABLE');
 assert.equal(blocked.list().length,4);assert.ok(blocked.list().every(record=>record.error.code==='STORAGE_UNAVAILABLE'));
 const storage=memoryStorage(),adapter=S.createSaveStorage({storage,now:()=>NOW});adapter.write('slot-1',state());const original=adapter.read('slot-1').save;storage.setItem=()=>{throw new DOMException('Full','QuotaExceededError');};
 assert.equal(adapter.write('slot-1',state()).error.code,'STORAGE_QUOTA');assert.deepEqual(adapter.read('slot-1').save,original);
 const missing=S.createSaveStorage({storage:null});assert.equal(missing.write('auto',state()).error.code,'STORAGE_UNAVAILABLE');
});
test('invalid slot names never access storage and export filenames are readable and safe',()=>{
 const storage=memoryStorage(),adapter=S.createSaveStorage({storage});assert.equal(adapter.write('../../other',state()).error.code,'INVALID_SLOT');assert.equal(adapter.read('slot-4').error.code,'INVALID_SLOT');assert.equal(storage.map.size,0);
 const filename=S.exportFilename(save());assert.match(filename,/^azurlane-chess-/);assert.ok(filename.endsWith('.json'));assert.ok(filename.includes('2026-10-03'));assert.ok(!/[\\/:*?"<>|]/.test(filename));
});
test('JSON numeric overflow cannot smuggle Infinity into an aircraft readiness slot',()=>{
 const json=S.serializeSave(save());const bad=json.replace(/("airReady": \[\s*)1,/,'$11e309,');
 assert.notEqual(bad,json);throwsCode(()=>S.deserializeSave(bad),'INVALID_SAVE');
});
test('in-memory metadata has a cumulative size bound before JSON stringification',()=>{
 const input=state();input.metadata={pieces:new Array(200).fill('x'.repeat(20000))};throwsCode(()=>save(input),'INVALID_STATE');
});
