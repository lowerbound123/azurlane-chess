<script setup lang="ts">
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { icons, type IconName } from '../icons';
const props=withDefaults(defineProps<{name:IconName;spin?:boolean}>(),{spin:false});
</script>
<template><FontAwesomeIcon :icon="icons[props.name]" aria-hidden="true" :spin="props.spin" class="app-icon"/></template>
