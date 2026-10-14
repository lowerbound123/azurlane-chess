import type {PublicModel} from '../shared/network.ts';
import type {StorageLike} from '../shared/save.ts';
import {isRecord} from './lib/errors.ts';
export function normalizePublicModels(value:unknown):PublicModel[] {
 return Array.isArray(value)?value.filter(isRecord).filter(m=>typeof m.id==='string'&&typeof m.name==='string').slice(0,100).map(m=>({id:String(m.id),name:String(m.name)})):[];
}
export function createServerPreferences(storage:StorageLike, origin:string) {
 const key='azurlane-server-ui-v1:'+origin;
 const read=():Record<string,unknown>=>{try{const value:unknown=JSON.parse(storage.getItem(key)??'null');return isRecord(value)?value:{};}catch{return {};}};
 const write=(patch:Record<string,unknown>)=>{try{storage.setItem(key,JSON.stringify({...read(),...patch}));}catch{/* Storage can be disabled without blocking play. */}};
 return {wanted:()=>read().wanted===true,nickname:()=>{const nickname=read().nickname;return typeof nickname==='string'?nickname.slice(0,20):'指挥官';},models:()=>normalizePublicModels(read().models),saveConnection:(wanted:boolean,nickname?:string)=>write({wanted,...(nickname?{nickname:nickname.slice(0,20)}:{})}),saveModels:(value:unknown)=>write({models:normalizePublicModels(value)})};
}
