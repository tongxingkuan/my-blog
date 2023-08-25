---
title: "前端模块化"
description: "前端模块化"
querys: ['前端模块化', '模块化']
---

## 前端模块化

参考https://github.com/careyke/frontend_knowledge_structure/blob/master/javascript/module/question01_module.md

### 前端模块化的演进过程

#### 函数

函数作为块，有局部作用域，相对比较独立；**存在全局变量污染，命名冲突，数据暴露在全局不安全等问题。**

#### 对象
对象作为块，能减少全局变量，且解决了命名冲突；**存在没有私有变量，数据不安全等问题。**

#### IIFE模式

`IIFE` 模式，形成独立的作用于，并通过传入的window对象暴露接口；**模块之间的引用关系不明显，不能按需加载导致首屏加载性能低。**

#### CommomJS

`CommomJS` ，每个文件就是一个模块，以同步的方式引入其他模块；**也正是因为同步引入，会在浏览器使用会造成阻塞。**

#### AMD和Require.js

`AMD` 和 `Require.js` ，异步加载模块。

##### Require.js的特点

1. 依赖模块的代码都是放在回调函数中，等待模块都加载完成才执行这个回调函数，执行顺序可以保证
2. 内部加载其他模块的时候，使用的是动态添加script标签的方式来实现动态加载
3. 内部需要缓存模块暴露出来的接口，避免多次执行

```js
// a.js
define(function () {
  function add(m, n) {
    return m + n
  }
  return {
    add
  }
})

require(['a'], function(a) {
  const sum = a.add(1, 3)
  return {
    sum
  }
})

require(['b'], function(b) {
  console.log(b.sum)
})
```

从上面代码可以看出，**在声明一个模块的时候，会在第一时间就将其依赖模块的内部代码执行完毕，而不是在真正使用的地方再去执行，因此会带来一些资源浪费。**

#### CMD和Sea.js

`CMD` 结合了 `CommonJS` 和 `AMD` 的特点，也是一种异步模块的方案，提倡就近依赖，延迟执行。需要用到某个模块的时候，才用 `require` 引入，模块内部的代码也是在被引入的时候才会执行，声明的时候并没有执行。

```js
// a.js
define(function(equire, exports, module) {
  function add(m, n) {
    return m + n
  }
  module.exports = {
    add
  }
})

// math.js
define(function(require, exports, module) {
  var a = require('./a.js')
  const sum = a.add(1, 2)
  module.exports = {
    sum
  }
})

//加载模块
seajs.use(['math.js'],function(math){
  var sum = math.sum;
  console.log(sum)
})
```

##### Sea.js中的静态依赖分析机制

Sea.js 中模块加载的入口方法是 `use()` 方法，执行这个方法会开始加载所有的依赖模块。然后 Sea.js 中是就近依赖的，它是如何获取依赖模块的呢？

在 `define` 方法中，如果传入的参数factory是一个函数，内部会执行函数的 `toString` 方法，转化成字符串，然后通过正则表达式分析字符串，获取require方法中的参数，通过路径分析去加载依赖的模块。以此链式分析下去，边分析边加载模块，等待所有的依赖都加载完成之后，才开始调用 `use` 的回调函数，正式执行模块内代码。

所以在 `require` 方法执行之前，对应的模块已经加载完成了，所以可以直接传入参数，执行模块函数体。

##### Sea.js的特点

1. 就近依赖，延时执行
2. 内部拥有静态依赖分析机制，保证 `require` 之前，模块已经加载完毕，但是函数还没有执行
3. 也是一种异步的模块化方案
4. 内部有缓存机制，缓存模块暴露的接口
5. 内部加载模块的时候，和 `require.js` 一样，通过动态增加 `script` 标签来完成的

#### ES Module

`ES Module` 是一种 `静态依赖` 的模块化方案，模块与模块之间的依赖关系是在编译期完成连接的。