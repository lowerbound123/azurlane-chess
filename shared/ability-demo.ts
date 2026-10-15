export const ABILITY_DEMO_SHIP_IDS=['dd-1','dd-2','dd-3','cl-1','cl-2','cl-3','ca-1','ca-2','ca-3','bb-1','bb-2','bb-3','cv-1','cv-2','cv-3'] as const;
export type AbilityDemoShipId=typeof ABILITY_DEMO_SHIP_IDS[number];
export interface AbilityDemoCue {start:number;end:number;round:number;title:string;detail:string;experiment?:string}
export interface AbilityDemoMedia {shipId:string;name:string;ability:string;duration:number;width:number;height:number;fps:number;webm:string;mp4:string;poster:string;cues:AbilityDemoCue[]}
