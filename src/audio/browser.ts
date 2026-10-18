import type {AssetClient} from '../assets/client.ts';
import type {AudioBackend,SoundChannel} from './player.ts';
import type {AssetResolution} from '../../shared/assets.ts';

/** Stream the long BGM; decode only short, requested voices/effects into a bounded cache. */
export class BrowserAudioBackend implements AudioBackend<AudioBuffer> {
 private context:AudioContext|null=null;private voiceGain:GainNode|null=null;private effectGain:GainNode|null=null;
 private bgm:HTMLAudioElement|null=null;private currentMusic:string|undefined;private musicToken=0;private musicStage=0;private recovering=false;
 private musicResolution:Record<string,AssetResolution>={};private unlocked=false;private disposed=false;
 private voiceMuted=false;private musicMuted=false;
 private buffers=new Map<string,AudioBuffer>();private pending=new Map<string,Promise<AudioBuffer>>();private bufferBytes=0;
 private playing={voice:new Set<AudioBufferSourceNode>(),effect:new Set<AudioBufferSourceNode>()};
 private readonly Context=typeof window==='undefined'?undefined:window.AudioContext??(window as unknown as {webkitAudioContext?:typeof AudioContext}).webkitAudioContext;
 constructor(private readonly assets:AssetClient){}
 get ready(){return !this.disposed&&this.context?.state==='running';}
 async unlock(){
  if(this.disposed||!this.Context)return;
  this.unlocked=true;
  if(!this.context){
   this.context=new this.Context({sampleRate:48000});
   this.voiceGain=this.context.createGain();this.voiceGain.gain.value=this.voiceMuted?0:.9;this.voiceGain.connect(this.context.destination);
   this.effectGain=this.context.createGain();this.effectGain.gain.value=.32;this.effectGain.connect(this.context.destination);
  }
  // Call play synchronously from the real gesture, before awaiting context.resume().
  this.playMusic();
  if(this.context.state!=='running'&&this.context.state!=='closed')await this.context.resume();
 }
 async load(id:string):Promise<AudioBuffer>{
  const cached=this.buffers.get(id);if(cached){this.buffers.delete(id);this.buffers.set(id,cached);return cached;}
  const pending=this.pending.get(id);if(pending)return pending;
  const context=this.context;if(!context||this.disposed)throw Error('Audio is not unlocked');
  const request=this.assets.load([id],async urls=>{
   const response=await fetch(urls[id],{signal:AbortSignal.timeout(8000)});if(!response.ok)throw Error('Audio unavailable');
   return context.decodeAudioData(await response.arrayBuffer());
  }).then(buffer=>{
   if(this.disposed)throw Error('Audio disposed');
   this.buffers.set(id,buffer);this.bufferBytes+=buffer.length*buffer.numberOfChannels*4;
   while(this.buffers.size>32||this.bufferBytes>24*1024*1024){const first=this.buffers.entries().next().value;if(!first)break;this.buffers.delete(first[0]);this.bufferBytes-=first[1].length*first[1].numberOfChannels*4;}
   return buffer;
  }).finally(()=>this.pending.delete(id));
  this.pending.set(id,request);return request;
 }
 play(channel:SoundChannel,buffer:AudioBuffer,_id:string){
  if(!this.ready||channel==='voice'&&this.voiceMuted)return;
  const sources=this.playing[channel],limit=channel==='voice'?8:12;
  if(sources.size>=limit){const oldest=sources.values().next().value;oldest?.stop();if(oldest)sources.delete(oldest);}
  const source=this.context!.createBufferSource();source.buffer=buffer;source.connect(channel==='voice'?this.voiceGain!:this.effectGain!);
  sources.add(source);source.onended=()=>{sources.delete(source);source.disconnect();};source.start();
 }
 music(id:string|undefined){
  if(this.disposed||this.currentMusic===id)return;
  this.currentMusic=id;const token=++this.musicToken;this.musicStage=0;this.recovering=false;
  if(!this.Context)return;
  if(!this.bgm){this.bgm=new Audio();this.bgm.loop=true;this.bgm.preload='auto';this.bgm.volume=.16;this.bgm.muted=this.musicMuted;}
  this.bgm.pause();
  if(!id){this.bgm.removeAttribute('src');this.bgm.load();return;}
  void this.assets.resolve([id]).then(resolution=>{
   if(this.disposed||token!==this.musicToken)return;this.musicResolution=resolution;this.applyMusic(resolution[id].url,token);
  }).catch(()=>{if(!this.disposed&&token===this.musicToken)this.applyMusic(this.assets.local(id).url,token);});
 }
 private applyMusic(url:string,token:number){
  if(!this.bgm||token!==this.musicToken||this.disposed)return;
  this.bgm.onerror=()=>{void this.recoverMusic(token);};
  this.bgm.oncanplay=()=>this.playMusic();this.bgm.src=url;this.bgm.load();this.playMusic();
 }
 private playMusic(){
  if(!this.bgm?.src||this.disposed||!this.unlocked&&!this.musicMuted)return;
  const token=this.musicToken;
  void this.bgm.play().catch(error=>{if(error?.name!=='NotAllowedError'&&error?.name!=='AbortError')void this.recoverMusic(token);});
 }
 private async recoverMusic(token:number){
  const id=this.currentMusic;if(!id||this.disposed||token!==this.musicToken||this.recovering||this.musicStage>=2)return;
  this.recovering=true;
  try{
   let next:string;
   if(this.musicStage++===0&&this.musicResolution[id]?.source==='remote'){
    const resolved=await this.assets.retry([id],this.musicResolution);
    next=resolved[id].url!==this.musicResolution[id].url?resolved[id].url:this.assets.local(id).url;
    this.musicResolution=resolved;
   }else next=this.assets.local(id).url;
   if(!this.disposed&&token===this.musicToken)this.applyMusic(next,token);
  }catch{if(!this.disposed&&token===this.musicToken)this.applyMusic(this.assets.local(id).url,token);}
  finally{if(token===this.musicToken)this.recovering=false;}
 }
 mute(channel:'music'|'voice',muted:boolean){
  if(channel==='music'){this.musicMuted=muted;if(this.bgm)this.bgm.muted=muted;this.playMusic();}
  else{this.voiceMuted=muted;if(this.voiceGain)this.voiceGain.gain.value=muted?0:.9;}
 }
 clear(channel:SoundChannel){for(const source of this.playing[channel]){try{source.stop();}catch{/* Already ended. */}}this.playing[channel].clear();}
 dispose(){
  this.disposed=true;this.musicToken++;this.clear('voice');this.clear('effect');
  if(this.bgm){this.bgm.onerror=null;this.bgm.oncanplay=null;this.bgm.pause();this.bgm.removeAttribute('src');this.bgm.load();}
  void this.context?.close().catch(()=>{});this.buffers.clear();this.pending.clear();this.bufferBytes=0;
 }
}
