<template>
  <div class="home">
    <h1>童话的博客</h1>
    <client-only>
      <particle :amountX="100" :amountY="100" />
      <el-input
        v-model="keywords"
        placeholder="请输入关键字"
        class="search-ipt"
      >
        <template #prepend>
          <el-select
            v-model="searchType"
            placeholder="请选择查询类型"
            style="width: 115px"
          >
            <el-option label="按名称" value="name" />
            <el-option label="按标签分类" value="tag" />
          </el-select>
        </template>
        <template #append>
          <el-button :icon="Search" @click="search"/>
        </template>
      </el-input>
    </client-only>
    <div class="home-animate-box">
      <nuxt-link to="articles">文章</nuxt-link>
      <nuxt-link to="demos">演示</nuxt-link>
      <nuxt-link to="test1">测试1</nuxt-link>
      <nuxt-link to="test2">测试2</nuxt-link>
    </div>
  </div>
</template>
<script lang="ts" setup>
import { Search } from "@element-plus/icons-vue";
const keywords = ref("");
const searchType = ref("name");

const router = useRouter();

const search = () => {
  router.push({
    path: 'articles',
    query: { searchType: searchType.value, keywords: keywords.value  }
  })
}
</script>
<style lang="less" scoped>
.home {
  width: 100vw;
  height: 100vh;
  overflow: hidden;
}
h1 {
  text-align: center;
  font-size: 50px;
  padding: 50px;
}
.search-ipt {
  width: 60vw;
  margin: 20px 20vw;
  padding: 0 20px;
}
.home-animate-box {
  padding: 20px;
  width: 60vw;
  height: 60vh;
  margin: 0 auto;
  display: flex;
  justify-content: space-around;
  flex-flow: wrap;
  a {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 48%;
    height: 48%;
    box-sizing: border-box;
    text-align: center;
    font-size: 40px;
  }
}
</style>
