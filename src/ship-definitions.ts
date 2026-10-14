import type {ShipType,ShipConfig,PlaneConfig} from '../shared/game.ts';
const sec=(damage:number,range:number,multi=false)=>({damage,range,multi});
export const TEMPLATES: Record<ShipType, Omit<ShipConfig,"radius">>={
 dd:{name:'驱逐',role:'front',hp:100,speed:4,vision:5,collision:15,secondary:sec(8,2),torpedo:{speed:4,damage:45,life:3,reserve:3,max:3},aa:{range:3,damage:1},contactSweep:true},
 cl:{name:'轻巡',role:'front',hp:150,speed:3,vision:5,collision:20,secondary:sec(12,3),torpedo:{speed:4,damage:45,life:3,reserve:9,max:3},aa:{range:2,damage:1}},
 ca:{name:'重巡',role:'front',hp:230,speed:3,vision:5,collision:30,secondary:sec(16,3),aa:{range:2,damage:1},guard:{range:1,torpedoReduction:.6}},
 bb:{name:'战列',role:'back',hp:270,speed:2,vision:5,collision:35,secondary:sec(10,3),main:{range:9,shots:3,damage:60,reload:1}},
 cv:{name:'航母',role:'back',hp:210,speed:2,vision:5,collision:15,carrier:{stock:6,launch:2,rearm:1,heal:1,plane:{hp:2,speed:6,vision:3,range:12,damage:25}}}
};
export const DEFAULT_ROSTER: ShipType[]=['dd','cl','ca','bb','cv'];
export const AIRCRAFT:Record<string,PlaneConfig>={
 bomber:{role:'bomber',hp:2,speed:6,vision:3,range:12,damage:25,rearm:1},
 heavy:{role:'heavy',hp:3,speed:5,vision:3,range:12,damage:35,rearm:2},
 fighter:{role:'fighter',hp:2,speed:6,vision:3,range:12,damage:0,rearm:1,attack:{range:1,damage:2}},
 scout:{role:'scout',hp:1,speed:8,vision:5,range:16,damage:0,rearm:1},
};
const fleetCarrier=(roles:string[])=>({stock:roles.length,launch:2,rearm:AIRCRAFT[roles[0]].rearm!,heal:1,plane:{...AIRCRAFT[roles[0]]},slots:roles.map(r=>({...AIRCRAFT[r]}))});
function definition(type:ShipType,name:string,patch:Partial<ShipConfig>):ShipConfig{
 const cfg:ShipConfig={radius:Math.sqrt(3)/2-.001,...structuredClone(TEMPLATES[type]),name,...patch};
 if(type==='ca')delete cfg.guard;
 return cfg;
}
export const SHIP_DEFINITIONS:Record<string,ShipConfig>={
 'dd-1':definition('dd','Z35',{minelayer:{reserve:6,max:2,damage:40}}),
 'dd-2':definition('dd','岛风',{hp:90,torpedo:{speed:4,damage:40,life:3,reserve:8,max:4,perWindow:4}}),
 'dd-3':definition('dd','阿卡司塔',{smoke:{charges:2,radius:1,duration:2}}),
 'cl-1':definition('cl','圣地亚哥',{torpedo:{speed:4,damage:45,life:3,reserve:6,max:3},aa:{range:3,damage:1,inner:{range:1,damage:1}}}),
 'cl-2':definition('cl','克利夫兰',{torpedo:{speed:4,damage:45,life:3,reserve:6,max:3},secondary:{damage:12,range:3,multi:false,targets:2}}),
 'cl-3':definition('cl','海伦娜',{torpedo:{speed:4,damage:45,life:3,reserve:6,max:3},radar:{charges:3,range:6,radius:1,duration:2}}),
 'ca-1':definition('ca','欧根亲王',{}),
 'ca-2':definition('ca','巴尔的摩',{escort:{range:1,reduction:.3,steps:1}}),
 'ca-3':definition('ca','旧金山',{secondary:{damage:16,range:3,multi:false,advanceSalvo:true}}),
 'bb-1':definition('bb','北卡罗来纳',{}),
 'bb-2':definition('bb','武藏',{main:{range:9,shots:1,damage:60,reload:1,blast:1,centerMultiplier:2}}),
 'bb-3':definition('bb','黎塞留',{main:{range:7,shots:2,damage:40,reload:0}}),
 'cv-1':definition('cv','企业',{carrier:fleetCarrier(['heavy','heavy','heavy','heavy'])}),
 'cv-2':definition('cv','埃塞克斯',{carrier:fleetCarrier(['fighter','fighter','fighter','fighter','bomber','bomber'])}),
 'cv-3':definition('cv','香格里拉',{carrier:fleetCarrier(['scout','scout','bomber','bomber','bomber','bomber'])}),
};
delete SHIP_DEFINITIONS['dd-1'].torpedo;
SHIP_DEFINITIONS['ca-1'].guard={range:1,torpedoReduction:.6,gunReduction:.3};
export const DEFAULT_FLEET=['dd-2','cl-2','ca-1','bb-1','cv-1'];
export const planeForSlot=(cfg:ShipConfig,slot:number)=>cfg.carrier!.slots?.[slot]??cfg.carrier!.plane;
export const AIR_ROLE_LABELS={bomber:'轰炸机',heavy:'强袭机',fighter:'战斗机',scout:'侦察机'};
