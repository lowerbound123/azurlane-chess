<script setup lang="ts">
import {ref} from 'vue';
import {useAppSession} from '../session-context.ts';
import {useCoachDock} from '../composables/use-coach-dock.ts';
import AppIcon from './AppIcon.vue';
import {Button} from './ui/button';

const {tutorial,lesson,tutorialStep,tutorialIndex,tutorialFeedback,toast,T,busy,startLesson,nextLesson,exitTutorial}=useAppSession();
const expanded=ref(true);
const {dockStyle}=useCoachDock();
</script>

<template>
  <div class="coach-space" :class="{expanded}" aria-hidden="true"/>
  <Teleport to="body">
    <section v-if="tutorial&&lesson" class="tutorial-coach" :class="{expanded}" :style="dockStyle" aria-label="交互教学提示" @keydown.stop>
      <header class="coach-heading">
        <div class="coach-title">
          <span v-if="!expanded&&toast" class="coach-compact-notice" role="status" :title="toast">{{toast}}</span>
          <span v-else>独立演练 · {{tutorialIndex+1}} / {{T.TUTORIAL_LESSONS.length}}</span>
          <h2>{{lesson.title}}</h2>
        </div>
        <Button variant="ghost" class="coach-toggle" :aria-label="expanded?'收起教学提示':'展开教学提示'" :aria-expanded="expanded" aria-controls="tutorial-coach-content" @click="expanded=!expanded">{{expanded?'收起':'展开提示'}}</Button>
      </header>
      <div v-if="expanded" id="tutorial-coach-content" class="coach-content">
        <div class="coach-details" tabindex="0" aria-label="本课操作说明">
          <p v-if="toast" class="coach-notice" role="status">{{toast}}</p>
          <strong>{{tutorial.complete?'本课完成':(tutorial.stepIndex+1)+' / '+lesson.steps.length+' · '+tutorialStep?.title}}</strong>
          <p>{{tutorial.complete?tutorialFeedback:tutorialStep?.instruction}}</p>
          <small>{{tutorial.complete?'可以重试本课，或继续下一课':tutorialStep?.hint}}</small>
        </div>
        <div class="coach-actions">
          <Button variant="outline" :disabled="busy" @click="startLesson(lesson.id)"><AppIcon name="tutorial"/> 重试本课</Button>
          <Button variant="outline" :disabled="busy||tutorialIndex===0" @click="startLesson(T.TUTORIAL_LESSONS[tutorialIndex-1].id)"><AppIcon name="back"/> 上一课</Button>
          <Button variant="default" class="primary coach-next" :disabled="busy||!tutorial.complete" @click="nextLesson"><AppIcon name="next"/> 下一课</Button>
          <Button variant="outline" class="coach-exit" :disabled="busy" @click="exitTutorial"><AppIcon name="back"/> 退出教学</Button>
        </div>
      </div>
    </section>
  </Teleport>
</template>

<style scoped>
.tutorial-coach,.coach-space{--coach-height:64px;--coach-gap:max(12px,env(safe-area-inset-bottom));height:var(--coach-height)}
.tutorial-coach.expanded,.coach-space.expanded{--coach-height:min(220px,48dvh)}
.coach-space{flex:none;height:calc(var(--coach-height) + var(--coach-gap) + 12px);pointer-events:none}
.tutorial-coach{position:fixed;z-index:45;inset:auto auto var(--coach-gap) 18px;width:calc(100% - 36px);margin:0;display:flex;flex-direction:column;overflow:hidden;border:1px solid rgb(230 185 101 / .45);border-radius:var(--radius-lg);background:linear-gradient(120deg,rgb(230 185 101 / .08),transparent 60%),var(--ink-1);box-shadow:0 12px 48px #0008}
.coach-heading{display:flex;align-items:center;gap:16px;flex:none;height:62px;padding:8px 18px}
.coach-title{flex:1;min-width:0}
.coach-title>span{display:block;font-size:10px;line-height:1.3;color:var(--text-3)}
.coach-title>.coach-compact-notice{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:var(--brass-hi)}
.coach-title h2{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:17px;line-height:1.4;margin:3px 0 0;color:var(--text-1)}
.coach-toggle{flex:none;min-height:36px;padding-inline:12px;font-size:12px}
.coach-content{display:flex;flex-direction:column;flex:1;min-height:0;border-top:1px solid var(--line-1)}
.coach-details{flex:1;min-height:0;overflow-y:auto;overscroll-behavior:contain;scrollbar-gutter:stable;padding:12px 18px;line-height:1.75;overflow-wrap:anywhere}
.coach-details:focus-visible{outline:2px solid var(--brass);outline-offset:-3px}
.coach-details strong{font-size:13px;color:var(--brass-hi)}
.coach-details p{margin:7px 0;font-size:13px;color:var(--text-1)}
.coach-details .coach-notice{margin:0 0 10px;padding:6px 10px;border-left:2px solid var(--brass);border-radius:3px;background:var(--brass-wash);color:var(--brass-hi);font-size:12px}
.coach-details small{display:block;font-size:12px;color:var(--text-2)}
.coach-actions{display:flex;justify-content:flex-end;gap:6px;flex:none;padding:9px 18px;border-top:1px solid var(--line-1);background:var(--ink-1)}
.coach-actions button{height:36px;min-height:36px;font-size:11px;padding-inline:12px}
@media(max-width:640px){
 .tutorial-coach,.coach-space{--coach-gap:max(8px,env(safe-area-inset-bottom))}
 .tutorial-coach.expanded,.coach-space.expanded{--coach-height:min(320px,50dvh)}
 .tutorial-coach{inset-inline:8px;width:calc(100% - 16px)}
 .coach-heading{padding-inline:12px;gap:8px}
 .coach-title h2{font-size:15px}
 .coach-details{padding:10px 12px}
 .coach-details p{font-size:12px}
 .coach-details small{font-size:11px}
 .coach-actions{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));padding:8px 12px;gap:6px}
 .coach-actions button{width:100%;min-width:0;padding-inline:6px}
}
@media(max-height:500px){.tutorial-coach.expanded,.coach-space.expanded{--coach-height:min(236px,54dvh)}.coach-heading{height:54px}.coach-details{padding-block:8px}.coach-actions{padding-block:6px}}
</style>
