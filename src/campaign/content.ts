import {displayCatalogText} from '../ship-catalog.ts';
import type {CampaignChapter,CampaignCheckpoint,CampaignState} from '../../shared/campaign.ts';
import {SHIP_DEFINITIONS as D,AIRCRAFT} from '../ship-definitions.ts';
import {CAMPAIGN_CHAPTER_ROWS,campaignCell,campaignCellLabel,campaignFocusPoint} from './layout.ts';
const cp=(id:string,title:string,instruction:string,unlocks:string[]=[],mechanism='先选中任务指定的舰娘，规划本段要求的移动或武器指令，再点击“执行回合”观察结果。'):CampaignCheckpoint=>({id,title,instruction,focus:campaignFocusPoint(id),unlocks,emphasis:{},controls:[],hints:[instruction,mechanism,'可点击“填入参考指令”查看当前回合的可执行方案；检查全舰计划后自行执行。参考方案可能需要多轮。']});
export const CAMPAIGN_CHAPTERS:CampaignChapter[]=[
 {id:'departure',title:'独自出港',description:'只有岛风与南方航道。前往浮标，练习航线、转向与等待；规划时可撤销、重做。',minutes:1,rows:CAMPAIGN_CHAPTER_ROWS[0],checkpoints:[
 cp('forward','前方浮标',`选择岛风，在“航线”模式规划前进到正前方浮标（${campaignCellLabel('forward',7,69)}），再点击“执行回合”抵达浮标。`,['dd-2'],'点击岛风后选航线；每个前进节点占一步，执行才会移动。'),
 cp('turn','侧前浮标',`选择岛风，用转向前进抵达侧前方浮标（${campaignCellLabel('turn',7,68)}），再执行回合。左转或右转最多 60°，原地转向也消耗一步移速。`,[],'每步最多转向 60°；原地转向也占一步。'),
 cp('exit','小转弯出港',`给岛风规划一条绕过岸线的合法航路，执行回合后抵达出口（${campaignCellLabel('exit',6,68)}）。可以撤销、重做，确认后再执行。`)]},
 {id:'contact',title:'海峡里的接触',description:'发现、失去接触与重新接近，地形记忆会保留。',minutes:2,rows:CAMPAIGN_CHAPTER_ROWS[1],checkpoints:[
 cp('secondary','绕岛接敌','选择岛风，在航线模式绕过岛岸，接近 1 HP 无武装靶舰。执行回合，让目标进入视野及副炮射程，由自动副炮击沉。',[],'副炮自动开火，但需要当前接触、射程与无遮挡视线。'),
 cp('memory','重新取得接触','先空过一轮，观察靶舰向北驶入迷雾、离开视野。再给岛风规划沿北侧航道追踪的路线并执行，重新看见靶舰，用自动副炮击沉。灰暗海格代表地形记忆，并非当前视野。')]},
 {id:'rendezvous',title:'友军会合',description:'克利夫兰加入；两舰分别规划，共同执行。',minutes:2,rows:CAMPAIGN_CHAPTER_ROWS[2],checkpoints:[
 cp('rendezvous','两舰汇合',`分别选择岛风与克利夫兰，规划到两个浮标的航路：岛风到${campaignCellLabel('rendezvous',4,59)}，克利夫兰到${campaignCellLabel('rendezvous',8,59)}。检查两舰移速和交叉航路后执行，避免相撞，两舰须保持完整耐久。`,['cl-2'],'两舰航速不同；等待、转向或分开航线都能避免碰撞。'),
 cp('split','双目标分火',`选择克利夫兰，确认两艘靶舰都在副炮射程与视野内，再执行回合，用自动副炮在同一回合分别击沉两个不同靶舰（每发 ${D['cl-2'].secondary!.damage}）。`,[],'同一回合两个目标均在射程与视线内，克利夫兰会分别开火。')]},
 {id:'torpedoes',title:'鱼雷穿越',description:'选择合适的发射窗口和发射角度，使用鱼雷消灭静止与移动敌舰；再学习多方向齐射和跨回合命中。',minutes:3,rows:CAMPAIGN_CHAPTER_ROWS[3],checkpoints:[
 cp('torpedo-start','起点窗口发射鱼雷','选择岛风，切到“鱼雷”，选发射窗口 0，向东侧发射一枚鱼雷，击沉静止靶舰。先确认发射角度：不能沿舰首或舰尾发射。',[],`岛风库存 ${D['dd-2'].torpedo!.reserve} 枚，每轮最多 ${D['dd-2'].torpedo!.max} 枚，每窗最多 ${D['dd-2'].torpedo!.perWindow} 个不同合法方向。不能朝舰首或舰尾发射。`),
 cp('torpedo-node','选择窗口与角度，鱼雷击沉移动靶','选择合适的发射窗口和发射角度，使用鱼雷消灭移动靶舰：先给岛风规划前进一步，再切到“鱼雷”选择窗口 1，从新节点向东发射，瞄准靶舰向南前进一步后的预告落点，然后执行回合。'),
 cp('torpedo-spread','同窗口多方向鱼雷齐射','选择岛风的鱼雷窗口 0，向东和西北两条不同航道各发射一枚鱼雷，再执行回合，击沉两个靶舰并避免友伤。'),
 cp('torpedo-persist','等待前轮鱼雷击沉远处靶舰','选择岛风的鱼雷窗口 0，向东发射一枚鱼雷并执行回合。第一轮结束后不要重复发射，继续执行下一回合，等待前轮鱼雷击沉远处目标。',[],`鱼雷每轮航速 ${D['dd-2'].torpedo!.speed}、寿命 ${D['dd-2'].torpedo!.life} 轮；已发射鱼雷不随指令清空。`)]},
 {id:'mines',title:'雷区与追兵',description:'Z35 接替岛风，学习清雷与断后。',minutes:3,rows:CAMPAIGN_CHAPTER_ROWS[4],checkpoints:[
 cp('contact-sweep','接触排雷','选择 Z35，规划向前一步并执行，让驱逐的接触排雷自动清除航线上标示的水雷，同时保持完整耐久。',['dd-1']),
 cp('remote-sweep','副炮远程清雷','选择克利夫兰，切到“排雷”，点击标示水雷并执行回合，使用副炮远程清雷。注意：本轮全部副炮机会被清雷占用。'),
 cp('lay-mine','未武装到触雷',`选择 Z35，先规划连续前进两步，再选择“第 1 步布雷”并执行，在第一步起点留下未武装水雷。下一轮继续执行，让向东追赶的靶舰触碰已武装水雷。库存 ${D['dd-1'].minelayer!.reserve} 枚，每轮最多 ${D['dd-1'].minelayer!.max} 枚。`,[],'布雷步骤必须实际前进，未到达不扣库存；新雷下一轮武装，追兵为无武装训练重巡。')]},
 {id:'artillery',title:'炮火支援',description:'三艘战列依次接替，比较装填、范围与速射。',minutes:4,rows:CAMPAIGN_CHAPTER_ROWS[5],checkpoints:[
 cp('north-carolina','单发、装填、三发叠点',`选择北卡的“主炮”，先在北侧低耐久靶舰落点点击一次并执行。空过下一轮完成装填后，在另一艘高耐久靶舰落点点击三次并执行，用 ${D['bb-1'].main!.shots} 发叠点击沉另一艘高耐久靶舰。`,['bb-1'],'主炮射程按回合开始位置检查，炮弹在回合末落下；装填回合仍可移动或观察。'),
 cp('musashi','七格范围炮击',`选择武藏，切到“主炮”，点击三艘靶舰组成的靶群中心并执行，利用七格范围爆炸消灭靶群。中心 ${D['bb-2'].main!.damage*D['bb-2'].main!.centerMultiplier!}，邻格 ${D['bb-2'].main!.damage}；请避开友舰。`,['bb-2']),
 cp('richelieu','连续回合速射',`黎塞留每轮 ${D['bb-3'].main!.shots} 发、单发 ${D['bb-3'].main!.damage}、无装填空窗。选择黎塞留的“主炮”，瞄准靶舰本轮向东前进一步后的落点，连续两个回合各安排两发并执行，击沉移动靶。`,['bb-3'])]},
 {id:'fog',title:'迷雾中的敌人',description:'阿卡司塔与海伦娜接替前排，理解烟幕与雷达。',minutes:3,rows:CAMPAIGN_CHAPTER_ROWS[6],checkpoints:[
 cp('smoke','烟幕掩护','选择阿卡司塔，点击“释放烟幕”后执行回合，观察烟幕掩护使敌方失去接触。随后继续执行回合，等待烟幕自然结束；释放烟幕当轮不能发射鱼雷。',['dd-3','cl-3'],`烟幕半径 ${D['dd-3'].smoke!.radius}，持续 ${D['dd-3'].smoke!.duration} 轮；烟幕中视野缩短，释放烟幕不能同轮发射鱼雷。`),
 cp('radar','雷达反隐','先选择海伦娜，切到“雷达扫描”，点击敌方烟幕中的标示格并执行，以雷达发现靶舰。下一回合选择北卡，用主炮瞄准该靶舰并执行，完成击沉。',[],`海伦娜雷达 ${D['cl-3'].radar!.charges} 次；雷达占用本轮副炮，无法消除岛屿对副炮的遮挡。`)]},
 {id:'vanguard',title:'前卫突破',description:'三种重巡各有独立实战。',minutes:4,rows:CAMPAIGN_CHAPTER_ROWS[7],checkpoints:[
 cp('guard','欧根封锁与减伤',`选择欧根亲王，点击“海域封锁”后执行，原地截停来袭靶舰，同时承受预告鱼雷与主炮，验证鱼雷减伤 ${D['ca-1'].guard!.torpedoReduction*100}%、炮击减伤 ${D['ca-1'].guard!.gunReduction!*100}%。`,['ca-1']),
 cp('escort','巴尔的摩护航',`选择已邻接北卡的巴尔的摩，点击“邻接护航”后执行回合，保护北卡，实际减少来袭主炮伤害 ${D['ca-2'].escort!.reduction*100}%；护航时最多移动 ${D['ca-2'].escort!.steps} 步。`,['ca-2']),
 cp('advance-salvo','旧金山推进齐射','选择旧金山，规划连续前进两步并执行回合，移动结束后由突击副炮对同一靶舰自动进行两次齐射，完成击沉。原地转向不计前进次数。',['ca-3'],'原地转向不计前进次数；齐射在移动结束后判定射程。')]},
 {id:'air',title:'争夺制空权',description:'五舰就位，亲手完成四机型与防空。',minutes:6,rows:CAMPAIGN_CHAPTER_ROWS[8],checkpoints:[
 cp('scout','侦察与回收','选择香格里拉，切到“飞机”并选“侦察机”，点击北方标示侦察点后执行，发现远处靶舰。飞机出动后给母舰规划前进一步并执行，再继续回合，等待飞机回到移动后的母舰并完成整备。',['cv-3'],'侦察机没有炸弹。直线航线按起飞位置与目标点决定，回航追随移动后的母舰。'),
 cp('bomber','普通轰炸机',`选择香格里拉，切到“飞机”并选“普通轰炸机”，向标示靶舰下达轰炸指令后执行，实际投弹（${AIRCRAFT.bomber.damage} 伤害），并等到回收、${AIRCRAFT.bomber.rearm} 轮整备结束。`),
 cp('aa','双层防空','选择圣地亚哥，检查预告敌机航线经过外层与内层防空范围，再执行回合。防空自动开火，无需手动点敌机；观察两层防空共同击落飞机。',['cl-1'],`外层半径 ${D['cl-1'].aa!.range}、内层半径 ${D['cl-1'].aa!.inner!.range}；各层各攻击一次。`),
 cp('fighter','战斗机巡逻','选择埃塞克斯，切到“飞机”并选“战斗机”，点击北方标示拦截点安排巡逻，再执行回合，等待战斗机自动空战击落敌机。',['cv-2'],'战斗机与轰炸机共享每轮两个放飞名额；巡逻点停留后自动返航。'),
 cp('heavy','企业强袭机',`选择企业，切到“飞机”并选“强袭机”，向标示靶舰下达轰炸指令后执行。强袭机 ${AIRCRAFT.heavy.hp} HP、${AIRCRAFT.heavy.damage} 伤害；完成投弹、回收与 ${AIRCRAFT.heavy.rearm} 轮整备。`,['cv-1'])]},
 {id:'blockade',title:'最后的封锁线',description:'选择 3 前排＋2 后排，部署五舰并协同突破。敌方训练耐久为正式最大值的 60%。',minutes:5,rows:CAMPAIGN_CHAPTER_ROWS[9],checkpoints:[
 cp('final','击败封锁舰队','确认 3 艘前排＋2 艘后排，在本段南侧蓝色海域调整五舰部署，点击“完成部署”。随后用航线、主炮、鱼雷和飞机协同歼灭敌方全部舰船，允许任意合法战术。',[],'正式对局全灭或第 30 回合结束，先比较存活舰数，再比较总耐久。战役主目标要求真实击败全部敌舰。')]},
];
// Display names and chapter bands share the geometry defined in layout.ts.
for(const chapter of CAMPAIGN_CHAPTERS){
 chapter.title=displayCatalogText(chapter.title);chapter.description=displayCatalogText(chapter.description);
 for(const checkpoint of chapter.checkpoints){checkpoint.title=displayCatalogText(checkpoint.title);checkpoint.instruction=displayCatalogText(checkpoint.instruction);checkpoint.hints=checkpoint.hints.map(displayCatalogText);}
}
const toolUnlocks:Record<string,string[]>={forward:['move'], 'torpedo-start':['torp'], 'contact-sweep':['mine'], 'lay-mine':['minelayer'], 'north-carolina':['main'], smoke:['smoke'],radar:['radar'],guard:['guard'],escort:['escort'],scout:['plane']};
const targetCells:Record<string,[number,number][]>={
 forward:[[7,69]],turn:[[7,68]],exit:[[6,68]],rendezvous:[[4,59],[8,59]],
 'torpedo-start':[[8,55]],'torpedo-node':[[9,54]],'torpedo-spread':[[8,55],[4,52]],'torpedo-persist':[[9,55]],
 'contact-sweep':[[6,49]],'remote-sweep':[[7,49]],'lay-mine':[[5,49]],
 'north-carolina':[[2,37],[5,37]],musashi:[[2,37],[3,37],[2,36]],
 radar:[[9,35]],'advance-salvo':[[8,28]],scout:[[2,13]],bomber:[[4,16]],heavy:[[4,16]],fighter:[[4,17]],
};
const emphasis:Record<string,Record<string,string[]>>={
 forward:{'dd-2':['speed']},turn:{'dd-2':['speed']},exit:{'dd-2':['speed']},
 secondary:{'dd-2':['secondary','vision']},memory:{'dd-2':['vision','speed']},
 rendezvous:{'dd-2':['speed'],'cl-2':['speed']},split:{'cl-2':['secondary']},
 'torpedo-start':{'dd-2':['torpedo']},'torpedo-node':{'dd-2':['torpedo','speed']},'torpedo-spread':{'dd-2':['torpedo']},'torpedo-persist':{'dd-2':['torpedo']},
 'contact-sweep':{'dd-1':['contact-sweep','hp']},'remote-sweep':{'cl-2':['secondary']},'lay-mine':{'dd-1':['minelayer']},
 'north-carolina':{'bb-1':['main','reload']},musashi:{'bb-2':['main']},richelieu:{'bb-3':['main','reload']},
 smoke:{'dd-3':['smoke','vision']},radar:{'cl-3':['radar'],'bb-1':['main']},
 guard:{'ca-1':['guard']},escort:{'ca-2':['escort'],'bb-1':['hp']},'advance-salvo':{'ca-3':['advance-salvo','speed']},
 scout:{'cv-3':['scout','speed']},bomber:{'cv-3':['bomber']},aa:{'cl-1':['aa']},fighter:{'cv-2':['fighter']},heavy:{'cv-1':['heavy']},
 final:{'*':['fleet']},
};
const controls:Record<string,string[]>={
 forward:['move-mode','forward','execute'],turn:['move-mode','turn-left','turn-right','forward','execute'],exit:['move-mode','redraw-movement','execute'],
 secondary:['move-mode','ranges','execute'],memory:['move-mode','ranges','execute'],rendezvous:['move-mode','execute'],split:['ranges','execute'],
 'torpedo-start':['torp-mode','execute'],'torpedo-node':['move-mode','torp-mode','execute'],'torpedo-spread':['torp-mode','execute'],'torpedo-persist':['execute'],
 'contact-sweep':['move-mode','forward','execute'],'remote-sweep':['mine-mode','execute'],'lay-mine':['move-mode','minelayer','execute'],
 'north-carolina':['main-mode','execute'],musashi:['main-mode','execute'],richelieu:['main-mode','execute'],smoke:['smoke','execute'],radar:['radar','main-mode','execute'],
 guard:['guard','execute'],escort:['escort','execute'],'advance-salvo':['move-mode','forward','execute'],
 scout:['plane-mode','scout','execute'],bomber:['plane-mode','bomber','execute'],aa:['ranges','execute'],fighter:['plane-mode','fighter','execute'],heavy:['plane-mode','heavy','execute'],final:['begin','execute'],
};
for(const chapter of CAMPAIGN_CHAPTERS)for(const checkpoint of chapter.checkpoints){checkpoint.unlocks.push(...(toolUnlocks[checkpoint.id]??[]));checkpoint.targets=targetCells[checkpoint.id]?.map(([c,r])=>campaignCell(checkpoint.id,c,r));}
for(const chapter of CAMPAIGN_CHAPTERS)for(const checkpoint of chapter.checkpoints){checkpoint.emphasis=emphasis[checkpoint.id];checkpoint.controls=controls[checkpoint.id];}
export function campaignCheckpoint(state:CampaignState):CampaignCheckpoint{return CAMPAIGN_CHAPTERS[state.chapter]?.checkpoints[state.checkpoint]??CAMPAIGN_CHAPTERS[9].checkpoints[0]}
export const campaignFocus=(state:CampaignState)=>({...campaignCheckpoint(state).focus});
