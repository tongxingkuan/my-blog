---
title: "JS事件机制"
description: "事件循环、event-loop、宏任务、微任务、requestAnimationFrame"
---

## 事件循环

### 什么是事件循环

答：事件循环。js是单线程，同一时间只能做一件事儿，如果有多个任务要执行，就要排队，排队也有优先级的划分，按照执行顺序依次是 同步任务 - 异步微任务 - 异步宏任务 ，在执行完第一梯队优先级的任务后，回过头来处理下一优先级的任务，在执行任务的同时又会有新的任务加入到队列中，将根据优先级放入对应的执行队列，这样循环往复，执行完所有的事件，这就是事件循环。

### js为什么是单线程

设计之初它主要就是为了用来与用户互动，以及操作DOM的，而不是有现在这么大的作用。

### 浏览器渲染页面有哪些进程以及线程的参与

首先是浏览器的四大进程：
1. 浏览器进程，负责协调、主控，只有一个。浏览器的核心进程，控制浏览器窗口以及各个子进程的创建和销毁；负责管理用户界面，存储缓存和历史记录等功能；负责管理所有其他进程资源，并协调它们之间的交互和通信；浏览器窗口的创建和关闭也由此进程执行。
2. 渲染进程，负责网页的呈现和交互，每一个标签页都对应一个独立的渲染进程。

渲染进程又分以下线程：
- 渲染线程，负责将javascript、html、css转化为网页内容，实现网页的渲染和绘制。
- javascript引擎线程，负责处理js脚本，解析和执行js代码，提供最终渲染结果所需的数据支持。
- 事件线程
- 定时器线程
- 异步请求线程
3. 插件进程，负责运行浏览器插件
4. GPU进程，处理网页中的图像和视频

### 打印顺序

```js
async function getData() {
  return new Promise((resolve, reject) => {
    console.log(1)
    setTimeout(() => {
      console.log(2)
      resolve('data')
      console.log(5)
      
    })
  })
}
console.log(3)
const data = await getData()
console.log(4)
// 3 1 2 5 4
```

**如果去掉await呢？打印顺序变为 3 1 4 2 5**

### requestAnimationFrame是宏任务还是微任务

答案是既不是宏任务也不是微任务。

```js
setTimeout(() => {console.log(1)})
requestAnimationFrame(() => {console.log(2)})
setTimeout(() => {console.log(4)})
Promise.resolve(3).then(res => {console.log(res)})
// 3 1 2 4
// 3 1 4 2
// 3 2 1 4
```

可以看到3 1 4的顺序是固定的，2也一定会在微任务之后

微任务执行完后，浏览器有一个渲染机制，requestAnimationFrame是在渲染之前执行的，对于刷新频率60Hz的屏幕，每1000 / 60 = 16.7ms重新渲染一次，所以具体执行时间要根据动作是否在处于下一次渲染开始来决定





