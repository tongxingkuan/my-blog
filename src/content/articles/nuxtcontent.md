---
title: "nuxt/content"
description: "从我的博客开发实践带领读者走近nuxt/content"
querys: ["nuxt", "content"]
---

## nuxt/content

### 相关文档

**nuxt/content** v2 版本是针对 **nuxt 3** 的一个模块库。引入 nuxt/content 后，可以参考 :c-link{name=nuxt3文档-模块 href=https://57code.gitee.io/nuxt3-docs-zh/directory-structure/nuxt-config.html#%E6%9E%84%E5%BB%BA%E6%9C%9F%E6%A8%A1%E5%9D%97-buildmodules target=blank} 添加配置。

本文章不是完整的 nuxt/content 文档，仅针对本项目中使用 nuxt/content 相关技术的说明。了解更多可以参考 :c-link{name=nuxt/content官方文档 href=https://content.nuxtjs.org/examples/navigation/fetch-content-navigation target=blank} 。且本文章只是关于 nuxt/content（以下简称 content）相关技术的讨论。

### 特点

为什么要引入 content 或者说它有哪些特点呢？

1. `content v2`作为`nuxt3`的模块库，能友好支持`nuxt3`。
2. 基于文件的内容管理系统，根据文件目录自动生成 web 页面、导航，同时还提供根据匹配内容快速查找文档的功能。
3. MDC 语法支持-即 **Markdown Component** 。使得常规`Markdown`能够支持`vue`组件的引入。
4. 支持代码高亮。
5. 生成 meta 标签，利于 SEO。

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

安装依赖采用 [pnpm](/articles/packagetools) 方式

```cmd
pnpm install --shamefully-hoist
```

### 配置

该配置为**构建期模块配置**，顾名思义，引入 content 能够极大的便利我们的开发，代替我们做了大量的配置开发工作量，包括文章页面路由管理、文章内容查找、代码高亮展示、锚点导航等等。

```typescript
export default defineNuxtConfig({
  modules: ["@nuxt/content"], // 引入模块
  content: {
    markdown: {
      toc: {
        depth: 5, // ？
        searchDepth: 5, // ？
      },
    },
    highlight: {
      // 配置代码高亮
      preload: [
        "javascript",
        "typescript",
        "html",
        "css",
        "less",
        "json",
        "cmd",
      ],
    },
  },
});
```

### components

#### 内置组件

内置组件无需引入，可全局使用。

##### ContentDoc

该组件用于将 markdown 文档渲染成页面元素。

###### props

- `tag`：根组件标签名，默认为`div`。
- `path`：渲染文件路径，不写则按照`route.path`匹配。
- `query`：查询字段，用于被 **queryContent** 捕获。
- `excerpt`：是否展示摘录，默认`false`。
- `head`：控制 head 标签内容展示，可以优化`SEO`，默认`true`。

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
import type { QueryBuilderParams } from "@nuxt/content/dist/runtime/types";
const queryStr = ref("");
// 定义查询条件
const query = ref<QueryBuilderParams>({
  path: "/articles",
  where: [{ query: { $eq: queryStr.value.toLocaleLowerCase() } }],
});
// 监听输入框变化并重写查询条件query
watch(queryStr, (newQuery) => {
  query.value = {
    path: "/articles",
    where: [{ query: { $eq: newQuery.toLocaleLowerCase() } }],
  };
});
const flag = ref(true);
const hide = () => {
  setTimeout(() => {
    // 避免影响跳转，先跳转后隐藏
    flag.value = false;
  }, 1000);
};
const show = () => {
  flag.value = true;
};
</script>

<template>
  <div class="gs-container">
    全局搜索：<el-input
      v-model="queryStr"
      class="gs-container-search"
      @blur="hide"
      @focus="show"
    ></el-input>
    <ContentList :query="query">
      <template #default="{ list }">
        <ul class="gs-container-search-list" v-if="flag">
          <el-scrollbar style="max-height: 250px">
            <li
              v-for="article in list"
              :key="article._path"
              class="gs-container-search-list-item"
            >
              <NuxtLink :to="article._path">
                <div class="title">{{ article.title }}</div>
                <div class="desc">{{ article.description }}</div>
              </NuxtLink>
            </li>
          </el-scrollbar>
        </ul>
      </template>
      <template #not-found>
        <p class="gs-container-search-no-data" v-if="queryStr && flag">
          没有找到相关资源
        </p>
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

内置组件就介绍这么多，更多内置组件可以去查阅 :c-link{name=nuxt/content官方文档 href=https://content.nuxtjs.org/examples/navigation/fetch-content-navigation target=blank} 。

#### 自定义组件

在开发过程中，肯定会遇到一些内置组件无法满足的需求。

##### 需求

需要在 markdown 中加入一个可以在新窗口打开的链接

##### 分析

如果是在 html 页面，只需要一个`a标签`，`target`属性设置为`_blank`即可。
在 markdown 中，原生语法不支持新窗口打开功能，因此需要采用 content 自定义组件的方式实现。

##### 用法

在`components`目录下新建子目录`content`，在该目录下声明的组件可以直接在 markdown 文档中使用，声明一个组件文件`CLink`。但其实，nuxt3 中，components 组件中的所有组件都已被声明为全局组件，所以只要是 components 目录下的所有组件均可在 markdown 文件中引入。`CLink.vue`代码如下：

```vue
<template>
  <a :href="href" :target="'_' + target">{{ name }}</a>
</template>
<script setup>
defineProps({
  name: {
    type: String,
    default: "",
  },
  href: {
    type: String,
    default: "#",
  },
  target: {
    type: String,
    default: "self",
  },
});
</script>
```

要想在 markdown 中引入，其语法如下：

###### 单行组件

单行组件以冒号（:）开头，组件名称可以用大写或者中横线（-）分隔，参数以花括号（{}）包裹，多个参数用空格分开

```markdown
:c-link{name=vue3官方文档 href=https://cn.vuejs.org/guide/introduction.html target=blank}

:CLink{name=vue3官方文档 href=https://cn.vuejs.org/guide/introduction.html target=blank}
```

###### 嵌套组件

嵌套组件以双冒号（::）开头，中间包裹嵌套其他组件

```markdown
::c-slot
::c-nested
This content comes from a nested MDC component in markdown.
::
::
```

###### 组件插槽

```vue
<template>
  <div>
    <p style="border: 1px solid; padding: .5rem">
      <!-- 默认插槽 -->
      <slot></slot>
    </p>
    <hr />
    <!-- 具名插槽 -->
    <slot name="namedSlot"></slot>
  </div>
</template>
```

```md
::c-slot
Rendered in the default slot of the `AppSlot` component from markdown

#namedSlot
Content inside the `namedSlot` slot
::
```

::c-slot
Rendered in the default slot of the `AppSlot` component from markdown

#namedSlot
Content inside the `namedSlot` slot
::

### composables

包含封装过的可复用的 api。

#### queryContent

在 contents 目录下查询并获取匹配的内容。

##### where(opts)

过滤查询条件。采用 Mongo 查询语法：

- `$eq`：等于
- `$gt`：大于
- `$gte`: 大于等于
- `$lt`：小于
- `$lte`：小于等于
- `$in`：包含于

```typescript
// Implicit (assumes $eq operator)
const articles = await queryContent("articles")
  .where({ title: "Home" })
  .findOne();

// Explicit $eq
const articles = await queryContent("articles")
  .where({ title: { $eq: "Home" } })
  .findOne();

// $gt
const articles = await queryContent("articles")
  .where({ age: { $gt: 18 } })
  .find();

// $in
const articles = await queryContent("articles")
  .where({ name: { $in: ["odin", "thor"] } })
  .find();
```

##### sort(opts)

排序：默认大小写敏感字典顺序排序，可选参数有：

- `$sensitivity`：值为 `base` 则不区分大小写排序
- `$numeric`：是否按照数字大小排序
- `$caseFirst`：大小写优先排序

##### limit(N: number)

限制展示 N 个

##### skip(N: number)

跳过 N 个

##### without(key: string | Array)

满足的不留下

##### only(key: string | Array)

满足的留下

##### find()

查询多个

##### findOne()

查询一个

##### 全局查找

本博客采用的全局查找就是通过构建一个 **query: QueryBuilderParams** ，然后通过组件`<ContentList :query='query'></ContentList>`查找获取文章，文章用于查询的信息是在 md 文件中通过`---`语法声明的。

```vue
<script setup lang="ts">
import type { QueryBuilderParams } from "@nuxt/content/dist/runtime/types";
const queryStr = ref<string>("");
let query: QueryBuilderParams = ref<QueryBuilderParams>({});
if (queryStr.value !== "") {
  // 匹配querys数组
  query.value = ref<QueryBuilderParams>({
    path: "/articles",
    where: [{ querys: { $contains: queryStr.value.toLocaleLowerCase() } }],
  });
}
watch(queryStr, (newQuery) => {
  if (newQuery !== "") {
    // 匹配querys数组
    query.value = {
      path: "/articles",
      where: [{ querys: { $contains: newQuery.toLocaleLowerCase() } }],
    };
  }
});
const flag = ref(true);
const hide = () => {
  setTimeout(() => {
    // 避免影响跳转，先跳转后隐藏
    flag.value = false;
  }, 500);
};
const show = () => {
  flag.value = true;
};
</script>

<template>
  <div class="gs-container">
    全局搜索：<el-input
      v-model="queryStr"
      class="gs-container-search"
      @blur="hide"
      @focus="show"
    ></el-input>
    <ContentList :query="query">
      <template #default="{ list }">
        <ul class="gs-container-search-list" v-if="flag">
          <el-scrollbar style="max-height: 210px; overflow: scroll;">
            <li
              v-for="article in list"
              :key="article._path"
              class="gs-container-search-list-item"
            >
              <NuxtLink :to="article._path">
                <div class="title">{{ article.title }}</div>
                <div class="desc">{{ article.description }}</div>
              </NuxtLink>
            </li>
          </el-scrollbar>
        </ul>
      </template>
      <template #not-found v-if="flag">
        <p class="gs-container-search-no-data">没有找到相关资源</p>
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

  pre {
    display: none;
  }

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

#### fetchContentNavigation

获取 content 路由导航

##### 用法

获取路由（树结构）

```typescript
// fetchContentNavigation 根据content目录结构生成路由，用queryContent限定想要的目录
const { data: navigation } = await useAsyncData("cNavigation", () => {
  return fetchContentNavigation(queryContent("articles"));
});
```

```vue
<contentNavigation :navigation-tree="navigation"></contentNavigation>
```

渲染路由（树结构）

```vue
<template>
  <ul class="navigation">
    <li
      v-for="(item, index) in navigationTree"
      :key="index"
      :title="item.title"
    >
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
```

##### 参数

- `QueryBuilder`：`queryContent()`的返回值，用于过滤输出目录

### 自动生成

至此，介绍完了 nuxt/content 的使用方式，它有很多自动生成的特性：

1. 根据 content 目录自动生成导航菜单
2. 根据 content 目录自动生成页面结构
3. 根据 markdown 文档自动生成锚节点导航
4. 自带 api 获取以及过滤内容，速度快性能高
5. 自动实现代码高亮效果
6. 生成 meta 标签，利于 SEO。

#### 案例

##### 根据 markdown 文档自动生成锚节点导航

首先定义文档 query 字段用于查询条件过滤：

```md
---
title: "vue3源码解读"
description: "本文将从入口文件到打包配置，浏览器调试等一系列方面展开解读vue3源码"
query: "vue3"
---
```

然后根据页面参数获取到对应文档：

```typescript
// 通过查询query项匹配路由参数slug，页面由md文档自动生成，此处的slug对应就是页面对应的md文档名称，也就是页面所属的子路由
if (route.params.slug && route.params.slug.length > 0) {
  const articles = await queryContent("articles")
    .where({ query: { $eq: route.params.slug[0] } })
    .find();
  if (articles && articles.length > 0) {
    aNavigation.value = articles[0].body.toc.links;
  } else {
    aNavigation.value = [];
  }
}
```

监听路由变化，并重新查询文档、生成锚点导航：

```typescript
watch(route, async ({ params }) => {
  // 访问pages/index不会有slug，所以判断
  if (params.slug) {
    // 查询articles目录下md文件中用"---"包裹的文件说明，其中route说明等于当前路由slug
    const articles = await queryContent("articles")
      .where({ query: { $eq: params.slug[0] } })
      .find();
    if (articles && articles.length > 0) {
      aNavigation.value = articles[0].body.toc.links;
    } else {
      aNavigation.value = [];
    }
  }
});
```

展示路由、高亮当前路由：

```vue
<template>
  <ul class="navigation">
    <li
      v-for="(item, index) in navigationTree"
      :key="index"
      :title="item.text"
      :class="currentHash === '#' + item.id ? 'active-hash' : ''"
    >
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

const route = useRoute();
const currentHash = ref(route.hash);
watch(route, (newRoute) => {
  currentHash.value = newRoute.hash;
});
</script>
```

### 项目开发问题

#### 组件配置问题

:c-link{name=nuxt/content官方文档 href=https://content.nuxtjs.org/examples/mdc/props target=blank} 有如下配置，设置如下 nuxt.config.ts 以后，部分组件无法正常使用

```javascript
components: {
  path: '~/components/content',
  gobal: true
}
```

nuxt3 项目中，默认 components 文件夹中的组件是全局，如果加上这个属性，那就是部分全局，剩下的都不再作为全局组件，所以产生了问题。

`解决方法`：去掉该条配置项即可

#### 组件嵌套问题

比如我现在有一个组件用于生成在新窗口打开的链接，有另一个组件是用于居中展示文字，我现在希望居中展示可以在新窗口打开的链接

它们各自应用代码见下：

```md
:c-link{name=引导 href=# target=blank}
```

```md
:c-text{text=引导 dir=center}
```

那么我们按照[组件插槽](#组件插槽)的方式，改写 CText.vue 代码

改写前：

```vue
<template>
  <p :style="{ 'text-align': dir }">
    {{ text }}
  </p>
</template>
<script setup>
defineProps({
  text: {
    type: String,
    default: "",
  },
  dir: {
    type: String,
    default: "left",
  },
});
</script>
```

改写后：

```vue
<template>
  <p :style="{ 'text-align': dir }">
    <slot></slot>
  </p>
</template>
<script setup>
defineProps({
  dir: {
    type: String,
    default: "left",
  },
});
</script>
```

引入：

```md
::c-text{dir=center}
:c-link{name=测试 href=# target=blank}
::
```

效果展示

::c-text{dir=center}
::c-link{href=# target=blank}
测试
::
::

#### 锚点无法跳转问题

从 articles/A 跳到 page/B#a 时，页面没有定位到锚点处

原因：因为content对md文件生成的锚点链接使用的是`ProseA`组件，而该组件内部使用的是`NuxtLink`组件，**NuxtLink不适用于hash路由**。

解决方法：在B页面添加如下代码：

```vue
<template>
  <div ref="ele">
    <ContentDoc>
      <template #not-found>
        <h2>未找到资源</h2>
      </template>
      <template #empty>
        <h2>资源为空</h2>
      </template>
    </ContentDoc>
  </div>
</template>
<script setup>

const ele = ref(null)

const goAnchor = (selector) => {
  // 最好加个定时器给页面缓冲时间
  setTimeout(() => {
    // 获取锚点元素
    let anchor = ele.value.querySelector(selector)
    anchor.scrollIntoView()
  }, 10)
}

onMounted(() => {
  // 判断是否存在锚点
  if (window.location.hash) {
    // 解决锚点未定位到指定位置
    goAnchor(window.location.hash)
  }
})
</script>
```

<!-- #### 如何实现通过页面的方式新增博客？ -->

#### 刷新页面后路由跳转报错。

报错截图如下：

:c-image-with-thumbnail{alt=路由跳转报错 src=/img/articles/question.png}

解决方案：目前定位在layout中使用了element-plus组件导致，按照网上配置`ID_INJECTION_KEY`后同样有报错，暂定解决方案有：
1. 在外层添加 _\<client-only\>_ 组件；
2. 还有一种办法是把`plugins/element-plus.ts`重命名为`element-plus.client.ts`，之后此插件只运行在客户端。


#### 编写md文件时，当引用链接中有 = 符号时，导致组件无法正常使用

问题代码如下：

```md
参考文章 :c-link{href=https://mp.weixin.qq.com/s?__biz=MzU2MjAzNTQ1Mw==&mid=2247485318&idx=1&sn=485203c0357800ef1da363e3fdcf6346&chksm=fc6ee814cb1961023ddccfc313fecdbe6bdb1bae55517c6f97dcd03c2c1ff242081605f72a82&scene=27 target=blank name=HTTP2的特性解析}
```

改造 `CLink` 组件，将href修改为计算属性，获取 `decodeURIComponent` 之后的链接地址。

改造后的 `CLink` 代码：

```vue
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
```

改造后的组件引用方式：

```md
:c-link{href=https%3A%2F%2Fmp.weixin.qq.com%2Fs%3F__biz%3DMzU2MjAzNTQ1Mw%3D%3D%26mid%3D2247485318%26idx%3D1%26sn%3D485203c0357800ef1da363e3fdcf6346%26chksm%3Dfc6ee814cb1961023ddccfc313fecdbe6bdb1bae55517c6f97dcd03c2c1ff242081605f72a82%26scene%3D27 target=blank name=HTTP2的特性解析 isEncode=true}
```

