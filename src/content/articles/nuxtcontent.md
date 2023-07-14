---
title: 'nuxt/content'
description: '从我的博客开发实践带领读者走近nuxt/content'
query: 'nuxtcontent'
---

## nuxt/content

### 相关文档

**nuxt/content** v2版本是针对 **nuxt 3** 的一个模块库。引入nuxt/content后，可以参考 :c-link{name=nuxt3文档-模块 href=https://57code.gitee.io/nuxt3-docs-zh/directory-structure/nuxt-config.html#%E6%9E%84%E5%BB%BA%E6%9C%9F%E6%A8%A1%E5%9D%97-buildmodules target=blank} 添加配置。

本文章不是完整的nuxt/content文档，仅针对本项目中使用nuxt/content相关技术的说明。了解更多可以参考 :c-link{name=nuxt/content官方文档 href=https://content.nuxtjs.org/examples/navigation/fetch-content-navigation target=blank} 。且本文章只是关于nuxt/content（以下简称content）相关技术的讨论，如需了解本文对nuxt3的使用，请前往 [nuxt3](/articles/nuxt3)。

### 特点

为什么要引入content或者说它有哪些特点呢？

1. `content v2`作为`nuxt3`的模块库，能友好支持`nuxt3`。
2. 基于文件的内容管理系统，根据文件目录自动生成web页面、导航，同时还提供根据匹配内容快速查找文档的功能。
3. MDC语法支持-即 **Markdown Component** 。使得常规`Markdown`能够支持`vue`组件的引入。
4. 支持代码高亮。

综合上述特点，本博客引入`content`，运用到了其内容管理，导航，锚点导航，源码展示等特点。

### 安装

本博客先通过脚手架安装`nuxt3`项目，之后引入`content`。

```cmd
yarn add nuxt/content
```

官方文档给出一种随项目搭建自动引入方式的脚手架命令

```cmd
npx nuxi@latest init <content-app> -t content
```

安装依赖采用 [pnpm](/articles/packagetools)  方式

```cmd
pnpm install --shamefully-hoist
```

### 配置

该配置为**构建期模块配置**，顾名思义，引入content能够极大的便利我们的开发，代替我们做了大量的配置开发工作量，包括文章页面路由管理、文章内容查找、代码高亮展示、锚点导航等等。

```typescript
export default defineNuxtConfig({
  modules: ['@nuxt/content'],  // 引入模块
  content: {
    markdown: {
      toc: {
        depth: 5,             // ？
        searchDepth: 5,       // ？
      }
    },
    highlight: {              // 配置代码高亮
      preload: [
        'javascript',
        'typescript',
        'html',
        'css',
        'less',
        'json',
        'cmd'
      ]
    },
  },
})
```

### 组件

#### 内置组件

内置组件无需引入，可全局使用。
##### ContentDoc

该组件用于将markdown文档渲染成页面元素。

###### props

- `tag`：根组件标签名，默认为`div`。
- `path`：渲染文件路径，不写则按照`route.path`匹配。
- `query`：查询字段，用于被 **queryContent** 捕获。
- `excerpt`：是否展示摘录，默认`false`。
- `head`：控制head标签内容展示，可以优化`SEO`，默认`true`。

###### slots

`notFound`、`not-found` ：用于未匹配到的默认展示。
`empty` ：用于者文档内容为空的默认展示。
###### example

```html
<ContentDoc>
  <template #notFound>
    <h2>未找到资源</h2>
  </template>
  <template #empty>
    <h2>资源为空</h2>
  </template>
</ContentDoc>
```

##### ContentList

该组件用于查询匹配条件的页面。

###### props

- `path`：指定文档所在路径
- `query`： 查询条件

###### slots

`notFound`、`not-found` ：用于未匹配到的默认展示。
`empty` ：用于者文档内容为空的默认展示。

###### example

```vue
<script setup lang="ts">
import type { QueryBuilderParams } from '@nuxt/content/dist/runtime/types'
const queryStr = ref('');
// 定义查询条件
const query = ref<QueryBuilderParams>({ path: '/articles', where: [{ query: { $eq: queryStr.value.toLocaleLowerCase() } }] })
// 监听输入框变化并重写查询条件query
watch(queryStr, (newQuery) => {
  query.value = { path: '/articles', where: [{ query: { $eq: newQuery.toLocaleLowerCase() } }] }
})
const flag = ref(true);
const hide = () => {
  setTimeout(() => {
    // 避免影响跳转，先跳转后隐藏
    flag.value = false;
  }, 1000)
}
const show = () => {
  flag.value = true;
}
</script>

<template>
  <div class="gs-container">
    全局搜索：<el-input v-model="queryStr" class="gs-container-search" @blur="hide" @focus="show"></el-input>
    <ContentList :query="query">
      <template #default="{ list }">
        <ul class="gs-container-search-list" v-if="flag">
          <el-scrollbar style="max-height: 250px">
            <li v-for="article in list" :key="article._path" class="gs-container-search-list-item">
              <NuxtLink :to="article._path">
                <div class="title">{{ article.title }}</div>
                <div class="desc">{{ article.description }}</div>
              </NuxtLink>
            </li>
          </el-scrollbar>
        </ul>
      </template>
      <template #not-found>
        <p class="gs-container-search-no-data" v-if="queryStr && flag">没有找到相关资源</p>
      </template>
    </ContentList>
  </div>
</template>

<style lang="less">
.gs-container {
  width: 300px;
  height: 100%;
  margin-right: 20px;
  line-height: 50px;
  position: relative;

  .gs-container-search {
    width: auto;
  }

  .gs-container-search-list {
    position: absolute;
    width: 300px;
    max-height: 250px;
    border-radius: 6px;
    padding: 20px;
    z-index: 10;

    .gs-container-search-list-item {
      width: 100%;
      height: 50px;
      margin: 5px 0;
      padding: 5px;
      border-radius: 5px;
      display: flex;
      line-height: 20px;
      flex-direction: column;
      .title {
        font-size: 16px;
        font-weight: 600;
        height: 20px;
      }
      .desc {
        font-size: 14px;
        width: 100%;
        height: 20px;
        text-overflow: ellipsis;
        white-space: nowrap;
        overflow: hidden;
      }
    }
  }

  .gs-container-search-no-data {
    width: 300px;
    position: absolute;
    text-align: center;
    padding: 20px;
    border-radius: 6px;
    z-index: 10;
  }
}
</style>
```
#### 自定义组件

### 问题：
1. 按照nuxt/content的 :c-link{name=引导 href=https://content.nuxtjs.org/examples/mdc/props target=blank} ，设置nuxt.config.ts以后，部分组件无法正常使用

```javascript
components: {
  path: '~/components/content',
  gobal: true
}
```

这是默认配置，默认components文件夹中的组件都设置的全局，如果加上这个属性，那就是部分全局，剩下的都不再作为全局组件，所以产生了问题。
解决方法：去掉该条配置项即可

2. 组件嵌套问题

比如我想在一个组件A中引入另一个组件B，并将组件B作为组件A某一个属性值的一部分，此时该如何编写md。
