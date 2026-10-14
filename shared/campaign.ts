import type {Game,Plans,Hex} from './game.ts';

export interface CampaignState {
 version:number;chapter:number;checkpoint:number;
 status:'playing'|'checkpoint-complete'|'failed'|'complete';
 completed:string[];hintLevel:number;attempts:number;evidence:Record<string,number|boolean>;
 feedback?:string;
}
export interface CampaignFixture {game:Game;plans:Plans;selected:string}
export interface CampaignCheckpoint {id:string;title:string;instruction:string;hints:string[];focus:Hex;targets?:Hex[];unlocks:string[]}
export interface CampaignChapter {id:string;title:string;description:string;minutes:number;rows:[number,number];checkpoints:CampaignCheckpoint[]}
export interface CampaignSave extends CampaignFixture {state:CampaignState;fleet?:string[];checkpointExplored?:string[][]}
