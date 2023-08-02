<template>
  <Title>x了个x</Title>
  <NuxtLink to="/articles/xlegex" class="article-link">文章地址</NuxtLink>
  <div ref="containerRef" class="container">
    <TransitionGroup name="slide-fade">
      <template v-for="cube in allCubes" :key="cube.id">
        <Cube
          :cube="cube"
          @click-cube="clickCube"
          v-if="[0, 1].includes(cube.status)"
        />
      </template>
    </TransitionGroup>
    <div class="slots">
      <TransitionGroup name="bounce">
        <template v-for="cube in slots" :key="cube.id">
          <Cube :cube="cube" :isDock="true" v-if="cube.status === 2" />
        </template>
      </TransitionGroup>
    </div>
  </div>
</template>
<script setup>
import { ElMessage } from "element-plus";

definePageMeta({
  layout: "demo",
  pageTransition: {
    name: "demos",
  },
});

const containerRef = ref();
const level = ref(0);
const levelConfig = [
  { layers: 2, types: 4 },
  { layers: 3, types: 9, trap: true },
  { layers: 6, types: 15, trap: true },
];

const winCallback = () => {
  if (level.value === levelConfig.length) {
    ElMessage.success(`您已通过全部关卡！`);
  } else {
    level.value++;
    ElMessage.success(`恭喜过关，进入第${level.value + 1}关！`);
    initGame(levelConfig[level.value]);
  }
};

const failCallback = () => {
  ElMessage.error("很遗憾，您未能过关！");
};

const { initGame, clickCube, slots, allCubes } = useGame({
  container: containerRef,
  callbacks: {
    winCallback,
    failCallback,
  },
});

onMounted(() => {
  initGame(levelConfig[level.value]);
});
</script>
<style lang="less" scoped>
.article-link {
  display: block;
  text-align: center;
  font-size: 20px;
}
.container {
  height: calc(100vh - 110px);
  width: 100%;
  position: relative;
  user-select: none;

  .slots {
    position: absolute;
    left: calc(50% - 150px);
    bottom: 50px;
    width: 300px;
    height: 46px;
    border: 2px dashed #000;
    display: flex;
    box-sizing: border-box;
    padding: 2px;
    align-items: center;

    .cube {
      box-shadow: none;
      margin: 0 1px;
    }
  }
}
</style>