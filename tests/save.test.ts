import type {Game,Plan,ShipType} from '../shared/game.ts';

import {test,afterAll,afterEach} from 'vitest';
import assert from 'node:assert/strict';
import * as E from '../src/engine.ts';
import * as S from '../src/save.ts';
import type { SaveEnvelope,SaveResult }  from '../shared/save.ts';

const NOW='2026-10-03T19:20:00.000Z';
interface FixtureState {game:Game&{metadata?:Record<string,unknown>};plans:Record<string,Plan&{routeMetadata?:unknown;segments?:{start:number;end:number;target:{q:number;r:number};label?:string}[]}>;selected:string;roster:ShipType[];seed:number;metadata?:Record<string,unknown>;[key:string]:unknown}
const state=(game=E.createGame()):FixtureState=>({game,plans:{},selected:'0-0',roster:[...E.DEFAULT_ROSTER],seed:game.seed});
const save=(input=state())=>S.createSave(input,{timestamp:NOW,label:'第一舰队'});
const clone=<T>(value:T):T=>structuredClone(value);
const throwsCode=(callback:()=>unknown,code:string)=>assert.throws(callback,error=>error instanceof S.SaveError&&error.code===code);
const saved=(result:SaveResult<{save:SaveEnvelope}>)=>{assert.ok(result.ok);return result.save;};
const failure=(result:SaveResult<unknown>)=>{assert.ok(!result.ok);return result.error;};
function memoryStorage(){const map=new Map<string,string>();return{getItem:(key:string)=>map.get(key)??null,setItem:(key:string,value:string)=>map.set(key,String(value)),removeItem:(key:string)=>map.delete(key),map};}

// Removing deep validation, fog persistence, or Infinity handling must fail these tests.
test('fresh deployment snapshot roundtrips without changing source or storing transient playback',()=>{
 const input=state();input.busy=true;input.playFrame={effects:['not stable']};input.progress=.3;input.finished={frames:[1]};input.metadata={sessionName:'Test'};
 const expected=clone(input);for(const key of ['busy','playFrame','progress','finished'])delete expected[key];
 const original=clone(input),envelope=save(input),json=S.serializeSave(envelope),loaded=S.deserializeSave(json);
 assert.deepEqual(loaded.state,expected);assert.deepEqual(input,original);assert.equal(loaded.schemaVersion,1);assert.equal(loaded.magic,'azurlane-chess');assert.equal(loaded.label,'第一舰队');assert.equal(loaded.timestamp,NOW);
 assert.notEqual(loaded.state.game,input.game);assert.ok(!json.includes('not stable'));
});
test('roundtrips airborne aircraft, Infinity readiness, explored fog, orders and route metadata',()=>{
 const game=E.createGame();game.phase='plan';const carrier=game.ships.find(s=>s.team===0&&s.cfg.carrier);const launched=E.resolveRound(game,{[carrier!.id]:{...E.emptyPlan(),planes:[{mode:'point',target:E.fromCR(15,1)}]}}).game;
 assert.ok(launched.planes.length);assert.ok(launched!.ships.find(s=>s.id===carrier!.id)!.airReady.includes(Infinity));
 const input=state(launched);input.selected=carrier!.id;input.plans['0-0']={...E.emptyPlan(),moves:[{turn:1,forward:false},{turn:0,forward:true}],segments:[{start:0,end:2,target:E.fromCR(1,11),label:'waypoint'}],routeMetadata:{waypoints:[E.fromCR(1,11)],editing:0}};
 input.game.metadata={balance:'prototype',nested:[{value:null}]};input.game.explored[0]=[...new Set([...input.game.explored[0],'0,0'])];
 const normalizeZero=(value:unknown):unknown=>typeof value==='number'&&Object.is(value,-0)?0:Array.isArray(value)?value.map(normalizeZero):value&&typeof value==='object'?Object.fromEntries(Object.entries(value).map(([k,v])=>[k,normalizeZero(v)])):value;
 const loaded=S.deserializeSave(S.serializeSave(save(input)));assert.deepEqual(loaded.state,normalizeZero(input));assert.equal(loaded!.state.game.ships.find(s=>s.id===carrier!.id)!.airReady[0],Infinity);
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
 bad=clone(save());bad.schemaVersion=99;throwsCode(()=>S.deserializeSave(JSON.stringify(bad)),'UNSUPPORTED_VERSION');
 throwsCode(()=>S.deserializeSave(' '.repeat(2_000_001)),'SAVE_TOO_LARGE');
});
test('rejects malformed concrete engine, missing fog and unstable execution state',()=>{
 const edits:((s:FixtureState)=>void)[]=[(s)=>Reflect.set(s.game,'phase','execute'),(s)=>Reflect.deleteProperty(s.game,'explored'),(s)=>Reflect.set(s.game.map,'width',20),(s)=>Reflect.set(s.game.ships[0],'hp','100'),(s)=>Reflect.set(s.game.ships[0],'heading',6),(s)=>Reflect.set(s.game.ships[0].cfg,'speed',100000),(s)=>Reflect.set(s.game.ships[0].pos,'q',300),(s)=>Reflect.set(s.game.ships[0].xy,'x',NaN),(s)=>Reflect.set(s.game.ships[0],'airReady',[null]),(s)=>s.game.ships[4].airReady[0]=-1,(s)=>s.game.ships[4].airReady[0]=1.5,(s)=>s.game.ships[4].airReady[0]=Number.MAX_SAFE_INTEGER,(s)=>Reflect.set(s.game.ships[0],'mainReady',Infinity),(s)=>Reflect.set(s.game,'nextId',-1),(s)=>Reflect.set(s.game,'winner',2),(s)=>Reflect.set(s,'roster',['cv']),(s)=>Reflect.set(s,'selected','1-0'),(s)=>Reflect.set(s.game.ships[1],'id',s.game.ships[0].id)];
 for(const edit of edits){const input=state();edit(input);throwsCode(()=>save(input),'INVALID_STATE');}
});
test('rejects unsafe keys, prototype pollution, accessors, class instances, cycles and enormous arrays',()=>{
 const original=save(),polluted=JSON.stringify(original).replace('"label":"第一舰队"','"label":"第一舰队","__proto__":{"polluted":true}');throwsCode(()=>S.deserializeSave(polluted),'INVALID_SAVE');assert.equal(Reflect.get({},'polluted'),undefined);
 for(const key of ['constructor','prototype','__proto__']){const input=state();input.metadata=Object.fromEntries([[key,{polluted:true}]]);throwsCode(()=>save(input),'INVALID_STATE');}
 for(const extra of [new Date(),new Map(),()=>42,Symbol('x')]){const input=state();input.metadata={extra};throwsCode(()=>save(input),'INVALID_STATE');}
 const accessor=state();let invoked=false;Object.defineProperty(accessor,'metadata',{enumerable:true,get(){invoked=true;return{};}});throwsCode(()=>save(accessor),'INVALID_STATE');assert.equal(invoked,false);
 const cyclic=state();cyclic.metadata=cyclic;throwsCode(()=>save(cyclic),'INVALID_STATE');const huge=state();huge.metadata={items:new Array(10001).fill(0)};throwsCode(()=>save(huge),'INVALID_STATE');
 const deep=state();let cursor:Record<string,unknown>=deep;for(let i=0;i<40;i++)cursor=cursor.metadata={};throwsCode(()=>save(deep),'INVALID_STATE');
});
test('only airReady accepts the sentinel and prototype pollution within plans is rejected',()=>{
 const good=save();const json=S.serializeSave(good);const malformed=JSON.parse(json);malformed.state.game.ships[4].airReady[0]={Infinity:true};throwsCode(()=>S.deserializeSave(JSON.stringify(malformed)),'INVALID_SAVE');
 const input=state();input.plans['__proto__']=E.emptyPlan();Object.setPrototypeOf(input.plans,{malicious:true});throwsCode(()=>save(input),'INVALID_STATE');
});
test('manual slots and autosave remain separate and a failed import never replaces saved progress',()=>{
 const storage=memoryStorage(),adapter=S.createSaveStorage({storage,now:()=>NOW});
 assert.equal(adapter.write('slot-1',state(),{label:'手动 1'}).ok,true);const next=state();next.game.round=2;next.game.phase='plan';assert.equal(adapter.write('auto',next,{label:'自动'}).ok,true);
 assert.equal(saved(adapter.read('slot-1')).state.game.round,1);assert.equal(saved(adapter.read('auto')).state.game.round,2);
 const records=adapter.list();assert.deepEqual(records.map(r=>r.id),S.SAVE_SLOTS);assert.equal(records.filter(r=>r.save).length,2);
 const old=saved(adapter.read('slot-1'));assert.equal(adapter.import('slot-1','bad json').ok,false);assert.deepEqual(saved(adapter.read('slot-1')),old);
 assert.equal(adapter.import('slot-2',S.serializeSave(old)).ok,true);assert.deepEqual(saved(adapter.read('slot-2')),old);
 assert.equal(adapter.remove('auto').ok,true);assert.equal(failure(adapter.read('auto')).code,'SAVE_NOT_FOUND');assert.equal(adapter.read('slot-1').ok,true);
});
test('storage corruption is isolated per slot and list surfaces it without deleting data',()=>{
 const storage=memoryStorage(),adapter=S.createSaveStorage({storage,now:()=>NOW});adapter.write('slot-2',state());storage.setItem('azurlane-chess:v1:slot-1','corrupted');
 const records=adapter.list();assert.equal(records!.find(r=>r.id==='slot-1')!.error!.code,'INVALID_JSON');assert.ok(records!.find(r=>r.id==='slot-2')!.save);assert.equal(storage.getItem('azurlane-chess:v1:slot-1'),'corrupted');
});
test('storage security/private-mode and quota errors are surfaced as safe results',()=>{
 const inaccessible={getItem(){throw new DOMException('Blocked','SecurityError');},setItem(){throw new DOMException('Blocked','SecurityError');},removeItem(){throw new DOMException('Blocked','SecurityError');}},blocked=S.createSaveStorage({storage:inaccessible});
 for(const result of [blocked.read('auto'),blocked.write('auto',state()),blocked.remove('auto'),blocked.import('auto',S.serializeSave(save()))])assert.equal(failure(result).code,'STORAGE_UNAVAILABLE');
 assert.equal(blocked.list().length,4);assert.ok(blocked.list().every(record=>record!.error!.code==='STORAGE_UNAVAILABLE'));
 const storage=memoryStorage(),adapter=S.createSaveStorage({storage,now:()=>NOW});adapter.write('slot-1',state());const original=saved(adapter.read('slot-1'));storage.setItem=()=>{throw new DOMException('Full','QuotaExceededError');};
 assert.equal(failure(adapter.write('slot-1',state())).code,'STORAGE_QUOTA');assert.deepEqual(saved(adapter.read('slot-1')),original);
 const missing=S.createSaveStorage({storage:null});assert.equal(failure(missing.write('auto',state())).code,'STORAGE_UNAVAILABLE');
});
test('invalid slot names never access storage and export filenames are readable and safe',()=>{
 const storage=memoryStorage(),adapter=S.createSaveStorage({storage});assert.equal(failure(adapter.write('../../other',state())).code,'INVALID_SLOT');assert.equal(failure(adapter.read('slot-4')).code,'INVALID_SLOT');assert.equal(storage.map.size,0);
 const filename=S.exportFilename(save());assert.match(filename,/^azurlane-chess-/);assert.ok(filename.endsWith('.json'));assert.ok(filename.includes('2026-10-03'));assert.ok(!/[\\/:*?"<>|]/.test(filename));
});
test('JSON numeric overflow cannot smuggle Infinity into an aircraft readiness slot',()=>{
 const json=S.serializeSave(save());const bad=json.replace(/("airReady": \[\s*)1,/,'$11e309,');
 assert.notEqual(bad,json);throwsCode(()=>S.deserializeSave(bad),'INVALID_SAVE');
});
test('in-memory metadata has a cumulative size bound before JSON stringification',()=>{
 const input=state();input.metadata={pieces:new Array(200).fill('x'.repeat(20000))};throwsCode(()=>save(input),'INVALID_STATE');
});
test('carrier healing config and stored aircraft HP roundtrip and reject invalid values',()=>{
 const input=state(),cv=input.game.ships.find(s=>s.cfg.carrier);
 cv!.airHP[0]=1;cv!.cfg.carrier!.heal=0;
 assert.deepEqual(S.deserializeSave(S.serializeSave(save(input))).state,input);
 const invalidHP=clone(input);invalidHP.game.ships.find((s)=>s.cfg.carrier)!.airHP[0]=3;
 assert.throws(()=>save(invalidHP));
 const invalidHeal=clone(input);invalidHeal.game.ships.find((s)=>s.cfg.carrier)!.cfg.carrier!.heal=-1;
 assert.throws(()=>save(invalidHeal));
 Reflect.deleteProperty(cv!,'airHP');delete cv!.cfg.carrier!.heal;
 assert.doesNotThrow(()=>S.deserializeSave(S.serializeSave(save(input))));
});
