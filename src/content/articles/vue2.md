---
title: "vue2源码流程图"
description: "vue2源码流程图"
querys: ['vue', 'vue2', '源码']
---

### vue2源码流程图

:c-image-with-thumbnail{alt=vue2源码流程图 src=/img/articles/vue2.png}

### 详细解释

#### 初始化Vue对象

其实 `Vue` 就是一个 `Function` ，通过`initMixin`定义原型方法`_init`，`stateMixin`定义原型属性`$data`、`$props`、`$set`、`$get`、`$delete`、`$watch`，此外还有`eventsMixin`、`lifecycleMixin`、`renderMixin`分别初始化了Vue对象原型的事件`$on`、`$emit`、`$once`、`$off`，生命周期`_update`、`$forceUpdate`、`$destroy`，渲染`$nextTick`、`_render`以及解析`ast`并生成渲染函数的工具函数，将在之后实例方法`vm.$createElement`或者`vm._c`中用到。接下来，通过`new Vue(options)`生成一个Vue实例。

> `_c`表示使用内部 render 函数，不需要额外的标准化处理，`$createElement`则表示使用的是用户自己编写的 render 函数，需要内部重新进行一次标准化处理，这两个方法最终其实都是调用的 `_createElement` 方法，只是标准函数（即 `_c` ）使用 `simpleNormalizeChildren()` 处理，而用户自定义 render （即 `$createElement`）使用 `normalizeChildren()` 处理。

> 摘自 :c-link{name=Vue2阅读理解之initRender与callHook组件详解 href=https://www.jb51.net/article/260526.htm target=blank}
#### Vue实例化

`new Vue(options)`将进入到原型方法`_init`，首先判断是不是组件初始化，这是因为`template`如果有组件存在，将会再次回到这个方法，此时的`options._isComponent`为true，通过`initInternalComponent`进行组件options的扩展，如果不是组件，则调用`mergeOptions`合并相关配置。之后是`initProxy`、`initLifecyle`、`initEvents`、`initEvents`、`initRender`等一系列方法为实例定义属性和方法，不一一赘述，只在之后使用到的时候作说明。同时，通过`callHook`调用钩子`beforeCreate`、`created`。

##### callHook

```js
export function callHook (vm: Component, hook: string) {
  // #7573 disable dep collection when invoking lifecycle hooks
  pushTarget()
  const handlers = vm.$options[hook]
  const info = `${hook} hook`
  if (handlers) {
    for (let i = 0, j = handlers.length; i < j; i++) {
      invokeWithErrorHandling(handlers[i], vm, null, vm, info)
    }
  }
  if (vm._hasHookEvent) {
    vm.$emit('hook:' + hook)
  }
  popTarget()
}
```

`callHook`就是对Vue的生命周期函数的调用，这里可以分成一下几步来理解：

- `pushTarget()` ：在组件的 Dep 依赖中插入一个 undefined 元素并将当前依赖指向设置为 undefined，来禁止生命周期钩子函数执行时的依赖收集
- 遍历 options 中对应的钩子函数数组，调用 `invokeWithErrorHandling` 来执行（这里其实与 initEvnets 中注册组件事件的方法是一致的）
- 如果 `_hasHookEvent` 为 true，即父组件有设置子组件的生命周期监听函数，则用 `$emit` 抛出对应生命周期事件
- `popTarget()` ：删除之前插入的 `undefined` 元素，并恢复 Dep 依赖对象中的依赖收集效果


#### mount

Vue是支持跨平台的，这里主要分析带有`compiler`版本的`mount`方法，首先缓存原型上的`mount`方法，原型上的方法是为了给`runtime`版本复用的，即先compiler再runtime，所以重写覆盖了原型方法，之后又在方法内部调用原来的原型方法，此做法值得借鉴。

核心方法：`compileToFunctions`，将`template`转换成`render`函数

`createCompilerCreator`方法 返回一个 创建 `compiler` 的工厂函数，同时也会将`compiler`作为参数，调用`createCompileToFunctionFn`生成`compileToFunctionFn`

```js
// src\compiler\create-compiler.js
export function createCompilerCreator (baseCompile: Function): Function {
  return function createCompiler (baseOptions: CompilerOptions) {
    function compile (
      template: string,
      options?: CompilerOptions
    ): CompiledResult {
      const finalOptions = Object.create(baseOptions)
      const errors = []
      const tips = []

      let warn = (msg, range, tip) => {
        (tip ? tips : errors).push(msg)
      }

      if (options) {
        if (process.env.NODE_ENV !== 'production' && options.outputSourceRange) {
          // $flow-disable-line
          const leadingSpaceLength = template.match(/^\s*/)[0].length

          warn = (msg, range, tip) => {
            const data: WarningMessage = { msg }
            if (range) {
              if (range.start != null) {
                data.start = range.start + leadingSpaceLength
              }
              if (range.end != null) {
                data.end = range.end + leadingSpaceLength
              }
            }
            (tip ? tips : errors).push(data)
          }
        }
        // merge custom modules
        if (options.modules) {
          finalOptions.modules =
            (baseOptions.modules || []).concat(options.modules)
        }
        // merge custom directives
        if (options.directives) {
          finalOptions.directives = extend(
            Object.create(baseOptions.directives || null),
            options.directives
          )
        }
        // copy other options
        for (const key in options) {
          if (key !== 'modules' && key !== 'directives') {
            finalOptions[key] = options[key]
          }
        }
      }

      finalOptions.warn = warn

      const compiled = baseCompile(template.trim(), finalOptions)
      if (process.env.NODE_ENV !== 'production') {
        detectErrors(compiled.ast, warn)
      }
      compiled.errors = errors
      compiled.tips = tips
      return compiled
    }

    return {
      compile,
      compileToFunctions: createCompileToFunctionFn(compile)
    }
  }
}
```

```js
// src\compiler\to-function.js
export function createCompileToFunctionFn (compile: Function): Function {
  const cache = Object.create(null)

  return function compileToFunctions (
    template: string,
    options?: CompilerOptions,
    vm?: Component
  ): CompiledFunctionResult {
    options = extend({}, options)
    const warn = options.warn || baseWarn
    delete options.warn

    /* istanbul ignore if */
    if (process.env.NODE_ENV !== 'production') {
      // detect possible CSP restriction
      try {
        new Function('return 1')
      } catch (e) {
        if (e.toString().match(/unsafe-eval|CSP/)) {
          warn(
            'It seems you are using the standalone build of Vue.js in an ' +
            'environment with Content Security Policy that prohibits unsafe-eval. ' +
            'The template compiler cannot work in this environment. Consider ' +
            'relaxing the policy to allow unsafe-eval or pre-compiling your ' +
            'templates into render functions.'
          )
        }
      }
    }

    // check cache
    const key = options.delimiters
      ? String(options.delimiters) + template
      : template
    if (cache[key]) {
      return cache[key]
    }

    // compile
    const compiled = compile(template, options)

    // check compilation errors/tips
    if (process.env.NODE_ENV !== 'production') {
      if (compiled.errors && compiled.errors.length) {
        if (options.outputSourceRange) {
          compiled.errors.forEach(e => {
            warn(
              `Error compiling template:\n\n${e.msg}\n\n` +
              generateCodeFrame(template, e.start, e.end),
              vm
            )
          })
        } else {
          warn(
            `Error compiling template:\n\n${template}\n\n` +
            compiled.errors.map(e => `- ${e}`).join('\n') + '\n',
            vm
          )
        }
      }
      if (compiled.tips && compiled.tips.length) {
        if (options.outputSourceRange) {
          compiled.tips.forEach(e => tip(e.msg, vm))
        } else {
          compiled.tips.forEach(msg => tip(msg, vm))
        }
      }
    }

    // turn code into functions
    const res = {}
    const fnGenErrors = []
    res.render = createFunction(compiled.render, fnGenErrors)
    res.staticRenderFns = compiled.staticRenderFns.map(code => {
      return createFunction(code, fnGenErrors)
    })

    // check function generation errors.
    // this should only happen if there is a bug in the compiler itself.
    // mostly for codegen development use
    /* istanbul ignore if */
    if (process.env.NODE_ENV !== 'production') {
      if ((!compiled.errors || !compiled.errors.length) && fnGenErrors.length) {
        warn(
          `Failed to generate render function:\n\n` +
          fnGenErrors.map(({ err, code }) => `${err.toString()} in\n\n${code}\n`).join('\n'),
          vm
        )
      }
    }

    return (cache[key] = res)
  }
}
```

`createCompileToFunctionFn`方法通过`compiler`生成编辑结果，`compiler`中，通过`createCompilerCreator`传入的参数作为`baseCompile`执行后的结果，返回的`render字符串`经过`createFunction`即`new Function`生成的方法就是`render`函数。

所以最终可以知道，`baseCompile`生成了`render`函数，那问题是为什么要在`baseCompile`外面包装那么多层呢？

> 1. `compile包装` 是将baseOptions与传入的options通过`柯里化`合并成finalOptions，这样不同目标平台的`baseOptions`就保留下来，只需要调用compile就好，不必每次编译时都传入了；
> 2. `createCompileToFunctionFn包装` 是对`render`方法进行缓存。当某个渲染过的组件再次渲染时（比如路由再次跳转回来），就可以避免`parse`，`optimize`，`generate`的一系列计算，直接得到渲染render函数。
> 摘自 :c-link{name=Vue2Compile-掘金 href=https://juejin.cn/post/6854573208529813518 target=blank}

##### parse optimize generate

`createCompiler`方法如下，可以看到`baseCompile`有三个核心方法：`parse`，`optimize`，`generate`。这三个方法就是将`template`中的内容编译为`render`函数。

```js
export const createCompiler = createCompilerCreator(function baseCompile (
  template: string,
  options: CompilerOptions
): CompiledResult {
  const ast = parse(template.trim(), options)
  optimize(ast, options)
  const code = generate(ast, options)
  return {
    ast,
    render: code.render,
    staticRenderFns: code.staticRenderFns
  }
})
```

###### parse

解析模板字符串生成 `AST（抽象语法树）`

###### optimize

优化语法树

###### generate

生成代码

以上三个方法细节暂时不展开，接着往下看。

回到新的`mount`方法中，生成`render`函数之后，通过`mount.call(this)`调用旧的原型方法`mount`。

```js
// src\platforms\web\runtime\index.js
Vue.prototype.$mount = function (
  el?: string | Element,
  hydrating?: boolean
): Component {
  el = el && inBrowser ? query(el) : undefined
  return mountComponent(this, el, hydrating)
}
```

##### mountComponent

通过源码可以看出，核心方法`mountComponent`，方法定义在`src/core/instance/lifecycle.js`中。

```js
// src\core\instance\lifecycle.js
export function mountComponent (
  vm: Component,
  el: ?Element,
  hydrating?: boolean
): Component {
  vm.$el = el
  if (!vm.$options.render) {
    vm.$options.render = createEmptyVNode
    if (process.env.NODE_ENV !== 'production') {
      /* istanbul ignore if */
      if ((vm.$options.template && vm.$options.template.charAt(0) !== '#') ||
        vm.$options.el || el) {
        warn(
          'You are using the runtime-only build of Vue where the template ' +
          'compiler is not available. Either pre-compile the templates into ' +
          'render functions, or use the compiler-included build.',
          vm
        )
      } else {
        warn(
          'Failed to mount component: template or render function not defined.',
          vm
        )
      }
    }
  }
  callHook(vm, 'beforeMount')

  let updateComponent
  /* istanbul ignore if */
  if (process.env.NODE_ENV !== 'production' && config.performance && mark) {
    updateComponent = () => {
      const name = vm._name
      const id = vm._uid
      const startTag = `vue-perf-start:${id}`
      const endTag = `vue-perf-end:${id}`

      mark(startTag)
      const vnode = vm._render()
      mark(endTag)
      measure(`vue ${name} render`, startTag, endTag)

      mark(startTag)
      vm._update(vnode, hydrating)
      mark(endTag)
      measure(`vue ${name} patch`, startTag, endTag)
    }
  } else {
    updateComponent = () => {
      vm._update(vm._render(), hydrating)
    }
  }

  // we set this to vm._watcher inside the watcher's constructor
  // since the watcher's initial patch may call $forceUpdate (e.g. inside child
  // component's mounted hook), which relies on vm._watcher being already defined
  new Watcher(vm, updateComponent, noop, {
    before () {
      if (vm._isMounted && !vm._isDestroyed) {
        callHook(vm, 'beforeUpdate')
      }
    }
  }, true /* isRenderWatcher */)
  hydrating = false

  // manually mounted instance, call mounted on self
  // mounted is called for render-created child components in its inserted hook
  if (vm.$vnode == null) {
    vm._isMounted = true
    callHook(vm, 'mounted')
  }
  return vm
}
```

通过源码可以看出，首先实例化一个`Watcher`，回调中调用`updateComponent`，继而执行`_render`生成vNode和`_update`更新DOM。
`Watcher` 在这里起到两个作用，一个是初始化的时候会执行回调函数，另一个是当 `vm` 实例中的监测的数据发生变化的时候执行回调函数。

```js
constructor (
  vm: Component,
  expOrFn: string | Function,
  cb: Function,
  options?: ?Object,
  isRenderWatcher?: boolean
) {
  this.vm = vm
  if (isRenderWatcher) {
    vm._watcher = this
  }
  vm._watchers.push(this)
  // options
  if (options) {
    this.deep = !!options.deep
    this.user = !!options.user
    this.lazy = !!options.lazy
    this.sync = !!options.sync
    this.before = options.before
  } else {
    this.deep = this.user = this.lazy = this.sync = false
  }
  this.cb = cb
  this.id = ++uid // uid for batching
  this.active = true
  this.dirty = this.lazy // for lazy watchers
  this.deps = []
  this.newDeps = []
  this.depIds = new Set()
  this.newDepIds = new Set()
  this.expression = process.env.NODE_ENV !== 'production'
    ? expOrFn.toString()
    : ''
  // parse expression for getter
  if (typeof expOrFn === 'function') {
    this.getter = expOrFn
  } else {
    this.getter = parsePath(expOrFn)
    if (!this.getter) {
      this.getter = noop
      process.env.NODE_ENV !== 'production' && warn(
        `Failed watching path: "${expOrFn}" ` +
        'Watcher only accepts simple dot-delimited paths. ' +
        'For full control, use a function instead.',
        vm
      )
    }
  }
  this.value = this.lazy
    ? undefined
    : this.get()
}
```

通过源码可以看到，`updateComponent`作为参数，在Wathcer构造函数中就是getter，最后调用get方法，`this.getter.call(vm, vm)`，此时执行`updateComponent`。

#### render

`_render`是Vue实例的一个私有方法，它用来把实例渲染成一个 `vNode`。改方法的核心就是`render`函数的调用。注意其中的两句赋值代码：

```js
const { render, _parentVnode } = vm.$options
......
vm.$vnode = _parentVnode
......
vnode = render.call(vm._renderProxy, vm.$createElement)
......
vnode.parent = _parentVnode
```

其中render调用时传入了两个参数：`vm._renderProxy` 和 `vm.$createElement`。

`vm.$createElement` 方法定义是在执行 `initRender` 方法的时候，可以看到除了 `vm.$createElement` 方法，还有一个 `vm._c` 方法，它是**被模板编译成的 render 函数使用**，而 `vm.$createElement` 是**用户手写 render 方法使用的**， 这俩个方法支持的参数相同，并且内部都调用了 `createElement` 方法。

##### createElement

Vue.js 利用 createElement 方法创建 VNode，它定义在 `src/core/vdom/create-element.js` 中：

```js
export function createElement (
  context: Component,
  tag: any,
  data: any,
  children: any,
  normalizationType: any,
  alwaysNormalize: boolean
): VNode | Array<VNode> {
  if (Array.isArray(data) || isPrimitive(data)) {
    normalizationType = children
    children = data
    data = undefined
  }
  if (isTrue(alwaysNormalize)) {
    normalizationType = ALWAYS_NORMALIZE
  }
  return _createElement(context, tag, data, children, normalizationType)
}

export function _createElement (
  context: Component,
  tag?: string | Class<Component> | Function | Object,
  data?: VNodeData,
  children?: any,
  normalizationType?: number
): VNode | Array<VNode> {
  if (isDef(data) && isDef((data: any).__ob__)) {
    process.env.NODE_ENV !== 'production' && warn(
      `Avoid using observed data object as vnode data: ${JSON.stringify(data)}\n` +
      'Always create fresh vnode data objects in each render!',
      context
    )
    return createEmptyVNode()
  }
  // object syntax in v-bind
  if (isDef(data) && isDef(data.is)) {
    tag = data.is
  }
  if (!tag) {
    // in case of component :is set to falsy value
    return createEmptyVNode()
  }
  // warn against non-primitive key
  if (process.env.NODE_ENV !== 'production' &&
    isDef(data) && isDef(data.key) && !isPrimitive(data.key)
  ) {
    if (!__WEEX__ || !('@binding' in data.key)) {
      warn(
        'Avoid using non-primitive value as key, ' +
        'use string/number value instead.',
        context
      )
    }
  }
  // support single function children as default scoped slot
  if (Array.isArray(children) &&
    typeof children[0] === 'function'
  ) {
    data = data || {}
    data.scopedSlots = { default: children[0] }
    children.length = 0
  }
  if (normalizationType === ALWAYS_NORMALIZE) {
    children = normalizeChildren(children)
  } else if (normalizationType === SIMPLE_NORMALIZE) {
    children = simpleNormalizeChildren(children)
  }
  let vnode, ns
  if (typeof tag === 'string') {
    let Ctor
    ns = (context.$vnode && context.$vnode.ns) || config.getTagNamespace(tag)
    if (config.isReservedTag(tag)) {
      // platform built-in elements
      if (process.env.NODE_ENV !== 'production' && isDef(data) && isDef(data.nativeOn) && data.tag !== 'component') {
        warn(
          `The .native modifier for v-on is only valid on components but it was used on <${tag}>.`,
          context
        )
      }
      vnode = new VNode(
        config.parsePlatformTagName(tag), data, children,
        undefined, undefined, context
      )
    } else if ((!data || !data.pre) && isDef(Ctor = resolveAsset(context.$options, 'components', tag))) {
      // component
      vnode = createComponent(Ctor, data, context, children, tag)
    } else {
      // unknown or unlisted namespaced elements
      // check at runtime because it may get assigned a namespace when its
      // parent normalizes children
      vnode = new VNode(
        tag, data, children,
        undefined, undefined, context
      )
    }
  } else {
    // direct component options / constructor
    vnode = createComponent(tag, data, context, children)
  }
  if (Array.isArray(vnode)) {
    return vnode
  } else if (isDef(vnode)) {
    if (isDef(ns)) applyNS(vnode, ns)
    if (isDef(data)) registerDeepBindings(data)
    return vnode
  } else {
    return createEmptyVNode()
  }
}
```

`createElement` 方法实际上是对 `_createElement` 方法的封装，它允许传入的参数更加灵活，在处理这些参数后，调用真正创建 VNode 的函数 `_createElement`。
在`_createElement`方法中，主要分析 2 个重点的流程：`children` 的规范化以及 `VNode` 的创建。

###### children 的规范化

1. `simpleNormalizeChildren`

`simpleNormalizeChildren` 方法调用场景是 **render 函数是编译生成的**。理论上编译生成的 children 都已经是 `VNode` 类型的，但这里有一个例外，就是 `functional component` 函数式组件返回的是一个数组而不是一个根节点，所以会通过 `Array.prototype.concat` 方法把整个 children 数组打平，让它的深度只有一层。

```js
export function simpleNormalizeChildren (children: any) {
  for (let i = 0; i < children.length; i++) {
    if (Array.isArray(children[i])) {
      return Array.prototype.concat.apply([], children)
    }
  }
  return children
}
```

2. `normalizeChildren`

```js
export function normalizeChildren (children: any): ?Array<VNode> {
  return isPrimitive(children)
    ? [createTextVNode(children)]
    : Array.isArray(children)
      ? normalizeArrayChildren(children)
      : undefined
}

function normalizeArrayChildren (children: any, nestedIndex?: string): Array<VNode> {
  const res = []
  let i, c, lastIndex, last
  for (i = 0; i < children.length; i++) {
    c = children[i]
    if (isUndef(c) || typeof c === 'boolean') continue
    lastIndex = res.length - 1
    last = res[lastIndex]
    //  nested
    if (Array.isArray(c)) {
      if (c.length > 0) {
        c = normalizeArrayChildren(c, `${nestedIndex || ''}_${i}`)
        // merge adjacent text nodes
        if (isTextNode(c[0]) && isTextNode(last)) {
          res[lastIndex] = createTextVNode(last.text + (c[0]: any).text)
          c.shift()
        }
        res.push.apply(res, c)
      }
    } else if (isPrimitive(c)) {
      if (isTextNode(last)) {
        // merge adjacent text nodes
        // this is necessary for SSR hydration because text nodes are
        // essentially merged when rendered to HTML strings
        res[lastIndex] = createTextVNode(last.text + c)
      } else if (c !== '') {
        // convert primitive to vnode
        res.push(createTextVNode(c))
      }
    } else {
      if (isTextNode(c) && isTextNode(last)) {
        // merge adjacent text nodes
        res[lastIndex] = createTextVNode(last.text + c.text)
      } else {
        // default key for nested array children (likely generated by v-for)
        if (isTrue(children._isVList) &&
          isDef(c.tag) &&
          isUndef(c.key) &&
          isDef(nestedIndex)) {
          c.key = `__vlist${nestedIndex}_${i}__`
        }
        res.push(c)
      }
    }
  }
  return res
}
```

`normalizeChildren` 方法的调用场景有 2 种，一个场景是 **render 函数是用户手写的**，当 children 只有一个节点的时候，Vue.js 从接口层面允许用户把 children 写成基础类型用来创建单个简单的文本节点，这种情况会调用 `createTextVNode` 创建一个文本节点的 VNode；另一个场景是当编译 `slot`、`v-for` 的时候会产生**嵌套数组**的情况，会调用 `normalizeArrayChildren` 方法。
`normalizeArrayChildren` 接收 2 个参数，children 表示要规范的子节点，`nestedIndex` 表示嵌套的索引，因为单个 child 可能是一个数组类型。 normalizeArrayChildren 主要的逻辑就是遍历 children，获得单个节点 `c`，然后对 c 的类型判断，如果是一个数组类型，则递归调用 normalizeArrayChildren; 如果是基础类型，则通过 `createTextVNode` 方法转换成 VNode 类型；否则就已经是 VNode 类型了，如果 children 是一个列表并且列表还存在嵌套的情况，则根据 nestedIndex 去更新它的 key。这里需要注意一点，在遍历的过程中，对这 3 种情况都做了如下处理：如果存在两个连续的 text 节点，会把它们合并成一个 text 节点。

此处代码跟编译生成render函数强相关，所以需要知道render函数具体是什么才能弄清楚，可以不用深究，结合断点调试去分析，或者在了解编译过程之后再回过头来看此处代码。

###### VNode 的创建




### Vue2 VS Vue3 VS React

#### 原理介绍

- _Vue2_ 采用 **双向数据绑定** 和 **虚拟DOM** 的原理实现。核心思想是通过 **响应式数据** 和 **模板渲染** 来构建用户界面。当用户数据发生变化时，Vue2会自动更新视图，从而实现数据和视图的同步。
Vue2的响应式数据是通过`Object.defineProperty`来实现的，它会劫持对象的属性，当属性值发生变化时，会触发对应的更新操作。在模板渲染方面，Vue2使用虚拟DOM来在数据变化时对比前后两个状态的差异，即`diff算法`，并最小化真实DOM的操作，提升性能。

- _Vue3_ 在原理上与Vue2类似，进行了一些优化和改进。在 `Vue2` 中，通过 `Object.defineProperty()` 来实现响应式。更确切的说，通过定义对象的 `getter` 和 `setter` 来检测属性变化，当读取对象属性时，触发 `getter` ，开始进行`依赖收集`，当修改属性值时触发 `setter`，`派发更新`。但是 Vue2 中的响应式系统存在一些问题，首先不能检测对象属性的新增或者删除，其次不能检测数组的变化，除非通过重写的方法 `push`、`unshift`、`splice`、`shift`、`pop`才能触发更新。为了解决上述问题，Vue2 新增了 `$set` 和  `$delete` 来触发响应式。除此之外，Vue2还存在以下性能问题：每个组件都会创建自己的 `Watcher` 实例，当组件数量较多时，会导致大量的内存开销和性能问题；每次数据变化都会导致组件的重新渲染，即使数据变化影响的组件仅限于某个子组件；在大型列表通过 `v-for` 循环渲染时，会产生大量的DOM操作，影响渲染性能。
在 `Vue3` 中，引入了 `Proxy` 对象来实现响应式。通过 `Proxy` 代理的对象既可以检测对象属性的新增和删除，又可以检测数组的变化。当一个属性被读取或者修改时，触发 `Proxy` 对象的 `get` 和 `set` 方法，最终实现响应式。 Vue3 还有一个优点，就是支持多个根节点，通过引入 `Fragment` ，总体来说， Vue3 更加灵活和高效，能够更好的应对复杂的场景。`Vue3`还引入了基于函数式编程的组合式API（`Composition API`），它允许开发者将组件的逻辑按照功能进行组合，提供了更灵活、可复用的代码结构。

- _React_ 采用了`虚拟DOM`的原理来实现高效的UI更新。它将用户界面抽象成组件树的形式，每个组件都有自己的状态（`state`）和属性（`props`），当状态或属性发生变化时，React会通过对比前后两个虚拟DOM树的差异，最小化DOM操作来更新用户界面。

#### 差异对比

- 数据响应式：_Vue2_ 采用了基于Object.defineProperty实现响应式，_Vue3_ 采用基于 _Proxy_ 的响应式实现，而 _React_ 则采用了单向数据流的机制。
- _Vue3_ 在性能方面进行了多项优化，包括更高效的虚拟DOM算法和按需编译等。React也一直致力于提升性能，通过虚拟DOM和"协调"算法来减少不必要的DOM操作。

#### 优缺点介绍

_Vue2_ 简单易学，是渐进式框架，生态系统已经成熟，但是性能相对于 _Vue3_ 略逊一筹。_Vue3_ 则是性能较高，且组合式API使得组件逻辑更加清晰和可复用，但是学习成本高，生态不够完善。_React_ 有高效的虚拟DOM算法，也就提供了出色的性能，有强大的生态支持，采用单向数据流的机制，更容易进行状态管理，由于有一套自己的模板语法（JSX），学习成本较高


