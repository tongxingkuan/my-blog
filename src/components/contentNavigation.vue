<template>
  <ul class="navigation">
    <li v-for="(item, index) in navigationTree" :key="index" :title="item.title">
      <NuxtLink :to="item._path">
        {{ item.title }}
      </NuxtLink>
      <contentNavigation
        v-if="item.children"
        :navigation-tree="item.children"
        class="subnavigation"
      />
    </li>
  </ul>
</template>

<script setup>
defineProps({
  navigationTree: {
    type: Array,
    default: () => [],
  },
});

</script>
