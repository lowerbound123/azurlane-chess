import {defineStore} from 'pinia';
import {ref} from 'vue';
import type {PublicConfig,ConnectionStatus} from '../../shared/network.ts';
export const useConnectionStore=defineStore('connection',()=>({onlineStatus:ref<ConnectionStatus>('disconnected'),onlineError:ref(''),onlineConfig:ref<PublicConfig>({models:[]}),connectionBusy:ref(false),disconnectBusy:ref(false),connectionWanted:ref(false),connectionNickname:ref('指挥官'),configLoading:ref(true),configStale:ref(true),startupComplete:ref(false)}));
