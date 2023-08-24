---
title: "vue2源码流程图"
description: "vue2源码流程图"
querys: ['vue', 'vue2', '源码']
---

### vue2源码流程图

:c-image-with-thumbnail{alt=vue2源码流程图 src=/img/articles/vue2.png}

### Vue2 VS Vue3

在 `Vue2` 中，通过 `Object.defineProperty()` 来实现响应式。更确切的说，通过定义对象的 `getter` 和 `setter` 来检测属性变化，当读取对象属性时，触发 `getter` ，开始进行`依赖收集`，当修改属性值时触发 `setter`，`派发更新`。但是 Vue2 中的响应式系统存在一些问题，首先不能检测对象属性的新增或者删除，其次不能检测数组的变化，除非通过重写的方法 `push`、`unshift`、`splice`、`shift`、`pop`才能触发更新。为了解决上述问题，Vue2 新增了 `$set` 和  `$delete` 来触发响应式。除此之外，Vue2还存在以下性能问题：每个组件都会创建自己的 `Watcher` 实例，当组件数量较多时，会导致大量的内存开销和性能问题；每次数据变化都会导致组件的重新渲染，即使数据变化影响的组件仅限于某个子组件；在大型列表通过 `v-for` 循环渲染时，会产生大量的DOM操作，影响渲染性能。

在 `Vue3` 中，引入了 `Proxy` 对象来实现响应式。通过 `Proxy` 代理的对象既可以检测对象属性的新增和删除，又可以检测数组的变化。当一个属性被读取或者修改时，触发 `Proxy` 对象的 `get` 和 `set` 方法，最终实现响应式。 Vue3 还有一个优点，就是支持多个根节点，通过引入 `Fragment` ，总体来说， Vue3 更加灵活和高效，能够更好的应对复杂的场景。