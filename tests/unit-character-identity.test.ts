// @vitest-environment happy-dom
import {test,vi} from 'vitest';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import type {MapModel} from '../shared/render.ts';
vi.mock('../src/characters/spine.ts',()=>({
 CharacterLibrary:class {dispose(){}},
 ShipCharacter:class {root=new THREE.Group();profile={};disposed=false;constructor(_library:unknown,public identity:string){}dispose(){this.disposed=true;}setAction(){}setHeading(){}seek(){}tick(){}},
}));
vi.mock('../src/scene/resources.ts',()=>({colors:{friendly:0x00ff00,enemy:0xff0000,gold:0xffff00},label:()=>new THREE.Sprite(),disposeTree:()=>{},ring:()=>new THREE.Line(),line:()=>new THREE.Line()}));
import {Units} from '../src/scene/units.ts';
import type {TacticalModels} from '../src/scene/tactical-models.ts';
test('reusing one render unit with the same template replaces its actor when identity changes',()=>{
 const units=new Units(new THREE.Scene(),{} as TacticalModels);
 const ship={id:'0-0',template:'dd',characterProfile:'ayanami',team:0,xy:{x:0,y:0},pos:{q:0,r:0},heading:0,label:'舰船',hp:100,cfg:{hp:100}};
 const model={ships:[ship],planes:[],torpedoes:[],myTeam:0,cells:[],visuals:{},selected:'',busy:false} as unknown as MapModel;
 units.update(model);
 const first=units.cache.get('ship:0-0')!.userData.actor!;
 units.update(model);assert.equal(units.cache.get('ship:0-0')!.userData.actor,first);
 ship.characterProfile='laffey';units.update(model);
 const second=units.cache.get('ship:0-0')!.userData.actor!;
 assert.notEqual(second,first);assert.equal((first as unknown as {disposed:boolean}).disposed,true);
 assert.equal(units.cache.get('ship:0-0')!.userData.characterProfile,'laffey');
 units.dispose();
});

test('main gun animation wins over a simultaneous secondary salvo, then yields to hit and death',()=>{
 const units=new Units(new THREE.Scene(),{} as TacticalModels);
 const ship={id:'0-0',template:'bb',team:0,xy:{x:0,y:0},pos:{q:0,r:0},heading:0,label:'战列',hp:100,cfg:{hp:100}};
 const model={ships:[ship],planes:[],torpedoes:[],myTeam:0,cells:[],visuals:{actions:[]},selected:'',busy:true} as unknown as MapModel;
 units.update(model);const actor=units.cache.get('ship:0-0')!.userData.actor!,spy=vi.spyOn(actor,'setAction');
 model.visuals.actions=[{id:'main',shipId:ship.id,action:'mainFire',age:.1},{id:'secondary',shipId:ship.id,action:'fire',age:.1}];units.update(model);
 assert.deepEqual(spy.mock.lastCall,['mainFire','main',.1]);
 model.visuals.actions.push({id:'hit',shipId:ship.id,action:'hit',age:.1});units.update(model);assert.deepEqual(spy.mock.lastCall,['hit','hit',.1]);
 ship.hp=0;model.visuals.actions.push({id:'dead',shipId:ship.id,action:'dead',age:.1});units.update(model);assert.deepEqual(spy.mock.lastCall,['dead','dead',.1]);
 assert.equal(units.cache.get('ship:0-0')!.userData.caption!.visible,false);units.dispose();
});
