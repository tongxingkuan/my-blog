<template>
  <p :style="{ 'text-align': dir }">
    <slot></slot>
  </p>
</template>
<script setup>
defineProps({
  dir: {
    type: String,
    default: 'left'
  },
})
</script>