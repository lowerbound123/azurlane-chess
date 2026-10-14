import type {DraftRules} from '../shared/draft.ts';
// @vitest-environment happy-dom
import {mount as mountComponent} from '@vue/test-utils';
import {defineComponent,reactive,nextTick,h} from 'vue';
import FleetSelection from '../src/FleetSelection.vue';
import OnlinePanel from '../src/OnlinePanel.vue';
import type {OnlineState} from '../shared/network.ts';
import {test,afterAll,afterEach} from 'vitest';
import assert from 'node:assert/strict';

import {createDraft,guessFirst,actDraft} from '../src/draft.ts';
import {catalogFleet} from '../src/ship-catalog.ts';
function mount(props:Partial<InstanceType<typeof FleetSelection>['$props']>){
 document.body.innerHTML='<div id="app"></div>';const state=reactive({...props,selected:props.selected??[],disabled:props.disabled??false});const events:{type:string;payload:unknown}[]=[];
 const Host=defineComponent({setup:()=>()=>h(FleetSelection,{...state,onChange:(ids:string[])=>{state.selected=ids;},onComplete:()=>events.push({type:'complete',payload:undefined}),onGuess:(payload:unknown)=>events.push({type:'guess',payload}),onAction:(payload:unknown)=>events.push({type:'action',payload}),onConfirm:(payload:unknown)=>events.push({type:'confirm',payload})})});
 const wrapper=mountComponent(Host,{attachTo:'#app'});return{state,events,close:()=>wrapper.unmount()};
}
const click=async (selector:string)=>{const el=document.querySelector<HTMLElement>(selector);assert.ok(el,selector);el.click();await nextTick();};

test('AI selection inspects without adding, removes, enforces roles and completes',async()=>{
  const h=mount({selected:catalogFleet()});
  try {
    assert.equal(document.querySelectorAll('.ship-class').length,5);assert.equal(document.querySelectorAll('.ship-card').length,15);
    assert.equal(document.querySelectorAll('.ship-card [data-spine-template]').length,15);
    assert.equal(document.querySelector('[data-ship-id="cv-3"] [data-spine-template]')?.getAttribute('data-spine-template'),'cv');
    assert.equal(document.querySelectorAll('.preview-avatar [data-spine-template]').length,5);
    assert.equal(document.querySelectorAll('.ship-avatar .progressive-image,.preview-avatar .progressive-image').length,0);
    assert.equal(document.querySelectorAll('.ship-portrait .progressive-image').length,1);
    await click('[data-ship-id="cv-3"]');assert.match(document!.querySelector<HTMLButtonElement>('.ship-facts')!.textContent,/香格里拉/);assert.equal(h.state.selected.length,5);assert.ok(document!.querySelector<HTMLButtonElement>('.add-ship')!.disabled);
    await click('[aria-label="移除企业"]');assert.equal(h.state.selected.length,4);assert.ok(document!.querySelector<HTMLButtonElement>('.complete-fleet')!.disabled);
    await click('[data-ship-id="dd-3"]');assert.ok(document!.querySelector<HTMLButtonElement>('.add-ship')!.disabled);assert.match(document!.querySelector<HTMLButtonElement>('.action-reason')!.textContent,/前排已满/);
    await click('[data-ship-id="cv-3"]');await click('.add-ship');assert.ok(h.state.selected.includes('cv-3'));assert.ok(document!.querySelector<HTMLButtonElement>('.add-ship')!.disabled);
    await click('.complete-fleet');assert.deepEqual(h.events,[{type:'complete',payload:undefined}]);
    h.state.disabled=true;await nextTick();assert.ok(document!.querySelector<HTMLButtonElement>('.remove-ship')!.disabled);assert.ok(document!.querySelector<HTMLButtonElement>('.complete-fleet')!.disabled);
  } finally {h.close();}
});

test('PVP uses server revision, exposes previews, has no removal, and explains blocked bans',async()=>{
  const rules:DraftRules={poolMode:'independent',banTarget:'opponent',fleetLimits:{front:1,back:1},steps:[{actor:'second',action:'ban',count:1},{actor:'first',action:'pick',count:2},{actor:'second',action:'pick',count:2}]};
  const initial=createDraft(rules,['dd-1','dd-2','bb-1']);const h=mount({draft:initial,team:0});
  try {
    assert.equal(document.querySelectorAll('.ship-card').length,3);assert.equal(document.querySelectorAll('.preview-empty').length,4);
    const guess=[...document.querySelectorAll('button')].find(b=>b.textContent.trim()==='猜正面');guess!.click();await nextTick();assert.deepEqual(h.events[0],{type:'guess',payload:{guess:0,revision:0}});
    const serverDraft=guessFirst(initial,0,0,0,0);h.state.draft=serverDraft;h.state.team=1;await nextTick();
    await click('[data-ship-id="bb-1"]');assert.ok(document!.querySelector<HTMLButtonElement>('.add-ship')!.disabled);assert.match(document!.querySelector<HTMLButtonElement>('.action-reason')!.textContent,/无法凑齐/);
    await click('[data-ship-id="dd-1"]');await click('.add-ship');assert.deepEqual(h.events.at(-1),{type:'action',payload:{shipId:'dd-1',revision:1}});
    let d=actDraft(serverDraft,1,'dd-1',1);d=actDraft(d,0,'dd-2',d.revision);d=actDraft(d,0,'bb-1',d.revision);d=actDraft(d,1,'dd-1',d.revision);d=actDraft(d,1,'bb-1',d.revision);
    h.state.draft=d;await nextTick();assert.equal(document.querySelectorAll('.remove-ship').length,0);assert.equal(document.querySelectorAll('.locked-ship').length,4);
    assert.equal(document.querySelectorAll('.opponent-preview .preview-ship').length,2);await click('.complete-fleet');assert.deepEqual(h.events.at(-1),{type:'confirm',payload:{revision:d.revision}});
    assert.equal(document.querySelectorAll('.opponent-preview [data-spine-template]').length,2);
    h.state.disabled=true;await nextTick();assert.ok(document!.querySelector<HTMLButtonElement>('.complete-fleet')!.disabled);
  } finally {h.close();}
});

test('online draft displays deadline, freezes during disconnect and stops after ending',async()=>{

  document.body.innerHTML='<div id="app"></div>';
  const props=reactive({state:{player:null,room:null,queue:null,match:{id:'test',kind:'pvp',round:0,submitted:[false,false],disconnects:[],draft:createDraft(),game:null,myTeam:0,stage:'draft',deadline:121000,paused:false,pausedAt:null,result:null} } as OnlineState,status:'connected' as const,clock:0,roster:['dd','cl','ca','bb','cv']});
  const app=mountComponent(defineComponent({setup:()=>()=>h(OnlinePanel,{...props,config:{protocolVersion:2,models:[]},error:'',pending:false})}),{attachTo:'#app'});
  try {
    assert.match(document.querySelector<HTMLButtonElement>('.draft-clock')?.textContent||'',/120 秒/);
    props.clock=31000;await nextTick();assert.match(document!.querySelector<HTMLButtonElement>('.draft-clock')!.textContent,/90 秒/);
    props!.state.match!.paused=true;props!.state.match!.pausedAt=31000;props.clock=61000;await nextTick();assert.match(document!.querySelector<HTMLButtonElement>('.draft-clock')!.textContent,/90 秒.*暂停/);
    props!.state.match!.paused=false;props!.state.match!.pausedAt=null;props!.state.match!.deadline=151000;await nextTick();assert.match(document!.querySelector<HTMLButtonElement>('.draft-clock')!.textContent,/90 秒/);
    props!.state.match!.stage='ended';props!.state.match!.result={winner:null,reason:'选禁操作超时'};await nextTick();assert.equal(document.querySelector<HTMLButtonElement>('.draft-clock'),null);assert.match(document.body.textContent,/选禁操作超时/);
  } finally {app.unmount();}
});

