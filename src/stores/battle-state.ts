import {ref,shallowRef} from 'vue';
import type {Game,Plans,RoundResult,BattleFrame,PlanHistory,Hex,XY} from '../../shared/game.ts';
import type {ClientVisuals} from '../../shared/network.ts';
export type RenderFrame=BattleFrame&{visuals?:ClientVisuals;cameraFocus?:XY&{radius?:number}};
export function createBattleState(){return {game:ref<(Game&{visible?:string[]})|null>(null),plans:ref<Plans>({}),selected:ref('0-0'),busy:ref(false),playFrame:shallowRef<RenderFrame|null>(null),finished:shallowRef<RoundResult|null>(null),progress:ref(0),history:ref<Record<string,PlanHistory>>({}),lastMovement:ref<Record<string,{blocked:boolean;reason:string;steps:number;received:number}>>({}),hover:ref<Hex|null>(null),generation:ref(0)};}
