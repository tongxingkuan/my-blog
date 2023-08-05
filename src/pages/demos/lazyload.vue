<template>
  <Title>图片懒加载</Title>
  <div class="wrapper">
    <div class="lazyload-js">
      <div class="title">原生js实现</div>
      <div class="container" ref="jsRef">
        <el-scrollbar @scroll="jsScrollThrottle">
          <div v-for="i in arr" :key="i" class="image-content">
            <img
              :data-url="'/img/demos/lazyload/' + i + '.jpg'"
              src="/img/demos/lazyload/loading.gif"
              :alt="i"
            />
            <div class="mask">{{ i + '.jpg' }}</div>
          </div>
        </el-scrollbar>
      </div>
      <div class="explain">
        <el-scrollbar>
          出现在视口的图片(getBoundingClientRect)：
          <div v-for="item in jsLoadedImageList" :key="item">
            <b style="margin: 0 5px">{{ item.getAttribute("alt") + ".jpg" }}</b>
            <i style="margin: 0 5px">{{ '图片顶部 = ' + item.getBoundingClientRect().top }}</i>
            <i style="margin: 0 5px">{{ '视口底部 = ' + jsRef.getBoundingClientRect().bottom }}</i>
          </div>
        </el-scrollbar>
      </div>
    </div>
    <div class="lazyload-intersectionObserve">
      <div class="title">观察器实现</div>
      <div class="container" ref="observerRef">
        <el-scrollbar>
          <div v-for="i in arr" :key="i" class="image-content">
            <img
              :data-url="'/img/demos/lazyload/' + i + '.jpg'"
              src="/img/demos/lazyload/loading.gif"
              :alt="i"
            />
          </div>
        </el-scrollbar>
      </div>
      <div class="explain">
        <el-scrollbar>
          上面我们利用BoundingClientRect获取元素的top属性和滚动元素的bottom属性比较，有一个缺点是我们还需要绑定scroll事件，scroll事件是伴随着大量计算的，会造成资源浪费，虽然我们可以通过节流函数来提高性能，但还是会有性能浪费的问题。而Intersection Observer可以不用监听scroll事件，做到元素一可见便调用回调，在回调里面我们来判断元素是否可见。
        </el-scrollbar>
      </div>
    </div>
    <div class="lazyload-lib">
      <div class="title">第三方实现</div>
      <div class="container">
        <el-scrollbar>
          <div v-for="i in arr" :key="i" class="image-content" v-lazy-container="{ selector: 'img', error: 'https://img.tukuppt.com/png_preview/00/08/20/SWFxnfT5Gv.jpg!/fw/780', loading: '/img/demos/lazyload/loading.gif' }">
            <img
              :data-src="'/img/demos/lazyload/' + i + '.jpg'"
              :alt="i"
            />
          </div>
        </el-scrollbar>
      </div>
      <div class="explain">
        <el-scrollbar>
          <a href="https://github.com/hilongjw/vue-lazyload#usage" target="_blank">vue-lazyload文档地址</a>
        </el-scrollbar>
      </div>
    </div>
  </div>
</template>
<script setup>
definePageMeta({
  layout: "demo",
  pageTransition: {
    name: "demos",
  },
});

const arr = new Array(10).fill(0).map((v, i) => ++i);

// --------------------------------------js处理方法 Start--------------------------------
const jsRef = ref(null);
const jsUnLoadImageList = ref([]);
const offset = 20; // 设置接近视口的缓冲距离为20
const jsLoadedImageList = ref([]);

let throttleFlag = false
const jsScrollThrottle = () => {
  if (throttleFlag) {
    return
  }
  throttleFlag = true
  setTimeout(() => {
    jsScrollHandler()
    throttleFlag = false
  }, 250);
};


const jsScrollHandler = () => {
  for (let i = 0, len = jsUnLoadImageList.value.length; i < len; i++) {
    let $img = jsUnLoadImageList.value[i];
    let flag = inViewport($img)
    if (flag) {
      $img.setAttribute("src", $img.getAttribute("data-url"));
      jsLoadedImageList.value = jsLoadedImageList.value.concat(
        jsUnLoadImageList.value.splice(i, 1)
      );
      i--;
      len--;
    }
  }
}

const inViewport = ($ele) => {
  return $ele && $ele.getBoundingClientRect().top - jsRef.value.getBoundingClientRect().bottom <= offset
}

const asyncLoadImg = async () => {
  for (let i = 0, len = jsUnLoadImageList.value.length; i < len; i++) {
    let $img = jsUnLoadImageList.value[i];
    // 此处增加异步处理，是因为如果图片元素的高度不固定，那么这个方法判断的只是loading图片加载时对应的图片高度，因而导致了获取位置的不准确，会存在加载视口缓冲区以外的图片
    let flag = await inViewportWithResolve($img, jsLoadedImageList.value[jsLoadedImageList.value.length - 1])
    if (flag) {
      $img.setAttribute("src", $img.dataset.url);
      jsLoadedImageList.value = jsLoadedImageList.value.concat(
        jsUnLoadImageList.value.splice(i, 1)
      );
      i--;
      len--;
    }
  }
};

const inViewportWithResolve = ($ele, $prevImg) => {
  // 每次判断都要等到前一张图片加载完成后，此时的定位才是当前图片真实的定位
  return new Promise((resolve, reject) => {
    if ($prevImg) {
      $prevImg.onload = () => {
        resolve( $ele && $ele.getBoundingClientRect().top - jsRef.value.getBoundingClientRect().bottom <= offset );
      };
    } else {
      resolve( $ele && $ele.getBoundingClientRect().top - jsRef.value.getBoundingClientRect().bottom <= offset );
    }
  });
};
// --------------------------------------js处理方法 End--------------------------------

// --------------------------------------IntersectionObserver处理方法 Start--------------------------------

const observerRef = ref(null);
const observeUnLoadImageList = ref([]);

const initIntersectionObserver = () => {
  if ("IntersectionObserver" in window) {
    let lazyImageObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry, index) => {
        // 如果元素可见
        if (entry.intersectionRatio > 0) {
          let lazyImage = entry.target
          lazyImage.src = lazyImage.dataset.url
          lazyImageObserver.unobserve(lazyImage)
          observeUnLoadImageList.value.splice(index, 1)
        }
      })
    })
    observeUnLoadImageList.value.forEach(function(lazyImage) {
      lazyImageObserver.observe(lazyImage)
    })
  }
}
// --------------------------------------IntersectionObserver处理方法 End--------------------------------

onMounted(() => {

  jsUnLoadImageList.value = Array.from(jsRef.value.querySelectorAll("img"));
  asyncLoadImg();
  
  observeUnLoadImageList.value = Array.from(observerRef.value.querySelectorAll("img"));
  initIntersectionObserver()


});
</script>

<style lang="less" scoped>
.wrapper {
  width: 100%;
  padding: 50px;
  height: calc(100vh - 110px);
  display: flex;
  justify-content: space-around;
  align-items: center;

  .lazyload-js,
  .lazyload-intersectionObserve,
  .lazyload-lib {
    width: 30%;
    height: 100%;
    border: 2px solid;

    .title {
      font-size: 16px;
      font-weight: 600;
      text-align: center;
      height: 30px;
      line-height: 30px;
      border-bottom: 1px solid #ccc;
    }

    .container {
      height: calc(100% - 180px);

      .image-content {
        position: relative;

        img {
          width: 100%;
          object-fit: contain;
        }

        .mask {
          font-size: 20px;
          position: absolute;
          width: 100%;
          height: 100%;
          background-color: rgba(0, 0, 0, 0.25);
          color: #fff;
          left: 0;
          top: 0;
        }
      }
    }

    .explain {
      height: 150px;
      padding: 5px;
      border-top: 1px solid #ccc;
    }
  }
}
</style>