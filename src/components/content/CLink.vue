<template>
  <a :href="href" :target="'_' + target">{{ name }}</a>
</template>
<script setup>
defineProps({
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
  }
})
</script>