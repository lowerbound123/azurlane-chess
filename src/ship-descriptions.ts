import type {ShipConfig} from '../shared/game.ts';
import {AIR_ROLE_LABELS} from './ship-definitions.ts';
export interface AbilityNote {topic:string;text:string}
export function abilityNotes(c:ShipConfig):AbilityNote[]{
 const a:AbilityNote[]=[];const add=(topic:string,text:string)=>a.push({topic,text});
 if(c.minelayer)add('minelayer',`布雷：${c.minelayer.reserve} 枚，每轮最多 ${c.minelayer.max} 枚，${c.minelayer.damage} 伤害；完成前进后在起点布设，下一轮武装。`);
 if(c.smoke)add('smoke',`烟幕：${c.smoke.charges} 次，覆盖自身及周围六格，持续本轮和下一轮；当轮不能发射鱼雷。区内舰船视野1格，仅邻接或雷达可发现。`);
 if(c.radar)add('radar',`雷达：${c.radar.charges} 次，射程 ${c.radar.range}，扫描七格两轮，穿透烟幕与岛屿，占用本轮全部副炮。`);
 if(c.escort)add('escort','护航：本轮最多一步，邻接其他友舰主炮与航空炸弹减伤30%，不叠加。');
 if(c.guard)add('guard',`海域封锁：放弃移动及转向，拦停邻接敌舰；自身鱼雷减伤60%${c.guard.gunReduction?'，主炮与副炮减伤30%':''}。`);
 if(c.secondary?.advanceSalvo)add('advance-salvo','突击副炮：移动结束后开火，实际完成两次前进则对同一目标 2×16，否则 1×16。');
 if(c.secondary?.targets)add('secondary',`副炮：每轮最多 ${c.secondary.targets} 个不同目标，每目标 ${c.secondary.damage} 伤害。`);
 if(c.aa?.inner)add('aa',`近程防空：${c.aa.range} 格 ${c.aa.damage} 伤害，${c.aa.inner.range} 格额外 ${c.aa.inner.damage} 伤害；每层每机每轮一次。`);
 if(c.main?.blast)add('main','范围炮：一发覆盖七格，中心120、邻格60，保留友伤；中心按射程验证，岛屿不挡爆炸。');
 if(c.torpedo?.perWindow)add('torpedo',`雷击齐射：每窗口最多 ${c.torpedo.perWindow} 个不同侧向，每轮最多 ${c.torpedo.max} 枚。`);
 if(c.carrier?.slots){for(const role of new Set(c.carrier.slots.map(x=>x.role!))){const slots=c.carrier.slots.filter(x=>x.role===role),p=slots[0];add(role,`${slots.length} 架${AIR_ROLE_LABELS[role]}：${p.hp} HP，速度${p.speed}，视野${p.vision}，航程${p.range}，${p.attack?'空战伤害'+p.attack.damage+'／射程'+p.attack.range:'炸弹'+p.damage}，整备${p.rearm}轮。`);}}
 return a;
}

export function abilityText(c:ShipConfig):string[]{return abilityNotes(c).map(note=>note.text);}
