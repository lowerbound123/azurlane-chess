import assert from 'node:assert/strict';
import * as E from '../src/engine.js';
import * as T from '../src/tutorial-content.js';
import test from 'node:test';
assert.equal(T.TUTORIAL_LESSONS.length,10);
assert.equal(T.TUTORIAL_LESSONS.filter(l=>l.section==='core').length,7);
assert.equal(T.TUTORIAL_LESSONS.filter(l=>l.section==='advanced').length,3);
assert.equal(Object.keys(T.SVG_FIGURES).length,6);
for(const section of T.TEXT_TUTORIAL){assert(T.SVG_FIGURES[section.figure]);assert(section.paragraphs.length>=2);}
for(const lesson of T.TUTORIAL_LESSONS){assert(T.SVG_FIGURES[lesson.figure]);assert(lesson.steps.length);for(const step of lesson.steps){assert(step.condition);assert(step.instruction);assert(step.hint);assert(step.highlights.length);}}
for(const [name,svg] of Object.entries(T.SVG_FIGURES)){

 assert(svg.includes('<title'));assert(svg.includes('<desc'));
 assert(!/<script|<foreignObject|(?:href|src)=['"]https?:|on(?:load|click)\s*=/i.test(svg));
}
const context=(f)=>({game:f.game,plans:f.plans,selected:f.selected,mode:f.mode,rangeMode:f.rangeMode,showRanges:f.showRanges});
const advance=(f,state,action)=>{const r=T.recordTutorialEvent(E,state,context(f),action);assert(r.advanced,`${state.lessonId} step ${state.stepIndex}: ${r.feedback}`);return r.state;};
const resolve=f=>{f.game=E.resolveRound(f.game,{...f.opponentPlans,...f.plans}).game;f.plans={};};
const moves=(n,turn=0,forward=true)=>Array.from({length:n},()=>({turn,forward}));
const empty=()=>E.emptyPlan();
const append=(f,shipId,m)=>{f.plans[shipId]??=empty();f.plans[shipId].moves.push(m);};
function pathTo(f,id,target){const ship=f.game.ships.find(s=>s.id===id),p=f.plans[id]??=empty(),end=E.route(ship,p,f.game.map).at(-1),remain=ship.cfg.speed-p.moves.length,q=[{pos:end.pos,heading:end.heading,moves:[]}],seen=new Set();while(q.length){const a=q.shift();if(E.same(a.pos,target)){p.moves.push(...a.moves);return;}if(a.moves.length>=remain)continue;for(const turn of[0,-1,1])for(const forward of[true,false]){const heading=E.mod(a.heading+turn),pos=forward?E.add(a.pos,heading):a.pos,k=`${E.key(pos)}:${heading}:${a.moves.length+1}`;if(seen.has(k)||!E.legal(f.game.map,pos))continue;seen.add(k);q.push({pos,heading,moves:[...a.moves,{turn,forward}]});}}throw Error('Unreachable fixture goal');}
for(const lesson of T.TUTORIAL_LESSONS)test('action-gated tutorial '+lesson.id,()=>{const f=T.createTutorialGame(E,lesson.id);let st=T.createTutorialState(lesson.id);
 const skip=T.recordTutorialEvent(E,st,context(f),{type:'next'});assert(!skip.advanced,'Next cannot complete an action-gated step');
 if(lesson.id==='select-deploy'){f.selected='0-0';st=advance(f,st,{type:'select',shipId:'0-0'});const s=f.game.ships.find(x=>x.id==='0-0');s.pos=E.fromCR(1,12);s.xy=E.hexToXY(s.pos);st=advance(f,st,{type:'deploy'});f.game.phase='plan';st=advance(f,st,{type:'begin'});}
 if(lesson.id==='route-segments'){pathTo(f,'0-0',E.fromCR(7,10));st=advance(f,st,{type:'route',target:E.fromCR(7,10)});pathTo(f,'0-0',E.fromCR(8,10));st=advance(f,st,{type:'route',target:E.fromCR(8,10)});}
 if(lesson.id==='turn-cost'){for(const m of [{turn:-1,forward:true},{turn:1,forward:false},{turn:0,forward:true}]){append(f,'0-0',m);st=advance(f,st,{type:'move',...m});}}
 if(lesson.id==='undo-redraw'){const original=structuredClone(f.plans['0-0']);f.plans['0-0'].moves.pop();st=advance(f,st,{type:'undo'});f.plans['0-0']=structuredClone(original);st=advance(f,st,{type:'redo'});f.plans['0-0'].moves=f.plans['0-0'].moves.slice(0,1);st=advance(f,st,{type:'truncate',index:1});f.plans['0-0'].moves=[];st=advance(f,st,{type:'redraw'});}
 if(lesson.id==='timeline-collision'){f.selected='0-0';st=advance(f,st,{type:'select'});f.selected='0-1';st=advance(f,st,{type:'select'});resolve(f);st=advance(f,st,{type:'roundComplete'});assert.equal(f.game.ships.find(s=>s.id==='0-0').hp,65);assert.equal(f.game.ships.find(s=>s.id==='0-1').hp,255);}
 if(lesson.id==='fog-secondary'){
  const fogCell=E.fromCR(11,10);assert(!E.visibleCells(f.game,0).has(E.key(fogCell)));assert(!f.game.explored[0].includes(E.key(fogCell)));
  f.showRanges=true;f.rangeMode='secondary';st=advance(f,st,{type:'overlay'});pathTo(f,'0-0',E.fromCR(7,10));st=advance(f,st,{type:'route',target:E.fromCR(7,10)});resolve(f);st=advance(f,st,{type:'roundComplete'});st=advance(f,st,{type:'inspect',target:fogCell});pathTo(f,'0-0',E.fromCR(5,10));resolve(f);st=advance(f,st,{type:'roundComplete'});st=advance(f,st,{type:'inspect',target:fogCell});assert(f.game.explored[0].includes(E.key(fogCell)));assert(!E.visibleCells(f.game,0).has(E.key(fogCell)));assert(!E.observe(f.game,0).ships.some(s=>s.id==='1-1'));
 }
 if(lesson.id==='main-save'){f.plans['0-0']={...empty(),main:Array.from({length:3},()=>E.fromCR(11,10))};st=advance(f,st,{type:'main'});resolve(f);st=advance(f,st,{type:'roundComplete'});resolve(f);st=advance(f,st,{type:'roundComplete'});st=advance(f,st,{type:'save',saved:true});}
 if(lesson.id==='torpedo-windows'){f.plans['0-0'].torps.push({window:0,dir:1});st=advance(f,st,{type:'torpedo'});f.plans['0-0'].torps.push({window:1,dir:1});st=advance(f,st,{type:'torpedo'});resolve(f);st=advance(f,st,{type:'roundComplete'});}
 if(lesson.id==='aircraft-aa'){f.plans['0-0']={...empty(),planes:[{mode:'point',target:E.fromCR(10,10)}]};st=advance(f,st,{type:'plane'});resolve(f);st=advance(f,st,{type:'roundComplete'});}
 if(lesson.id==='mines'){f.plans['0-0']={...empty(),sweep:E.fromCR(6,10)};st=advance(f,st,{type:'sweep'});resolve(f);st=advance(f,st,{type:'roundComplete'});}
 assert(st.complete,lesson.id+' did not complete');
});
const f=T.createTutorialGame(E,'turn-cost'),st=T.createTutorialState('turn-cost');f.plans['0-0']={...empty(),moves:[{turn:1,forward:true}]};const wrong=T.recordTutorialEvent(E,st,context(f),{type:'move',turn:1,forward:true});assert(!wrong.advanced);assert.equal(wrong.state.attempts,1);assert(wrong.feedback);
console.log('PASS all 32 actionable steps, wrong-action gate, SVG safety, fixture physics and fog separation');
