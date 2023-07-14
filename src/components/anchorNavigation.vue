<template>
  <ul class="navigation">
    <li v-for="(item, index) in navigationTree" :key="index" :title="item.text" :class="(currentHash === '#' + item.id) ? 'active-hash' : ''">
      <a :href="'#' + item.id">{{ item.text }}</a>
      <anchorNavigation
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

const route = useRoute()
const currentHash = ref(route.hash)
watch(route, (newRoute) => {
  currentHash.value = newRoute.hash
});

</script>