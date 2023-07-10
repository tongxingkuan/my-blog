---
title: 'vue3源码解读'
description: 'vue3、源码'
---

## vue3源码解读

### 写在前面的话

> [vue3官方文档](https://cn.vuejs.org/guide/introduction.html)：Vue 2 将于 2023 年 12 月 31 日停止维护。

这使得我们学习vue3顺理成章，本文将通过解读[vue3源码](https://github.com/vuejs/vue-next)，带领大家从入口到打包配置，再到浏览器调试、控制台日志等方方面面，来解读剖析一下vue3源码。中间也会穿插对比与vue2的实现差异。

<br />

### 寻找入口文件

要阅读项目源代码，特别是当项目目录较多，层次较深时，我们就要从入口文件入手，根据入口逐渐发散开来，期间要找准主线逻辑，切莫跑偏导致思绪混乱。现在的项目大多是基于nodejs开发，像这一类项目，找到 __package.json__ 文件也就找到了项目的“身份证”。根据 __package.json__ 的scripts中的指令，我们找到了dev指令所对应的文件路径及名称： __node scripts/dev.js__ ，那么我们接下来就进入到该文件下一探究竟吧！

> 当然scripts中的命令还有很多，且不是以dev.js作为入口，这个时候我们就要 *学会分清主线* ，何为主线，就是在不了解代码的前提下，先找准一个方向进行探究，期间的其他分支不要过分纠结，否则将会导致我们深陷支线，难以自拔，最终的结果就是放弃或从头再来。

### scripts/dev.js文件解读

该文件用于解析scripts中的命令并获取到各种参数，用于后续打包配置。

```javascript
const __dirname = dirname(fileURLToPath(import.meta.url))
const args = minimist(process.argv.slice(2))
const target = args._[0] || 'vue'
const format = args.f || 'global'
const inlineDeps = args.i || args.inline
const pkg = require(`../packages/${target}/package.json`)
```

以上是截取的部分源码，在阅读该源码过程中，如果我们不知道某行代码的含义，这个时候，另一个调试工具可以很好的帮助我们，它就是 *console.log(desciprtion, somethingToPrint)* 。其中第一个参数可以让我们在众多的打印中快速找到我们要打印的内容。

```javascript
const __dirname = dirname(fileURLToPath(import.meta.url))
console.log('__dirname', __dirname) // __dirname C:\Users\童年\Desktop\tongxk\core\scripts
const args = minimist(process.argv.slice(2))
console.log('args', args) // args { _: [] }
const target = args._[0] || 'vue'
const format = args.f || 'global'
const inlineDeps = args.i || args.inline
const pkg = require(`../packages/${target}/package.json`)
```

通过阅读后续源码，我们知道target是输出文件目录（C:\Users\童年\Desktop\tongxk\core\packages\vue\dist），format是代码打包格式（ __iife__ :立即执行函数表达式）。最终使用esbuild模块将代码打包。那么打包工具是什么呢？

### 打包工具

#### rollup(build.js)

我们知道现在主流的打包工具有：[webpack](/#)、[rollup](/#)、[grunt](/#)；此博客将分章节讲述各种打包工具的特点，并对比各个打包工具的优劣，此处不过多赘述。通过代码根目录下的 __rollup.config.js__ 我们知道vue3项目源码采用 *rollup* 进行打包。而熟悉vue2源码的小伙伴都知道，vue2采用的webpack打包，那么为什么要放弃webpack打包工具，采用rollup呢？

>   在vue2中，打包采用的是webpack，而到了vue3中打包就变成了rollup，而且不仅仅vue3采用了rollup来打包，react也从webpack到rollup转变了。那么rollup打包工具是不是要比webpack打包要好呢？其实各自有各自的用途，我们通过对比vue2和vue3的一些用法就可以简单的看出来两者打包工具的一些区别，vue3最大的一个特性就说采用了组合式API，简单来说vue2更多的像一个百宝箱，我们可以开箱即用，而vue3更多的是提供一些基础功能，然后让使用者去选择，灵活使用。
>   两者打包工具各自有各自的好处，就像一句话说的"webpack是大而全，rollup是小而美"。首先相对于webpack来说rollup更加轻量级，同时rollup是一个JS模块打包器，更适合于JS库打包，而webpack更适合的是大型项目。<br />
> ——
> 版权声明：本文为CSDN博主「BUG不加糖」的原创文章，遵循CC 4.0 BY-SA版权协议，转载请附上原文出处链接及本声明。
> 原文链接：https://blog.csdn.net/YX0711/article/details/129202476

归结来说就是rollup更轻量，更契合vue3灵活性的特点。以上说明了一下vue3打包工具以及为什么采用rollup打包。

> 但是其实这一小节说的rollup打包实际上并未在dev命令的后续中使用到，因为在 __scripts/dev.js__ 有这么一段打包代码，对比 __scripts/build.js__ 中的打包代码不难发现，运行 __yarn dev__ 并不会采用rollup打包方式，而是采用的 *esbuild打包方式* 。之所以在这里提到rollup是因为我们常用的还是build构建方式生成的包才是大多数脚手架工具采用的依赖包，而dev构建方式只是生成一个 __dist\vue.global.js__ 文件，在现在的应用场景相对较少。

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
    platform: format === 'cjs' ? 'node' : 'browser',
    plugins,
    define: {
      __COMMIT__: `"dev"`,
      __VERSION__: `"${pkg.version}"`,
      __DEV__: `true`,
      __TEST__: `false`,
      __BROWSER__: String(
        format !== 'cjs' && !pkg.buildOptions?.enableNonBrowserBranches
      ),
      __GLOBAL__: String(format === 'global'),
      __ESM_BUNDLER__: String(format.includes('esm-bundler')),
      __ESM_BROWSER__: String(format.includes('esm-browser')),
      __NODE_JS__: String(format === 'cjs'),
      __SSR__: String(format === 'cjs' || format.includes('esm-bundler')),
      __COMPAT__: String(target === 'vue-compat'),
      __FEATURE_SUSPENSE__: `true`,
      __FEATURE_OPTIONS_API__: `true`,
      __FEATURE_PROD_DEVTOOLS__: `false`
    }
  })
  .then(ctx => ctx.watch())
```

```javascript
// build.js
await execa(
    'rollup',
    [
      '-c',
      '--environment',
      [
        `COMMIT:${commit}`,
        `NODE_ENV:${env}`,
        `TARGET:${target}`,
        formats ? `FORMATS:${formats}` : ``,
        prodOnly ? `PROD_ONLY:true` : ``,
        sourceMap ? `SOURCE_MAP:true` : ``
      ]
        .filter(Boolean)
        .join(',')
    ],
    { stdio: 'inherit' }
)
```

#### esbuild(dev.js)

### 开始打包

至此我们还只是解析出了命令并生成打包配置，真正的打包现在正式开始。我们在scripts/dev.js文件中看到了这样一段代码：

```javascript
entryPoints: [resolve(__dirname, `../packages/${target}/src/index.ts`)]
```

可想而知，这是打包的入口文件。接下来进入该文件目录下查看，







