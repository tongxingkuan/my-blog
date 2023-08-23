---
title: "http"
description: "解读http协议"
querys: ['http', 'HTTP', 'Content-Security-Policy', '状态码', '响应头', '请求头']
---

## HTTP

前端开发本质上是将数据渲染到页面，数据存储在服务端数据库，要获取数据，就要通过网络请求，HTTP（HyperText Transfer Protocol），超文本传输协议，可用于传输HTML文档，图片，查询数据，文件下载等。HTTP 协议以 _明文_ 方式发送内容，不提供任何方式的数据加密，默认端口 **80** 。作为前端开发，理解HTTP建立连接的过程是次要，参考文章 :c-link{name=HTTP与HTTPS的区别 href=https://www.runoob.com/w3cnote/http-vs-https.html target=blank} 。本文主要是弄清HTTP的三要素：**请求头**，**状态码**，**响应头**。


下面列举的是前端开发常遇到的字段，完整参考文章 :c-link{name=前端基础HTTP篇 href=https://blog.csdn.net/by6671715/article/details/127538902 target=blank} 。

### 请求头

:c-image-with-thumbnail{alt=请求头 src=/img/articles/request.png}

#### Accept

可接受的响应内容类型。以axios为例，看下如何设置该值：

```js
import axios from 'axios'

const service = axios.create({
    baseURL: '/',
    withCredentials: true, 
    timeout: 100000
})

// 设置请求拦截器
service.interceptors.request.use(config => {
  config.headers['Accept'] = 'application/json;chartset=UTF-8;text-plain,*/*' // 接收哪些类型的参数，前后台定，可不设置，默认是json
  return config
})
```
#### Content-Type

请求体的 MIME 类型 （用于 _POST_ 和 _PUT_ 请求中）。以下是封装的 _POST_ 方法，设置请求头的 **Content-Type** 值。

```js
import axios from 'axios'

const service = axios.create({
    baseURL: '/',
    withCredentials: true, 
    timeout: 100000
})

const post = (url, data, useFormData = false, responseType = '') => {
  return new Promise(resolve, reject) => {
    let headers = {
      'Content-Type': 'application/json',
    }
    if (useFormData) {
      headers = {
        'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8',
      }
      data = qs.stringify(data)
    }
    service({
      method: 'post',
      url,
      headers,
      data,
      dataType: 'json',
      responseType: responseType
    })
      .then(res => {
        resolve(res)
      })
      .catch(error => {
        reject(error)
      })
  }
}
```

常用Content-Type的取值及对应的资源格式如下：

- `text/html`、`text/plain`、`text/xml` ：超文本标记语言文本 .html、.html；普通文本 .txt；XML 文件 .xml
- `image/gif`、`image/jpeg`、`image/png` ：GIF 图形 .gif；JPEG 图形 .jpeg、.jpg；PNG 图形 .png
- `application/json` ：JSON数据格式
- `application/x-www-form-urlencoded` ：form表单默认的提交数据的格式
- `multipart/form-data` ：表单中进行文件上传时

#### Authorization

标识 HTTP 协议中需要认证资源的认证信息

#### Cookie

携带浏览器本地缓存的cookie信息

#### Referer

告诉服务器请求是从哪个页面链接过来的

#### Cache-Control

指定当前的请求中的资源，是否使用缓存机制，参考文章 [浏览器缓存机制](/articles/cache#cache-control)

#### 控制缓存字段

`If-Modified-Since`、`If-No-Match` 。参考文章 [浏览器缓存机制](/articles/cache#协商缓存)

### 状态码

常用的状态码如下

#### 200 OK

客户端请求成功，此时已经接收到服务端返回的数据。一般用于 _GET_ 与 _POST_ 请求

#### 201 Created

表示请求已经被成功处理，并且创建了新的资源。新的资源在响应返回之前已经被创建。_POST/PUT/PATCH_：用户新建或修改数据成功

#### 204 No Content

服务器成功处理，但未返回内容

#### 301 Moved Permanently

请求的资源已被永久的移动到新 URI，返回信息会包括新的 URI，浏览器会自动定向到新 URI。今后任何新的请求都应使用新的 URI 代替

#### 302 Moved Temporarily

请求的资源已被暂时性转移到新 URI，客户端应继续使用原有 URI

#### 304 Not Modified

所请求的资源未修改，服务器返回此状态码时，不会返回任何资源。客户端通常会缓存访问过的资源，通过提供一个头信息指出客户端希望只返回在指定日期之后修改的资源

#### 307 Temporary Redirect

临时重定向，与 302 类似。使用 _GET_ 请求重定向

#### 400 Bad Request

客户端请求的语法错误，服务器无法理解

#### 401 Unauthorized

请求要求用户的身份认证

#### 403 Forbidden

服务器理解客户端的请求，但是拒绝执行此请求

#### 404 Not Found

服务器无法根据客户端的请求找到资源

#### 500 Internal Server Error

服务器内部错误，无法完成请求

#### 502 Bad Gateway

作为网关或者代理服务器尝试执行请求时，从远程服务器接收到了一个无效的响应，常见于Ngnix

#### 503 Service Unavailable

由于超载或系统维护，服务器暂时的无法处理客户端的请求

#### 504 Gateway Time-out

充当网关或代理的服务器，未及时从远端服务器获取请求

### 响应头

#### Cache-Control

对应请求中的 Cache-Control

#### 控制缓存字段

`Last-Modified`、`Etag` 。参考文章 [浏览器缓存机制](/articles/cache#协商缓存)

#### Content-Security-Policy

引用自 :c-link{name=内容安全策略(CSP) href=https://blog.csdn.net/gtLBTNq9mr3/article/details/126552215 target=blank}

##### 定义

存在于静态资源（图片，js，css，html等文件）的响应头中。

:c-image-with-thumbnail{alt=csp src=/img/articles/csp.png}

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


#### Content-Type

告诉客户端，资源的类型，还有字符编码，通常我们会看到有些网站是乱码的，往往就是服务器端没有返回正确的编码。

#### Expires

告诉客户端在这个时间前，可以直接访问缓存副本，但是因为客户端和服务器的时间不一定会都是相同的，如果时间不同就会导致问题。

#### Access-Control-Allow-Origin

指定哪些网站可以跨域资源共享。

#### Access-Control-Allow-Credentials

是否允许发送 `Cookie` 。默认情况下，Cookie不包括在CORS请求之中。该值为 `true` ，表示服务器明确许可，Cookie 可以包含在请求中，一起发给服务器。如果服务器不要浏览器发送 Cookie ，删除该字段即可。如果 `Access-Control-Allow-Origin` 为 `*` ，当前字段就不能为true。

### HTTP、HTTPS、HTTP 2.0

参考文章 :c-link{href=https%3A%2F%2Fmp.weixin.qq.com%2Fs%3F__biz%3DMzU2MjAzNTQ1Mw%3D%3D%26mid%3D2247485318%26idx%3D1%26sn%3D485203c0357800ef1da363e3fdcf6346%26chksm%3Dfc6ee814cb1961023ddccfc313fecdbe6bdb1bae55517c6f97dcd03c2c1ff242081605f72a82%26scene%3D27 target=blank name=HTTP2的特性解析 isEncode=true}

#### HTTP

`HTTP` 的特点：
- **无连接** （非`KeepAlive`模式）：每次请求都要新建一个连接，请求完成即断开连接，下一次请求再新建连接。
- **串行传输** ：又称 `单通道传输` ，即传输完第一个再传输第二个，以此类推；
- **无状态** ：HTTP 协议自身不对请求和响应之间的通信状态进行保存，任何两次请求之间都没有依赖关系。
- **简单快速** ：HTTP 协议结构较为简单，使得 HTTP 服务器的程序规模小，因此通信速度很快。

#### HTTPS

`HTTP` 和 `HTTPS` 的最大区别是传输的数据是否加密。`HTTPS` 协议是由 `HTTP` 和 `SSL` 协议构建的可进行加密传输和身份认证的网络协议，比 `HTTP` 协议的安全性更高。也正是因为多了加密传输等过程， HTTP 协议在速度上比 HTTPS 快一些。 HTTP 端口号默认 `80` ， HTTPS 端口号默认 `1443`。

#### HTTP2.0

`HTTP2.0` 基于 `HTTPS` ，因此安全性相对较高。

此外，HTTP2.0还有如下特点：
- **二进制分帧** ：采用二进制格式传输数据，二进制协议解析起来更高效。HTTP2.0 将请求和响应数据分割为更小的帧，并且它们采用二进制编码。
- **多路复用** ：同域名下所有通信都在单个连接上完成；单个连接可以承载任意数量的双向数据流；数据流以消息的形式发送，而消息又由一个或多个帧组成，多个帧之间可以乱序发送，然后根据帧首部的流标识重新组装。
:c-image-with-thumbnail{alt=多路复用 src=/img/articles/http2.png}
- **头部压缩**
- **服务端推送** ：服务端能通过 `push` 的方式将客户端需要的内容预先推送过去，主动推送也遵守 `同源策略`。