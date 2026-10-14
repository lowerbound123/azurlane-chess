import {defineStore} from 'pinia';
import {ref} from 'vue';
import type {BattleMode} from '../../shared/domination.ts';
import {createBattleState} from './battle-state.ts';
import {catalogFleet} from '../ship-catalog.ts';
import {DEFAULT_ROSTER} from '../engine.ts';
export const useLocalGameStore=defineStore('local-game',()=>({...createBattleState(),battleMode:ref<BattleMode>('annihilation'),roster:ref([...DEFAULT_ROSTER]),selectedFleet:ref<string[]>(catalogFleet()),seed:ref(20261004),slot:ref(0)}));
