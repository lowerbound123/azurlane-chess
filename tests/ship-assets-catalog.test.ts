import {test,expect} from 'vitest';
import {readFile} from 'node:fs/promises';
import sharp from 'sharp';
import config from '../config/ship-assets.json' with {type:'json'};
import generated from '../src/characters/ships.generated.json' with {type:'json'};
import {SHIP_DEFINITIONS} from '../src/ship-definitions.ts';
import {HISTORICAL_BATTLES} from '../src/history/content.ts';
import {shipCharacterProfile} from '../src/ship-art.ts';
import {checkShipAssets} from '../scripts/fetch-ship-assets.mjs';
import {parseSkeleton} from '../src/vendor/parse.mjs';
test('every catalog and historical unit has an explicit same-type published identity',()=>{
 const cfg=config as any,g=generated as any;
 expect(Object.keys(cfg.catalog).sort()).toEqual(Object.keys(SHIP_DEFINITIONS).sort());
 expect(new Set(Object.values(cfg.catalog)).size).toBe(Object.keys(cfg.catalog).length);
 for(const [slot,id]of Object.entries(cfg.catalog) as [string,string][]){expect(cfg.ships[id].type).toBe(slot.split('-')[0]);expect(g.profiles[id]).toBeTruthy();expect(g.identities[id].portrait).toBe(`portraits/${id}.webp`);}
 for(const battle of HISTORICAL_BATTLES){expect(Object.keys(cfg.historical[battle.id]).sort()).toEqual(battle.units.map(u=>u.id).sort());for(const unit of battle.units){const id=cfg.historical[battle.id][unit.id];expect(cfg.ships[id].type).toBe(unit.template);expect(shipCharacterProfile({id:unit.id,template:unit.template},battle.id)).toBe(id);expect(g.profiles[id]).toBeTruthy();}}
});
test('all published paintings are bounded WebP, complete and backed by recorded source hashes',async()=>{
 const {problems,lock}=await checkShipAssets(process.cwd());expect(problems).toEqual([]);
 for(const [id,identity]of Object.entries(generated.identities)){for(const [kind,max]of [['portrait',1600],['avatar',256]] as const){const p=identity[kind],meta=await sharp(await readFile('public/'+p)).metadata();expect(meta.format).toBe('webp');expect(Math.max(meta.width!,meta.height!)).toBeLessThanOrEqual(max);}expect(lock.ships[id].sources.painting.provider).toBeTruthy();expect(lock.ships[id].sources.chibi.provider).toBeTruthy();expect(lock.ships[id].profile.runtimeVersion).toMatch(/^3\.[68]$/);}
});
test('Enterprise idle feet meet the common ground plane after character registration',async()=>{
 const profile=generated.profiles.qiye,{data,core}=parseSkeleton(await readFile('public/'+profile.skeleton),await readFile('public/'+profile.atlas,'utf8'));
 for(let time=0;time<data.findAnimation(profile.animations.idle).duration;time+=.2){
  const skeleton=new core.Skeleton(data),state=new core.AnimationState(new core.AnimationStateData(data));state.setAnimation(0,profile.animations.idle,true);state.update(time);state.apply(skeleton);skeleton.updateWorldTransform();
  const feet=skeleton.slots.filter((s:any)=>['leg_R2','leg_L2'].includes(s.data.name));expect(feet).toHaveLength(2);
  const minimum=feet.map((s:any)=>{const v:number[]=[];if(s.attachment.worldVerticesLength)s.attachment.computeWorldVertices(s,0,s.attachment.worldVerticesLength,v,0,2);else s.attachment.computeWorldVertices(s.bone,v,0,2);return Math.min(...v.filter((_,i)=>i%2))*profile.scale+profile.offset[1];});
  expect(Math.abs(Math.min(...minimum))).toBeLessThan(.03);
 }
});
