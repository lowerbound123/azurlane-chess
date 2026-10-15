/** Minimal skeleton contract shared by profile helpers and browser rendering. */
export interface SkeletonData {
 version?:string;
 animations:{name:string;duration?:number}[];
 findAnimation(name:string):unknown;
 findSkin(name:string):unknown;
}
