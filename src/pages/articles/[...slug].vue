<template>
  <ContentDoc>
    <template #not-found>
      <h2>未找到资源</h2>
    </template>
    <template #empty>
      <h2>资源为空</h2>
    </template>
  </ContentDoc>
</template>
<script setup>

definePageMeta({
  layout: "article"
});

</script>