import {test,expect} from 'vitest';
import * as E from '../src/engine.ts';
import type {CampaignSave} from '../shared/campaign.ts';
import {createCampaignStorage,CAMPAIGN_SAVE_KEY} from '../src/campaign/storage.ts';
import {applyBattleStatus} from '../shared/status.ts';

const memory=()=>{const data=new Map<string,string>();return {data,getItem:(k:string)=>data.get(k)??null,setItem:(k:string,v:string)=>{data.set(k,v);},removeItem:(k:string)=>{data.delete(k);}};};
function fixture():CampaignSave {
 const game=E.createFleetGame(['cv-3']);game.map={width:13,height:72,islands:[],mines:[]};game.ships=game.ships.filter(s=>s.team===0);game.ships[0].pos=E.fromCR(6,70);game.ships[0].xy=E.hexToXY(game.ships[0].pos);game.ships[0].airReady[0]=Infinity;game.explored=[[],[]];game.phase='plan';
 return {state:{version:1,chapter:8,checkpoint:0,status:'playing',completed:['depart'],hintLevel:1,attempts:0,evidence:{}},game,plans:{},selected:'0-0'};
}
test('campaign save round-trips the long map and airborne Infinity without touching regular saves',()=>{
 const storage=memory();storage.setItem('azurlane-chess:v1:auto','ordinary');const repo=createCampaignStorage(storage);
 expect(repo.write(fixture()).ok).toBe(true);const restored=repo.read();expect(restored.kind).toBe('resume');
 if(restored.kind==='resume'){expect(restored.save.game.ships[0].airReady[0]).toBe(Infinity);expect(restored.save.game.ships[0].pos.r).toBe(70);}
 expect(storage.getItem('azurlane-chess:v1:auto')).toBe('ordinary');
});
test('malformed campaign state is rejected and retained for explicit recovery',()=>{
 const storage=memory();const raw=JSON.stringify({magic:'azurlane-campaign',version:1,save:{...fixture(),game:{...fixture().game,map:{width:999,height:72,islands:[],mines:[]}}}});storage.setItem(CAMPAIGN_SAVE_KEY,raw);
 expect(createCampaignStorage(storage).read().kind).toBe('error');expect(storage.getItem(CAMPAIGN_SAVE_KEY)).toBe(raw);
});
test('campaign rejects illegal positions, nonfinite HP and foreign plan owners',()=>{
 const repo=createCampaignStorage(memory());const bad=fixture();bad.game.ships[0].pos=E.fromCR(13,70);expect(repo.write(bad).ok).toBe(false);
 const hp=fixture();hp.game.ships[0].hp=NaN;expect(repo.write(hp).ok).toBe(false);
 const orders=fixture();orders.plans['missing']=E.emptyPlan();expect(repo.write(orders).ok).toBe(false);
});
test('old content version preserves a bounded chapter for checkpoint migration',()=>{
 const storage=memory();const save=fixture();save.state.version=0;storage.setItem(CAMPAIGN_SAVE_KEY,JSON.stringify({magic:'azurlane-campaign',version:0,save}));
 expect(createCampaignStorage(storage).read()).toMatchObject({kind:'migrate',chapter:8,completed:['depart']});
});
test('storage failures are returned instead of claiming the campaign was saved',()=>{
 const repo=createCampaignStorage({getItem(){throw Error('denied');},setItem(){throw Error('quota');}});
 expect(repo.read().kind).toBe('error');expect(repo.write(fixture()).ok).toBe(false);
});
test('sunk moving ships retain their last physical position without breaking saves',()=>{
 const save=fixture(),ship=save.game.ships[0];ship.hp=0;ship.xy.x+=.4;
 const repo=createCampaignStorage(memory());expect(repo.write(save).ok).toBe(true);expect(repo.read().kind).toBe('resume');
 ship.xy.x=NaN;expect(repo.write(save).ok).toBe(false);
});
test('campaign saves damage snapshots created by legal status bonuses after the status expires',()=>{
 const save=fixture(),repo=createCampaignStorage(memory());save.game.ships=[E.createCatalogShip('dd-2',0,0,E.fromCR(4,20))];
 const ship=save.game.ships[0];applyBattleStatus(save.game,ship.id,{id:'test-output',name:'增伤示例',kind:'buff',icon:'up',description:'测试',effects:[{kind:'outgoingDamage',value:5}]},{duration:1});
 expect(repo.write(save).ok).toBe(true);save.game=E.resolveRound(save.game,{[ship.id]:{...E.emptyPlan(),torps:[{window:0,dir:1}]}},{termination:'mission'}).game;
 expect(save.game.torpedoes[0].cfg.damage).toBe(240);expect(save.game.ships[0].statuses).toBeUndefined();expect(repo.write(save).ok).toBe(true);expect(repo.read().kind).toBe('resume');
});
