<template>
  <p :style="{ 'text-align': dir }">
    {{ text }}
    <slot name="textSlot"></slot>
  </p>
</template>
<script setup>
defineProps({
  text: {
    type: String,
    default: ''
  },
  dir: {
    type: String,
    default: 'left'
  },
})
</script>