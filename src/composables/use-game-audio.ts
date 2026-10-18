import {onUnmounted,ref,watch} from 'vue';
import {useEventListener} from '@vueuse/core';
import {assetClient,runtimeAssets} from '../assets/runtime.ts';
import {shipCharacterProfile} from '../ship-art.ts';
import {historicalSettlementShips} from '../history/settlement.ts';
import {AudioPlayer} from '../audio/player.ts';
import {BrowserAudioBackend} from '../audio/browser.ts';
import {battleAudioEvents,musicForPage,type AudioShip,type BattleAudioEvent} from '../audio/events.ts';
import type {RoundResult} from '../../shared/game.ts';
import type {SessionCore} from './session-core.ts';

const preferenceKey='azurlane-chess.audio.v1';
export function useGameAudio(core:SessionCore){
 let stored:{bgmMuted?:boolean;voiceMuted?:boolean}={};
 try{stored=JSON.parse(localStorage.getItem(preferenceKey)??'{}')??{};}catch{/* Browser storage can be unavailable. */}
 const bgmMuted=ref(stored.bgmMuted===true),voiceMuted=ref(stored.voiceMuted===true);
 const player=new AudioPlayer(runtimeAssets.audio??{music:{},voices:{},effects:{}},new BrowserAudioBackend(assetClient));
 player.muteMusic(bgmMuted.value);player.muteVoice(voiceMuted.value);
 const persist=()=>{try{localStorage.setItem(preferenceKey,JSON.stringify({bgmMuted:bgmMuted.value,voiceMuted:voiceMuted.value}));}catch{/* Preferences are optional. */}};
 const toggleBgm=()=>{bgmMuted.value=!bgmMuted.value;player.muteMusic(bgmMuted.value);persist();void player.unlock();};
 const toggleVoice=()=>{voiceMuted.value=!voiceMuted.value;player.muteVoice(voiceMuted.value);persist();void player.unlock();};
 useEventListener(window,'pointerdown',()=>{void player.unlock();},{capture:true,passive:true});
 useEventListener(window,'keydown',event=>{if(!event.repeat)void player.unlock();},{capture:true});
 let context='',result:RoundResult|null=null,events:BattleAudioEvent[]=[],cursor=0,finished=false,victory=false,wasEnded=false,lastRound=0;
 const lost=new Set<string>();
 const voice=(ship:AudioShip,action:'skill'|'lose')=>{
  if(ship.team!==core.myTeam.value)return;
  if(action==='lose'){if(lost.has(ship.id))return;lost.add(ship.id);}
  player.voice(shipCharacterProfile(ship,core.historical.value?.scenarioId),action);
 };
 const dispatch=(event:BattleAudioEvent)=>{if(event.channel==='voice')voice(event.ship,event.action);else player.effect(event.cue);};
 watch(()=>[core.router.currentRoute.value.fullPath,core.screen.value,core.game.value,core.finished.value,core.playFrame.value,core.myTeam.value,core.busy.value,core.campaignTransit.value,core.campaignOverview.value,core.campaign.value?.chapter,core.campaign.value?.checkpoint,core.audioEpoch.value] as const,()=>{
  const game=core.game.value,team=core.myTeam.value,route=core.router.currentRoute.value;
  player.music(musicForPage(core.screen.value,core.phase.value==='ended',core.campaignOverview.value,route.name==='draft'));
  const inBattle=!!(route.meta.battle&&game&&!core.campaignTransit.value);
  const nextContext=inBattle?`${route.path}:${game!.seed}:${team}:${core.campaign.value?.chapter??''}:${core.campaign.value?.checkpoint??''}:${core.audioEpoch.value}`:'';
  const restarted=inBattle&&game&&(wasEnded&&game.phase!=='ended'||game.round<lastRound);
  if(nextContext!==context||restarted){player.clearBattle();context=nextContext;result=null;events=[];cursor=0;finished=false;victory=false;lost.clear();}
  wasEnded=!!(inBattle&&game?.phase==='ended');lastRound=inBattle?game!.round:0;
  if(!inBattle||!game)return;
  const replay=core.finished.value;
  if(replay&&replay!==result){
   result=replay;events=battleAudioEvents(replay,game.ships,team);cursor=0;finished=false;
   // Retrying a checkpoint can restore a previously sunk actor without changing route.
   for(const ship of replay.frames[0]?.ships??[])if(ship.team===team&&ship.hp>0)lost.delete(ship.id);
  }
  if(replay&&core.playFrame.value){const time=core.playFrame.value.t;while(cursor<events.length&&events[cursor].time<=time+1e-8)dispatch(events[cursor++]);}
  else if(result&&!finished){
   // Skipping a replay still announces actual losses, but does not burst all skipped shots.
   for(const event of events.slice(cursor))if(event.channel==='voice'&&event.action==='lose')dispatch(event);
   finished=true;
  }
  if(!core.busy.value&&game.phase==='ended'&&game.winner===team&&!victory){
   victory=true;
   const roster=historicalSettlementShips(game.ships,core.historical.value,core.historicalDefinition.value);
   player.victory(roster.map(ship=>({team:ship.team,identity:shipCharacterProfile(ship,core.historical.value?.scenarioId)})),team);
  }
 },{flush:'post',immediate:true});
 onUnmounted(()=>player.dispose());
 return {bgmMuted,voiceMuted,toggleBgm,toggleVoice};
}
