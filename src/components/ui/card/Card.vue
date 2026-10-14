<script setup lang="ts">
import type { HTMLAttributes } from "vue"
import { cn } from "@/lib/utils"

const props = defineProps<{
  class?: HTMLAttributes["class"]
}>()
</script>

<template>
  <div
    data-slot="card"
    :class="
      cn(
        'bg-card text-card-foreground flex flex-col gap-4 rounded-lg border border-[var(--line-1)] p-5 shadow-[var(--shadow-1)]',
        props.class,
      )
    "
  >
    <slot />
  </div>
</template>
