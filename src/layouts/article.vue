<template>
  <div class="article-layout">
    <header class="header">
      <h1>童话的博客</h1>
    </header>
    <nav class="nav">
      当前位置：
      <el-breadcrumb separator="/">
        <template
          v-for="(breadcrumb, index) in computedRouteList"
          :key="breadcrumb.name"
        >
          <template v-if="index < computedRouteList.length - 1">
            <el-breadcrumb-item :to="{ path: breadcrumb.path }">{{
              breadcrumb.name
            }}</el-breadcrumb-item>
          </template>
          <template v-else>
            <el-breadcrumb-item>{{ breadcrumb.name }}</el-breadcrumb-item>
          </template>
        </template>
      </el-breadcrumb>
    </nav>
    <aside class="aside-left">
      <myNavigation :navigation-tree="navigation"></myNavigation>
    </aside>
    <main class="main">
      <el-scrollbar style="max-height: calc(100vh - 110px)">
        <slot></slot>
      </el-scrollbar>
    </main>
    <aside class="aside-right">aside-right</aside>
    <footer class="footer">版权所有@copyright</footer>
  </div>
</template>
<script setup lang="ts">
declare interface Breadcrumb {
  name: string;
  path: string;
}

definePageMeta({
  pageTransition: {
    name: 'page'
  }
})

const covert = (paths: string[]): Breadcrumb[] => {
  if (!paths || paths.length === 0) return [];
  let res: Breadcrumb[] = [],
    current = "",
    newItem: Breadcrumb;
  paths.forEach((item, index) => {
    if (index === 0) {
      res.push({
        name: item ? item : "home",
        path: "/" + item,
      });
    } else {
      if (current) {
        current += "/" + paths[index];
        newItem = {
          name: paths[index],
          path: current,
        };
      } else {
        current = paths[index - 1] + "/" + paths[index];
        newItem = {
          name: paths[index],
          path: current,
        };
      }
      res.push(newItem);
    }
  });
  return res;
};

const route = useRoute();

const computedRouteList = computed(() => {
  const routeList = route.path.split("/");
  return covert(routeList);
});

const { data: navigation } = await useAsyncData("navigation", () => {
  return fetchContentNavigation();
});
</script>
<style lang="less" scoped>
.header {
  height: 50px;
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  h1 {
    width: auto;
    margin-left: 10%;
  }
}
.nav {
  height: 20px;
  padding: 5px 20px;
  display: flex;
  align-items: center;
  justify-content: right;
}
.aside-left,
.aside-right {
  float: left;
  display: block;
  width: 20%;
  height: calc(100vh - 110px);
}
.main {
  float: left;
  display: block;
  width: 60%;
  height: calc(100vh - 110px);
}
.footer {
  height: 30px;
  text-align: center;
  line-height: 30px;
}
</style>