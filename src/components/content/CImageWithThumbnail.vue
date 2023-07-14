<template>
  <el-image 
    :src="src"
    :zoom-rate="1.2"
    :preview-src-list="[src]"
    :initial-index="4"
    fit="cover"></el-image>
</template>
<script setup>
defineProps({
  alt: {
    type: String,
    default: ''
  },
  src: {
    type: String,
    default: ''
  }
})
</script>