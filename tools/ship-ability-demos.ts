import '@fontsource-variable/saira';
import {DEMO_IDS} from '../src/ability-demos/scenarios.ts';
import {getShip} from '../src/ship-catalog.ts';
import {createAbilityDemoRenderer} from '../src/ability-demos/render.ts';
if(!import.meta.env.DEV)throw new Error('能力演示工作台仅用于开发录制');
const $=(id:string)=>document.getElementById(id)!;
async function main(){
 const selector=$('ship') as HTMLSelectElement;selector.replaceChildren(...DEMO_IDS.map(id=>new Option(getShip(id)!.name,id)));
 const renderer=await createAbilityDemoRenderer($('stage'));let total=0,frame=0,playing=false,busy=false,last=0;
 const seek=$('seek') as HTMLInputElement;
 async function seekFrame(index:number){const state=await renderer.seekFrame(index);frame=index;seek.value=String(index);$('cue').textContent=state.title;$('detail').textContent=state.detail;$('perspective').textContent=`${state.experiment?state.experiment+' · ':''}第 ${state.round} 回合 · ${state.viewer===0?'我方':'敌方'}视角`;$('legend').innerHTML=state.viewer===0?'<b>● 我方</b><i>● 敌方</i>':'<b>● 观察方</b><i>● 被观察方</i>';$('progress').style.width=`${100*(index+1)/total}%`;return state;}
 async function load(id:string){playing=false;const info=await renderer.load(id);total=info.duration*info.fps;seek.max=String(total-1);$('name').textContent=`${info.name} · ${info.ability}`;await seekFrame(0);return info;}
 (window as unknown as {abilityDemo:unknown}).abilityDemo={load,seekFrame,evidence:()=>renderer.evidence(),dispose:()=>renderer.dispose()};
 $('ship').onchange=()=>{void load(($('ship') as HTMLSelectElement).value).catch(fail);};$('play').onclick=()=>{playing=!playing;};seek.oninput=()=>{playing=false;void seekFrame(Number(seek.value)).catch(fail);};
 async function tick(now:number){if(playing&&!busy&&now-last>=1000/30){busy=true;last=now;try{await seekFrame((frame+1)%total);}catch(e){fail(e);playing=false;}finally{busy=false;}}requestAnimationFrame(tick);}requestAnimationFrame(tick);
 await document.fonts.ready;await load(new URLSearchParams(location.search).get('ship')??'bb-2');document.documentElement.dataset.ready='true';
}
function fail(e:unknown){$('error').textContent=String(e);document.documentElement.dataset.error=String(e);console.error(e);}
void main().catch(fail);
