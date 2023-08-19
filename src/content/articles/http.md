---
title: "http"
description: "解读http协议"
querys: ['http', 'HTTP', 'Content-Security-Policy', '状态码']
---

## HTTP

前端开发一般都是基于B/S（浏览器-服务端）架构，当然也有C/S架构（客户端-服务端）

### 响应头

#### CSP

> 引用自 :c-link{name=内容安全策略(CSP) href=https://blog.csdn.net/gtLBTNq9mr3/article/details/126552215 target=blank}

##### 定义

存在于静态资源（图片，js，css，html等文件）响应头中，

##### 指令策略

CSP 通过指令策略指定白名单，仅执行白名单内的有效域相关脚本，以及加载响应资源。

指令策略是一个字符串，由一系列策略指令所组成，每个策略指令都描述了一个针对某个特定类型资源以及生效范围的策略。

- `script-src`：指定script脚本加载策略

- `style-src`：指定style样式表加载策略

- `img-src`：指定图片资源加载策略

- `default-src`：上述三种资源的统称，可能取值
  1. `http://example.com`：指定域名
  2. `'self'`：指定资源加载限制范围为当前页面所在的域名和端口。
  3. `'unsafe-inline'`：允许使用内联资源，例如内联 `<script>` 元素、内联事件处理器 `onclick` 以及内联 `<style>` 元素。
  4. `'unsafe-eval'`：允许使用 `eval() `。
  5. `'none'`：不允许任何内容。