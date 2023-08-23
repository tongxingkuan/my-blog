---
title: "浏览器缓存机制"
description: "强制缓存、协商缓存、理解浏览器的缓存机制减轻网络负载"
querys: ['浏览器缓存', '缓存', '缓存机制','cache','no-cache','cache-control', 'modified', 'modify']
---

## 浏览器缓存机制

浏览器缓存可以优化网络传输和减轻服务器负载，合理使用缓存是[前端页面性能优化](/articles/performance/#从网络请求入手)的有效方法之一。

### 强制缓存

1. 浏览器每次发起请求，都会先去浏览器缓存中查找请求结果和缓存标识
2. 浏览器每次获取请求结果和缓存标识后，都会将其存储到浏览器缓存中

因此有如下过程：在一次请求中，当缓存失效或不满足缓存条件时，浏览器会发送请求到服务器，服务器会返回新的资源，并更新缓存的相关信息，供后续的缓存判断使用。

强制缓存字段位于[响应头](/articles/http/#响应头)，状态码为 **200** 。

#### Expires

_HTTP/1.0_ 使用Expires控制缓存过期时间，但是存在客户端和服务端时间不一致导致缓存异常的情况，_HTTP/1.1_ 采用 **cache-control**。

#### Cache-Control

_Cache-Control_ 优先级高于 _Expires_ 。可能的值有

- _public_ ：允许代理缓存，即如果服务器和浏览器之间存在代理服务器，允许代理服务器缓存结果
- _private_ ：不允许代理缓存
- _no-cache_ ：使用协商缓存，判断资源是否失效
- _no-store_ ：不允许使用缓存
- _max-age_ ：设置资源有效时间，单位为秒

#### pragma

相当于是一种cache-control对http 1.0 的兼容性写法。Pragma: no-cache可以应用到http 1.0 和http 1.1，而Cache-Control: no-cache只能应用于http 1.1。注意 _pragma_ 的可能取值只有`no-cache`和`no-store`。

优先级：_pragma > Cache-Control > Expires_

### 协商缓存

当`Cache-Control: no-cache`时，启用协商缓存。顾名思义，就是通过客户端和服务端协商来判断缓存是否失效。协商缓存判断规则：通过比较请求头字段  _If-Modified-Since_ 和 响应头字段 _Last-Modified_ 或者请求头字段 _If-No-Match_ 和响应头字段  _Etag_ 是否相同，判断请求资源是否有修改。这两者的区别是 _Last-Modified_ 是通过文件修改日期判断，_Etag_ 是基于资源生成一串唯一标识符，两者都是判断文件是否有修改，区别是前者在修改完以后恢复，修改时间同样会更新，继而不会读取浏览器缓存，后者更加精确。协商缓存一旦判断两者相等，即浏览器缓存资源是最新的，此时无需服务端再返回资源，状态码为 [304](/articles/http#_304-not-modified) 。

### 测试

通过测试代码看一下两者的区别的请求过程。首先在 `serve` 目录下新建 `middleware` 文件夹。

```js
// serve/middleware/response.js
export default fromNodeMiddleware((req, res, next) => {
  // 设置强制缓存，缓存资源过期时间为10s
  res.setHeader("Cache-Control", "max-age=10");
  next();
});
```

来看下添加以上代码后，可以通过以下截图看到，在设置`max-age=10`后，强制缓存开启：
1. 在第一次请求后的10秒内，都是`(disk cache)`，即从浏览器缓存中获取资源。
2. 同时也能看到后续的请求耗时都很短，这也体现了利用缓存带来的性能提升。
3. 状态码都是 **200**。

:c-image-with-thumbnail{alt=强制缓存 src=/img/articles/cache1.png}

在勾选了`Disable cache`选项禁用强制缓存后，可以看到请求每次都会从服务端返回。

:c-image-with-thumbnail{alt=禁用强制缓存 src=/img/articles/cache2.png}

接下来改造代码，设置协商缓存，我们可以根据请求路径找到对应的资源文件，它的变更导致缓存资源的更新，现在我们要监听文件的改变。首先配置相关文件：

```ts
// type.d.ts
interface CachedApiConfig {
  url: string,        // 要缓存的接口名
  filePath?: string,  // 缓存接口对应资源路径
  noCache?: boolean,  // 是否设置协商缓存，默认为true
  maxAge?: number     // 如果noCache为false，则maxAge设置强制缓存生效时间
}
```

```js
// cacheApiConfig.js
// 需要缓存的接口
export const cachedApiConfig: CachedApiConfig[] = [
  {
    url: '/api/articles',
    filePath: '/src/server/data/articles.js',
    noCache: true
  },
  {
    url: '/api/demos',
    noCache: false,
    maxAge: 10
  }
]
```

```js
// response.js
import * as fs from "fs";
import * as crytpo from "crypto";
import * as path from "path";
import { cachedApiConfig } from "../data/cacheApiConfig";

export default fromNodeMiddleware((req, res, next) => {
  let idx = cachedApiConfig.findIndex((item) => req.url.indexOf(item.url) > -1);
  if (idx > -1) {
    let config = cachedApiConfig[idx];
    const { filePath, noCache, maxAge } = config;
    if (!noCache && maxAge) {
      // 设置强制缓存
      res.setHeader("Cache-Control", "max-age=" + maxAge);
      next()
    } else if (noCache && filePath) {
      // 设置协商缓存
      // 必须先设置为no-cache，才会启用协商缓存
      res.setHeader("Cache-Control", "no-cache");
      const lastModified = fs.statSync(path.resolve() + filePath).ctime.toGMTString();
      const ifModifiedSince = req.headers['if-modified-since'];
      const ifNoneMatch =  req.headers["if-none-match"];
      fs.readFile(path.resolve() + filePath, function (err, data) {
        if (!err) {
          const etag = crytpo.createHash("md5").update(data).digest("hex");
          // 判断修改时间是否一致
          const isSameCtime = ifModifiedSince === lastModified;
          // 判断文件的MD5是否一致，不一致说明文件内容变更
          const isSameFlag = ifNoneMatch === etag;
          // 两者满足其一则使用浏览器缓存
          // 判断文件是否有改动 ------------Start-------------
          if (isSameCtime || isSameFlag) {
            res.statusCode = 304;
          } else {
            res.setHeader("Last-Modified", lastModified);
            res.setHeader("ETag", etag);
          }
          next()
        }
      });
    }
  } else {
    next();
  }
});
```

阅读response.js中的代码，首先根据接口路径和配置，找到接口对应资源文件，然后获取`LastModified`和`Etag`，分别对比请求头中的`If-Modified-Since`和`If-None-Match`，其中有一对相等则判断文件未改变，设置状态码为 **304** ，否则重新设置`Last-Modified`和`Etag`。

### 总结

一般我们针对 _占用空间大且不轻易变动_ 的数据，采用浏览器缓存机制可以显著提升前端页面性能。但是针对 _频繁变动_ 的数据，经常通过 _添加时间戳_ 的方式，避免缓存。跳转以查看更多[页面性能优化](/articles/performance)。
