---
title: "你不知道的link标签用法"
description: "link"
querys: ['link']
---

## 你不知道的link标签用法

摘自 :c-link{name=Link标签的预加载机制 href=https://blog.csdn.net/Mr_linjw/article/details/95459878 target=blank}

link标签接触过前端的同学都已经司空见惯，我们常用 **href** 和 **rel="stylesheet"** 来引入外部样式表，偶尔也会用 **rel="icon"** 来引入网站的icon图标。**type** 用来标识资源的MIME类型。

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
    <!-- stylesheet -->
    <link rel="stylesheet" href="../style.css">
    <!-- type -->
    <link rel="stylesheet" href="../style.css" type="text/css">
    <!-- icon -->
    <link rel="icon" href="../favicon.icon">
</head>
<body>
</body>
</html>
```

接下来介绍几个不常用但却有奇效的link用法。

### Link 标签的预加载机制

#### dns-prefetch

dns-prefetch 型link提前对一个域名做dns查询

```html
<link rel="dns-prefetch" href="//example.com">
```

#### preconnect

preconnect 型link提前对服务器建立tcp连接，一般用于加载网络字体

```html
<link href='https://fonts.demo.com' rel='preconnect' crossorigin>
```

#### prefetch

prefetch 型link提前获取指定url的资源，资源包括图片、脚本或者任何可以被浏览器缓存的资源

```html
<link rel="prefetch" href="image.png">
```

#### preload

preload 型link提前渲染指定url的资源，有些资源是在页面加载完成后即刻需要的，对于这种即刻需要的资源，你可能希望在页面加载的生命周期的早期阶段就开始获取，在浏览器的主渲染机制介入前就进行预加载。这一机制使得资源可以更早的得到加载并可用，且更不易阻塞页面的初步渲染，进而提升性能。

```html
<link rel="preload" href="style.css" as="style">
<link rel="preload" href="main.js" as="script">
```

**preload** 常搭配 **as** 属性使用。

### as属性

**as** 指定预加载的内容的类型，将使得浏览器能够

1. 更精确地优化资源加载优先级
2. 为资源应用正确的内容安全策略
3. 为资源设置正确的 _Accept_ 请求头

可选参数有：

- audio: 音频文件
- document: 一个将要被嵌入到 **&lt;frame&gt;** 或 **&lt;iframe&gt;** 内部的 HTML 文档
- embed: 一个将要被嵌入到 **&lt;embed&gt;** 元素内部的资源
- fetch: 那些将要通过 fetch 和 XHR 请求来获取的资源，比如一个 ArrayBuffer 或 JSON 文件
- font: 字体文件
- image: 图片文件
- object: 一个将会被嵌入到 **&lt;embed&gt;** 元素内的文件
- script: JavaScript 文件
- style: 样式表
- track: WebVTT 文件
- worker: 一个 JavaScript 的 web worker 或 shared worker
- video: 视频文件

### crossorigin

用于指定跨域资源的处理方式。常用的取值有 **anonymous**（允许跨域请求，但不发送凭据）和 **use-credentials**（允许跨域请求，并发送凭据）。