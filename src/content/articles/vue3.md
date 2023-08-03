---
title: "vue3源码解读"
description: "本文将从入口文件到打包配置，浏览器调试等一系列方面展开解读vue3源码"
querys: ['vue', 'vue3', '源码']
---

## vue3 源码解读

### 写在前面的话

> :c-link{name=vue3官方文档 href=https://cn.vuejs.org/guide/introduction.html target=blank}：Vue 2 将于 2023 年 12 月 31 日停止维护。

这使得我们学习 vue3 顺理成章，本文将通过解读 :c-link{name=vue3源码 href=https://github.com/vuejs/vue-next target=blank}，带领大家从入口到打包配置，再到浏览器调试、控制台日志等方方面面，来解读剖析一下 vue3 源码。中间也会穿插对比与 vue2 的实现差异。

<br />

### 寻找入口文件

要阅读项目源代码，特别是当项目目录较多，层次较深时，我们就要从入口文件入手，根据入口逐渐发散开来，期间要找准主线逻辑，切莫跑偏导致思绪混乱。现在的项目大多是基于 nodejs 开发，像这一类项目，找到 **package.json** 文件也就找到了项目的“身份证”。根据 **package.json** 的 scripts 中的指令，我们找到了 dev 指令所对应的文件路径及名称： **node scripts/dev.js** ，那么我们接下来就进入到该文件下一探究竟吧！

当然 scripts 中的命令还有很多，且不是以 dev.js 作为入口，这个时候我们就要 **学会分清主线** ，何为主线，就是在不了解代码的前提下，先找准一个方向进行探究，期间的其他分支不要过分纠结，否则将会导致我们深陷支线，难以自拔，最终的结果就是放弃或从头再来。

#### scripts/build.js 文件解读

为了保持主线逻辑，此处先按下不表。

#### scripts/dev.js 文件解读

该文件用于解析 scripts 中的命令并获取到各种参数，用于后续打包配置。

```javascript
const __dirname = dirname(fileURLToPath(import.meta.url));
const args = minimist(process.argv.slice(2));
const target = args._[0] || "vue";
const format = args.f || "global";
const inlineDeps = args.i || args.inline;
const pkg = require(`../packages/${target}/package.json`);
```

以上是截取的部分源码，在阅读该源码过程中，如果我们不知道某行代码的含义，这个时候，另一个调试工具可以很好的帮助我们，它就是 **console.log(desciprtion, somethingToPrint)** 。其中第一个参数可以让我们在众多的打印中快速找到我们要打印的内容。

```javascript
const __dirname = dirname(fileURLToPath(import.meta.url));
console.log("__dirname", __dirname); // __dirname C:\Users\童年\Desktop\tongxk\core\scripts
const args = minimist(process.argv.slice(2));
console.log("args", args); // args { _: [] }
const target = args._[0] || "vue";
const format = args.f || "global";
const inlineDeps = args.i || args.inline;
const pkg = require(`../packages/${target}/package.json`);
```

通过阅读后续源码，我们知道 target 是输出文件目录（C:\Users\童年\Desktop\tongxk\core\packages\vue\dist），format 是代码打包格式（ **iife** :立即执行函数表达式）。最终使用 esbuild 模块将代码打包。那么打包工具是什么呢？

### 打包工具

#### rollup(build.js)

我们知道现在主流的打包工具有：[webpack](/#)、[rollup](/#)、[grunt](/#)；此博客将分章节讲述各种打包工具，并对比各个打包工具的优劣，此处不过多赘述。通过代码根目录下的 **rollup.config.js** 我们知道 vue3 项目源码采用 **rollup** 进行打包。而熟悉 vue2 源码的小伙伴都知道，vue2 采用的 webpack 打包，那么为什么要放弃 webpack 打包工具，采用 rollup 呢？

> 在 vue2 中，打包采用的是 webpack，而到了 vue3 中打包就变成了 rollup，而且不仅仅 vue3 采用了 rollup 来打包，react 也从 webpack 到 rollup 转变了。那么 rollup 打包工具是不是要比 webpack 打包要好呢？其实各自有各自的用途，我们通过对比 vue2 和 vue3 的一些用法就可以简单的看出来两者打包工具的一些区别，vue3 最大的一个特性就说采用了组合式 API，简单来说 vue2 更多的像一个百宝箱，我们可以开箱即用，而 vue3 更多的是提供一些基础功能，然后让使用者去选择，灵活使用。两者打包工具各自有各自的好处，就像一句话说的"webpack 是大而全，rollup 是小而美"。首先相对于 webpack 来说 rollup 更加轻量级，同时 rollup 是一个 JS 模块打包器，更适合于 JS 库打包，而 webpack 更适合的是大型项目。

> 版权声明：本文为 CSDN 博主「BUG 不加糖」的原创文章，遵循 CC 4.0 BY-SA 版权协议，转载请附上原文出处链接及本声明。[原文链接](https://blog.csdn.net/YX0711/article/details/129202476)

归结来说就是 rollup 更轻量，更契合 vue3 灵活性的特点。以上说明了一下 vue3 打包工具以及为什么采用 rollup 打包。

但是其实这一小节说的 rollup 打包实际上并未在 dev 命令的后续中使用到，因为在 **scripts/dev.js** 有这么一段打包代码，对比 **scripts/build.js** 中的打包代码不难发现，运行 **yarn dev** 并不会采用 rollup 打包方式，而是采用的 **esbuild 打包方式** 。之所以在这里提到 rollup 是因为我们常用的还是 build 构建方式生成的包才是大多数脚手架工具采用的依赖包，而 dev 构建方式只是生成一个 **dist\vue.global.js** 文件，在现在的应用场景相对较少。

```javascript
// dev.js
esbuild
  .context({
    entryPoints: [resolve(__dirname, `../packages/${target}/src/index.ts`)],
    outfile,
    bundle: true,
    external,
    sourcemap: true,
    format: outputFormat,
    globalName: pkg.buildOptions?.name,
    platform: format === "cjs" ? "node" : "browser",
    plugins,
    define: {
      __COMMIT__: `"dev"`,
      __VERSION__: `"${pkg.version}"`,
      __DEV__: `true`,
      __TEST__: `false`,
      __BROWSER__: String(
        format !== "cjs" && !pkg.buildOptions?.enableNonBrowserBranches
      ),
      __GLOBAL__: String(format === "global"),
      __ESM_BUNDLER__: String(format.includes("esm-bundler")),
      __ESM_BROWSER__: String(format.includes("esm-browser")),
      __NODE_JS__: String(format === "cjs"),
      __SSR__: String(format === "cjs" || format.includes("esm-bundler")),
      __COMPAT__: String(target === "vue-compat"),
      __FEATURE_SUSPENSE__: `true`,
      __FEATURE_OPTIONS_API__: `true`,
      __FEATURE_PROD_DEVTOOLS__: `false`,
    },
  })
  .then((ctx) => ctx.watch());
```

```javascript
// build.js
await execa(
  "rollup",
  [
    "-c",
    "--environment",
    [
      `COMMIT:${commit}`,
      `NODE_ENV:${env}`,
      `TARGET:${target}`,
      formats ? `FORMATS:${formats}` : ``,
      prodOnly ? `PROD_ONLY:true` : ``,
      sourceMap ? `SOURCE_MAP:true` : ``,
    ]
      .filter(Boolean)
      .join(","),
  ],
  { stdio: "inherit" }
);
```

#### esbuild(dev.js)

此处我们又接触了一个新的打包工具，[**esbuild**](/#) ，esbuild 特点是打包速度快，本文不作赘述。之所以要用 esbuild 打包而不是 rollup，我想有两点原因：一是打包速度快，二是可以启动本地服务，在监听模式下文件发生变化重新编译。这两点契合了开发调试的需求，所以采用此打包工具。

### 开始打包

至此我们还只是解析出了命令并生成打包配置，真正的打包现在正式开始。我们在 scripts/dev.js 文件中看到了这样一段代码：

```javascript
esbuild
  .context({
    entryPoints: [resolve(__dirname, `../packages/${target}/src/index.ts`)],
    outfile,
    bundle: true,
    external,
    sourcemap: true,
    format: outputFormat,
    globalName: pkg.buildOptions?.name,
    platform: format === "cjs" ? "node" : "browser",
    plugins,
    define: {
      __COMMIT__: `"dev"`,
      __VERSION__: `"${pkg.version}"`,
      __DEV__: `true`,
      __TEST__: `false`,
      __BROWSER__: String(
        format !== "cjs" && !pkg.buildOptions?.enableNonBrowserBranches
      ),
      __GLOBAL__: String(format === "global"),
      __ESM_BUNDLER__: String(format.includes("esm-bundler")),
      __ESM_BROWSER__: String(format.includes("esm-browser")),
      __NODE_JS__: String(format === "cjs"),
      __SSR__: String(format === "cjs" || format.includes("esm-bundler")),
      __COMPAT__: String(target === "vue-compat"),
      __FEATURE_SUSPENSE__: `true`,
      __FEATURE_OPTIONS_API__: `true`,
      __FEATURE_PROD_DEVTOOLS__: `false`,
    },
  })
  .then((ctx) => ctx.watch());
```

分析可知，**entryPoints** 为入口文件地址：_packages/vue/src/index.ts_ ，**outfile** 声明输出文件地址：_/packages/vue/dist/vue.global.js_ 。接下来，我们来分析一下入口文件、输出文件。

#### 入口文件

入口文件主要声明了一个方法：**compileToFunction(template, CompilerOptions)** ，该方法用于将模板编译成 render 函数。在运行时调用，即在运行输出文件时，会调用该 api。该代码有如下特点：
1. template参数可以为选择器，可以为DOM元素，为选择器则获取到DOM，并取其innerHTML，为DOM元素则直接取其innerHTML。
2. **compileCache** 用于缓存模板对应的渲染函数，是为了优化编译性能的。
3. **new Function(code)()** 获取编译后的render函数。

```javascript
function compileToFunction(
  template: string | HTMLElement,
  options?: CompilerOptions
): RenderFunction {
  if (!isString(template)) {
    if (template.nodeType) {
      template = template.innerHTML
    } else {
      __DEV__ && warn(`invalid template option: `, template)
      return NOOP
    }
  }

  const key = template
  const cached = compileCache[key]
  if (cached) {
    return cached
  }

  if (template[0] === '#') {
    const el = document.querySelector(template)
    if (__DEV__ && !el) {
      warn(`Template element not found or is empty: ${template}`)
    }
    // __UNSAFE__
    // Reason: potential execution of JS expressions in in-DOM template.
    // The user must make sure the in-DOM template is trusted. If it's rendered
    // by the server, the template should not contain any user data.
    template = el ? el.innerHTML : ``
  }

  const opts = extend(
    {
      hoistStatic: true,
      onError: __DEV__ ? onError : undefined,
      onWarn: __DEV__ ? e => onError(e, true) : NOOP
    } as CompilerOptions,
    options
  )

  if (!opts.isCustomElement && typeof customElements !== 'undefined') {
    opts.isCustomElement = tag => !!customElements.get(tag)
  }

  const { code } = compile(template, opts)

  function onError(err: CompilerError, asWarning = false) {
    const message = asWarning
      ? err.message
      : `Template compilation error: ${err.message}`
    const codeFrame =
      err.loc &&
      generateCodeFrame(
        template as string,
        err.loc.start.offset,
        err.loc.end.offset
      )
    warn(codeFrame ? `${message}\n${codeFrame}` : message)
  }

  // The wildcard import results in a huge object with every export
  // with keys that cannot be mangled, and can be quite heavy size-wise.
  // In the global build we know `Vue` is available globally so we can avoid
  // the wildcard object.
  const render = (
    __GLOBAL__ ? new Function(code)() : new Function('Vue', code)(runtimeDom)
  ) as RenderFunction

  // mark the function as runtime compiled
  ;(render as InternalRenderFunction)._rc = true

  return (compileCache[key] = render)
}

registerRuntimeCompiler(compileToFunction) // 博主注：此方法先记下
```



#### 输出文件

可以看到仅一个 iife，向外暴露了一个对象 Vue。该对象的所有向外暴露的 api 见下

```javascript
__export(src_exports, {
  BaseTransition: () => BaseTransition,
  BaseTransitionPropsValidators: () => BaseTransitionPropsValidators,
  Comment: () => Comment,
  DeprecationTypes: () => DeprecationTypes,
  EffectScope: () => EffectScope,
  ErrorCodes: () => ErrorCodes,
  Fragment: () => Fragment,
  KeepAlive: () => KeepAlive,
  ReactiveEffect: () => ReactiveEffect2,
  Static: () => Static,
  Suspense: () => Suspense,
  Teleport: () => Teleport,
  Text: () => Text,
  TrackOpTypes: () => TrackOpTypes,
  Transition: () => Transition,
  TransitionGroup: () => TransitionGroup,
  TriggerOpTypes: () => TriggerOpTypes,
  VueElement: () => VueElement,
  assertNumber: () => assertNumber,
  callWithAsyncErrorHandling: () => callWithAsyncErrorHandling,
  callWithErrorHandling: () => callWithErrorHandling,
  camelize: () => camelize,
  capitalize: () => capitalize,
  cloneVNode: () => cloneVNode,
  compatUtils: () => compatUtils,
  compile: () => compileToFunction,
  computed: () => computed2,
  createApp: () => createApp,
  createBlock: () => createBlock,
  createCommentVNode: () => createCommentVNode,
  createElementBlock: () => createElementBlock,
  createElementVNode: () => createBaseVNode,
  createHydrationRenderer: () => createHydrationRenderer,
  createPropsRestProxy: () => createPropsRestProxy,
  createRenderer: () => createRenderer,
  createSSRApp: () => createSSRApp,
  createSlots: () => createSlots,
  createStaticVNode: () => createStaticVNode,
  createTextVNode: () => createTextVNode,
  createVNode: () => createVNode,
  customRef: () => customRef,
  defineAsyncComponent: () => defineAsyncComponent,
  defineComponent: () => defineComponent,
  defineCustomElement: () => defineCustomElement,
  defineEmits: () => defineEmits,
  defineExpose: () => defineExpose,
  defineModel: () => defineModel,
  defineOptions: () => defineOptions,
  defineProps: () => defineProps,
  defineSSRCustomElement: () => defineSSRCustomElement,
  defineSlots: () => defineSlots,
  devtools: () => devtools,
  effect: () => effect,
  effectScope: () => effectScope,
  getCurrentInstance: () => getCurrentInstance,
  getCurrentScope: () => getCurrentScope,
  getTransitionRawChildren: () => getTransitionRawChildren,
  guardReactiveProps: () => guardReactiveProps,
  h: () => h,
  handleError: () => handleError,
  hasInjectionContext: () => hasInjectionContext,
  hydrate: () => hydrate,
  initCustomFormatter: () => initCustomFormatter,
  initDirectivesForSSR: () => initDirectivesForSSR,
  inject: () => inject,
  isMemoSame: () => isMemoSame,
  isProxy: () => isProxy,
  isReactive: () => isReactive,
  isReadonly: () => isReadonly,
  isRef: () => isRef,
  isRuntimeOnly: () => isRuntimeOnly,
  isShallow: () => isShallow,
  isVNode: () => isVNode,
  markRaw: () => markRaw,
  mergeDefaults: () => mergeDefaults,
  mergeModels: () => mergeModels,
  mergeProps: () => mergeProps,
  nextTick: () => nextTick,
  normalizeClass: () => normalizeClass,
  normalizeProps: () => normalizeProps,
  normalizeStyle: () => normalizeStyle,
  onActivated: () => onActivated,
  onBeforeMount: () => onBeforeMount,
  onBeforeUnmount: () => onBeforeUnmount,
  onBeforeUpdate: () => onBeforeUpdate,
  onDeactivated: () => onDeactivated,
  onErrorCaptured: () => onErrorCaptured,
  onMounted: () => onMounted,
  onRenderTracked: () => onRenderTracked,
  onRenderTriggered: () => onRenderTriggered,
  onScopeDispose: () => onScopeDispose,
  onServerPrefetch: () => onServerPrefetch,
  onUnmounted: () => onUnmounted,
  onUpdated: () => onUpdated,
  openBlock: () => openBlock,
  popScopeId: () => popScopeId,
  provide: () => provide,
  proxyRefs: () => proxyRefs,
  pushScopeId: () => pushScopeId,
  queuePostFlushCb: () => queuePostFlushCb,
  reactive: () => reactive,
  readonly: () => readonly,
  ref: () => ref,
  registerRuntimeCompiler: () => registerRuntimeCompiler,
  render: () => render,
  renderList: () => renderList,
  renderSlot: () => renderSlot,
  resolveComponent: () => resolveComponent,
  resolveDirective: () => resolveDirective,
  resolveDynamicComponent: () => resolveDynamicComponent,
  resolveFilter: () => resolveFilter,
  resolveTransitionHooks: () => resolveTransitionHooks,
  setBlockTracking: () => setBlockTracking,
  setDevtoolsHook: () => setDevtoolsHook,
  setTransitionHooks: () => setTransitionHooks,
  shallowReactive: () => shallowReactive,
  shallowReadonly: () => shallowReadonly,
  shallowRef: () => shallowRef,
  ssrContextKey: () => ssrContextKey,
  ssrUtils: () => ssrUtils,
  stop: () => stop,
  toDisplayString: () => toDisplayString,
  toHandlerKey: () => toHandlerKey,
  toHandlers: () => toHandlers,
  toRaw: () => toRaw,
  toRef: () => toRef,
  toRefs: () => toRefs,
  toValue: () => toValue,
  transformVNodeArgs: () => transformVNodeArgs,
  triggerRef: () => triggerRef,
  unref: () => unref,
  useAttrs: () => useAttrs,
  useCssModule: () => useCssModule,
  useCssVars: () => useCssVars,
  useModel: () => useModel,
  useSSRContext: () => useSSRContext,
  useSlots: () => useSlots,
  useTransitionState: () => useTransitionState,
  vModelCheckbox: () => vModelCheckbox,
  vModelDynamic: () => vModelDynamic,
  vModelRadio: () => vModelRadio,
  vModelSelect: () => vModelSelect,
  vModelText: () => vModelText,
  vShow: () => vShow,
  version: () => version,
  warn: () => warn2,
  watch: () => watch,
  watchEffect: () => watchEffect,
  watchPostEffect: () => watchPostEffect,
  watchSyncEffect: () => watchSyncEffect,
  withAsyncContext: () => withAsyncContext,
  withCtx: () => withCtx,
  withDefaults: () => withDefaults,
  withDirectives: () => withDirectives,
  withKeys: () => withKeys,
  withMemo: () => withMemo,
  withModifiers: () => withModifiers,
  withScopeId: () => withScopeId,
});
```

### 调试

在获取到输出文件以后，要想调试源代码，在 packages/vue/examples 中可以添加测试文件

```cmd
$ mkdir packages/vue/examples/test.html
```

```html
<!-- test.html -->
<div id="app">
  <h1>Vue3</h1>
</div>

<script src="../dist/vue.global.js"></script>
<script>
  const { createApp } = Vue;
  createApp({}).mount("#app");
</script>
```

#### 源码调试小技巧

##### vscode 快捷键

快速定位文件位置 <kbd>ctrl</kbd> + <kbd>shfit</kbd> + <kbd>p</kbd>、展开代码 <kbd>ctrl</kbd> + <kbd>k</kbd> + <kbd>j</kbd> 、 折叠代码 <kbd>ctrl</kbd> + <kbd>k</kbd> + <kbd>0</kbd> 、转到方法定义 <kbd>ctrl</kbd> + <kbd>t</kbd> ；

##### 日志、断点跟踪

**debugger** ，**console.log()**

##### 浏览器调用栈

:c-image-with-thumbnail{alt=callStack src=/img/articles/callStack.png}

##### 浏览器扩展

**vue.js devtools**

### 探索源码

根据 test.html 中的代码，很明显，要从 **createApp** 方法入手

#### createApp

位置：_packages\runtime-dom\src\index.ts_

vue3 的创建项目不再使用 vue2 的 _new Vue()_ 构造函数，

```javascript
new Vue(options).$mount("#app"); // vue2
```

而是使用 createApp(options)

```javascript
createApp(options).mount("#app"); // vue3
```

该方法实际是调用 **ensureRenderer().createApp()** ，而 ensureRenderer 返回一个 **renderer** 对象，我们称之为渲染器对象；接下来我们看一下创建渲染器的逻辑。

##### createRenderer

位置：_packages\runtime-core\src\renderer.ts_

实际调用 **baseCreateRenderer** ，通过折叠代码发现此方法代码行数达两千行之多，此时不要担心，我们想一想前面的代码调用的是此方法返回的一个 api，所以我们直接定位到函数末尾，可以看到此方法的返回值是一个对象，也就是前文所说的 **renderer 对象** 。

```javascript
return {
  render,
  hydrate,
  createApp: createAppAPI(render, hydrate),
};
```

根据主线逻辑，我们开始分析 **createAppAPI** 方法。

###### createAppAPI

位置：_packages\runtime-core\src\apiCreateApp.ts_

```javascript
return function createApp(rootComponent, rootProps = null) {

  // ......

  return app;
};
```

```typescript
// packages\runtime-dom\src\index.ts createApp
export const createApp = ((...args) => {
  const app = ensureRenderer().createApp(...args)

  if (__DEV__) {
    injectNativeTagCheck(app)
    injectCompilerOptionsCheck(app)
  }

  const { mount } = app
  app.mount = (containerOrSelector: Element | ShadowRoot | string): any => {
    const container = normalizeContainer(containerOrSelector)
    if (!container) return

    const component = app._component
    if (!isFunction(component) && !component.render && !component.template) {
      // __UNSAFE__
      // Reason: potential execution of JS expressions in in-DOM template.
      // The user must make sure the in-DOM template is trusted. If it's
      // rendered by the server, the template should not contain any user data.
      component.template = container.innerHTML
      // 2.x compat check
      if (__COMPAT__ && __DEV__) {
        for (let i = 0; i < container.attributes.length; i++) {
          const attr = container.attributes[i]
          if (attr.name !== 'v-cloak' && /^(v-|:|@)/.test(attr.name)) {
            compatUtils.warnDeprecation(
              DeprecationTypes.GLOBAL_MOUNT_CONTAINER,
              null
            )
            break
          }
        }
      }
    }

    // clear content before mounting
    container.innerHTML = ''
    const proxy = mount(container, false, container instanceof SVGElement)
    if (container instanceof Element) {
      container.removeAttribute('v-cloak')
      container.setAttribute('data-v-app', '')
    }
    return proxy
  }

  return app
}) as CreateAppFunction<Element>
```

以上代码只保留了部分关键代码，可以看出，**createAppAPI** 返回了一个方法，**createApp**， 再回到 _packages\runtime-dom\src\index.ts_ 中的 createApp 方法，我们拿到了一个 app 对象，该对象就是 **vue 实例对象** 。至此我们知道了 createApp 就是创建了一个 vue 实例对象，之后调用实例对象的 **mount** 方法。

#### 初始化过程

##### mount

位置：_packages\runtime-core\src\apiCreateApp.ts_

```typescript
mount(
  rootContainer: HostElement,
  isHydrate?: boolean,
  isSVG?: boolean
): any {
  if (!isMounted) {
    // #5571
    if (__DEV__ && (rootContainer as any).__vue_app__) {
      warn(
        `There is already an app instance mounted on the host container.\n` +
          ` If you want to mount another app on the same host container,` +
          ` you need to unmount the previous app by calling \`app.unmount()\` first.`
      )
    }
    const vnode = createVNode(rootComponent, rootProps)
    // store app context on the root VNode.
    // this will be set on the root instance on initial mount.
    vnode.appContext = context

    // HMR root reload
    if (__DEV__) {
      context.reload = () => {
        render(cloneVNode(vnode), rootContainer, isSVG)
      }
    }

    if (isHydrate && hydrate) {
      hydrate(vnode as VNode<Node, Element>, rootContainer as any)
    } else {
      render(vnode, rootContainer, isSVG)
    }
    isMounted = true
    app._container = rootContainer
    // for devtools and telemetry
    ;(rootContainer as any).__vue_app__ = app

    if (__DEV__ || __FEATURE_PROD_DEVTOOLS__) {
      app._instance = vnode.component
      devtoolsInitApp(app, version)
    }

    return getExposeProxy(vnode.component!) || vnode.component!.proxy
  } else if (__DEV__) {
    warn(
      `App has already been mounted.\n` +
        `If you want to remount the same app, move your app creation logic ` +
        `into a factory function and create fresh app instances for each ` +
        `mount - e.g. \`const createMyApp = () => createApp(App)\``
    )
  }
}
```

:c-text{dir=center text=以下简称第一层mount}

```typescript
// packages\runtime-dom\src\index.ts createApp
const { mount } = app;
app.mount = (containerOrSelector: Element | ShadowRoot | string): any => {
  const container = normalizeContainer(containerOrSelector);
  if (!container) return;

  const component = app._component;
  if (!isFunction(component) && !component.render && !component.template) {
    // __UNSAFE__
    // Reason: potential execution of JS expressions in in-DOM template.
    // The user must make sure the in-DOM template is trusted. If it's
    // rendered by the server, the template should not contain any user data.
    // 博主注：在 DOM 模板中可能执行 JS 表达式。
    // 用户必须确保 DOM 模板是受信任的。如果是
    // 由服务器呈现，模板不应包含任何用户数据。
    component.template = container.innerHTML;
    // 2.x compat check
    if (__COMPAT__ && __DEV__) {
      for (let i = 0; i < container.attributes.length; i++) {
        const attr = container.attributes[i];
        if (attr.name !== "v-cloak" && /^(v-|:|@)/.test(attr.name)) {
          compatUtils.warnDeprecation(
            DeprecationTypes.GLOBAL_MOUNT_CONTAINER,
            null
          );
          break;
        }
      }
    }
  }
};
```

:c-text{dir=center text=以下简称第二层mount}

如果你认为 **createApp({}).mount('#app')** 方法就是执行第一层 mount 方法，那就错了，其实在 _packages\runtime-dom\src\index.ts_ createaApp 方法中，还有第二层 mount。首先巧妙的提取出了实例对象上的第一层 mount 方法，之后通过 app.mount 重写了 mount 方法，并在第二层 mount 方法中又调用了第一层 mount 方法。这种巧妙的书写方法可以让我们在调用第一层 mount 方法以前，对参数进行处理，或者是根据不同的场景差异化参数，类似“重载”的实现方式。之所以“重载”mount是为了实现跨平台。其实如果进行浏览器调试进行断点跟踪，也能发现上述问题，因为 test.html 中 mount 的参数为 _#app_ ，而实际在 mount 断点处，发现参数已经变为 DOM 元素，也就是说在这两者之间一定还有其他操作将选择器转换为了对应的 DOM 元素。

##### 浏览器调试

浏览器调试可以方便我们在代码多，分支复杂的情况下带领我们去按照执行步骤理清脉络，也可以帮助我们迅速定位问题所在位置。首先我们添加如下代码，然后重新运行 **pnpm dev**，此时会重新打包构建，并生成 vue.global.js，之后我们通过 **liveServer** 在浏览器运行 test.html 并查看效果。**F12** 打开控制台，刷新页面，可以看到控制台命中断点。

```javascript
...
if (!isMounted) {
  // eslint-disable-next-line no-debugger
  debugger;
  ...
```

命中断点以后，我们可以在 **callStack** 中查看调用链，因此也就知道了 **mount** 方法的上一个调用是在 **app.mount** 中。

:c-image-with-thumbnail{alt=callStack src=/img/articles/callStack.png}


接下来我们继续往下走，单步调试快捷键 **F10** ，进入方法快捷键 **F11** ，我们注意到以下代码：

```typescript
const vnode = createVNode(rootComponent, rootProps);
```

顾名思义，该方法将把实际的 DOM 转换成虚拟 DOM 节点 **vnode** 。

##### createVNode

位置：_packages\runtime-core\src\apiCreateApp.ts_

断点进入此方法，可以发现此方法也是由方法 **createVNodeWithArgsTransform** 所返回的，可以发现[闭包](/#)在 vue 源码中或者说大多数框架源码中被运用的场景非常多，此博客也会专门出一篇文章来讨论一下这个概念。从返回值可以看出，接下来进入到了 **\_createVNode** 方法。先按最简单的来，此处我们传入的参数 **type** 如下：

:c-image-with-thumbnail{alt=type src=/img/articles/type.png}

最终通过**createBaseVNode**方法创建并返回 vnode。

##### vnode

位置：_packages/runtime-core/src/vnode.ts_

> vnode 是对真实 DOM 的一种抽象描述，它的核心定义无非就几个关键属性，标签名、数据、子节点、键值等，其它属性都是用来扩展 vnode 的灵活性以及实现一些特殊 feature 的。由于 vnode 只是用来映射到真实 DOM 的渲染，不需要包含操作 DOM 的方法，因此它是非常轻量和简单的。
> :c-link{name=原文链接 href=https://ustbhuangyi.github.io/vue-analysis/v2/data-driven/virtual-dom.html target=blank}

```typescript
const vnode = {
  __v_isVNode: true,
  __v_skip: true,
  type,
  props,
  key: props && normalizeKey(props),
  ref: props && normalizeRef(props),
  scopeId: currentScopeId,
  slotScopeIds: null,
  children,
  component: null,
  suspense: null,
  ssContent: null,
  ssFallback: null,
  dirs: null,
  transition: null,
  el: null,
  anchor: null,
  target: null,
  targetAnchor: null,
  staticCount: 0,
  shapeFlag,
  patchFlag,
  dynamicProps,
  dynamicChildren: null,
  appContext: null,
  ctx: currentRenderingInstance,
} as VNode;

if (needFullChildrenNormalization) {
  normalizeChildren(vnode, children);
  // normalize suspense children
  if (__FEATURE_SUSPENSE__ && shapeFlag & ShapeFlags.SUSPENSE) {
    (type as typeof SuspenseImpl).normalize(vnode);
  }
} else if (children) {
  // compiled element vnode - if children is passed, only possible types are
  // string or Array.
  vnode.shapeFlag |= isString(children)
    ? ShapeFlags.TEXT_CHILDREN
    : ShapeFlags.ARRAY_CHILDREN;
}

// validate key
if (__DEV__ && vnode.key !== vnode.key) {
  warn(`VNode created with invalid key (NaN). VNode type:`, vnode.type);
}

// track vnode for block tree
if (
  isBlockTreeEnabled > 0 &&
  // avoid a block node from tracking itself
  !isBlockNode &&
  // has current parent block
  currentBlock &&
  // presence of a patch flag indicates this node needs patching on updates.
  // component nodes also should always be patched, because even if the
  // component doesn't need to update, it needs to persist the instance on to
  // the next vnode so that it can be properly unmounted later.
  (vnode.patchFlag > 0 || shapeFlag & ShapeFlags.COMPONENT) &&
  // the EVENTS flag is only for hydration and if it is the only flag, the
  // vnode should not be considered dynamic due to handler caching.
  vnode.patchFlag !== PatchFlags.HYDRATE_EVENTS
) {
  currentBlock.push(vnode);
}

if (__COMPAT__) {
  convertLegacyVModelProps(vnode);
  defineLegacyVNodeProperties(vnode);
}

return vnode;
```

可以看到 vnode 节点有茫茫多的属性，我们不用去一一深究每个属性代表的含义，而是在用到的时候逐个去分析，这样由点逐面，最终当你彻底理解 vnode 每个属性的含义以及运作机制之后，那么恭喜你，vue3 源码也就掌握的差不多了。

##### render

位置：_packages\runtime-core\src\renderer.ts_

回到主线，我们生成了一个 vnode，接下来将 vnode 作为参数传到**render**函数中

```typescript
render(vnode, rootContainer, isSVG);
```

先不考虑 isSVG，**rootContainer**对应根节点，而**vnode.type.template** 对应根节点的 innerHTML。然后来看看 render 方法，此处的 render 向上溯源发现是 **createAppAPI** 的参数，而 **createAppAPI** 方法又是由 **createRenderer** 方法调用并传入了 render 参数。那我们就回到 **createRenderer** 方法，原来是那个两千多行代码的方法，我们依旧只看我们需要的部分：

```typescript
const render: RootRenderFunction = (vnode, container, isSVG) => {
  if (vnode == null) {
    if (container._vnode) {
      unmount(container._vnode, null, null, true);
    }
  } else {
    patch(container._vnode || null, vnode, container, null, null, null, isSVG);
  }
  flushPreFlushCbs();
  flushPostFlushCbs();
  container._vnode = vnode;
};
```

从 render 代码可以知道，patch 执行完后才会将当前 vnode 赋值给 **container.\_vnode** OK，这样我们就可以带着参数去分析一下这段代码，首先 vnode 不为 null，方法执行到了 **patch** 中：

##### patch

位置：_packages\runtime-core\src\renderer.ts_

```typescript
// 博主注：baseCreateRenderer
const patch: PatchFn = (
  n1,
  n2,
  container,
  anchor = null,
  parentComponent = null,
  parentSuspense = null,
  isSVG = false,
  slotScopeIds = null,
  optimized = __DEV__ && isHmrUpdating ? false : !!n2.dynamicChildren
) => {
  if (n1 === n2) {
    return;
  }

  // patching & not same type, unmount old tree
  if (n1 && !isSameVNodeType(n1, n2)) {
    anchor = getNextHostNode(n1);
    unmount(n1, parentComponent, parentSuspense, true);
    n1 = null;
  }

  if (n2.patchFlag === PatchFlags.BAIL) {
    optimized = false;
    n2.dynamicChildren = null;
  }

  const { type, ref, shapeFlag } = n2;
  switch (type) {
    case Text:
      processText(n1, n2, container, anchor);
      break;
    case Comment:
      processCommentNode(n1, n2, container, anchor);
      break;
    case Static:
      if (n1 == null) {
        mountStaticNode(n2, container, anchor, isSVG);
      } else if (__DEV__) {
        patchStaticNode(n1, n2, container, isSVG);
      }
      break;
    case Fragment:
      processFragment(
        n1,
        n2,
        container,
        anchor,
        parentComponent,
        parentSuspense,
        isSVG,
        slotScopeIds,
        optimized
      );
      break;
    default:
      if (shapeFlag & ShapeFlags.ELEMENT) {
        processElement(
          n1,
          n2,
          container,
          anchor,
          parentComponent,
          parentSuspense,
          isSVG,
          slotScopeIds,
          optimized
        );
      } else if (shapeFlag & ShapeFlags.COMPONENT) {
        processComponent(
          n1,
          n2,
          container,
          anchor,
          parentComponent,
          parentSuspense,
          isSVG,
          slotScopeIds,
          optimized
        );
      } else if (shapeFlag & ShapeFlags.TELEPORT) {
        (type as typeof TeleportImpl).process(
          n1 as TeleportVNode,
          n2 as TeleportVNode,
          container,
          anchor,
          parentComponent,
          parentSuspense,
          isSVG,
          slotScopeIds,
          optimized,
          internals
        );
      } else if (__FEATURE_SUSPENSE__ && shapeFlag & ShapeFlags.SUSPENSE) {
        (type as typeof SuspenseImpl).process(
          n1,
          n2,
          container,
          anchor,
          parentComponent,
          parentSuspense,
          isSVG,
          slotScopeIds,
          optimized,
          internals
        );
      } else if (__DEV__) {
        warn("Invalid VNode type:", type, `(${typeof type})`);
      }
  }

  // set ref
  if (ref != null && parentComponent) {
    setRef(ref, n1 && n1.ref, parentSuspense, n2 || n1, !n2);
  }
};
```

我们的断点走到此处，第一个参数（n1）为 null，第二个参数（n2）就是前面创建的 vnode，第三个参数（container）就是根节点 DOM 元素。此处留下一个问题，该函数参数在初始化只用到了第二、三个参数，以后还有什么场景会调用 patch？到那时传参如何？还记得**n2.type**吗，这里就判断了该值，明显进入了 default 分支。此时再记住一个属性，**shapeFlag** ，该值的判断方式：

```typescript
// 博主注： packages/runtime-core/src/vnode.ts
const shapeFlag = isString(type)
  ? ShapeFlags.ELEMENT
  : __FEATURE_SUSPENSE__ && isSuspense(type)
  ? ShapeFlags.SUSPENSE
  : isTeleport(type)
  ? ShapeFlags.TELEPORT
  : isObject(type)
  ? ShapeFlags.STATEFUL_COMPONENT
  : isFunction(type)
  ? ShapeFlags.FUNCTIONAL_COMPONENT
  : 0;
```

```typescript
// 博主注： packages\shared\src\shapeFlags.ts
export const enum ShapeFlags {
  ELEMENT = 1,
  FUNCTIONAL_COMPONENT = 1 << 1, // 2
  STATEFUL_COMPONENT = 1 << 2, // 4
  TEXT_CHILDREN = 1 << 3, // 8
  ARRAY_CHILDREN = 1 << 4, // 16
  SLOTS_CHILDREN = 1 << 5, // 32
  TELEPORT = 1 << 6, // 64
  SUSPENSE = 1 << 7, // 128
  COMPONENT_SHOULD_KEEP_ALIVE = 1 << 8, // 256
  COMPONENT_KEPT_ALIVE = 1 << 9, // 512
  COMPONENT = ShapeFlags.STATEFUL_COMPONENT | ShapeFlags.FUNCTIONAL_COMPONENT, // 6
}
```

显然，shapeFlag 会根据 **type** _（注意此处的 type 值等于 vnode.type，但并不是真正的 vnode.type，因为此时 vnode 还没创建）_ 的值，我们知道对应取**ShapeFlags.STATEFUL_COMPONENT**，也就是 4。**<<** 为左移运算符，**|** 为按位或。_我们一般在底层代码使用位运算符的方式枚举，可以提高程序性能；业务层代码还是使用数字枚举方式，提升代码可读性。_

回到主线，此时方法来到了 **processComponent** 中。

##### processComponent

位置：_packages\runtime-core\src\renderer.ts_

```typescript
const processComponent = (
  n1: VNode | null,
  n2: VNode,
  container: RendererElement,
  anchor: RendererNode | null,
  parentComponent: ComponentInternalInstance | null,
  parentSuspense: SuspenseBoundary | null,
  isSVG: boolean,
  slotScopeIds: string[] | null,
  optimized: boolean
) => {
  n2.slotScopeIds = slotScopeIds;
  if (n1 == null) {
    if (n2.shapeFlag & ShapeFlags.COMPONENT_KEPT_ALIVE) {
      (parentComponent!.ctx as KeepAliveContext).activate(
        n2,
        container,
        anchor,
        isSVG,
        optimized
      );
    } else {
      mountComponent(
        n2,
        container,
        anchor,
        parentComponent,
        parentSuspense,
        isSVG,
        optimized
      );
    }
  } else {
    updateComponent(n1, n2, optimized);
  }
};
```

该方法中首先判断 n1 如果为 null，也就是前面的 **container.\_vnode** 为 undefined。其次又判断是否是 **keep_alive 组件** 。初始化过程执行到了 **mountComponent** 方法中。

同时我们再多看一步，那就是如果 n1 不为 null 的时候，将会进入 **updateComponent** 方法中，该方法先按下不表，也就是说初始化 patch 完成后，将会给 **container.\_vnode** 赋值，之后更新过程中执行到此方法，n1 将不再是 null，而是上一次初始化过程中创建的 vnode。

##### mountComponent

位置：_packages\runtime-core\src\renderer.ts_

```typescript
const mountComponent: MountComponentFn = (
  initialVNode,
  container,
  anchor,
  parentComponent,
  parentSuspense,
  isSVG,
  optimized
) => {
  // 2.x compat may pre-create the component instance before actually
  // mounting
  // 博主注：兼容vue2处理
  const compatMountInstance =
    __COMPAT__ && initialVNode.isCompatRoot && initialVNode.component;
  const instance: ComponentInternalInstance =
    compatMountInstance ||
    (initialVNode.component = createComponentInstance(
      initialVNode,
      parentComponent,
      parentSuspense
    ));

  if (__DEV__ && instance.type.__hmrId) {
    registerHMR(instance);
  }

  if (__DEV__) {
    pushWarningContext(initialVNode);
    startMeasure(instance, `mount`);
  }

  // inject renderer internals for keepAlive
  if (isKeepAlive(initialVNode)) {
    (instance.ctx as KeepAliveContext).renderer = internals;
  }

  // resolve props and slots for setup context
  if (!(__COMPAT__ && compatMountInstance)) {
    if (__DEV__) {
      startMeasure(instance, `init`);
    }
    setupComponent(instance);
    if (__DEV__) {
      endMeasure(instance, `init`);
    }
  }

  // setup() is async. This component relies on async logic to be resolved
  // before proceeding
  if (__FEATURE_SUSPENSE__ && instance.asyncDep) {
    parentSuspense && parentSuspense.registerDep(instance, setupRenderEffect);

    // Give it a placeholder if this is not hydration
    // TODO handle self-defined fallback
    if (!initialVNode.el) {
      const placeholder = (instance.subTree = createVNode(Comment));
      processCommentNode(null, placeholder, container!, anchor);
    }
    return;
  }

  setupRenderEffect(
    instance,
    initialVNode,
    container,
    anchor,
    parentSuspense,
    isSVG,
    optimized
  );

  if (__DEV__) {
    popWarningContext();
    endMeasure(instance, `mount`);
  }
};
```

**createComponentInstance** 创建组件实例，这里重点关注 **setupComponent** 方法和 **setupRenderEffect** 方法。

##### setupComponent

位置：_packages\runtime-core\src\component.ts_

该方法用来处理组件数据，属性**props**，插槽**slot**等。

```typescript
export function setupComponent(
  instance: ComponentInternalInstance,
  isSSR = false
) {
  isInSSRComponentSetup = isSSR;

  const { props, children } = instance.vnode;
  const isStateful = isStatefulComponent(instance); // 博主注：shapeFlag & ShapeFlags.STATEFUL_COMPONENT
  initProps(instance, props, isStateful, isSSR);
  initSlots(instance, children);

  const setupResult = isStateful
    ? setupStatefulComponent(instance, isSSR)
    : undefined;
  isInSSRComponentSetup = false;
  return setupResult;
}
```

执行**finishComponentSetup**，生成render函数。

```typescript
// 博主注：packages\runtime-core\src\component.ts
export function finishComponentSetup(
  instance: ComponentInternalInstance,
  isSSR: boolean,
  skipOptions?: boolean
) {
  const Component = instance.type as ComponentOptions;

  if (__COMPAT__) {
    convertLegacyRenderFn(instance);

    if (__DEV__ && Component.compatConfig) {
      validateCompatConfig(Component.compatConfig);
    }
  }

  // template / render function normalization
  // could be already set when returned from setup()
  if (!instance.render) {
    // only do on-the-fly compile if not in SSR - SSR on-the-fly compilation
    // is done by server-renderer
    if (!isSSR && compile && !Component.render) {
      const template =
        (__COMPAT__ &&
          instance.vnode.props &&
          instance.vnode.props["inline-template"]) ||
        Component.template ||
        resolveMergedOptions(instance).template;
      if (template) {
        if (__DEV__) {
          startMeasure(instance, `compile`);
        }
        const { isCustomElement, compilerOptions } = instance.appContext.config;
        const { delimiters, compilerOptions: componentCompilerOptions } =
          Component;
        const finalCompilerOptions: CompilerOptions = extend(
          extend(
            {
              isCustomElement,
              delimiters,
            },
            compilerOptions
          ),
          componentCompilerOptions
        );
        if (__COMPAT__) {
          // pass runtime compat config into the compiler
          finalCompilerOptions.compatConfig = Object.create(globalCompatConfig);
          if (Component.compatConfig) {
            // @ts-expect-error types are not compatible
            extend(finalCompilerOptions.compatConfig, Component.compatConfig);
          }
        }
        Component.render = compile(template, finalCompilerOptions);
        if (__DEV__) {
          endMeasure(instance, `compile`);
        }
      }
    }

    instance.render = (Component.render || NOOP) as InternalRenderFunction;

    // for runtime-compiled render functions using `with` blocks, the render
    // proxy used needs a different `has` handler which is more performant and
    // also only allows a whitelist of globals to fallthrough.
    if (installWithProxy) {
      installWithProxy(instance);
    }
  }

  // support for 2.x options
  if (__FEATURE_OPTIONS_API__ && !(__COMPAT__ && skipOptions)) {
    setCurrentInstance(instance);
    pauseTracking();
    try {
      applyOptions(instance);
    } finally {
      resetTracking();
      unsetCurrentInstance();
    }
  }

  // warn missing template/render
  // the runtime compilation of template in SSR is done by server-render
  if (__DEV__ && !Component.render && instance.render === NOOP && !isSSR) {
    /* istanbul ignore if */
    if (!compile && Component.template) {
      warn(
        `Component provided template option but ` +
          `runtime compilation is not supported in this build of Vue.` +
          (__ESM_BUNDLER__
            ? ` Configure your bundler to alias "vue" to "vue/dist/vue.esm-bundler.js".`
            : __ESM_BROWSER__
            ? ` Use "vue.esm-browser.js" instead.`
            : __GLOBAL__
            ? ` Use "vue.global.js" instead.`
            : ``) /* should not happen */
      );
    } else {
      warn(`Component is missing template or render function.`);
    }
  }
}
```

不同于vue2源码的是，_vue2是直接在代码里声明的方法：**compileToFunction**_，而vue3的实现比较巧妙：我们首先看下**compile**函数是如何生成的：

```typescript
// 博主注：packages\runtime-core\src\component.ts
export function registerRuntimeCompiler(_compile: any) {
  compile = _compile
  installWithProxy = i => {
    if (i.render!._rc) {
      i.withProxy = new Proxy(i.ctx, RuntimeCompiledPublicInstanceProxyHandlers)
    }
  }
}
```

这个方法还记得不，可以回顾一下[入口文件](#入口文件)，原来这里暴露的方法是在入口文件被调用的。因此compile函数实际上就是入口文件定义的方法：**compileToFunction**，那么为什么要把方法提取出去放到入口文件呢？通过 **compileToFunction** 代码可以分析出是为了缓存，以优化编译性能。

这里有一个点要提一下：**\_\_COMPAT\_\_**，**\_\_DEV\_\_** 等这些是 rollup 打包配置的全局变量，可以从 _rollup.config.js_ 中找到出处。

##### setupRenderEffect

位置：_packages\runtime-core\src\renderer.ts_

```typescript
const setupRenderEffect: SetupRenderEffectFn = (
  instance,
  initialVNode,
  container,
  anchor,
  parentSuspense,
  isSVG,
  optimized
) => {
  const componentUpdateFn = () => {
    if (!instance.isMounted) {
      let vnodeHook: VNodeHook | null | undefined
      const { el, props } = initialVNode
      const { bm, m, parent } = instance
      const isAsyncWrapperVNode = isAsyncWrapper(initialVNode)

      toggleRecurse(instance, false)
      // beforeMount hook
      if (bm) {
        invokeArrayFns(bm)
      }
      // onVnodeBeforeMount
      if (
        !isAsyncWrapperVNode &&
        (vnodeHook = props && props.onVnodeBeforeMount)
      ) {
        invokeVNodeHook(vnodeHook, parent, initialVNode)
      }
      if (
        __COMPAT__ &&
        isCompatEnabled(DeprecationTypes.INSTANCE_EVENT_HOOKS, instance)
      ) {
        instance.emit('hook:beforeMount')
      }
      toggleRecurse(instance, true)

      if (el && hydrateNode) {
        // vnode has adopted host node - perform hydration instead of mount.
        const hydrateSubTree = () => {
          if (__DEV__) {
            startMeasure(instance, `render`)
          }
          instance.subTree = renderComponentRoot(instance)
          if (__DEV__) {
            endMeasure(instance, `render`)
          }
          if (__DEV__) {
            startMeasure(instance, `hydrate`)
          }
          hydrateNode!(
            el as Node,
            instance.subTree,
            instance,
            parentSuspense,
            null
          )
          if (__DEV__) {
            endMeasure(instance, `hydrate`)
          }
        }

        if (isAsyncWrapperVNode) {
          ;(initialVNode.type as ComponentOptions).__asyncLoader!().then(
            // note: we are moving the render call into an async callback,
            // which means it won't track dependencies - but it's ok because
            // a server-rendered async wrapper is already in resolved state
            // and it will never need to change.
            () => !instance.isUnmounted && hydrateSubTree()
          )
        } else {
          hydrateSubTree()
        }
      } else {
        if (__DEV__) {
          startMeasure(instance, `render`)
        }
        const subTree = (instance.subTree = renderComponentRoot(instance))
        if (__DEV__) {
          endMeasure(instance, `render`)
        }
        if (__DEV__) {
          startMeasure(instance, `patch`)
        }
        patch(
          null,
          subTree,
          container,
          anchor,
          instance,
          parentSuspense,
          isSVG
        )
        if (__DEV__) {
          endMeasure(instance, `patch`)
        }
        initialVNode.el = subTree.el
      }
      // mounted hook
      if (m) {
        queuePostRenderEffect(m, parentSuspense)
      }
      // onVnodeMounted
      if (
        !isAsyncWrapperVNode &&
        (vnodeHook = props && props.onVnodeMounted)
      ) {
        const scopedInitialVNode = initialVNode
        queuePostRenderEffect(
          () => invokeVNodeHook(vnodeHook!, parent, scopedInitialVNode),
          parentSuspense
        )
      }
      if (
        __COMPAT__ &&
        isCompatEnabled(DeprecationTypes.INSTANCE_EVENT_HOOKS, instance)
      ) {
        queuePostRenderEffect(
          () => instance.emit('hook:mounted'),
          parentSuspense
        )
      }

      // activated hook for keep-alive roots.
      // #1742 activated hook must be accessed after first render
      // since the hook may be injected by a child keep-alive
      if (
        initialVNode.shapeFlag & ShapeFlags.COMPONENT_SHOULD_KEEP_ALIVE ||
        (parent &&
          isAsyncWrapper(parent.vnode) &&
          parent.vnode.shapeFlag & ShapeFlags.COMPONENT_SHOULD_KEEP_ALIVE)
      ) {
        instance.a && queuePostRenderEffect(instance.a, parentSuspense)
        if (
          __COMPAT__ &&
          isCompatEnabled(DeprecationTypes.INSTANCE_EVENT_HOOKS, instance)
        ) {
          queuePostRenderEffect(
            () => instance.emit('hook:activated'),
            parentSuspense
          )
        }
      }
      instance.isMounted = true

      if (__DEV__ || __FEATURE_PROD_DEVTOOLS__) {
        devtoolsComponentAdded(instance)
      }

      // #2458: deference mount-only object parameters to prevent memleaks
      initialVNode = container = anchor = null as any
    } else {
      // updateComponent
      // This is triggered by mutation of component's own state (next: null)
      // OR parent calling processComponent (next: VNode)
      let { next, bu, u, parent, vnode } = instance
      let originNext = next
      let vnodeHook: VNodeHook | null | undefined
      if (__DEV__) {
        pushWarningContext(next || instance.vnode)
      }

      // Disallow component effect recursion during pre-lifecycle hooks.
      toggleRecurse(instance, false)
      if (next) {
        next.el = vnode.el
        updateComponentPreRender(instance, next, optimized)
      } else {
        next = vnode
      }

      // beforeUpdate hook
      if (bu) {
        invokeArrayFns(bu)
      }
      // onVnodeBeforeUpdate
      if ((vnodeHook = next.props && next.props.onVnodeBeforeUpdate)) {
        invokeVNodeHook(vnodeHook, parent, next, vnode)
      }
      if (
        __COMPAT__ &&
        isCompatEnabled(DeprecationTypes.INSTANCE_EVENT_HOOKS, instance)
      ) {
        instance.emit('hook:beforeUpdate')
      }
      toggleRecurse(instance, true)

      // render
      if (__DEV__) {
        startMeasure(instance, `render`)
      }
      const nextTree = renderComponentRoot(instance)
      if (__DEV__) {
        endMeasure(instance, `render`)
      }
      const prevTree = instance.subTree
      instance.subTree = nextTree

      if (__DEV__) {
        startMeasure(instance, `patch`)
      }
      patch(
        prevTree,
        nextTree,
        // parent may have changed if it's in a teleport
        hostParentNode(prevTree.el!)!,
        // anchor may have changed if it's in a fragment
        getNextHostNode(prevTree),
        instance,
        parentSuspense,
        isSVG
      )
      if (__DEV__) {
        endMeasure(instance, `patch`)
      }
      next.el = nextTree.el
      if (originNext === null) {
        // self-triggered update. In case of HOC, update parent component
        // vnode el. HOC is indicated by parent instance's subTree pointing
        // to child component's vnode
        updateHOCHostEl(instance, nextTree.el)
      }
      // updated hook
      if (u) {
        queuePostRenderEffect(u, parentSuspense)
      }
      // onVnodeUpdated
      if ((vnodeHook = next.props && next.props.onVnodeUpdated)) {
        queuePostRenderEffect(
          () => invokeVNodeHook(vnodeHook!, parent, next!, vnode),
          parentSuspense
        )
      }
      if (
        __COMPAT__ &&
        isCompatEnabled(DeprecationTypes.INSTANCE_EVENT_HOOKS, instance)
      ) {
        queuePostRenderEffect(
          () => instance.emit('hook:updated'),
          parentSuspense
        )
      }

      if (__DEV__ || __FEATURE_PROD_DEVTOOLS__) {
        devtoolsComponentUpdated(instance)
      }

      if (__DEV__) {
        popWarningContext()
      }
    }
  }

  // create reactive effect for rendering
  const effect = (instance.effect = new ReactiveEffect(
    componentUpdateFn,
    () => queueJob(update),
    instance.scope // track it in component's effect scope
  ))

  const update: SchedulerJob = (instance.update = () => effect.run())
  update.id = instance.uid
  // allowRecurse
  // #1801, #2043 component render effects should allow recursive updates
  toggleRecurse(instance, true)

  if (__DEV__) {
    effect.onTrack = instance.rtc
      ? e => invokeArrayFns(instance.rtc!, e)
      : void 0
    effect.onTrigger = instance.rtg
      ? e => invokeArrayFns(instance.rtg!, e)
      : void 0
    update.ownerInstance = instance
  }

  update()
}
```

该方法用于组件初始化以及更新，篇幅较长，`effect`的功能先按下不表，在方法结尾执行了**update()**，也就进入到了**componentUpdateFn**，进入该方法，hydrate也先不提，可以看到其中这样一句代码：

```typescript
 const subTree = (instance.subTree = renderComponentRoot(instance))
```

我们知道代码执行到这儿已经生成了render函数，那么接下来应该就是执行render函数了。要知道subTree是什么就要知道render函数到底返回的什么。通过观察**normalizeVNode**的入参，render函数返回的就是一个虚拟的DOM树，该树的根节点是一个type为 **Symbol(v-fgt)** 的Fragment。

接下来就是通过patch将子树vnode挂载到container中，此时n1为null，n2就是子树vnode，它的 **shapeFlag** 为16。此时分支进入到 **processFragment** 方法中。

##### processFragment

```typescript
const processFragment = (
  n1: VNode | null,
  n2: VNode,
  container: RendererElement,
  anchor: RendererNode | null,
  parentComponent: ComponentInternalInstance | null,
  parentSuspense: SuspenseBoundary | null,
  isSVG: boolean,
  slotScopeIds: string[] | null,
  optimized: boolean
) => {
  const fragmentStartAnchor = (n2.el = n1 ? n1.el : hostCreateText(''))!
  const fragmentEndAnchor = (n2.anchor = n1 ? n1.anchor : hostCreateText(''))!

  let { patchFlag, dynamicChildren, slotScopeIds: fragmentSlotScopeIds } = n2

  if (
    __DEV__ &&
    // #5523 dev root fragment may inherit directives
    (isHmrUpdating || patchFlag & PatchFlags.DEV_ROOT_FRAGMENT)
  ) {
    // HMR updated / Dev root fragment (w/ comments), force full diff
    patchFlag = 0
    optimized = false
    dynamicChildren = null
  }

  // check if this is a slot fragment with :slotted scope ids
  if (fragmentSlotScopeIds) {
    slotScopeIds = slotScopeIds
      ? slotScopeIds.concat(fragmentSlotScopeIds)
      : fragmentSlotScopeIds
  }

  if (n1 == null) {
    hostInsert(fragmentStartAnchor, container, anchor)
    hostInsert(fragmentEndAnchor, container, anchor)
    // a fragment can only have array children
    // since they are either generated by the compiler, or implicitly created
    // from arrays.
    mountChildren(
      n2.children as VNodeArrayChildren,
      container,
      fragmentEndAnchor,
      parentComponent,
      parentSuspense,
      isSVG,
      slotScopeIds,
      optimized
    )
  } else {
    if (
      patchFlag > 0 &&
      patchFlag & PatchFlags.STABLE_FRAGMENT &&
      dynamicChildren &&
      // #2715 the previous fragment could've been a BAILed one as a result
      // of renderSlot() with no valid children
      n1.dynamicChildren
    ) {
      // a stable fragment (template root or <template v-for>) doesn't need to
      // patch children order, but it may contain dynamicChildren.
      patchBlockChildren(
        n1.dynamicChildren,
        dynamicChildren,
        container,
        parentComponent,
        parentSuspense,
        isSVG,
        slotScopeIds
      )
      if (__DEV__) {
        // necessary for HMR
        traverseStaticChildren(n1, n2)
      } else if (
        // #2080 if the stable fragment has a key, it's a <template v-for> that may
        //  get moved around. Make sure all root level vnodes inherit el.
        // #2134 or if it's a component root, it may also get moved around
        // as the component is being moved.
        n2.key != null ||
        (parentComponent && n2 === parentComponent.subTree)
      ) {
        traverseStaticChildren(n1, n2, true /* shallow */)
      }
    } else {
      // keyed / unkeyed, or manual fragments.
      // for keyed & unkeyed, since they are compiler generated from v-for,
      // each child is guaranteed to be a block so the fragment will never
      // have dynamicChildren.
      patchChildren(
        n1,
        n2,
        container,
        fragmentEndAnchor,
        parentComponent,
        parentSuspense,
        isSVG,
        slotScopeIds,
        optimized
      )
    }
  }
}
```

##### mountChildren

遍历subTree.children，依次执行patch。

##### processElement

```typescript
const processElement = (
  n1: VNode | null,
  n2: VNode,
  container: RendererElement,
  anchor: RendererNode | null,
  parentComponent: ComponentInternalInstance | null,
  parentSuspense: SuspenseBoundary | null,
  isSVG: boolean,
  slotScopeIds: string[] | null,
  optimized: boolean
) => {
  isSVG = isSVG || (n2.type as string) === 'svg'
  if (n1 == null) {
    mountElement(
      n2,
      container,
      anchor,
      parentComponent,
      parentSuspense,
      isSVG,
      slotScopeIds,
      optimized
    )
  } else {
    patchElement(
      n1,
      n2,
      parentComponent,
      parentSuspense,
      isSVG,
      slotScopeIds,
      optimized
    )
  }
}
```

##### mountElement

```typescript
const mountElement = (
  vnode: VNode,
  container: RendererElement,
  anchor: RendererNode | null,
  parentComponent: ComponentInternalInstance | null,
  parentSuspense: SuspenseBoundary | null,
  isSVG: boolean,
  slotScopeIds: string[] | null,
  optimized: boolean
) => {
  let el: RendererElement
  let vnodeHook: VNodeHook | undefined | null
  const { type, props, shapeFlag, transition, dirs } = vnode

  el = vnode.el = hostCreateElement(
    vnode.type as string,
    isSVG,
    props && props.is,
    props
  )

  // mount children first, since some props may rely on child content
  // being already rendered, e.g. `<select value>`
  if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
    hostSetElementText(el, vnode.children as string)
  } else if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
    mountChildren(
      vnode.children as VNodeArrayChildren,
      el,
      null,
      parentComponent,
      parentSuspense,
      isSVG && type !== 'foreignObject',
      slotScopeIds,
      optimized
    )
  }

  if (dirs) {
    invokeDirectiveHook(vnode, null, parentComponent, 'created')
  }
  // scopeId
  setScopeId(el, vnode, vnode.scopeId, slotScopeIds, parentComponent)
  // props
  if (props) {
    for (const key in props) {
      if (key !== 'value' && !isReservedProp(key)) {
        hostPatchProp(
          el,
          key,
          null,
          props[key],
          isSVG,
          vnode.children as VNode[],
          parentComponent,
          parentSuspense,
          unmountChildren
        )
      }
    }
    /**
     * Special case for setting value on DOM elements:
     * - it can be order-sensitive (e.g. should be set *after* min/max, #2325, #4024)
     * - it needs to be forced (#1471)
     * #2353 proposes adding another renderer option to configure this, but
     * the properties affects are so finite it is worth special casing it
     * here to reduce the complexity. (Special casing it also should not
     * affect non-DOM renderers)
     */
    if ('value' in props) {
      hostPatchProp(el, 'value', null, props.value)
    }
    if ((vnodeHook = props.onVnodeBeforeMount)) {
      invokeVNodeHook(vnodeHook, parentComponent, vnode)
    }
  }

  if (__DEV__ || __FEATURE_PROD_DEVTOOLS__) {
    Object.defineProperty(el, '__vnode', {
      value: vnode,
      enumerable: false
    })
    Object.defineProperty(el, '__vueParentComponent', {
      value: parentComponent,
      enumerable: false
    })
  }
  if (dirs) {
    invokeDirectiveHook(vnode, null, parentComponent, 'beforeMount')
  }
  // #1583 For inside suspense + suspense not resolved case, enter hook should call when suspense resolved
  // #1689 For inside suspense + suspense resolved case, just call it
  const needCallTransitionHooks =
    (!parentSuspense || (parentSuspense && !parentSuspense.pendingBranch)) &&
    transition &&
    !transition.persisted
  if (needCallTransitionHooks) {
    transition!.beforeEnter(el)
  }
  hostInsert(el, container, anchor)
  if (
    (vnodeHook = props && props.onVnodeMounted) ||
    needCallTransitionHooks ||
    dirs
  ) {
    queuePostRenderEffect(() => {
      vnodeHook && invokeVNodeHook(vnodeHook, parentComponent, vnode)
      needCallTransitionHooks && transition!.enter(el)
      dirs && invokeDirectiveHook(vnode, null, parentComponent, 'mounted')
    }, parentSuspense)
  }
}
```

最终执行 **hostInsert** 将DOM插入到页面中。整体流程可以通过调用栈一目了然：

:c-image-with-thumbnail{alt=callStack2 src=/img/articles/callStack2.png}
