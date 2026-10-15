<script setup lang="ts">
import AppIcon from './components/AppIcon.vue';
import BrandMark from './components/BrandMark.vue';
import ResumeBar from './components/shell/ResumeBar.vue';
import ProgressiveImage from './components/ProgressiveImage.vue';
import {Button} from './components/ui/button';
import {APP_VERSION} from './version.ts';
import {shipArt} from './ship-art.ts';
const cover=shipArt.identities.ougen;
withDefaults(defineProps<{canResume?:boolean;saveCount?:number;onlineResume?:boolean;onlineTitle?:string}>(),{});
defineEmits(['new','load','book','tutorial','historical','resume','online']);
</script>
<template>
<main class="home-screen">
  <div class="home-chart hex-texture" aria-hidden="true"><div class="chart-ring"><BrandMark/></div><span class="chart-coordinate">35° 00′ N / 139° 00′ E</span></div>
  <figure class="home-art" aria-hidden="true"><ProgressiveImage :path="cover.portrait" alt=""/><figcaption>{{cover.name}} · 基础立绘</figcaption></figure>
  <section class="home-command">
    <div class="home-heading reveal">
      <h1>碧蓝<span>推演棋</span></h1>
      <p class="home-subtitle">每一次出航，都是一场推演。</p>
      <p class="home-lede">编队，部署，然后让双方的计划同时执行。<br>在迷雾中寻找对手，用航线与火力掌控海域。</p>
    </div>
    <nav class="home-menu reveal" aria-label="主菜单">
      <Button class="home-card primary-card" @click="$emit('new')"><span class="menu-index">01</span><AppIcon name="anchor"/><span class="menu-copy"><strong>新游戏</strong><small>选择游玩方式 · 准备出航</small></span><AppIcon name="next"/></Button>
      <Button variant="ghost" class="home-card" @click="$emit('load')"><span class="menu-index">02</span><AppIcon name="folder"/><span class="menu-copy"><strong>读取游戏</strong><small>{{saveCount||0}} 个本机存档 · JSON 备份</small></span><AppIcon name="next"/></Button>
      <Button variant="ghost" class="home-card" @click="$emit('book')"><span class="menu-index">03</span><AppIcon name="book"/><span class="menu-copy"><strong>图文教程</strong><small>航线、火力与视野的作战指南</small></span><AppIcon name="next"/></Button>
      <Button variant="ghost" class="home-card" @click="$emit('tutorial')"><span class="menu-index">04</span><AppIcon name="tutorial"/><span class="menu-copy"><strong>交互教学</strong><small>在独立演练海域，完成第一次下令</small></span><AppIcon name="next"/></Button>
      <Button variant="ghost" class="home-card" @click="$emit('historical')"><span class="menu-index">05</span><AppIcon name="flag"/><span class="menu-copy"><strong>历史战斗</strong><small>五场独立海战 · 指挥历史舰队</small></span><AppIcon name="next"/></Button>
    </nav>
    <div class="home-resumes">
      <ResumeBar v-if="canResume" title="当前战局已保留" hint="返回海图，继续规划" action="继续当前战局" @resume="$emit('resume')"/>
      <ResumeBar v-if="onlineResume" :title="onlineTitle||'在线流程已保留'" tone="online" action="继续在线流程" @resume="$emit('online')"/>
    </div>
  </section>
  <footer class="home-foot"><span><i class="dot is-ok"/> 本地游玩随时就绪</span><span>本地存档保存在此浏览器 · 在线对局由服务器管理</span><span class="mono">{{APP_VERSION}}</span></footer>
</main>
</template>
<style scoped>
.home-screen { position: relative; isolation: isolate; min-height: calc(100dvh - var(--header-h)); overflow: hidden; padding: 20px max(32px, calc((100vw - 1240px) / 2)) 88px; }
.home-command { position: relative; z-index: 2; width: min(490px, 48%); }
.home-heading h1 { margin: 0 0 16px; font-size: clamp(48px, 5.6vw, 78px); line-height: 1.15; font-weight: 750; letter-spacing: .12em; }
.home-heading h1 span { display: block; color: var(--brass-hi); }
.home-subtitle { color: var(--text-1); font-size: 17px; letter-spacing: .08em; }
.home-lede { margin-top: 12px; color: var(--text-2); font-size: 13px; line-height: 1.9; }
.home-menu { display: grid; gap: 4px; margin-top: 34px; --i: 2; }
.home-card { width: 100%; height: auto; min-height: 68px; justify-content: flex-start; gap: 18px; padding: 12px 20px; text-align: left; border: 1px solid transparent; border-radius: 4px; }
.home-card:not(.primary-card) { border-bottom-color: var(--line-1); background: rgb(6 17 27 / .6); }
.home-card:not(.primary-card):hover { border-color: var(--line-3); background: var(--ink-2); }
.menu-index { font: 500 11px var(--font-code); opacity: .55; }
.home-card > .app-icon { font-size: 18px; color: var(--brass); }
.home-card.primary-card > .app-icon { color: var(--brass-ink); }
.home-card > .app-icon:last-child { margin-left: auto; font-size: 13px; }
.menu-copy { display: grid; gap: 3px; white-space: normal; }
.menu-copy strong { font-size: 18px; letter-spacing: .08em; }
.menu-copy small { font-size: 11px; font-weight: 400; color: var(--text-2); }
.primary-card .menu-copy small { color: rgb(31 22 6 / .72); }
.home-resumes { display: grid; gap: 10px; margin-top: 20px; }
.home-art { position: absolute; z-index: 1; margin: 0; width: min(66vw, 900px); height: calc(100% - 28px); right: -3%; top: 8px; pointer-events: none; mask-image: linear-gradient(90deg, transparent, black 20%, black 85%, transparent); }
.home-art :deep(.progressive-image) { width: 100%; height: 100%; object-fit: contain; object-position: center bottom; filter: drop-shadow(0 20px 40px #0008); }
.home-art figcaption { position: absolute; bottom: 46px; right: 14%; font-size: 10px; color: var(--text-3); }
.home-chart { position: absolute; z-index: -1; inset: 0 0 0 32%; opacity: .55; mask-image: linear-gradient(90deg, transparent, black 50%); }
.chart-ring { position: absolute; width: min(55vw, 700px); aspect-ratio: 1; top: 10%; right: 7%; border: 1px solid var(--line-3); border-radius: 50%; display: grid; place-items: center; box-shadow: 0 0 0 40px rgb(150 190 222 / .025), 0 0 0 41px var(--line-1), 0 0 0 96px rgb(150 190 222 / .02); }
.chart-ring .brand-mark { width: 50%; opacity: .15; }
.chart-ring::before, .chart-ring::after { content: ''; position: absolute; background: var(--line-2); }
.chart-ring::before { width: 120%; height: 1px; }.chart-ring::after { width: 1px; height: 120%; }
.chart-coordinate { position: absolute; top: 28px; right: 32px; font: 11px var(--font-code); color: var(--text-3); }
.home-foot { position: absolute; bottom: 22px; left: max(32px, calc((100vw - 1240px) / 2)); right: 32px; display: flex; flex-wrap: wrap; align-items: center; gap: 12px 24px; font-size: 11px; color: var(--text-3); }
.home-foot > span:first-child { display: flex; align-items: center; gap: 10px; color: var(--text-2); }.home-foot > span:last-child { margin-left: auto; }
@media(max-width: 760px) {
 .home-screen { padding: 18px 22px 110px; }.home-command { width: min(440px, 100%); }.home-heading h1 { font-size: 54px; }.home-art { width: 95vw; height: 65%; top: 0; right: -32%; opacity: .22; mask-image: linear-gradient(180deg, black 30%, transparent); }.home-heading { text-shadow: 0 2px 18px var(--abyss); }.home-menu { margin-top: 28px; }.home-chart { inset: 0; }.chart-coordinate { display: none; }.home-foot { left: 22px; right: 22px; bottom: 20px; }.home-foot > span:nth-child(2) { flex-basis: 100%; font-size: 10px; }.home-foot > span:last-child { position: absolute; top: 0; right: 0; }.home-card { gap: 14px; min-height: 68px; padding: 12px 16px; }
}
</style>
