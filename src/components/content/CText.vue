<template>
  <p :style="{ 'text-align': dir }">
    {{ text }}
    <slot></slot>
  </p>
</template>
<script setup>
defineProps({
  dir: {
    type: String,
    default: 'left'
  },
  text: {
    type: String,
    default: ''
  }
})
</script>