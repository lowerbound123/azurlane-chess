import type {RuntimeAudioCatalog,MusicTrack,VoiceAction} from '../../shared/audio.ts';
export type SoundChannel='voice'|'effect';
export interface AudioBackend<T> {
 readonly ready:boolean;unlock():Promise<void>;load(id:string):Promise<T>;play(channel:SoundChannel,buffer:T,id:string):void;
 music(id:string|undefined):void;mute(channel:'music'|'voice',muted:boolean):void;clear(channel:SoundChannel):void;dispose():void;
}
export class AudioPlayer<T> {
 private readonly now:()=>number;private readonly random:()=>number;
 private queue:{id:string}[]=[];private timer:ReturnType<typeof setTimeout>|undefined;
 private loading:object|null=null;private generation=0;private effectsGeneration=0;private lastVoice=-Infinity;private muted=false;private disposed=false;
 private effects=new Map<string,number>();
 constructor(private readonly catalog:RuntimeAudioCatalog,private readonly backend:AudioBackend<T>,options:{now?:()=>number;random?:()=>number}={}){
  this.now=options.now??(()=>performance.now());this.random=options.random??Math.random;
 }
 private pick<T>(items:readonly T[]):T|undefined{return items[Math.min(items.length-1,Math.max(0,Math.floor(this.random()*items.length)))];}
 voice(identity:string,action:VoiceAction):void{
  if(this.disposed||this.muted||!this.backend.ready||!Object.hasOwn(this.catalog.voices,identity))return;
  const id=this.pick(this.catalog.voices[identity][action]);if(!id)return;
  this.queue.push({id});void this.pump();
 }
 private async pump():Promise<void>{
  if(this.disposed||this.muted||!this.backend.ready||this.loading||!this.queue.length)return;
  const remaining=this.lastVoice+1000-this.now();
  if(remaining>0){if(!this.timer)this.timer=setTimeout(()=>{this.timer=undefined;void this.pump();},remaining);return;}
  const entry=this.queue[0],token=this.generation,ticket={};this.loading=ticket;
  try{
   const buffer=await this.backend.load(entry.id);
   if(this.disposed||this.muted||token!==this.generation||this.queue[0]!==entry)return;
   if(!this.backend.ready)return;
   this.queue.shift();this.backend.play('voice',buffer,entry.id);this.lastVoice=this.now();
  }catch{if(token===this.generation&&this.queue[0]===entry)this.queue.shift();}
  finally{if(this.loading===ticket)this.loading=null;if(!this.disposed)void this.pump();}
 }
 effect(cue:string):void{
  if(this.disposed||!this.backend.ready||!Object.hasOwn(this.catalog.effects,cue))return;
  const now=this.now();if(now-(this.effects.get(cue)??-Infinity)<80)return;this.effects.set(cue,now);
  const token=this.effectsGeneration,id=this.catalog.effects[cue];
  void this.backend.load(id).then(buffer=>{if(!this.disposed&&token===this.effectsGeneration&&this.backend.ready)this.backend.play('effect',buffer,id);}).catch(()=>{});
 }
 music(track:MusicTrack):void{if(!this.disposed)this.backend.music(this.catalog.music[track]);}
 victory(actors:{team:number;identity:string}[],team:number):void{
  const own=actors.filter(actor=>actor.team===team&&Object.hasOwn(this.catalog.voices,actor.identity)&&this.catalog.voices[actor.identity].victory.length);
  const actor=this.pick(own);if(actor)this.voice(actor.identity,'victory');
 }
 muteVoice(muted:boolean):void{this.muted=muted;this.backend.mute('voice',muted);if(muted)this.cancelVoices();}
 muteMusic(muted:boolean):void{this.backend.mute('music',muted);}
 async unlock():Promise<void>{if(this.disposed)return;try{await this.backend.unlock();void this.pump();}catch{/* A later real user gesture can unlock the browser. */}}
 private cancelVoices(){this.generation++;this.loading=null;this.queue=[];clearTimeout(this.timer);this.timer=undefined;this.backend.clear('voice');}
 clearBattle():void{this.cancelVoices();this.effectsGeneration++;this.backend.clear('effect');this.effects.clear();}
 dispose():void{if(this.disposed)return;this.disposed=true;this.clearBattle();this.backend.dispose();}
}
