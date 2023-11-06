<template>
  <Title>面试题</Title>
  <div>
    <ul v-if="questionsRef.length > 0" class="question-list">
      <li
        v-for="(question, index) in questionsRef"
        :key="question.name"
        :title="question.name"
      >
        <nuxt-link :to="question.path" class="question-link">
          <span class="index">{{ index + 1 }}</span>
          <span class="title">{{ question.name }}</span>
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
      @size-change="getQuestions"
      @current-change="getQuestions"
    >
    </el-pagination>
  </div>
</template>
  <script setup lang="ts">
// 定义结构
declare interface question {
  name: string;
  path: string;
}
// 布局
definePageMeta({
  layout: "question",
});
// 分页相关
const questionsRef = ref<question[]>([]);
const pageNumRef = ref(1);
const pageSizeRef = ref(10);
const totalRef = ref(0);

// 获取数据
const getQuestions = () => {
  $fetch("/api/questions", {
    method: "GET",
    params: {
      pageSize: pageSizeRef.value,
      pageNum: pageNumRef.value,
    },
  }).then((res) => {
    questionsRef.value = res.questions || [];
    totalRef.value = res.total;
  });
};
getQuestions();
</script>
  <style lang="less" scoped>
.question-list {
  padding: 20px;

  li {
    width: 100%;

    .question-link {
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