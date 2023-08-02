<template>
  <div
    class="cube"
    :id="cube.id"
    :class="isFreeze ? 'disabled' : ''"
    :style="[
      { 'position': isDock ? '' : 'absolute' },
      { 'z-index': 1000 - cube.layer },
      { left: cube.x + 'px' },
      { top: cube.y + 'px' },
    ]"
    @click="handleClick"
  >
    <img :src="'/img/demos/xlegex/' + cube.type + '.png'" alt="兔子" />
    <div class="mask-layer"></div>
  </div>
</template>
<script setup lang="ts">
interface Props {
  cube: Cube,
  isDock?: Boolean
}
const props = defineProps<Props>()
const emit = defineEmits(["clickCube"]);

// 无遮挡则肯定能点击，有遮挡 若遮挡不可点击则不能点击
const isFreeze = computed(() => (props.cube.maskCubes.length > 0 ? true : false));
const isDock = computed(() => (props.isDock || false))

const handleClick = () => {
  if (!isFreeze.value)
    emit('clickCube', props.cube)
}

</script>
<style lang="less" scoped>
.cube {
  width: 40px;
  height: 40px;
  border-radius: 4px;
  border: 1px solid #000;
  box-shadow: 1px 5px 5px -1px #000;
  cursor: pointer;

  .mask-layer {
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.6);
    display: none;
    position: absolute;
    left: 0;
    top: 0;
  }

  &.disabled {
    cursor: default;
    .mask-layer {
      display: block;
    }
  }

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    margin: 0;
  }
}
</style>