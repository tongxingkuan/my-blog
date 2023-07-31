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
import { ElMessage } from 'element-plus'
import ClipboardJS from 'clipboard'

definePageMeta({
  layout: "article",
  pageTransition: {
    name: 'articles'
  }
});

const clipboard = ref(null)

const ele = ref(null)

const goAnchor = (selector) => {
  // 最好加个定时器给页面缓冲时间
  setTimeout(() => {
    // 获取锚点元素
    let anchor = ele.value.querySelector(selector)
    anchor.scrollIntoView()
  }, 100)
}

onMounted(() => {
  if (window.location.hash) {
    // hash路由解编码
    goAnchor(decodeURIComponent(window.location.hash))
  }
  let preDomList = document.getElementsByTagName('pre');
  let len = preDomList.length
  if (len > 0) {
    for (let i = 0; i < len; i++) {
      let $pre = preDomList[i];
      let $btn = document.createElement('button');
      $btn.classList.add('copy-btn');
      $btn.onclick = () => {
        clipboard.value = new ClipboardJS('.copy-btn', {
          target: (trigger) => {
            return trigger.previousElementSibling;
          }
        })
        clipboard.value.on("success", (e) => {
          ElMessage.success("复制成功");
          e.clearSelection();
          clipboard.value.destroy();
        });

        clipboard.value.on("error", (e) => {
          ElMessage.error("复制失败");
        });
      }
      $pre.appendChild($btn);
    }
  }
})
</script>
<style lang="less" scoped>
:global(.copy-btn) {
  position: absolute;
  top: 4px;
  right: 4px;
  z-index: 3;
  display: block;
  justify-content: center;
  align-items: center;
  width: 30px;
  height: 30px;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' height='20' width='20' stroke='rgba(128,128,128,1)' stroke-width='2' viewBox='0 0 24 24'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' d='M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2'/%3E%3C/svg%3E");
  opacity: 0;
  cursor: pointer;
  background-size: 20px;
  border-radius: 4px;
  background-position: 50% center;
  background-repeat: no-repeat;
  transition: opacity 0.4s ease 0s;
}
</style>