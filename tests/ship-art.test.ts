import {test} from 'vitest';
import assert from 'node:assert/strict';
import {catalogArt,shipCharacterProfile,type ShipArtManifest} from '../src/ship-art.ts';
const manifest:ShipArtManifest={profiles:{},catalog:{'dd-1':'ayanami','dd-2':'laffey'},historical:{first:{flagship:'enterprise'},second:{flagship:'hornet'}},templates:{dd:'ayanami'},identities:{laffey:{name:'拉菲',avatar:'ships/laffey/avatar.webp',portrait:'ships/laffey/portrait.webp'}}};
test('same combat template resolves independent catalog identities with a legacy template fallback',()=>{
 assert.equal(shipCharacterProfile({id:'0-0',template:'dd',catalogId:'dd-1'},undefined,manifest),'ayanami');
 assert.equal(shipCharacterProfile({id:'0-0',template:'dd',catalogId:'dd-2'},undefined,manifest),'laffey');
 assert.equal(shipCharacterProfile({id:'0-0',template:'dd'},undefined,manifest),'ayanami');
});
test('historical art scopes repeated unit IDs by battle and ignores catalog and labels',()=>{
 const ship={id:'flagship',template:'cv',catalogId:'dd-1',label:'相同标签'};
 assert.equal(shipCharacterProfile(ship,'first',manifest),'enterprise');
 assert.equal(shipCharacterProfile(ship,'second',manifest),'hornet');
 assert.equal(ship.label,'相同标签');
});
test('catalog identity carries its own published avatar and portrait',()=>{
 assert.deepEqual(catalogArt('dd-2',manifest),manifest.identities.laffey);
 assert.equal(catalogArt('missing',manifest),undefined);
});
