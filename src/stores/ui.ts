import {defineStore} from 'pinia';
import {ref} from 'vue';
import type {SaveRecord} from '../../shared/save.ts';
export type PendingSave={kind:'write';id:string;label:string;message:string}|{kind:'load';id:string;message:string}|{kind:'import';id:string;json:string;message:string}|{kind:'new';start?:boolean;message:string};
export type OrderMode='move'|'torp'|'main'|'plane'|'mine'|'radar';
export const useUIStore=defineStore('ui',()=>({connectionOpen:ref(false),disconnectOpen:ref(false),accountModal:ref(false),mode:ref<OrderMode>('move'),pendingTurn:ref(0),torpWindow:ref(0),planeMode:ref<'point'|'target'>('point'),airRole:ref<import('../../shared/game.ts').AirRole>('bomber'),showRules:ref(false),toast:ref(''),playSpeed:ref(1),showLog:ref(false),showRanges:ref(true),rangeMode:ref('auto'),replan:ref(false),showPlans:ref(true),saveOpen:ref(false),saveRecords:ref<SaveRecord[]>([]),saveNotice:ref(''),pendingSave:ref<PendingSave|null>(null),saveStatus:ref(''),mapZoom:ref(1),cameraRotate:ref(false),ordersOpen:ref(true),rangeToolsOpen:ref(false),portraitHint:ref(true),swapMode:ref(false),coachOpen:ref(false),overlayDepth:ref(0)}));
