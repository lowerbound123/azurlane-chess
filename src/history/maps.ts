import type {GameMap,Hex} from '../../shared/game.ts';
import {allHexes,fromCR,key,toCR,hexDist} from '../engine.ts';
export const sea=(width:number,height:number):GameMap=>({width,height,islands:[],mines:[]});
export function narvikMap():GameMap {
 const map=sea(19,25);
 map.islands=allHexes(map).filter(h=>{const {c,r}=toCR(h);const water=r>=20?c>=6&&c<=12:r>=17?c>=7&&c<=11:r>=11?c>=5&&c<=14:r>=7?c>=3&&c<=15:(c>=3&&c<=7)||(c>=11&&c<=15);return !water;}).map(key);
 return map;
}
export function rectangle(c0:number,c1:number,r0:number,r1:number):Hex[]{const cells:Hex[]=[];for(let r=r0;r<=r1;r++)for(let c=c0;c<=c1;c++)cells.push(fromCR(c,r));return cells;}
export function circle(map:GameMap,c:number,r:number,radius:number):Hex[]{return allHexes(map).filter(h=>hexDist(h,fromCR(c,r))<=radius&&!map.islands.includes(key(h)));}
