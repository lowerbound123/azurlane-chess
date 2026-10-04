import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {Window} from 'happy-dom';
const window=new Window({url:'http://localhost/'});
for(const k of ['window','document','navigator','HTMLElement','Element','SVGElement','Node','Event','MouseEvent','KeyboardEvent','MutationObserver','getComputedStyle','localStorage'])Object.defineProperty(globalThis,k,{value:k==='window'?window:typeof window[k]==='function'&&k==='getComputedStyle'?window[k].bind(window):window[k],configurable:true});
window.document.body.innerHTML='<div id="app"></div>';
const errors=[];const oldError=console.error;console.error=(...x)=>errors.push(x.join(' '));
let source=await fs.readFile(new URL('../src/main.js',import.meta.url),'utf8');
source=source.replace(/import\s+['"]\.\/style\.css['"];?\s*/,'').replace(/from\s+(['"])([^'"]+)\1/g,(_,quote,spec)=>'from '+JSON.stringify(spec.startsWith('./')?new URL('../src/'+spec.slice(2),import.meta.url).href:import.meta.resolve(spec)));
await import('data:text/javascript;base64,'+Buffer.from(source).toString('base64'));
const wait=ms=>new Promise(r=>setTimeout(r,ms));const flush=async()=>{await Promise.resolve();await wait(0)};
const buttons=()=>[...document.querySelectorAll('button')];const button=(text)=>buttons().find(b=>b.textContent.replace(/\s/g,'').includes(text.replace(/\s/g,'')));const click=async el=>{assert.ok(el,'control exists');el.dispatchEvent(new window.MouseEvent('click',{bubbles:true}));await flush()};const hex=(c,r)=>document.querySelectorAll('polygon.hex')[r*19+c];
test('fresh tutorial exit cannot hide new normal game range defaults',async()=>{
 await click(button('交互教学'));await click(document.querySelectorAll('.lesson-card')[4]);assert.ok(button('显示范围'),'practice starts with range hidden');await click(button('退出教学'));await click(button('新游戏'));await click(button('进入部署'));await click(button('完成部署'));assert.ok(button('隐藏范围'),'normal game resets useful range layer visible');assert.ok(button('隐藏全部计划'),'normal game resets all friendly plans visible');assert.equal(errors.length,0,errors.join('\n'));
});
