<script setup lang="ts">
import {useAppSession} from '../session-context.ts';

import SaveManager from '../SaveManager.vue';

const {saveRecords, saveNotice, pendingSave, canSave, writeSave, loadSave, confirmSaveAction, importSave, exportSave, goHome}=useAppSession();

</script>
<template>
<SaveManager standalone :records="saveRecords" :can-save="canSave" :notice="saveNotice" :pending="pendingSave" :in-battle="false" @close="goHome" @write="writeSave" @load="loadSave" @export="exportSave" @import="importSave" @confirm="confirmSaveAction" @cancel="pendingSave=null"/>
</template>
