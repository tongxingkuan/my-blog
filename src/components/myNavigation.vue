<script setup>
defineProps({
  navigationTree: {
    type: Array,
    default: () => [],
  },
});

</script>

<template>
  <ul class="navigation">
    <li v-for="(item, index) in navigationTree" :key="index">
      <NuxtLink :to="item._path">
        {{ item.title }}
      </NuxtLink>
      <myNavigation
        v-if="item.children"
        :navigation-tree="item.children"
        class="subnavigation"
      />
    </li>
  </ul>
</template>

<style lang="less" scoped>
.navigation {
  font-size: 16px;
  font-weight: 400;
  font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont,
    Segoe UI, Roboto, Helvetica Neue, Arial, Noto Sans, sans-serif,
    "Apple Color Emoji", "Segoe UI Emoji", Segoe UI Symbol, "Noto Color Emoji";
  .subnavigation {
    font-size: 14px;
    font-weight: 100;
  }
}

.navigation ul {
  margin-left: 0.8rem;
}

.subnavigation li a::before {
  content: "| ";
}
</style>
