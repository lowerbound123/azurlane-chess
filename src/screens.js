const HomeScreen = {
  props: ["canResume", "saveCount"],
  emits: ["new", "load", "book", "tutorial", "resume"],
  template: `<main class="home-screen">
<div class="home-heading">
<p class="eyebrow">AZURLANE CHESS / v0.3.2</p>
<h1>碧蓝推演棋</h1>
<p>\u7F16\u961F\uFF0C\u90E8\u7F72\uFF0C\u7136\u540E\u8BA9\u53CC\u65B9\u7684\u8BA1\u5212\u540C\u65F6\u6267\u884C</p>
</div>
<div class="home-grid">
<button class="home-card primary-card" @click="$emit('new')">
<span>01</span>
<strong>\u65B0\u6E38\u620F</strong>
<p>\u9009\u62E9 3 \u8258\u524D\u6392\u4E0E 2 \u8258\u540E\u6392\uFF0C\u5BF9\u6297\u6218\u672F AI</p>
<b>\u5F00\u59CB\u7F16\u961F \u2192</b>
</button>
<button class="home-card" @click="$emit('load')">
<span>02</span>
<strong>\u8BFB\u53D6\u6E38\u620F</strong>
<p>\u81EA\u52A8\u5B58\u6863\u30013 \u4E2A\u624B\u52A8\u69FD\u4F4D\u4E0E JSON \u5907\u4EFD</p>
<b>{{saveCount||0}} \u4E2A\u672C\u673A\u5B58\u6863 \u2192</b>
</button>
<button class="home-card" @click="$emit('book')">
<span>03</span>
<strong>\u56FE\u6587\u6559\u7A0B</strong>
<p>\u56FE\u89E3\u822A\u7EBF\u3001\u6B66\u5668\u3001\u78B0\u649E\u3001\u89C6\u91CE\u4E0E\u5B58\u6863\u673A\u5236</p>
<b>\u9605\u8BFB\u4F5C\u6218\u6307\u5357 \u2192</b>
</button>
<button class="home-card" @click="$emit('tutorial')">
<span>04</span>
<strong>\u4EA4\u4E92\u6559\u5B66</strong>
<p>\u5728\u72EC\u7ACB\u6F14\u7EC3\u6D77\u57DF\u5B9E\u9645\u4E0B\u4EE4\uFF0C\u9010\u6B65\u5B66\u4F1A\u4F5C\u6218</p>
<b>\u8FDB\u5165\u6559\u5B66 \u2192</b>
</button>
</div>
<div v-if="canResume" class="resume-bar">
<span>\u5F53\u524D\u6218\u5C40\u5DF2\u4FDD\u7559\uFF0C\u8FD4\u56DE\u540E\u53EF\u7EE7\u7EED\u89C4\u5212</span>
<button class="primary" @click="$emit('resume')">\u7EE7\u7EED\u5F53\u524D\u6218\u5C40</button>
</div>
<p class="home-note">\u89C4\u5212\u4E0D\u9650\u65F6 \xB7 PvAI \xB7 \u5B58\u6863\u4FDD\u5B58\u5728\u6B64\u6D4F\u89C8\u5668\uFF0C\u5BFC\u51FA JSON \u53EF\u5907\u4EFD\u5230\u5176\u4ED6\u8BBE\u5907</p>
</main>`
};
const SaveManager = {
  props: ["records", "canSave", "notice", "pending", "inBattle"],
  emits: ["close", "write", "load", "export", "import", "confirm", "cancel"],
  data: () => ({ label: "", importSlot: "slot-1" }),
  methods: { slotName(id) {
    return id === "auto" ? "\u81EA\u52A8\u5B58\u6863" : "\u624B\u52A8\u69FD\u4F4D " + id.slice(-1);
  }, time(t) {
    return new Date(t).toLocaleString("zh-CN");
  } },
  template: `<div class="modal-backdrop save-backdrop">
<section class="save-manager" role="dialog" aria-modal="true" aria-label="\u4FDD\u5B58\u4E0E\u8BFB\u53D6\u6E38\u620F">
<div class="panel-title">
<h2>\u4FDD\u5B58\u4E0E\u8BFB\u53D6</h2>
<button @click="$emit('close')">{{inBattle?'\u8FD4\u56DE\u6218\u5C40':'\u8FD4\u56DE\u4E3B\u83DC\u5355'}}</button>
</div>
<p class="save-explanation">\u81EA\u52A8\u5B58\u6863\u8BB0\u5F55\u7A33\u5B9A\u7684\u90E8\u7F72\u3001\u89C4\u5212\u4E0E\u56DE\u5408\u7ED3\u679C\u3002\u624B\u52A8\u69FD\u4F4D\u4E0D\u4F1A\u81EA\u52A8\u8986\u76D6\u3002\u5B58\u6863\u4EC5\u5728\u5F53\u524D\u6D4F\u89C8\u5668\uFF1B\u5BFC\u51FA JSON \u53EF\u8DE8\u8BBE\u5907\u5907\u4EFD</p>
<p v-if="notice" class="save-notice" role="status">{{notice}}</p>
<section v-if="pending" class="save-confirm">
<p>{{pending.message}}</p>
<button class="primary" @click="$emit('confirm')">{{pending.kind==='load'?'\u786E\u8BA4\u8BFB\u53D6':pending.kind==='new'?'\u786E\u8BA4\u65B0\u6E38\u620F':'\u786E\u8BA4\u8986\u76D6'}}</button>
<button @click="$emit('cancel')">\u53D6\u6D88</button>
</section>
<label v-if="canSave" class="save-label">\u5B58\u6863\u540D\u79F0 <input v-model="label" maxlength="80" placeholder="\u7559\u7A7A\u81EA\u52A8\u547D\u540D">
</label>
<div class="save-slots">
<article v-for="record in records" :key="record.id" :data-save-slot="record.id" class="save-slot">
<div>
<small>{{slotName(record.id)}}</small>
<strong>{{record.save?record.save.label:'\u7A7A\u69FD\u4F4D'}}</strong>
<p v-if="record.save">R{{String(record.save.state.game.round).padStart(2,'0')}} \xB7 {{record.save.state.game.phase==='deploy'?'\u90E8\u7F72\u4E2D':record.save.state.game.phase==='ended'?'\u5DF2\u7ED3\u675F':'\u89C4\u5212\u4E2D'}} \xB7 {{time(record.save.timestamp)}}</p>
<p v-else-if="record.error" class="save-error">{{record.error.message}}</p>
</div>
<div class="slot-actions">
<button v-if="record.id!=='auto'" class="write-slot" :disabled="!canSave||!!pending" @click="$emit('write',{id:record.id,label})">\u4FDD\u5B58</button>
<button class="load-slot" :disabled="!record.save||!!pending" @click="$emit('load',record.id)">\u8BFB\u53D6</button>
<button :disabled="!record.save||!!pending" @click="$emit('export',record.save)">\u5BFC\u51FA</button>
</div>
</article>
</div>
<div class="backup-tools">
<button :disabled="!canSave||!!pending" @click="$emit('export',null)">\u5BFC\u51FA\u5F53\u524D\u6218\u5C40 JSON</button>
<label>\u5BFC\u5165\u5230 <select v-model="importSlot">
<option value="slot-1">\u69FD\u4F4D 1</option>
<option value="slot-2">\u69FD\u4F4D 2</option>
<option value="slot-3">\u69FD\u4F4D 3</option>
</select>
</label>
<label class="file-import-button">\u9009\u62E9 JSON \u6587\u4EF6<input type="file" accept=".json,application/json" :disabled="!!pending" @change="$emit('import',{id:importSlot,file:$event.target.files[0]});$event.target.value=''" />
</label>
</div>
<p class="save-footer">\u52A8\u753B\u6267\u884C\u671F\u95F4\u4E0D\u53EF\u4FDD\u5B58\u3002\u6D4F\u89C8\u5668\u6E05\u7406\u7AD9\u70B9\u6570\u636E\u4F1A\u79FB\u9664\u672C\u673A\u5B58\u6863\uFF0C\u91CD\u8981\u6218\u5C40\u8BF7\u5BFC\u51FA\u5907\u4EFD</p>
</section>
</div>`
};
const TutorialBook = {
  props: ["chapters", "figures"],
  emits: ["home", "practice"],
  methods: { scopedFigure(svg, index) {
    const prefix = "guide-" + index + "-";
    return svg.replace(/id="([^"]+)"/g, (_, id) => 'id="' + prefix + id + '"').replace(/url\(#([^)]*)\)/g, (_, id) => "url(#" + prefix + id + ")").replace(/aria-labelledby="([^"]+)"/g, (_, ids) => 'aria-labelledby="' + ids.split(" ").map((id) => prefix + id).join(" ") + '"');
  } },
  template: `<main class="tutorial-book">
<div class="book-heading">
<div>
<p class="eyebrow">FIELD GUIDE</p>
<h1>\u56FE\u6587\u4F5C\u6218\u6307\u5357</h1>
<p>\u5148\u7406\u89E3\u89C4\u5219\uFF0C\u518D\u51B3\u5B9A\u672C\u56DE\u5408\u7684\u822A\u7EBF\u4E0E\u706B\u529B</p>
</div>
<div>
<button @click="$emit('home')">\u8FD4\u56DE\u4E3B\u83DC\u5355</button>
<button class="primary" @click="$emit('practice')">\u4EA4\u4E92\u6559\u5B66</button>
</div>
</div>
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
<p v-for="(p,j) in (chapter.paragraphs||chapter.body||[])" :key="j">{{p}}</p>
<ul v-if="chapter.bullets">
<li v-for="b in chapter.bullets">{{b}}</li>
</ul>
<aside v-if="chapter.takeaway||chapter.tip">{{chapter.takeaway||chapter.tip}}</aside>
</article>
<button class="primary" @click="$emit('practice')">\u5728\u4EA4\u4E92\u6559\u5B66\u4E2D\u8BD5\u4E00\u904D</button>
</main>`
};
const TutorialMenu = {
  props: ["lessons"],
  emits: ["home", "start"],
  template: `<main class="tutorial-menu">
<div class="book-heading">
<div>
<p class="eyebrow">TRAINING WATERS</p>
<h1>\u4EA4\u4E92\u6559\u5B66</h1>
<p>\u6BCF\u4E00\u6B65\u8981\u771F\u7684\u5B8C\u6210\u64CD\u4F5C\u3002\u6F14\u7EC3\u4E0E\u666E\u901A\u6218\u5C40\u3001\u5B58\u6863\u76F8\u4E92\u72EC\u7ACB</p>
</div>
<button @click="$emit('home')">\u8FD4\u56DE\u4E3B\u83DC\u5355</button>
</div>
<div class="lesson-grid">
<button v-for="(lesson,i) in lessons" :key="lesson.id" class="lesson-card" @click="$emit('start',lesson.id)">
<span>{{String(i+1).padStart(2,'0')}} / {{lesson.section==='advanced'?'\u8FDB\u9636':'\u57FA\u7840'}}</span>
<strong>{{lesson.title}}</strong>
<p>{{lesson.goal}}</p>
<small>{{lesson.duration}} \xB7 {{lesson.steps.length}} \u4E2A\u5B9E\u64CD\u6B65\u9AA4 \u2192</small>
</button>
</div>
</main>`
};
export {
  HomeScreen,
  SaveManager,
  TutorialBook,
  TutorialMenu
};
