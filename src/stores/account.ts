import {defineStore} from 'pinia';
import {ref} from 'vue';
import type {AccountState} from '../../shared/network.ts';
export const useAccountStore=defineStore('account',()=>({accountState:ref<AccountState>({enabled:false,loaded:false,user:null})}));
