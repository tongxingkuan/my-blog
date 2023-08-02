<template>
  <Title>演示</Title>
  <div class="demo-container">
    <ul v-if="demosRef.length > 0" class="demo-list">
      <li
        v-for="demo in demosRef"
        :key="demo.name"
        :title="demo.name"
        class="demo-item"
      >
        <nuxt-link :to="demo.path" class="demo-link">
          <el-image :src="demo.source"></el-image>
          <div class="tag-list">
            <el-tag
              v-for="tag in demo.tags"
              :key="tag"
              :color="getColor(tag)"
              >{{ tag }}</el-tag
            >
          </div>
        </nuxt-link>
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
      @current-change="handleCurrentChange"
    >
    </el-pagination>
  </div>
  <div class="all-demo-tags">
    <el-tag
      class="el-tag"
      v-for="tag in tagListRef"
      :key="tag"
      :class="checkedTags.indexOf(tag) > -1 ? 'checked' : ''"
      :color="getColor(tag)"
      @click="changeSelect(tag)"
      >{{ tag }}</el-tag
    >
  </div>
</template>
<script setup lang="ts">
// 定义结构
declare interface Demo {
  name: string;
  path: string;
  source: string;
  tags: string[];
}
// 布局
definePageMeta({
  layout: "demo",
});
// 分页相关
const demosRef = ref<Demo[]>([]);
const pageNumRef = ref(1);
const pageSizeRef = ref(10);
const totalRef = ref(0);
const tagRef = ref("");
const tagListRef = ref<any>([]);
const checkedTags = ref<string[]>([]);
const handleSizeChange = (pageSize: number) => {
  pageSizeRef.value = pageSize;
  getDemos();
};
const handleCurrentChange = (current: number) => {
  pageNumRef.value = current;
  getDemos();
};

const route = useRoute();

const tagColorMap = new Map([
  ["vue3", "#67c23a"],
  ["vue2", "#409eff"],
  ["nuxt3", "#e6a23c"],
]);

const getColor = (tagName: string) => {
  return tagColorMap.get(tagName) || "#909399";
};

const changeSelect = (tagName: string) => {
  let idx = checkedTags.value.indexOf(tagName);
  if (idx === -1) checkedTags.value.push(tagName);
  else if (idx > -1) checkedTags.value.splice(idx, 1);
  getDemos()
};

const getAllTags = (demos: Demo[] | undefined) => {
  if (demos && demos.length > 0) {
    let tags = new Set();
    demos.forEach((demo) => {
      let len = demo.tags.length;
      let i = 0;
      while (i < len) {
        tags.add(demo.tags[i]);
        i++;
      }
    });
    tagListRef.value = tagListRef.value.concat(Array.from(tags));
  }
};

// 获取数据
const getDemos = (isInitial?: boolean) => {
  $fetch("/api/demos", {
    method: "GET",
    params: {
      pageSize: pageSizeRef.value,
      pageNum: pageNumRef.value,
      tags: checkedTags.value.length === 0 ? '' : JSON.stringify(checkedTags.value),
    },
  }).then((res) => {
    if (isInitial) {
      getAllTags(res.demos);
    }
    demosRef.value = res.demos || [];
    totalRef.value = res.total;
  });
};
getDemos(true);
</script>
<style lang="less" scoped>
.demo-container {
  width: 90%;
  .demo-list {
    width: 100%;
    padding: 20px;
    display: flex;

    .demo-item {
      display: flex;
      width: 18%;
      min-width: 60px;
      padding-top: 15%;
      position: relative;
      transform: scale(1);
      transition: transform 0.5s;

      &:hover {
        transform: scale(1.2);
      }

      .demo-link {
        :deep(.el-image) {
          position: absolute;
          width: 80%;
          height: 80%;
          left: 10%;
          top: 0;
        }

        .tag-list {
          position: absolute;
          width: 100%;
          z-index: 10;
          bottom: 0;
          left: 0;
          display: flex;
          justify-content: center;
        }
      }
    }
  }
}
:deep(.el-tag) {
  color: #fff;
  margin: 5px;
}
.all-demo-tags {
  position: fixed;
  width: 10%;
  height: calc(100vh - 110px);
  right: 0;
  top: 80px;
  display: flex;
  padding: 10px;
  flex-direction: column;
  user-select: none;

  :deep(.el-tag) {
    opacity: 0.85;
    cursor: pointer;

    &::after {
      box-sizing: content-box;
      content: "";
      border: 1px solid transparent;
      border-left: 0;
      border-top: 0;
      height: 7px;
      right: 10px;
      position: absolute;
      top: 5px;
      transform: rotate(45deg) scaleY(0);
      width: 3px;
      transition: transform 0.15s ease-in 0.05s;
      transform-origin: center;
    }

    &.checked {
      position: relative;
      opacity: 1;
      &::after {
        transform: rotate(45deg) scaleY(1);
        border-color: #fff;
      }
    }

    &:hover {
      opacity: 1;
    }
  }
}
</style>