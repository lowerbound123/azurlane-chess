import type {Game,Ship} from '../../shared/game.ts';
import type {CampaignState} from '../../shared/campaign.ts';
import {effectiveSpeed,effectiveVision} from '../../shared/status.ts';
import {abilityNotes} from '../ship-descriptions.ts';
import {campaignCheckpoint} from './content.ts';

export interface CampaignEmphasis {catalogId:string;topic:string;label:string;text:string}
export function campaignEmphasis(state:CampaignState,game:Game):CampaignEmphasis[]{
 if(state.status!=='playing')return [];
 const result:CampaignEmphasis[]=[];
 function detail(s:Ship,topic:string):string|undefined{
  const c=s.cfg;
  if(topic==='speed')return `移速 ${effectiveSpeed(s,game.round)} 步／回合；前进、转向前进和原地转向都占一步。`;
  if(topic==='vision')return `视野 ${effectiveVision(s,game.round)} 格；当前视野显示舰船，已探索地形不会随离开而遗忘。`;
  if(topic==='hp')return `耐久 ${s.hp} / ${c.hp} HP；留意避碰、伤害与减伤效果。`;
  if(topic==='torpedo'&&c.torpedo)return `鱼雷 ${s.torps} 枚；每回合最多 ${c.torpedo.max} 枚，每窗口最多 ${c.torpedo.perWindow??1} 个不同侧向；速度 ${c.torpedo.speed} 格／回合，${c.torpedo.damage} 伤害，持续 ${c.torpedo.life} 回合。`;
  if(topic==='secondary'&&c.secondary)return `副炮每回合最多攻击 ${c.secondary.targets??1} 个不同目标，每目标 ${c.secondary.damage} 伤害，射程 ${c.secondary.range} 格；当前可见且无遮挡时自动开火。`;
  if(topic==='contact-sweep'&&c.contactSweep)return '接触排雷：实际前进到水雷所在格时自动清除，不承受该枚水雷伤害。';
  if(topic==='main'&&c.main)return `主炮射程 ${c.main.range} 格，每回合最多 ${c.main.shots} 发；${c.main.blast?`中心 ${c.main.damage*c.main.centerMultiplier!}、邻格 ${c.main.damage} 伤害`:`单发 ${c.main.damage} 伤害`}，在回合末命中指定落点。`;
  if(topic==='reload'&&c.main)return c.main.reload?`主炮开火后需空过 ${c.main.reload} 个完整回合装填；装填时仍可规划移动。`:'主炮无装填空窗，下一回合可以继续开火。';
  return abilityNotes(c).find(note=>note.topic===topic)?.text;
 }
 for(const [catalogId,topics] of Object.entries(campaignCheckpoint(state).emphasis)){
  if(catalogId==='*'){result.push({catalogId,topic:'fleet',label:'舰队协同',text:'3 艘前排＋2 艘后排；完成部署后分别规划，全舰同步执行，歼灭全部敌舰。'});continue;}
  const s=game.ships.find(s=>s.team===0&&s.catalogId===catalogId);if(!s)continue;
  for(const topic of topics){const text=detail(s,topic);if(text)result.push({catalogId,topic,label:s.label,text});}
 }
 return result;
}
