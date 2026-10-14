import {test,afterAll,afterEach} from 'vitest';
import assert from 'node:assert/strict';
import { createServerPreferences } from '../src/server-preferences.ts';

test('connection intent and cached models are scoped to the server origin',()=>{
  const values=new Map<string,string>(),storage={getItem:(key:string)=>values.get(key)||null,setItem:(key:string,value:string)=>values.set(key,value),removeItem:(key:string)=>values.delete(key)};
  const first=createServerPreferences(storage,'https://first.example');
  const second=createServerPreferences(storage,'https://second.example');
  first.saveConnection(true,'舰长');first.saveModels([{id:'a',name:'模型',apiKey:'private',endpoint:'private'}]);
  assert.equal(createServerPreferences(storage,'https://first.example').wanted(),true);
  assert.equal(second.wanted(),false);assert.deepEqual(second.models(),[]);
  assert.deepEqual(first.models(),[{id:'a',name:'模型'}]);assert.ok(![...values.values()].join('').includes('private'));
  first.saveConnection(false);assert.equal(first.wanted(),false);assert.deepEqual(first.models(),[{id:'a',name:'模型'}]);
});
test('malformed or unavailable browser storage does not prevent local play',()=>{
  const broken=createServerPreferences({getItem:()=>'{',removeItem(){},setItem:()=>{throw new Error('private mode');}},'http://local');
  assert.equal(broken.wanted(),false);assert.deepEqual(broken.models(),[]);
  assert.doesNotThrow(()=>broken.saveConnection(true,'舰长'));
});
