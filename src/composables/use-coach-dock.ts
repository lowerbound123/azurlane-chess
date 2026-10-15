import {onBeforeUnmount,onMounted,ref,type CSSProperties} from 'vue';
import {useEventListener} from '@vueuse/core';

/** Match the fleet/chart columns, leaving the actual command sidebar uncovered. */
export function useCoachDock(){
 const dockStyle=ref<CSSProperties>({});
 let observer:ResizeObserver|undefined;
 function measure(){
  const layout=document.querySelector<HTMLElement>('.battle-layout');
  const chart=document.querySelector<HTMLElement>('.ocean-panel');
  if(!layout||!chart)return;
  const left=Math.max(6,layout.getBoundingClientRect().left);
  const right=Math.min(document.documentElement.clientWidth-6,chart.getBoundingClientRect().right);
  dockStyle.value={left:`${left}px`,width:`${Math.max(0,right-left)}px`};
 }
 useEventListener(window,'resize',measure);
 if(window.visualViewport)useEventListener(window.visualViewport,'resize',measure);
 onMounted(()=>{
  measure();observer=new ResizeObserver(measure);
  for(const selector of ['.battle-layout','.ocean-panel']){
   const element=document.querySelector(selector);if(element)observer.observe(element);
  }
 });
 onBeforeUnmount(()=>observer?.disconnect());
 return {dockStyle};
}
