export const ABILITY_STUDIES = [
 {id:'smoke',name:'烟幕掩护',ship:'阿卡司塔',group:'持续能力',color:'#c2d2d5',duration:8,peak:3.2,summary:'贴近海面铺开的烟墙，保留若隐若现的舰体轮廓。',rule:'自身及周围六格，持续两轮；本轮不能发射鱼雷。',phases:['烟团铺开','持续掩护','烟幕消散']},
 {id:'escort',name:'邻接护航',ship:'巴尔的摩',group:'持续能力',color:'#6be5d3',duration:8,peak:3,summary:'友舰周围环绕半透明盾牌，护航舰与友舰间有柔和连线。',rule:'邻接其他友舰主炮与航空炸弹减伤 30%；表示减伤，不表示无敌。',phases:['护航建立','盾牌环绕','保护收束']},
 {id:'radar',name:'雷达扫描',ship:'海伦娜',group:'持续能力',color:'#8fe8bd',duration:8,peak:3.2,summary:'指定海域出现旋转扫描扇面、同心脉冲和短暂回波。',rule:'在六格射程内选择七格扫描区域，持续两轮；占用副炮。',phases:['发出脉冲','扇面扫描','回波淡出']},
 {id:'heavyShell',name:'七格重炮',ship:'武藏',group:'武器反馈',color:'#ffae70',duration:8,peak:2.65,summary:'单枚粗亮弹道，落点形成强中心爆炸与六向扩散冲击。',rule:'单发覆盖七格，中心 120、邻格 60，保留友伤。',phases:['单发出膛','中心与扩散','烟尘消散']},
 {id:'heavyStrike',name:'飞机投弹',ship:'企业 / 埃塞克斯 / 香格里拉',group:'航空特色',color:'#efae8c',duration:8,peak:3.4,summary:'强袭机掠过，重型炸弹下落后形成厚重火球与烟柱。',rule:'普通轰炸机炸弹 25，强袭机炸弹 35；飞机状态独立于母舰。',phases:['强袭进入','投弹命中','脱离烟柱']},
 {id:'fighter',name:'战斗机拦截',ship:'埃塞克斯',group:'航空特色',color:'#9ebcff',duration:8,peak:2.35,summary:'空中短点射、机翼火光与敌机受击闪光，突出空战方向。',rule:'战斗机对空伤害 2、射程一格；埃塞克斯另有普通轰炸机。',phases:['接近敌机','短点射拦截','脱离接触']},
 {id:'scout',name:'空中侦察',ship:'香格里拉',group:'航空特色',color:'#89d9b2',duration:8,peak:3.2,summary:'侦察机下方柔和的观察光锥与地面扩散环，不出现武器火光。',rule:'侦察机视野五格、无炸弹；光锥仅表示观察，不代表雷达穿透。',phases:['侦察进入','观察海域','飞离区域']},
] as const;
export type AbilityKind=typeof ABILITY_STUDIES[number]['id'];
export const SHIP_EFFECT_AUDIT:Record<string,AbilityKind[]>={
 'dd-1':[],'dd-2':[],'dd-3':['smoke'],'cl-1':[],'cl-2':[],'cl-3':['radar'],
 'ca-1':[],'ca-2':['escort'],'ca-3':[],'bb-1':[],'bb-2':['heavyShell'],'bb-3':[],
 'cv-1':['heavyStrike'],'cv-2':['fighter','heavyStrike'],'cv-3':['scout','heavyStrike'],
};
