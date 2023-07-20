<script setup lang="ts">
import type { QueryBuilderParams } from '@nuxt/content/dist/runtime/types'
const queryStr = ref<string>('')
let query: QueryBuilderParams = ref<QueryBuilderParams>({})
if (queryStr.value !== '') {
  // 匹配querys数组
  query.value = ref<QueryBuilderParams>({ path: '/articles', where: [{ querys: { $contains: queryStr.value.toLocaleLowerCase() } }] })
}
watch(queryStr, (newQuery) => {
  if (newQuery !== '') {
  // 匹配querys数组
    query.value = { path: '/articles', where: [{ querys: { $contains: newQuery.toLocaleLowerCase() } }] }
  }
})
const flag = ref(true);
const hide = () => {
  setTimeout(() => {
    // 避免影响跳转，先跳转后隐藏
    flag.value = false;
  }, 500)
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
        <ul class="gs-container-search-list" v-if="flag && queryStr !== ''">
          <el-scrollbar style="max-height: 210px; overflow: scroll;">
            <li v-for="article in list" :key="article._path" class="gs-container-search-list-item">
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