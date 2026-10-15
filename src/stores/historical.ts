import {defineStore} from 'pinia';
import {ref} from 'vue';
import type {HistoricalState} from '../../shared/history.ts';
import {createBattleState} from './battle-state.ts';

export const useHistoricalStore=defineStore('historical',()=>({
 ...createBattleState(),historical:ref<HistoricalState|null>(null),historicalNotice:ref(''),historicalRevision:ref(0),
}));
