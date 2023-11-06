<template>
  <div class="home">
    <h1>童话的博客</h1>
    <client-only>
      <particle :amountX="100" :amountY="100" />
    </client-only>
    <div class="home-animate-box">
      <nuxt-link to="articles">文章</nuxt-link>
      <nuxt-link to="demos">演示</nuxt-link>
      <nuxt-link to="questions">面试题</nuxt-link>
      <nuxt-link to="test2">测试2</nuxt-link>
    </div>
  </div>
</template>
<script lang="ts" setup>
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
    font-size: 80px;
    transform: scale(1);
    transition: all 0.2s ease-in-out;
    &:hover {
      transform: scale(1.1);
    }
  }
}
</style>
