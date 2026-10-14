<script lang="ts" setup>
import type { ToasterProps } from "vue-sonner"
import AppIcon from '@/components/AppIcon.vue'
import { Toaster as Sonner } from "vue-sonner"
import { cn } from "@/lib/utils"

const props = defineProps<ToasterProps>()
</script>

<template>
  <Sonner
    :class="cn('toaster group', props.class)"
    :style="{
      '--normal-bg': 'var(--popover)',
      '--normal-text': 'var(--popover-foreground)',
      '--normal-border': 'var(--border)',
      '--border-radius': 'var(--radius-lg)',
    }"
    v-bind="props"
  >
    <template #success-icon>
      <AppIcon name="check" class="size-4" />
    </template>
    <template #info-icon>
      <AppIcon name="question" class="size-4" />
    </template>
    <template #warning-icon>
      <AppIcon name="warning" class="size-4" />
    </template>
    <template #error-icon>
      <AppIcon name="warning" class="size-4" />
    </template>
    <template #loading-icon>
      <div>
        <AppIcon name="spinner" class="size-4 animate-spin" />
      </div>
    </template>
    <template #close-icon>
      <AppIcon name="close" class="size-4" />
    </template>
  </Sonner>
</template>
