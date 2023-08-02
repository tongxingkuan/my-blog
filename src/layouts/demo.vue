<template>
  <div class="article-layout">
    <header class="header">
      <h1>童话的博客</h1>
      <globalSearch />
    </header>
    <nav class="nav">
      当前位置：
      <el-breadcrumb separator="/">
        <template v-for="(breadcrumb, index) in computedRouteList" :key="breadcrumb.name">
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
    <main class="demos">
      <el-scrollbar style="max-height: calc(100vh - 110px)">
        <slot></slot>
      </el-scrollbar>
    </main>
    <aside class="all-tag-list">
      
    </aside>
    <footer class="footer">版权所有@copyright</footer>
  </div>
</template>
<script setup lang="ts">
declare interface Breadcrumb {
  name: string;
  path: string;
}

// 转换路由路径为面包屑导航
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

</script>
<style lang="less" scoped>
.header {
  height: 50px;
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;

  .logo {
    width: 50px;
    height: 50px;
  }

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

.demos {
  display: block;
  width: auto;
  height: calc(100vh - 110px);
}

.footer {
  height: 30px;
  text-align: center;
  line-height: 30px;
}

:global(.el-scrollbar__bar.is-horizontal) {
  display: none;
}
</style>