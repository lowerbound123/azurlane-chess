import type {GameMap} from '../../shared/game.ts';
import {fromCR,key} from '../engine.ts';
/** One immutable coastline; every checkpoint receives its own mine field. */
const islands:string[]=[];
for(let r=0;r<72;r++)for(let c=0;c<13;c++){
 const edge=r>=68?(r===71?5:4):r>=58?1:0;
 if(c<edge||c>12-edge||
   (r>=63&&r<=65&&c===7)||
   (r>=30&&r<=35&&c===3)||
   (r>=30&&r<=32&&c===4)||
   (r>=3&&r<=5&&c===3)||
   (r>=1&&r<=3&&c===10))islands.push(key(fromCR(c,r)));
}
export const CAMPAIGN_MAP:GameMap={width:13,height:72,islands,mines:[]};
export const campaignMap=():GameMap=>structuredClone(CAMPAIGN_MAP);
export function matchesCampaignMap(map:GameMap){
 return map.width===CAMPAIGN_MAP.width&&map.height===CAMPAIGN_MAP.height&&map.islands.length===islands.length&&map.islands.every(h=>islands.includes(h));
}
