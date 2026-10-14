import {defineStore} from 'pinia';
import {ref} from 'vue';
import type {BattleMode} from '../../shared/domination.ts';
import type {OnlineState} from '../../shared/network.ts';
import {createBattleState} from './battle-state.ts';
import {catalogFleet} from '../ship-catalog.ts';
export const useOnlineGameStore=defineStore('online-game',()=>({...createBattleState(),onlineBattleMode:ref<BattleMode>('annihilation'),onlineState:ref<OnlineState|null>(null),matchId:ref<string|null>(null),onlinePending:ref(false),aiFleet:ref<string[]>(catalogFleet()),aiMode:ref<'standard'|'full'>('standard')}));
