// @vitest-environment happy-dom
import {afterEach,expect,test,vi} from 'vitest';
import {mount} from '@vue/test-utils';
import {computed,defineComponent,h,nextTick,ref,shallowRef,toRaw} from 'vue';
import {useGameAudio} from '../src/composables/use-game-audio.ts';
import type {SessionCore} from '../src/composables/session-core.ts';
import type {Game,RoundResult,BattleFrame,Presentation} from '../shared/game.ts';
import {clone,createFleetGame} from '../src/engine.ts';
import {shipCharacterProfile} from '../src/ship-art.ts';
import {createHistoricalBattle,getHistoricalDefinition} from '../src/history/index.ts';
import type {HistoricalState} from '../shared/history.ts';

const sound=vi.hoisted(()=>({played:[] as {channel:string;id:string;time:number}[],clear:vi.fn(),music:vi.fn()}));
vi.mock('../src/audio/browser.ts',()=>({BrowserAudioBackend:class{
 ready=true;async unlock(){}async load(id:string){return id;}
 play(channel:string,_buffer:unknown,id:string){sound.played.push({channel,id,time:performance.now()});}
 music=sound.music;clear=sound.clear;mute(){}dispose(){}
}}));
let mounted:ReturnType<typeof mount>|undefined;
afterEach(()=>{mounted?.unmount();mounted=undefined;vi.useRealTimers();localStorage.clear();sound.played=[];vi.clearAllMocks();});
async function flush(){await nextTick();for(let i=0;i<5;i++)await Promise.resolve();}
function setup(team=1){
 vi.useFakeTimers();
 const game=ref<Game|null>(createFleetGame());game.value!.phase='plan';
 const historical=ref<HistoricalState|null>(null);
 const core={router:{currentRoute:ref({path:'/battle/online/test',fullPath:'/battle/online/test',meta:{battle:true}})},game,audioEpoch:ref(0),myTeam:ref(team),screen:ref('battle'),phase:computed(()=>game.value?.phase),finished:shallowRef<RoundResult|null>(null),playFrame:shallowRef<BattleFrame|null>(null),busy:ref(false),campaignTransit:ref(false),campaignOverview:ref(false),campaign:ref(null),historical,historicalDefinition:computed(()=>historical.value?getHistoricalDefinition(historical.value.scenarioId):undefined)};
 mounted=mount(defineComponent({setup(){useGameAudio(core as unknown as SessionCore);return()=>h('div');}}));
 return core;
}
function replay(game:Game){
 const after=clone(toRaw(game)),own=after.ships.find(s=>s.team===1&&s.template==='cv')!,foe=after.ships.find(s=>s.team===0&&s.template==='bb')!;
 const initial=clone(toRaw(game.ships));own.hp=0;foe.hp=0;foe.catalogId='bb-3';
 const frame=(t:number,ships:Game['ships']):BattleFrame=>({t,ships,planes:[],torpedoes:[],mines:[],visible:[],explored:[],effects:[]});
 const action=(id:string,s:typeof own,a:string,time:number):Presentation=>({id,type:'action',shipId:s.id,team:s.team,action:a,at:s.pos,time,duration:.65});
 const result:RoundResult={game:after,frames:[frame(0,initial),frame(.4,after.ships),frame(1,after.ships)],events:[],counts:[],combatStats:{},presentation:[action('own',own,'aircraft',.1),action('same-launch',own,'aircraft',.1),action('foe',foe,'mainFire',.1),{id:'impact',type:'effect',kind:'bomb',team:0,at:{q:99,r:99},time:.8,duration:.3}]};
 return {result,own,foe};
}
test('online team one voices follow crossed replay times once; a skipped tail keeps own loss and victory only',async()=>{
 const core=setup();await flush();const {result,own,foe}=replay(core.game.value!);
 core.busy.value=true;core.finished.value=result;core.playFrame.value=result.frames[0];await flush();expect(sound.played).toHaveLength(0);
 core.playFrame.value={...result.frames[0],t:.3};await flush();
 expect(sound.played.filter(p=>p.channel==='voice')).toHaveLength(1);
 expect(sound.played.find(p=>p.channel==='voice')!.id).toContain(`/${shipCharacterProfile(own)}/skill`);
 // Repeated/interpolated frames do not re-announce a launch; completion skips .4..1.
 core.playFrame.value={...result.frames[0],t:.35};await flush();
 core.game.value={...result.game,phase:'ended',winner:1};core.finished.value=null;core.playFrame.value=null;core.busy.value=false;await flush();
 await vi.advanceTimersByTimeAsync(2000);await flush();
 const voices=sound.played.filter(p=>p.channel==='voice');expect(voices).toHaveLength(3);
 expect(voices[1].id).toContain(`/${shipCharacterProfile(own)}/lose`);expect(voices[2].id).toMatch(/\/mvp(?:_|$)/);
 expect(voices.every(p=>!p.id.includes(`/${shipCharacterProfile(foe)}/`))).toBe(true);
 expect(voices[1].time-voices[0].time).toBeGreaterThanOrEqual(1000);expect(voices[2].time-voices[1].time).toBeGreaterThanOrEqual(1000);
 core.playFrame.value=null;core.campaignOverview.value=true;await flush();await vi.advanceTimersByTimeAsync(3000);expect(sound.played.filter(p=>p.channel==='voice')).toHaveLength(3);
});
test('retrying the same route and seed resets victory and loss bookkeeping for the next battle',async()=>{
 const core=setup();await flush();const initial=clone(toRaw(core.game.value!));
 for(let i=0;i<2;i++){
  core.game.value=clone(initial);await flush();const {result}=replay(core.game.value!);
  core.busy.value=true;core.finished.value=result;core.playFrame.value=result.frames[0];await flush();
  core.game.value={...result.game,phase:'ended',winner:1};core.finished.value=null;core.playFrame.value=null;core.busy.value=false;await flush();
  await vi.advanceTimersByTimeAsync(2000);await flush();
 }
 expect(sound.played.filter(p=>p.channel==='voice'&&p.id.includes('/lose'))).toHaveLength(2);
 expect(sound.played.filter(p=>p.channel==='voice'&&p.id.includes('/mvp'))).toHaveLength(2);
});
test('leaving battle cancels voices waiting for the one second slot',async()=>{
 const core=setup();await flush();const {result}=replay(core.game.value!);core.busy.value=true;core.finished.value=result;core.playFrame.value=result.frames[1];await flush();
 const count=sound.played.filter(p=>p.channel==='voice').length;expect(count).toBe(1);
 core.router.currentRoute.value={path:'/',fullPath:'/',meta:{battle:false}};core.screen.value='home';await flush();await vi.advanceTimersByTimeAsync(3000);
 expect(sound.played.filter(p=>p.channel==='voice')).toHaveLength(count);expect(sound.clear).toHaveBeenCalledWith('voice');
});
test('installing another saved branch at the same seed and round cancels the old fleet voice queue',async()=>{
 const core=setup();await flush();const {result}=replay(core.game.value!);
 core.busy.value=true;core.finished.value=result;core.playFrame.value=result.frames[1];await flush();
 core.finished.value=null;core.playFrame.value=null;core.busy.value=false;core.game.value=result.game;await flush();
 const count=sound.played.filter(p=>p.channel==='voice').length;expect(count).toBe(1);
 core.audioEpoch.value++;core.game.value=clone(result.game);await flush();await vi.advanceTimersByTimeAsync(3000);
 expect(sound.played.filter(p=>p.channel==='voice')).toHaveLength(count);
});
test('a historical victory can speak for its own extracted fleet even after every friendly ship left the combat array',async()=>{
 const core=setup(0);await flush();const battle=createHistoricalBattle('denmark-strait');
 const own=battle.game.ships.filter(s=>s.team===0);
 for(const ship of own)battle.state.extracted[ship.id]={id:ship.id,label:ship.label,team:ship.team,hp:ship.hp,round:2};
 battle.game.ships=battle.game.ships.filter(s=>s.team!==0);battle.game.phase='ended';battle.game.winner=0;
 core.historical.value=battle.state;core.game.value=battle.game;await flush();
 const voices=sound.played.filter(p=>p.channel==='voice');expect(voices).toHaveLength(1);
 expect(voices[0].id).toMatch(/\/mvp(?:_|$)/);expect(own.some(s=>voices[0].id.includes(`/${shipCharacterProfile(s,'denmark-strait')}/`))).toBe(true);
});
