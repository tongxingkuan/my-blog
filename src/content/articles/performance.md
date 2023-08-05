---
title: "前端性能优化"
description: "性能优化"
querys: ['性能优化']
---

## 前端性能优化

前端性能优化，这个概念很笼统，优化的方面有很多，但其实最终的目的就一点，那就是能够快速呈现全部页面元素，并保证使用的流畅度。过程不重要，只看结果。首先要了解页面渲染的过程，然后从渲染过程分析从哪些方面切入，达到优化效果。本文所涵盖的知识点也较多，算是对所学技术的一个综合应用。

### 从页面渲染入手

按照流程顺序有以下节点。

1. 获取HTML：通过网络请求获取到HTML资源。

2. 生成DOM树：所谓DOM，就是js操作页面元素的基本单元，所以此过程就是把HTML中的元素构建出DOM树。_DOM树的生成过程中可能会被CSS和JS的加载执行阻塞_。

3. 生成CSSOM树：将内联样式，外联或者引入样式表解析生成CSSOM树。

4. 根据DOM树与CSSOM树生成另渲染树。

5. 布局：根据渲染树计算每个可见元素的布局。布局阶段输出的结果称为**box盒模型**（`width`、`height`、`margin`、`padding`、`border`、`left`、`top`......），盒模型精确表示了每一个元素的位置和大小，并且所有相对度量单位此时都转化为了绝对单位。

:c-image-with-thumbnail{alt=盒模型 src=/img/articles/box.png}

6. 绘制：绘制就是把渲染树最终渲染到页面上。根据操作DOM是否改变上一次的布局属性，包括但不限于元素位置改变、大小改变、内外边距改变等，又可以分为**回流**和**重绘**两种方式。

- 回流（Reflow） 回流又称重排。页面结构改变导致的部分或全部DOM树的重新构建、渲染。回流所耗费的成本比重绘高得多，回流一定伴随着重绘，而重绘却不一定会回流。
- 重绘（Repaint） 改变元素的外观属性如背景颜色、文字颜色、边框颜色等，不引起页面结构改变，最终只会触发重绘。


根据页面渲染流程，分析有如下可以进行页面优化的点。

##### 打包优化

现在的前端页面都是基于构建工具构建的产物，所以可以依赖构建工具进行js、css文件的优化，如体积压缩、按需加载等

参考文章： :c-link{name=vue进行gzip压缩和服务器如何开启gzip href=https://blog.csdn.net/u013788943/article/details/79786558 target=blank}

参考文章： :c-link{name=性能优化之CSS href=https://blog.csdn.net/qq_36262295/article/details/125874516 target=blank}

内联关键CSS实现：

```bash
npm i -D critters-webpack-plugin
```

```js webpack.config.js
// 一个Webpack插件，用于内嵌关键的CSS并延迟加载其余的CSS
module.exports = {
  plugins: [
    new Critters({
      // optional configuration (see below)
    })
  ]
}
```
options配置参考 :c-link{name=critters href=https://github.com/alan-agius4/critters target=blank}


##### 加载时序控制

为避免阻塞渲染，控制加载时序很重要。
1. 将 CSS 放在文件头部，JavaScript 文件放在底部
3. 对于非关键js文件，可以通过`async`和`defer`异步执行，两者的区别是：async请求到后即执行，defer等到DOM加载完毕再执行。

##### 减少回流

1. 如果要加多个子元素，最好使用 `fragment`
2. 几何属性的变化，如果你要改变多个属性，最好将这些属性定义在一个`class`中，直接修改class名，这样只用引起一次回流
3. 使用定位脱离文档流后改变位置
4. 获取元素的偏移量也会导致回流，取完做个缓存
5. 使用 `transform` 和 `opacity` 属性更改来实现动画


### 从网络请求入手

网络请求的快慢体现在获取数据并渲染到页面的时间长短，用户当然不希望查看一个商品详情要等待3秒的加载时间。

#### 利用缓存

缓存是双刃剑，合理利用能够帮助我们提升页面性能。参考文章 [缓存](/articles/cache)

#### CDN

内容分发网络

#### 使用 http2

参考文章 [网络请求](/articles/http/#http2)

#### SSR

客户端渲染（CSR）: 获取 HTML 文件，根据需要下载 JavaScript 文件，运行文件，生成 DOM，再渲染。
服务端渲染（SSR）：服务端返回 HTML 文件，客户端只需解析 HTML。
了解更多参考文章 [渲染模式](/articles/render)

#### 懒加载

参考 [图片懒加载实现](/demos/lazyload)

### 从资源本身入手

#### 雪碧图（精灵图）

可以减少网络请求次数。参考 :c-link{name=PS制作教程 href=http://www.cdcxhl.com/news/240101.html target=blank}

#### 代码优化

分离第三方代码；提取公用代码；遵循编程规范；垃圾回收，定时器清理等
