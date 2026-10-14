import {defineStore} from 'pinia';
import {ref,shallowRef} from 'vue';
import type {SaveState} from '../../shared/save.ts';
import type {CampaignState} from '../../shared/campaign.ts';
import {createBattleState} from './battle-state.ts';
import type {createTutorialGame,createTutorialState} from '../tutorial-content.ts';
export const useTutorialStore=defineStore('tutorial',()=>({...createBattleState(),tutorial:ref<ReturnType<typeof createTutorialState>|null>(null),tutorialFixture:shallowRef<ReturnType<typeof createTutorialGame>|null>(null),tutorialFeedback:ref(''),practiceSave:shallowRef<SaveState|null>(null),campaign:ref<CampaignState|null>(null),campaignNotice:ref(''),campaignTransit:ref(false),campaignOverview:ref(false),campaignViewChapter:ref<number|null>(null),campaignFleet:ref(['dd-2','cl-3','ca-1','bb-1','cv-3'])}));
