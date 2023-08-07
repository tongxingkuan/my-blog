---
title: "闭包"
description: "闭包：一个抽象又重要的概念"
querys: ['闭包']
---

## 闭包

### 定义

一个函数和词法作用域的引用捆绑在一起，这样的组合就是`闭包`。

通俗来说就是：一个函数A返回了内部的函数B，被return出去的B可以在外部访问A中的变量，这时候就形成了一个B函数的变量背包，A函数执行结束后这个变量背包也不会被销毁，并且这个变量背包在A函数外部只能通过B函数访问。

### 形成原理

作用域链，当前作用域可以访问上级作用域中的变量

### 使用场景

#### 函数柯里化

```js
function curry(func) {
  return function curried(...args) {
    if (args.length >= func.length) {
      return func.apply(this, args)
    } else {
      return function(...args2) {
        return curried.apply(this, args.concat(args2))
      }
    }
  }
}
```

##### 作用和特点

1. 降低适用范围，提高适用性：

> 不同平台的 patch 的主要逻辑部分是相同的，所以这部分公共的部分托管在 core 这个大目录下。差异化部分只需要通过参数来区别，这里用到了一个函数柯里化的技巧，通过 createPatchFunction 把差异化参数提前固化，这样不用每次调用 patch 的时候都传递 nodeOps 和 modules 了，这种编程技巧也非常值得学习。
> :c-link{name=原文链接 href=https://ustbhuangyi.github.io/vue-analysis/v2/data-driven/update.html#update target=blank}

2. 提前返回：

提前处理部分任务并返回一个函数用于处理后续的任务，支持异步处理。

##### 缺点

导致调用栈增加。

#### 在构造函数内部定义特权方法

##### 私有变量

任何在函数内部定义的变量都可以称为私有变量，包括函数的参数、局部变量以及在函数内部定义的其他函数，私有变量无法在函数外部访问。

##### 特权方法

如果在函数内部创建一个闭包，那么闭包通过自己的作用域链可以访问这些变量，利用这一点就可以创建用于访问私有变量的公有方法，称之为特权方法。

#### 防抖和节流

##### 防抖

防抖是指延迟执行回调，如果在此期间事件又被出发，则重新计时

```js
function debounce(fn, interval) {
  // 闭包变量
  let timer = null
  return function() {
    clearTimeout(timer)
    timer = setTimeout(() => {
      fn.call(this)
    }, interval)
  }
}
```

##### 节流

节流是指规定的时间内，事件只允许被触发一次

```js
function throttle(fn, interval) {
  // 闭包变量
  let flag = false
  return function() {
    if (flag) return
    setTimeout(() => {
      flag = true
      fn.call(this)
    }, interval)
  }
}
```

#### 引申-模仿块级作用域

来看一段经典的代码，我希望每隔1s依次打印0-9：

```js
for (var i = 0; i < 10; i++) {
  setTimeout(() => {
    console.log(i)
  }, 1000)
}
```

最后的运行结果是，一秒以后打印出10次10！

`IIFE（立即执行函数）`中定义的任何函数和变量，都会在执行结束后被销毁，适合做初始化工作；创建块级作用域，避免了向全局作用域中添加变量和函数，减少资源占用的内存问题。_因为没有指向匿名函数的引用，只要函数执行完毕，就可以立即销毁其作用域链。_

_严格意义上来说，IIFE并不属于闭包，对比闭包定义即可清楚。_

要实现上述功能，改造以上代码：

```js
for (var i = 0; i < 10; i++) {
  (function(i) {
    setTimeout(() => {
      console.log(i)
    }, i * 1000)
  })(i)
}
```

### 闭包的缺点

由于垃圾回收器不会回收闭包中的变量，于是就造成了`内存泄露`，内存泄露积累多了就会导致`内存溢出`。