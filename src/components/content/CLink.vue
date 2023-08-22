<template>
  <a :href="isEncode ? computedHref : href" :target="'_' + target">{{ name }}</a>
</template>
<script setup>
const { href } = defineProps({
  name: {
    type: String,
    default: ''
  },
  href: {
    type: String,
    default: '#'
  },
  target: {
    type: String,
    default: 'self'
  },
  isEncode: {
    type: Boolean,
    default: false
  }
})
const computedHref = computed(() => {
  return decodeURIComponent(href)
})
</script>