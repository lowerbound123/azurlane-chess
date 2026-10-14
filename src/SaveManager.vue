<script setup lang="ts">
import PageHead from './components/shell/PageHead.vue';
import {AlertDialog, AlertDialogContent, AlertDialogTitle, AlertDialogDescription} from './components/ui/alert-dialog';
import {Card} from './components/ui/card';
import {ref} from 'vue';

import AppIcon from './components/AppIcon.vue';
import {Button} from './components/ui/button';
import {Input} from './components/ui/input';

import type {SaveRecord} from '../shared/save.ts';
import type {PendingSave} from './stores/ui.ts';

const props=withDefaults(defineProps<{records:SaveRecord[];canSave:boolean;notice:string;pending:PendingSave|null;inBattle:boolean;standalone?:boolean}>(),{});
const emit=defineEmits(["close", "write", "load", "export", "import", "confirm", "cancel"]);
const label=ref("");
const importSlot=ref("slot-1");
function slotName(id:string){
    return id === "auto" ? "\u81EA\u52A8\u5B58\u6863" : "\u624B\u52A8\u69FD\u4F4D " + id.slice(-1);
  }
function time(t:string){
    return new Date(t).toLocaleString("zh-CN");
  }
</script>
<template>
<div :class="standalone?'save-page':'modal-backdrop save-backdrop'">
<section class="save-manager" :role="standalone?'region':'dialog'" :aria-modal="standalone?undefined:true" aria-label="保存与读取游戏">
<PageHead eyebrow="CAPTAIN’S ARCHIVE" title="保存与读取"><template #actions><Button variant="outline" @click="$emit('close')"><AppIcon name="back"/> {{inBattle?'返回战局':'返回主菜单'}}</Button></template></PageHead>
<p class="save-explanation">自动存档记录稳定的部署、规划与回合结果。手动槽位不会自动覆盖。存档仅在当前浏览器；导出 JSON 可跨设备备份</p>
<p v-if="notice" class="save-notice" role="status">{{notice}}</p>
<AlertDialog :open="!!pending" @update:open="!$event&&$emit('cancel')"><AlertDialogContent class="save-confirm"><AlertDialogTitle>确认存档操作</AlertDialogTitle><AlertDialogDescription>{{pending?.message}}</AlertDialogDescription>
<Button variant="default" class="primary" @click="$emit('confirm')"><AppIcon name="folder"/> {{pending?.kind==='load'?'确认读取':pending?.kind==='new'?'确认新游戏':'确认覆盖'}}</Button>
<Button variant="outline" @click="$emit('cancel')"><AppIcon name="close"/> 取消</Button>
</AlertDialogContent></AlertDialog>
<label v-if="canSave" class="save-label">存档名称 <Input v-model="label" maxlength="80" placeholder="留空自动命名" />
</label>
<div class="save-slots">
<Card v-for="record in records" :key="record.id" :data-save-slot="record.id" class="save-slot">
<div>
<small>{{slotName(record.id)}}</small>
<strong>{{record.save?record.save.label:'空槽位'}}</strong>
<p v-if="record.save">R{{String(record.save.state.game.round).padStart(2,'0')}} · {{record.save.state.game.phase==='deploy'?'部署中':record.save.state.game.phase==='ended'?'已结束':'规划中'}} · {{time(record.save.timestamp)}}</p>
<p v-else-if="record.error" class="save-error">{{record.error.message}}</p>
</div>
<div class="slot-actions">
<Button variant="outline" v-if="record.id!=='auto'" class="write-slot" :disabled="!canSave||!!pending" @click="$emit('write',{id:record.id,label})"><AppIcon name="save"/> 保存</Button>
<Button variant="outline" class="load-slot" :disabled="!record.save||!!pending" @click="$emit('load',record.id)"><AppIcon name="folder"/> 读取</Button>
<Button variant="outline" :disabled="!record.save||!!pending" @click="$emit('export',record.save)"><AppIcon name="save"/> 导出</Button>
</div>
</Card>
</div>
<div class="backup-tools">
<Button variant="outline" :disabled="!canSave||!!pending" @click="$emit('export',null)"><AppIcon name="save"/> 导出当前战局 JSON</Button>
<label>导入到 <select v-model="importSlot">
<option value="slot-1">槽位 1</option>
<option value="slot-2">槽位 2</option>
<option value="slot-3">槽位 3</option>
</select>
</label>
<label class="file-import-button">选择 JSON 文件<Input type="file" accept=".json,application/json" :disabled="!!pending" @change="$emit('import',{id:importSlot,file:$event.target.files[0]});$event.target.value=''"  />
</label>
</div>
<p class="save-footer">动画执行期间不可保存。浏览器清理站点数据会移除本机存档，重要战局请导出备份</p>
</section>
</div>
</template>
