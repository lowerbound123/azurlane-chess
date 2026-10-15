import type {AbilityDemoSpec,DemoBeat} from './scenarios.ts';
import type {Plans} from '../../shared/game.ts';
import {demoShip as ship,demoGame as game,demoPlan as plan,demoBase as base} from './support.ts';
import {updateExploration,fromCR} from '../engine.ts';
const move={turn:0,forward:true};
const beat=(start:number,end:number,round:number,from:number,to:number,title:string,detail:string,extra:Partial<DemoBeat>={}):DemoBeat=>({start,end,round,from,to,viewer:0,title,detail,...extra});
export function buildRemainingDemo(id:string):AbilityDemoSpec|null {
 if(id==='dd-1'){
  const a=ship(id,0,0,3,5),target=ship('cv-1',1,0,2,6);target.heading=5;const g=game([a,target]);
  return {...base,id,name:a.label,ability:'航迹布雷',duration:12,posterTime:8,game:g,orders:[{'0-0':plan({moves:[move,move],mineSteps:[1,2]})},{'1-0':plan({moves:[move]})}],beats:[
   beat(0,2,0,-.01,-.01,'沿航迹布雷 · 库存六枚','本回合完成两次前进，在身后留下两枚水雷',{preview:true}),
   beat(2,5.5,0,0,1.1,'本回合布设 · 下回合武装','每回合最多布设两枚；灰色水雷尚未武装'),
   beat(5.5,10,1,0,1.2,'第二回合 · 水雷命中 40','敌舰驶入已武装雷区；未触发的水雷继续留在海面'),
   beat(10,12,1,1.2,1.2,'封锁航路 · 预判敌舰走向','库存 6 → 4；有接触排雷能力的舰船可以清除水雷') ]};
 }
 if(id==='dd-2'){
  const a=ship(id,0,0,4,5),g=game([a,ship('cv-1',1,0,4,8),ship('cv-1',1,1,1,8),ship('cv-1',1,2,4,2),ship('cv-1',1,3,7,2)]);
  return {...base,id,name:a.label,ability:'四向鱼雷齐射',duration:10,posterTime:4.3,game:g,orders:[{'0-0':plan({torps:[1,2,4,5].map(dir=>({window:0,dir}))})}],beats:[
   beat(0,2,0,-.01,-.01,'四个合法侧向 · 同窗口齐射','舰首与舰尾不能发射；同一窗口不能重复同一射向',{preview:true}),
   beat(2,7.5,0,0,1.2,'四枚鱼雷 · 每枚伤害 40','鱼雷各沿一条直线前进；本回合最多四枚'),
   beat(7.5,10,0,1.2,1.2,'库存 8 → 4 · 封锁多条航路','用不同射向逼迫敌舰选择航线，不是同向四连发') ]};
 }
 if(id==='cl-1'){
  const a=ship(id,0,0,4,5),enemy=ship('cv-2',1,0,9,5),g=game([a,enemy]);
  return {...base,focus:fromCR(7,5),id,name:a.label,ability:'双层防空',duration:10,posterTime:5.8,game:g,orders:[{'1-0':plan({planes:[{slot:4,mode:'point',target:a.pos}]})}],aaRange:true,beats:[
   beat(0,2,0,-.01,-.01,'三格外圈 · 一格内圈','一架 2 HP 轰炸机正在接近防空区域',{preview:true}),
   beat(2,7,0,0,.9,'外圈扣 1 · 内圈再扣 1','双层防空在投弹前击落来袭轰炸机'),
   beat(7,10,0,1.1,1.1,'每层每轮对每架飞机各触发一次','不是持续扣血；注意用防空舰保护舰队航路') ]};
 }
 if(id==='cl-2'){
  const a=ship(id,0,0,4,5),g=game([a,ship('cv-1',1,0,6,4),ship('cv-2',1,1,6,6)]);
  return {...base,id,name:a.label,ability:'双目标副炮',duration:10,posterTime:3.1,game:g,orders:[{}],beats:[
   beat(0,2,0,-.01,-.01,'三格射程 · 两个不同目标','两艘敌舰同时进入副炮射程',{preview:true}),
   beat(2,6,0,0,.8,'分别命中 · 各造成 12 伤害','每回合最多攻击两艘不同敌舰'),
   beat(6,10,0,1.1,1.1,'用位置换取双目标火力','同一个目标不会因此承受两次副炮攻击') ]};
 }
 if(id==='cl-3'){
  const a=ship(id,0,0,2,5),enemy=ship('dd-3',1,0,7,5),ally=ship('bb-3',0,1,1,7),g=game([a,enemy,ally]);g.map.islands=['5,5'];updateExploration(g);
  return {...base,id,name:a.label,ability:'定点雷达',duration:14,posterTime:4,game:g,orders:[{'1-0':plan({smoke:true})},{'0-0':plan({radar:enemy.pos})},{'0-1':plan({main:[enemy.pos,enemy.pos]})},{}],beats:[
   beat(0,2,0,0,1.1,'岛后烟幕 · 敌舰不可见','先确认常规视野无法看穿岛屿与烟幕'),
   beat(2,5,1,0,1.1,'第二回合 · 扫描指定七格','六格是投放距离；雷达扫描范围是中心与周围六格'),
   beat(5,8,2,-.01,-.01,'第三回合 · 扫描仍在持续','发现目标后，友舰在下一轮规划炮击',{preview:true}),
   beat(8,11,2,0,1.9,'利用情报 · 炮击命中','雷达穿透岛屿与烟幕，占用释放轮的全部副炮'),
   beat(11,14,3,0,1.1,'第四回合 · 雷达消散','本轮与下一轮有效；雷达储备 3 → 2') ]};
 }
 if(id==='ca-1'){
  const a=ship(id,0,0,4,5),approach=ship('cv-1',1,0,7,5),gun=ship('bb-1',1,1,0,5),torp=ship('dd-3',1,2,4,1);approach.heading=3;
  const g=game([a,approach,gun,torp]);
  return {...base,id,name:a.label,ability:'海域封锁',duration:16,posterTime:9,game:g,orders:[{'0-0':plan({guard:true,moves:[move]}),'1-0':plan({moves:[move,move]}),'1-1':plan({main:[a.pos]}),'1-2':plan({torps:[{window:0,dir:1}]})}],beats:[
   beat(0,2,0,-.01,-.01,'驻守海域 · 放弃移动与转向','锁住周围六格；敌舰进入相邻格后被拦停',{preview:true}),
   beat(2,7,0,0,1.05,'封锁航路 · 鱼雷 45 → 18','真实鱼雷命中驻守舰，自身鱼雷伤害减少 60%'),
   beat(7,12,0,1.05,1.9,'主炮减伤 · 60 → 42','驻守时自身主炮与副炮伤害减少 30%'),
   beat(12,16,0,1.95,1.95,'用机动换取控制与生存','同一段真实结算展示拦停、鱼雷减伤和炮击减伤') ]};
 }
 if(id==='ca-2'){
  const a=ship(id,0,0,3,5),ally=ship('cv-1',0,1,5,5),gun=ship('bb-1',1,0,1,1),carrier=ship('cv-2',1,1,9,5),g=game([a,ally,gun,carrier]);
  return {...base,focus:fromCR(7,5),id,name:a.label,ability:'舰队护航',duration:14,posterTime:7.7,game:g,orders:[{'0-0':plan({escort:true,moves:[move,move]}),'1-0':plan({main:[{q:4,r:5},ally.pos]}),'1-1':plan({planes:[{slot:4,mode:'point',target:ally.pos}]})}],beats:[
   beat(0,2,0,-.01,-.01,'护航移动 · 本回合最多一步','前进后靠近友舰，保护邻接的其他友方舰船',{preview:true}),
   beat(2,6,0,0,.75,'航空炸弹 · 友舰 25 → 18','护航对友舰提供 30% 减伤，伤害逐次四舍五入'),
   beat(6,10,0,.75,1.9,'同轮炮击 · 友舰 42，自身 60','护航只保护其他友舰；自己不会获得这份减伤'),
   beat(10,14,0,1.95,1.95,'保护邻舰 · 分配舰队站位','仅减免主炮与航空炸弹伤害；多个护航不叠加') ]};
 }
 if(id==='ca-3'){
  const a=ship(id,0,0,3,5),g=game([a,ship('cv-1',1,0,7,5)]),orders:Plans[]=[{'0-0':plan({moves:[move,move]})}];
  return {...base,id,name:a.label,ability:'突击副炮',duration:12,posterTime:4.3,game:g,orders,experiments:{partial:{label:'示例 B · 独立对照',game:structuredClone(g),orders:[{'0-0':plan({moves:[move,{turn:1,forward:false}]})}]}},beats:[
   beat(0,1,0,-.01,-.01,'示例 A · 完成两次前进','副炮在移动结束后统一结算',{preview:true}),
   beat(1,5,0,0,1.8,'示例 A · 两次命中 2 × 16','实际完成两次前进，获得一次额外副炮攻击'),
   beat(5,6,0,1.9,1.9,'示例 A · 合计 32 伤害','下面切换至相同初始局面的独立对照'),
   beat(6,7,0,-.01,-.01,'示例 B · 一次前进加转向','场景已重置；原地转向不计入前进次数',{experiment:'partial',preview:true}),
   beat(7,10,0,0,1.8,'示例 B · 仅命中 1 × 16','一次前进不足以触发额外攻击',{experiment:'partial'}),
   beat(10,12,0,1.9,1.9,'两步 32 · 一步加转向 16','等待、转向和未完成的计划步数都不算前进',{experiment:'partial'}) ]};
 }
 if(id==='bb-1'){
  const a=ship(id,0,0,1,5),target=ship('cv-1',1,0,6,5),g=game([a,target]),main=[target.pos,target.pos,target.pos];
  return {...base,id,name:a.label,ability:'三联装主炮',duration:12,posterTime:5.3,game:g,orders:[{'0-0':plan({main})},{'0-0':plan({main})},{}],beats:[
   beat(0,2,0,-.01,-.01,'九格射程 · 三发主炮','静止靶场中三发均瞄准同一格',{preview:true}),
   beat(2,6,0,0,1.9,'三发各 60 · 合计 180','命中按同一轮主炮结果合并显示；移动敌舰可能避开'),
   beat(6,7,0,1.95,1.95,'炮击完成 · 进入装填','额外装填一回合，下一轮无法再次开炮'),
   beat(7,9,1,0,1.1,'第二回合 · 主炮装填中','即使提交炮击，也不会发射新的炮弹'),
   beat(9,12,2,-.01,-.01,'第三回合 · 主炮再次就绪','保留移动和副炮，安排下一轮远程打击') ]};
 }
 if(id==='bb-3'){
  const a=ship(id,0,0,1,5),target=ship('cv-1',1,0,6,5),g=game([a,target]),main=[target.pos,target.pos];
  return {...base,id,name:a.label,ability:'快速装填主炮',duration:10,posterTime:3.7,game:g,orders:[{'0-0':plan({main})},{'0-0':plan({main})}],beats:[
   beat(0,1,0,-.01,-.01,'七格射程 · 两发各 40','额外装填零回合，可以连续两轮开火',{preview:true}),
   beat(1,5,0,0,1.9,'第一回合 · 两发合计 80','两发炮弹在本回合正常落点结算'),
   beat(5,8.5,1,0,1.9,'第二回合 · 再次命中 80','这是下一回合的第二次齐射，不是同轮四连发'),
   beat(8.5,10,1,1.95,1.95,'持续火力 · 每轮重新预判落点','两轮共 160 伤害，射程比九格主炮更短') ]};
 }
 if(id==='cv-1'){
  const a=ship(id,0,0,2,5),target=ship('cl-1',1,0,5,5),g=game([a,target]);g.map.mines=[{q:6,r:6}];updateExploration(g);
  return {...base,id,name:a.label,ability:'强袭航空队',duration:18,posterTime:5.6,game:g,orders:[{'0-0':plan({planes:[0,1].map(slot=>({slot,mode:'point' as const,target:target.pos}))}),'1-0':plan({sweep:{q:6,r:6}})},{},{},{}],beats:[
   beat(0,2,0,-.01,-.01,'四架强袭机 · 每轮放飞两架','每架 3 HP；敌方防空舰此轮正在执行清雷任务',{preview:true}),
   beat(2,8,0,0,1.1,'穿过双层防空 · 每架轰炸 35','先后承受两次 1 点防空后仍能投弹；两架合计 70'),
   beat(8,11,1,1.2,1.2,'第二回合 · 飞机已经回收','返航完成后还需要等待整备，不能立即重飞'),
   beat(11,14,2,1.2,1.2,'快进至第三回合 · 继续整备','强袭机整备两回合；整备完成时回复 1 HP'),
   beat(14,18,3,1.2,1.2,'第四回合 · 两架强袭机再次就绪','耐久与轰炸更强，但整备比普通轰炸机更久') ]};
 }
 if(id==='cv-3'){
  const a=ship(id,0,0,1,5),target=ship('bb-1',1,0,9,5),g=game([a,target]);
  return {...base,focus:fromCR(7,5),id,name:a.label,ability:'侦察与打击',duration:16,posterTime:4.8,game:g,orders:[{'0-0':plan({planes:[{slot:0,mode:'point',target:target.pos}]})},{'0-0':plan({planes:[{slot:2,mode:'target',targetId:target.id}]})},{},{}],beats:[
   beat(0,2,0,-.01,-.01,'两架侦察机 · 四架轰炸机','先派侦察机发现远处目标，此时敌舰不可见',{preview:true}),
   beat(2,6,0,0,1,'侦察机前出 · 展开五格视野','1 HP、航速 8、航程 16；侦察机不能投弹'),
   beat(6,8,1,-.01,-.01,'第二回合 · 选择已发现目标','发现目标后，下一轮规划才新增锁定攻击指令',{preview:true}),
   beat(8,11,1,0,1.1,'轰炸机出击 · 侦察机返航','混合机队共享每轮两架的放飞额度'),
   beat(11,14,2,0,1.1,'第三回合 · 轰炸命中 25','轰炸机执行打击；侦察机提供发现目标的机会'),
   beat(14,16,3,0,1.1,'返航回收 · 规划下一次侦察','情报与火力分工，保持对远处海域的控制') ]};
 }
 return null;
}
