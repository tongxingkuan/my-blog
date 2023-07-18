---
title: '浏览器缓存'
description: '分析cookie、sessionStorage、localStorage的特点，使用场景'
query: 'storage'
---

## cookie、sessionStorage、localStorage的那些事儿

### cookie

#### 什么是cookie

会话存储。由 __服务端__ 写入，大小 __4KB__ ，客户端请求服务器时，即建立了会话，如果服务端需要记录客户端状态，则向客户端浏览器发送一个cookie。

#### cookie内容

cookie三要素：包含属性名key，属性值value，过期时间exp。未设置过期时间，则cookie存储在内存上，关闭浏览器即被清除；设置了cookie过期时间则cookie存储在磁盘上，浏览器关闭也不会消失。

#### 读写操作

```js
// 写
function setCookie(key, value, expdays) {
  let expDate = new Date();
  expDate.setDate(expDate.getDate() + expdays)
  document.cookie = `${key}=${value}${expdays ? ';expires=' + expDate.toGMTString() : ''}`
}
```

```js
// 读
function getCookie(key) {
  let sIndex = document.cookie.indexOf(key + '=')
  let eIndex = document.cookie.indexOf(';', sIndex)
  if (eIndex === -1) {
    eIndex = document.cookie.length
  }
  return document.cookie.substring(sIndex, eIndex)
}
```

#### 使用场景

存储用户基本信息，跟踪用户行为。

#### cookie攻击与防范

常见攻击方式：
1. 通过`document.cookie`直接访问cookie
2. 在客户端和服务端之间截取cookie信息，用以冒充身份操作

防范攻击：
1. 不要在cookie中存储敏感信息
2. cookie中的信息应该加密
3. 使用https协议传输
4. 对从客户端取得的cookie进行严格校验

