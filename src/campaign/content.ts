import type {CampaignChapter,CampaignCheckpoint,CampaignState} from '../../shared/campaign.ts';
import {fromCR} from '../engine.ts';
import {SHIP_DEFINITIONS as D,AIRCRAFT} from '../ship-definitions.ts';
const cp=(id:string,title:string,instruction:string,row:number,unlocks:string[]=[],mechanism='可先观察航线与射程，再填入指令并执行。'):CampaignCheckpoint=>({id,title,instruction,focus:fromCR(6,row),unlocks,hints:[instruction,mechanism,'可点击“填入参考指令”查看当前回合的可执行方案；检查全舰计划后自行执行。参考方案可能需要多轮。']});
export const CAMPAIGN_CHAPTERS:CampaignChapter[]=[
 {id:'departure',title:'独自出港',description:'只有岛风与南方航道。前往浮标，练习航线、转向与等待；规划时可撤销、重做。',minutes:1,rows:[68,71],checkpoints:[
 cp('forward','前方浮标','让岛风抵达正前方浮标（第 70 行、第 8 列）。',70,['dd-2'],'点击岛风后选航线；每个前进节点占一步，执行才会移动。'),
 cp('turn','侧前浮标','抵达侧前方浮标（第 69 行、第 8 列），体验转向前进。',69,[],'每步最多转向 60°；原地转向也占一步。'),
 cp('exit','小转弯出港','驶到出口（第 69 行、第 7 列），可自行选择合法路线。',68)]},
 {id:'contact',title:'海峡里的接触',description:'发现、失去接触与重新接近，地形记忆会保留。',minutes:2,rows:[63,67],checkpoints:[
 cp('secondary','绕岛接敌','绕过岛岸接近 1 HP 无武装靶舰，让岛风自动副炮击沉目标。',65,[],'副炮自动开火，但需要当前接触、射程与无遮挡视线。'),
 cp('memory','重新取得接触','观察靶舰驶入岛后，再绕岛重新取得接触并击沉。已探索的岛岸不会忘记。',65)]},
 {id:'rendezvous',title:'友军会合',description:'克利夫兰加入；两舰分别规划，共同执行。',minutes:2,rows:[58,62],checkpoints:[
 cp('rendezvous','两舰汇合','分别让岛风抵达第 60 行第 5 列、克利夫兰抵达第 60 行第 9 列；两舰均须保持完整耐久。',60,['cl-2'],'两舰航速不同；等待、转向或分开航线都能避免碰撞。'),
 cp('split','双目标分火',`让克利夫兰在同一回合用副炮击中两个不同靶舰（每发 ${D['cl-2'].secondary!.damage}）。`,60,[],'同一回合两个目标均在射程与视线内，克利夫兰会分别开火。')]},
 {id:'torpedoes',title:'鱼雷穿越',description:'起点、后续节点、多方向与跨回合航行。',minutes:3,rows:[52,57],checkpoints:[
 cp('torpedo-start','起点侧向发射','以起点窗口侧向发射，实际命中静止靶舰。',55,[],`岛风库存 ${D['dd-2'].torpedo!.reserve} 枚，每轮最多 ${D['dd-2'].torpedo!.max} 枚，每窗最多 ${D['dd-2'].torpedo!.perWindow} 个不同合法方向。不能朝舰首或舰尾发射。`),
 cp('torpedo-node','节点与移动靶','靶舰会向南前进一步；在岛风前进后的节点侧向发射，命中预告落点。',55),
 cp('torpedo-spread','同窗多方向','在同一窗口向两条不同航道发射，实际击中两个目标，并避免友伤。',55),
 cp('torpedo-persist','前轮鱼雷继续航行','向东发射鱼雷，观察第一轮结束仍在航行，再等待它下一轮击中远处目标。',55,[],`鱼雷每轮航速 ${D['dd-2'].torpedo!.speed}、寿命 ${D['dd-2'].torpedo!.life} 轮；已发射鱼雷不随指令清空。`)]},
 {id:'mines',title:'雷区与追兵',description:'Z35 接替岛风，学习清雷与断后。',minutes:3,rows:[46,51],checkpoints:[
 cp('contact-sweep','接触排雷','让 Z35 前进一步清除脚下航线水雷，并保持完整耐久。',49,['dd-1']),
 cp('remote-sweep','副炮远程清雷','让克利夫兰远程清除标示水雷；观察该轮副炮机会被清雷占用。',49),
 cp('lay-mine','未武装到触雷',`让 Z35 在驶离格布雷；下一轮追兵向东前进触雷。库存 ${D['dd-1'].minelayer!.reserve} 枚，每轮最多 ${D['dd-1'].minelayer!.max} 枚。`,49,[],'布雷步骤必须实际前进，未到达不扣库存；新雷下一轮武装，追兵为无武装训练重巡。')]},
 {id:'artillery',title:'炮火支援',description:'三艘战列依次接替，比较装填、范围与速射。',minutes:4,rows:[38,45],checkpoints:[
 cp('north-carolina','单发、装填、三发叠点',`北卡先单发击沉北侧低耐久靶舰，经过真实装填空窗，再用 ${D['bb-1'].main!.shots} 发叠点击沉另一艘高耐久靶舰。`,42,['bb-1'],'主炮射程按回合开始位置检查，炮弹在回合末落下；装填回合仍可移动或观察。'),
 cp('musashi','七格范围炮击',`武藏攻击靶群中心：中心 ${D['bb-2'].main!.damage*D['bb-2'].main!.centerMultiplier!}，邻格 ${D['bb-2'].main!.damage}；请避开友舰。`,42,['bb-2']),
 cp('richelieu','连续回合速射',`黎塞留每轮 ${D['bb-3'].main!.shots} 发、单发 ${D['bb-3'].main!.damage}、无装填空窗。连续两个回合预判移动靶落点并命中。`,42,['bb-3'])]},
 {id:'fog',title:'迷雾中的敌人',description:'阿卡司塔与海伦娜接替前排，理解烟幕与雷达。',minutes:3,rows:[32,37],checkpoints:[
 cp('smoke','烟幕掩护','释放烟幕掩护阿卡司塔，观察敌方失去接触；再等待烟幕自然结束。',35,['dd-3','cl-3'],`烟幕半径 ${D['dd-3'].smoke!.radius}，持续 ${D['dd-3'].smoke!.duration} 轮；烟幕中视野缩短，释放烟幕不能同轮发射鱼雷。`),
 cp('radar','雷达反隐','用海伦娜雷达发现敌方烟幕中的靶舰，下一回合再由北卡主炮击沉。',35,[],`海伦娜雷达 ${D['cl-3'].radar!.charges} 次；雷达占用本轮副炮，无法消除岛屿对副炮的遮挡。`)]},
 {id:'vanguard',title:'前卫突破',description:'三种重巡各有独立实战。',minutes:4,rows:[24,31],checkpoints:[
 cp('guard','欧根封锁与减伤',`开启封锁截停来袭靶舰，同时承受预告鱼雷与炮击，验证鱼雷减伤 ${D['ca-1'].guard!.torpedoReduction*100}%、炮击减伤 ${D['ca-1'].guard!.gunReduction!*100}%。`,28,['ca-1']),
 cp('escort','巴尔的摩护航',`邻接北卡开启护航，实际减少来袭主炮伤害 ${D['ca-2'].escort!.reduction*100}%；护航时最多移动 ${D['ca-2'].escort!.steps} 步。`,28,['ca-2']),
 cp('advance-salvo','旧金山推进齐射','旧金山实际前进两步后，用两次副炮齐射击沉靶舰。',28,['ca-3'],'原地转向不计前进次数；齐射在移动结束后判定射程。')]},
 {id:'air',title:'争夺制空权',description:'五舰就位，亲手完成四机型与防空。',minutes:6,rows:[12,23],checkpoints:[
 cp('scout','侦察与回收','香格里拉放飞侦察机发现北方远处目标；出击后移动母舰一步，等待飞机回到当前母舰并完成整备。',19,['cv-3'],'侦察机没有炸弹。直线航线按起飞位置与目标点决定，回航追随移动后的母舰。'),
 cp('bomber','普通轰炸机',`使用普通轰炸机实际投弹（${AIRCRAFT.bomber.damage} 伤害），并等到回收、${AIRCRAFT.bomber.rearm} 轮整备结束。`,19),
 cp('aa','双层防空','圣地亚哥位于预告敌机航线上，观察外层与内层防空实际击落飞机。',19,['cl-1'],`外层半径 ${D['cl-1'].aa!.range}、内层半径 ${D['cl-1'].aa!.inner!.range}；各层各攻击一次。`),
 cp('fighter','战斗机巡逻','埃塞克斯向北方拦截点派出战斗机巡逻，实际完成一次空战击落。',19,['cv-2'],'战斗机与轰炸机共享每轮两个放飞名额；巡逻点停留后自动返航。'),
 cp('heavy','企业强袭机',`企业的强袭机 ${AIRCRAFT.heavy.hp} HP、${AIRCRAFT.heavy.damage} 伤害；完成投弹、回收与 ${AIRCRAFT.heavy.rearm} 轮整备。`,19,['cv-1'])]},
 {id:'blockade',title:'最后的封锁线',description:'选择 3 前排＋2 后排，部署五舰并协同突破。敌方训练耐久为正式最大值的 60%。',minutes:5,rows:[0,11],checkpoints:[
 cp('final','击败封锁舰队','完成五舰部署，自主击败敌方舰队。敌方仅根据己方视野行动；允许任意合法战术。',6,[],'正式对局全灭或第 30 回合结束，先比较存活舰数，再比较总耐久。战役主目标要求真实击败全部敌舰。')]},
];
const toolUnlocks:Record<string,string[]>={forward:['move'], 'torpedo-start':['torp'], 'contact-sweep':['mine'], 'lay-mine':['minelayer'], 'north-carolina':['main'], smoke:['smoke'],radar:['radar'],guard:['guard'],escort:['escort'],scout:['plane']};
const targetCells:Record<string,[number,number][]>={
 forward:[[7,69]],turn:[[7,68]],exit:[[6,68]],rendezvous:[[4,59],[8,59]],
 'torpedo-start':[[8,55]],'torpedo-node':[[9,54]],'torpedo-spread':[[8,55],[4,52]],'torpedo-persist':[[9,55]],
 'contact-sweep':[[6,49]],'remote-sweep':[[7,49]],'lay-mine':[[5,49]],
 'north-carolina':[[2,37],[5,37]],musashi:[[2,37],[3,37],[2,36]],
 radar:[[9,35]],'advance-salvo':[[8,28]],scout:[[2,13]],bomber:[[4,16]],heavy:[[4,16]],fighter:[[4,17]],
};
for(const chapter of CAMPAIGN_CHAPTERS)for(const checkpoint of chapter.checkpoints){checkpoint.unlocks.push(...(toolUnlocks[checkpoint.id]??[]));checkpoint.targets=targetCells[checkpoint.id]?.map(([c,r])=>fromCR(c,r));}
export function campaignCheckpoint(state:CampaignState):CampaignCheckpoint{return CAMPAIGN_CHAPTERS[state.chapter]?.checkpoints[state.checkpoint]??CAMPAIGN_CHAPTERS[9].checkpoints[0]}
export const campaignFocus=(state:CampaignState)=>({...campaignCheckpoint(state).focus});
