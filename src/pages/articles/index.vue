<template>
  <Title>文章</Title>
  <div>
    <ul v-if="articlesRef.length > 0" class="article-list">
      <li v-for="(article, index) in articlesRef" :key="article.name" :title="article.name">
        <nuxt-link :to="article.path" class="article-link">
          <span class="index">{{ index + 1 }}</span>
          <span class="title">{{ article.name }}</span>
        </nuxt-link>
      </li>
    </ul>
    <noData v-else></noData>
    <el-pagination
      v-model:current-page="pageNumRef"
      v-model:page-size="pageSizeRef"
      :page-sizes="[10, 20, 30, 40, 50]"
      layout="total, sizes, prev, pager, next, jumper"
      :total="totalRef"
      @size-change="getArticles"
      @current-change="getArticles">
    </el-pagination>
  </div>
</template>
<script setup lang="ts">
// 定义结构
declare interface article {
  name: string,
  path: string,
}
// 布局
definePageMeta({
  layout: "article",
});
// 分页相关
const articlesRef = ref<article[]>([]);
const pageNumRef = ref(1)
const pageSizeRef = ref(10)
const totalRef = ref(0)
const route = useRoute();

// 获取数据
const getArticles = () => {
  $fetch("/api/articles", {
    method: "GET",
    params: {
      pageSize: pageSizeRef.value,
      pageNum: pageNumRef.value,
    },
  }).then(res => {
    articlesRef.value = res.articles || [];
    totalRef.value = res.total;
  })
}
getArticles()
</script>
<style lang="less" scoped>
.article-list {
  padding: 20px;

  li {
    width: 100%;

    .article-link {
      display: block;
      height: 40px;
      line-height: 40px;
      width: 100%;
      display: flex;
      .index {
        display: inline-block;
        width: 30px;
        text-align: right;
        margin-right: 10px;
      }

      .title {
        display: inline-block;
        text-align: right;
        margin-right: 10px;
        flex-shrink: 0;
      }
    }
  }
}
</style>