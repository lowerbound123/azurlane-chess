<script setup lang="ts">
import PageHead from './components/shell/PageHead.vue';

import AppIcon from './components/AppIcon.vue';
import {Button} from './components/ui/button';

import {TEXT_TUTORIAL, SVG_FIGURES} from './tutorial-content.ts';
const props=withDefaults(defineProps<{chapters:typeof TEXT_TUTORIAL;figures:typeof SVG_FIGURES}>(),{});
const emit=defineEmits(["home", "practice"]);
function scopedFigure(svg:string,index:number){
    const prefix = "guide-" + index + "-";
    return svg.replace(/id="([^"]+)"/g, (_, id) => 'id="' + prefix + id + '"').replace(/url\(#([^)]*)\)/g, (_, id) => "url(#" + prefix + id + ")").replace(/aria-labelledby="([^"]+)"/g, (_, ids) => 'aria-labelledby="' + ids.split(" ").map((id:string) => prefix + id).join(" ") + '"');
  }
</script>
<template>
<main class="tutorial-book page">
<PageHead title="图文作战指南" lede="先理解规则，再决定本回合的航线与火力。"><template #actions><Button variant="outline" @click="$emit('home')"><AppIcon name="back"/> 返回主菜单</Button><Button @click="$emit('practice')"><AppIcon name="tutorial"/> 交互教学</Button></template></PageHead>
<p class="faint">以下图解对应基础专项练习的标准训练配置。归航行动与正式新局使用 15 艘独立舰船，具体能力与数值请查看舰船详情及作战手册。</p>
<nav class="book-contents">
<a v-for="(chapter,i) in chapters" :href="'#guide-'+i">{{chapter.title}}</a>
</nav>
<article v-for="(chapter,i) in chapters" :key="i" :id="'guide-'+i" class="guide-chapter">
<div class="chapter-heading">
<span>{{String(i+1).padStart(2,'0')}}</span>
<h2>{{chapter.title}}</h2>
</div>
<div v-if="chapter.figure&&figures[chapter.figure]" class="guide-figure" v-html="scopedFigure(figures[chapter.figure],i)">
</div>
<p v-for="(p,j) in (chapter.paragraphs||chapter.paragraphs||[])" :key="j">{{p}}</p>

<aside v-if="chapter.takeaway||chapter.takeaway">{{chapter.takeaway||chapter.takeaway}}</aside>
</article>
<Button variant="default" class="primary" @click="$emit('practice')"><AppIcon name="tutorial"/> 在交互教学中试一遍</Button>
</main>
</template>
