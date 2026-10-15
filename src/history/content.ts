import type {HistoricalDefinition,HistoricalUnitDefinition,HistoricalId,HistoricalRegion} from '../../shared/history.ts';
import type {ShipConfig,ShipType,PlaneConfig} from '../../shared/game.ts';
import {fromCR,RULES} from '../engine.ts';
import {sea,narvikMap,rectangle,circle} from './maps.ts';
const gun=(shots:number,damage:number,range:number,reload:number)=>({shots,damage,range,reload});
const secondary=(damage:number,range:number)=>({damage,range,multi:false});
const torpedo=(reserve:number,damage:number)=>({speed:4,damage,life:3,reserve,max:2,perWindow:1});
const smoke=(charges:number)=>({charges,radius:1,duration:2});
const config=(name:string,hp:number,speed:number,type:ShipType,patch:Partial<ShipConfig>={}):ShipConfig=>({name,hp,speed,role:type==='bb'||type==='cv'?'back':'front',vision:5,collision:type==='bb'?35:type==='ca'?30:type==='cl'?20:15,radius:RULES.shipRadius,...patch});
const bomber:PlaneConfig={role:'bomber',hp:3,speed:6,range:18,vision:3,damage:45,rearm:1};
const fighter:PlaneConfig={role:'fighter',hp:3,speed:7,range:16,vision:3,damage:0,rearm:1,attack:{damage:1,range:1}};
const scout:PlaneConfig={role:'scout',hp:1,speed:8,range:20,vision:5,damage:0,rearm:1};
const carrier=(slots:PlaneConfig[],launch=2)=>({stock:slots.length,launch,rearm:1,heal:1,plane:{...slots[0]},slots:slots.map(p=>({...p}))});
function unit(team:number,index:number,name:string,type:ShipType,hp:number,speed:number,c:number,r:number,heading:number,patch:Partial<ShipConfig>,controlled=team===0,initial?:number,airReady?:number[]):HistoricalUnitDefinition {
 return {id:`${team}-${index}`,team,template:type,name,cfg:config(name,hp,speed,type,patch),pos:fromCR(c,r),heading,controlled,...(initial===undefined?{}:{hp:initial}),...(airReady?{airReady}:{})};
}
const region=(id:string,label:string,kind:HistoricalRegion['kind'],cells:HistoricalRegion['cells']):HistoricalRegion=>({id,label,kind,cells});
const source=(title:string,url:string)=>({title,url});
function definition(id:HistoricalId,title:string,subtitle:string,date:string,roundLimit:number,difficulty:string,minutes:string,map:HistoricalDefinition['map'],units:HistoricalUnitDefinition[],regions:HistoricalRegion[],objectives:string[],bonusObjectives:string[],description:string,history:string,sources:HistoricalDefinition['sources']):HistoricalDefinition{return {id,title,subtitle,date,roundLimit,difficulty,minutes,map,units,regions,objectives,bonusObjectives,description,history,sources};}
const narvik=narvikMap();
export const HISTORICAL_BATTLES:HistoricalDefinition[]=[
 definition('river-plate','拉普拉塔河口','保持接触','1939-12-13',14,'入门','10–15 分钟',sea(21,17),[
  unit(0,0,'埃克塞特 Exeter','ca',240,3,11,7,3,{main:gun(2,30,7,0),secondary:secondary(6,2),torpedo:torpedo(4,40),smoke:smoke(1)}),
  unit(0,1,'阿贾克斯 Ajax','cl',170,4,13,5,3,{main:gun(2,20,6,0),secondary:secondary(6,2),torpedo:torpedo(4,40),smoke:smoke(1)}),
  unit(0,2,'阿基里斯 Achilles','cl',170,4,13,9,3,{main:gun(2,20,6,0),secondary:secondary(6,2),torpedo:torpedo(4,40),smoke:smoke(1)}),
  unit(1,0,'斯佩伯爵 Admiral Graf Spee','ca',420,3,6,5,0,{main:gun(2,55,9,1),secondary:secondary(12,3),torpedo:torpedo(2,45)}),
 ],[region('german-exit','德舰脱离区','enemy-exit',rectangle(0,2,14,16)),region('intel','目标可能方位','intel',rectangle(3,8,2,7))],['至少一艘英舰存活；击沉斯佩伯爵，或迫使其撤退后连续两轮目视'],['三艘英舰均存活','第 10 轮及以前完成'],
 '指挥三艘英国巡洋舰分散牵制德国装甲舰，受创后接力追踪其撤退。','1939 年 12 月 13 日三艘英国巡洋舰与斯佩伯爵交战。德舰驶入蒙得维的亚，并于 17 日自沉。本场只改编海上交战和追踪，未模拟港口外交；舰队耐久与距离为玩法抽象。',[source('格林尼治皇家博物馆','https://www.rmg.co.uk/collections/objects/rmgc-object-14227')]),
 definition('narvik','第二次纳尔维克','深入峡湾','1940-04-13',18,'进阶','18–25 分钟',narvik,[
  unit(0,0,'厌战 Warspite','bb',420,2,9,22,4,{main:gun(2,65,9,1),secondary:secondary(12,3)}),
  ...['哥萨克 Cossack','贝都因 Bedouin','爱斯基摩 Eskimo'].map((name,i)=>unit(0,i+1,name,'dd',140,4,7+i*2,19,4,{main:gun(1,18,4,0),secondary:secondary(6,2),torpedo:torpedo(4,40),smoke:smoke(1)})),
  ...[['Z13 Erich Koellner',80,1,9,16],['Z12 Erich Giese',110,3,10,12],['Z17 Diether von Roeder',60,1,6,11],['Z9 Wolfgang Zenker',120,4,4,7],['Z18 Hans Lüdemann',110,4,13,7],['Z2 Georg Thiele',100,4,13,3]].map(([name,hp,speed,c,r],i)=>unit(1,i,String(name),'dd',120,Number(speed),Number(c),Number(r),1,{main:gun(1,18,5,0),secondary:secondary(6,2),torpedo:torpedo(2,45)},false,Number(hp))),
 ],[region('port','港口任务区','control',circle(narvik,9,13,2)),region('ambush-west','入口伏击方位','intel',circle(narvik,8,16,2)),region('ambush-east','港口伏击方位','intel',circle(narvik,12,12,2))],['厌战存活，击沉至少四艘德舰，并连续两轮独占港口'],['厌战 HP≥210','六艘德舰全部击沉'],
 '以驱逐舰探明峡湾，厌战提供炮火；打开航道后控制港口。','1940 年 4 月 13 日英国舰队进入纳尔维克峡湾。选取厌战与三艘驱逐，压缩德国驱逐舰编制；未模拟潜艇、陆军和完整航空行动。初始损伤与速度是剧本配置。',[source('英国海军战时日志','https://www.naval-history.net/xDKWD-DCHF1940_03-09.htm'),source('德舰参战记录','https://www.naval-history.net/xDKWW2-4004-13APR02.htm')]),
 definition('denmark-strait','丹麦海峡','突破拦截','1941-05-24',12,'标准','10–15 分钟',sea(25,15),[
  unit(0,0,'俾斯麦 Bismarck','bb',370,3,17,4,3,{vision:6,main:gun(2,65,9,1),secondary:secondary(10,3)}),
  unit(0,1,'欧根亲王 Prinz Eugen','ca',240,3,19,2,3,{vision:6,main:gun(2,30,7,0),secondary:secondary(8,3),torpedo:torpedo(4,40)}),
  unit(1,0,'胡德 Hood','bb',330,3,14,8,4,{vision:6,main:gun(2,65,9,1),secondary:secondary(10,3)}),
  unit(1,1,'威尔士亲王 Prince of Wales','bb',350,2,18,10,4,{vision:6,main:gun(3,45,9,1),secondary:secondary(8,3)}),
 ],[region('exit','大西洋突围区','exit',rectangle(0,4,11,14))],['俾斯麦成功撤离，或俾斯麦存活且击沉两艘拦截舰'],['欧根也撤离；或敌舰全灭时仍存活','俾斯麦 HP≥185'],
 '从德方视角指挥两舰协同，选择突围路线并保存旗舰。','1941 年 5 月 24 日胡德与威尔士亲王拦截德舰。本场只改编遭遇后的局部突围，不模拟随后数日追击，也不强制胡德殉爆或英舰失灵。',[source('英国皇家海军','https://www.royalnavy.mod.uk/news/2021/may/24/20210524-loss-hood')]),
 definition('midway','中途岛','发现与出击','1942-06-04',18,'高级','20–30 分钟',sea(27,21),[
  ...[['企业 Enterprise',200,19,5],['大黄蜂 Hornet',190,20,10],['约克城 Yorktown',180,22,14]].map(([name,hp,c,r],i)=>unit(0,i,String(name),'cv',Number(hp),2,Number(c),Number(r),3,{carrier:carrier([bomber,bomber,bomber,fighter,fighter,scout]),aa:{range:2,damage:1}})),
  ...[['赤城 Akagi',180,7,7],['加贺 Kaga',180,6,11],['苍龙 Soryu',150,9,13],['飞龙 Hiryu',150,6,2]].map(([name,hp,c,r],i)=>unit(1,i,String(name),'cv',Number(hp),2,Number(c),Number(r),0,{carrier:carrier([bomber,bomber,fighter,scout]),aa:{range:2,damage:1}},false,undefined,[3,5,1,1])),
 ],[region('exit','美舰撤离区','exit',rectangle(24,26,0,20)),region('search-main','敌航母可能活动区','intel',rectangle(4,11,6,15)),region('search-north','北侧可能活动区','intel',rectangle(3,10,0,5))],['击沉至少三艘日舰并撤离一艘美舰；或全灭日舰且有美舰存活或已撤离'],['四艘日舰全部击沉','三艘美舰均未沉没'],
 '指挥三艘美军航母搜索目标、组织攻击波和防御反击。','本场聚焦 1942 年 6 月 4 日三艘美舰与四艘日舰的航空交战。护卫防空合并在航母配置中，多次出动压缩为飞机批次，未模拟后续救援与潜艇袭击。',[source('美国海军历史与遗产司令部','https://www.history.navy.mil/research/library/online-reading-room/title-list-alphabetically/m/midway-sheer-luck-or-better-doctrine.html')]),
 definition('samar','萨马岛','掩护撤退','1944-10-25',16,'高级','18–25 分钟',sea(23,25),[
  ...['约翰斯顿 Johnston','霍埃尔 Hoel','赫尔曼 Heermann'].map((name,i)=>unit(0,i,name,'dd',140,4,8+i*4,2,1,{main:gun(1,18,4,0),secondary:secondary(6,2),torpedo:torpedo(4,45),smoke:smoke(2),aa:{range:2,damage:1}})),
  ...['范肖湾 Fanshaw Bay','白平原 White Plains','加里宁湾 Kalinin Bay'].map((name,i)=>unit(0,i+3,name,'cv',180,2,9+i*4,4,1,{smoke:smoke(1),carrier:carrier([{...bomber,range:12,damage:20,rearm:2},{...bomber,range:12,damage:20,rearm:2}],1),aa:{range:2,damage:1}},false)),
  unit(1,0,'大和 Yamato','bb',600,2,3,0,1,{main:gun(1,90,11,1),secondary:secondary(12,3),aa:{range:2,damage:1}}),
  unit(1,1,'金刚 Kongo','bb',460,3,6,0,1,{main:gun(2,45,9,1),secondary:secondary(10,3),aa:{range:2,damage:1}}),
  unit(1,2,'熊野 Kumano','ca',300,3,20,0,2,{main:gun(2,30,7,0),secondary:secondary(8,3),torpedo:torpedo(2,45),aa:{range:2,damage:1}}),
  unit(1,3,'筑摩 Chikuma','ca',300,3,22,3,2,{main:gun(2,30,7,0),secondary:secondary(8,3),torpedo:torpedo(2,45),aa:{range:2,damage:1}}),
 ],[region('exit','友军撤离区','exit',rectangle(0,22,22,24))],['护送至少两艘航母撤离；第三艘仍有机会时继续战斗'],['三艘航母全部撤离','至少一艘玩家驱逐存活或已撤离'],
 '用烟幕与雷击掩护三艘自动航行的护航航母，选择中央线或东侧线。','1944 年 10 月 25 日 Taffy 3 遭遇日本水面舰队。本场压缩双方编制，聚焦驱逐舰烟幕、雷击和航母脱离，不接入随后空袭。舰队损失由实际战斗决定。',[source('美国海军历史与遗产司令部','https://www.history.navy.mil/about-us/leadership/director/directors-corner/h-grams/h-gram-038/h-038-1.html'),source('加里宁湾舰史','https://www.history.navy.mil/content/history/nhhc/research/histories/ship-histories/danfs/k/kalinin-bay.html')]),
];
export const getHistoricalDefinition=(id:string)=>HISTORICAL_BATTLES.find(d=>d.id===id);
