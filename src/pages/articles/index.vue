<template>
  <div>
    <ul v-if="articlesRef.length > 0">
      <li v-for="(article, index) in articlesRef" :key="article.name">
        {{ index + 1 }}.
        <nuxt-link :to="article.path">{{ article.name + ' —— ' + article.desc }}</nuxt-link>
      </li>
    </ul>
    <noData v-else></noData>
    <el-pagination
      v-model:current-page="pageNumRef"
      v-model:page-size="pageSizeRef"
      :page-sizes="['10', '20', '30', '40', '50']"
      layout="total, sizes, prev, pager, next, jumper"
      :total="totalRef"
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange">
    </el-pagination>
  </div>
</template>
<script setup lang="ts">
// 定义结构
declare interface article {
  name: string,
  path: string,
  desc: string
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
const handleSizeChange = (pageSize: number) => {
  pageSizeRef.value = pageSize;
  getArticles();
};
const handleCurrentChange = (current: number) => {
  pageNumRef.value = current;
  getArticles();
}
const route = useRoute();

// 获取数据
const getArticles = () => {
  let property: any = route.query.searchType;
  $fetch("/api/articles", {
    method: "GET",
    params: {
      pageSize: pageSizeRef.value,
      pageNum: pageNumRef.value,
      [property]:  route.query.keywords
    },
  }).then(res => {
    articlesRef.value = res.articles;
    totalRef.value = res.total;
  })
}
getArticles()
</script>