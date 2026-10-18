import {afterEach,expect,test,vi} from 'vitest';
import {AudioPlayer,type AudioBackend,type SoundChannel} from '../src/audio/player.ts';
import type {RuntimeAudioCatalog} from '../shared/audio.ts';
afterEach(()=>vi.useRealTimers());
const catalog:RuntimeAudioCatalog={music:{'main-menu':'home'},effects:{boom:'boom'},voices:{own:{skill:['skill-a','skill-b'],lose:['lose-a','lose-b'],victory:['win-a']},other:{skill:['other-skill'],lose:['other-lose'],victory:['other-win']}}};
function fixture(random=()=>0){
 vi.useFakeTimers();const played:{channel:string;id:string;time:number}[]=[];
 const backend:AudioBackend<string>={ready:true,unlock:vi.fn(async()=>{}),load:vi.fn(async id=>id),play:(channel:SoundChannel,_buffer,id)=>played.push({channel,id,time:Date.now()}),music:vi.fn(),mute:vi.fn(),clear:vi.fn(),dispose:vi.fn()};
 const player=new AudioPlayer(catalog,backend,{now:()=>Date.now(),random});return {player,backend,played};
}
test('near-simultaneous voices start at least one second apart without delaying battle effects',async()=>{
 const {player,played}=fixture();player.voice('own','skill');player.voice('own','lose');player.voice('other','skill');player.effect('boom');
 await vi.advanceTimersByTimeAsync(0);expect(played.filter(p=>p.channel==='voice')).toHaveLength(1);expect(played.some(p=>p.channel==='effect')).toBe(true);
 await vi.advanceTimersByTimeAsync(999);expect(played.filter(p=>p.channel==='voice')).toHaveLength(1);
 await vi.advanceTimersByTimeAsync(1001);const voices=played.filter(p=>p.channel==='voice');expect(voices).toHaveLength(3);expect(voices[1].time-voices[0].time).toBe(1000);expect(voices[2].time-voices[1].time).toBe(1000);player.dispose();
});
test('changing battle cancels old voices but preserves the one second start spacing',async()=>{
 const {player,played}=fixture();player.voice('own','skill');await vi.advanceTimersByTimeAsync(100);
 player.clearBattle();player.voice('other','skill');await vi.advanceTimersByTimeAsync(0);expect(played.filter(p=>p.channel==='voice')).toHaveLength(1);
 await vi.advanceTimersByTimeAsync(900);const voices=played.filter(p=>p.channel==='voice');expect(voices).toHaveLength(2);expect(voices[1].time-voices[0].time).toBe(1000);
});
test('voice mute cancels pending and active character voices while BGM and effects stay independent',async()=>{
 const {player,backend,played}=fixture();player.voice('own','skill');player.voice('own','lose');await vi.advanceTimersByTimeAsync(0);player.muteVoice(true);player.effect('boom');await vi.advanceTimersByTimeAsync(2000);
 expect(played.filter(p=>p.channel==='voice')).toHaveLength(1);expect(backend.clear).toHaveBeenCalledWith('voice');expect(played.some(p=>p.channel==='effect')).toBe(true);
 player.muteMusic(true);expect(backend.mute).toHaveBeenCalledWith('music',true);player.muteVoice(false);player.voice('own','lose');await vi.advanceTimersByTimeAsync(0);expect(played.at(-1)?.id).toBe('lose-a');player.dispose();
});
test('changing battle cancels an in-flight voice load and never lets it play in the next context',async()=>{
 const {player,backend,played}=fixture();let finish!:(id:string)=>void;vi.mocked(backend.load).mockImplementationOnce(()=>new Promise(resolve=>{finish=resolve;}));
 player.voice('own','skill');player.clearBattle();player.voice('other','skill');await vi.advanceTimersByTimeAsync(0);expect(played.map(p=>p.id)).toEqual(['other-skill']);finish('skill-a');await vi.advanceTimersByTimeAsync(2000);expect(played.map(p=>p.id)).toEqual(['other-skill']);player.dispose();
});
test('muting voices does not cancel a battle sound effect that is still loading',async()=>{
 const {player,backend,played}=fixture();let finish!:(id:string)=>void;vi.mocked(backend.load).mockImplementationOnce(()=>new Promise(resolve=>{finish=resolve;}));
 player.effect('boom');player.muteVoice(true);finish('boom');await vi.advanceTimersByTimeAsync(0);expect(played.map(p=>p.id)).toEqual(['boom']);player.dispose();
});
test('victory randomly chooses only an own actor and one of that actor’s lines',async()=>{
 const {player,played}=fixture(()=>.99);player.victory([{team:0,identity:'other'},{team:1,identity:'own'}],1);await vi.advanceTimersByTimeAsync(0);expect(played.map(p=>p.id)).toEqual(['win-a']);player.dispose();
});
test('loss variants are chosen from the requested identity and unknown actors stay silent',async()=>{
 const {player,played}=fixture(()=>.99);player.voice('own','lose');player.voice('missing','skill');await vi.advanceTimersByTimeAsync(0);expect(played.map(p=>p.id)).toEqual(['lose-b']);player.dispose();
});
