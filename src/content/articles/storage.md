---
title: "浏览器缓存"
description: "分析cookie、sessionStorage、localStorage的特点，使用场景"
querys: ['缓存','cookie','sessionStorage','localStorage']
---

## cookie、sessionStorage、localStorage 的那些事儿

### cookie

#### 定义

会话存储。由 **服务端** 写入，大小 **4KB** ，客户端请求服务器时，即建立了会话，如果服务端需要记录客户端状态，则向客户端浏览器发送一个 cookie。

#### 特点

cookie 三要素：包含`属性名key`，`属性值value`，`过期时间exp`。
未设置过期时间，则 cookie 存储在内存上，关闭浏览器即被清除；设置了 cookie 过期时间则 cookie 存储在磁盘上，浏览器关闭也不会消失。

> - 在浏览器端，发送请求时，将`withCredentials`设置为 false，该属性指示是否在请求中携带身份凭证，包括 cookies 等。
> - 在服务端，响应头中设置`Access-Control-Allow-Credential`为 false，这样即使前端请求携带了 cookie 信息，服务器也不会读取 cookie。
> - 此外，将 cookie 的`SameSite`属性设置为 `Strict` 或 `Lax` ，那么浏览器就会限制cookie在跨域请求中发送的情况

> 版权声明：本文为CSDN博主「暴打沐浴露」的原创文章，遵循CC 4.0 BY-SA版权协议，转载请附上原文出处链接及本声明。 :c-link{name=原文链接 href=https://blog.csdn.net/weixin_48133907/article/details/130259657 target=blank}

#### 读写操作

```js
// 写
function setCookie(key, value, expdays) {
  let expDate = new Date();
  expDate.setDate(expDate.getDate() + expdays);
  document.cookie = `${key}=${value}${
    expdays ? ";expires=" + expDate.toGMTString() : ""
  }`;
}
```

```js
// 读
function getCookie(key) {
  let sIndex = document.cookie.indexOf(key + "=");
  let eIndex = document.cookie.indexOf(";", sIndex);
  if (eIndex === -1) {
    eIndex = document.cookie.length;
  }
  return document.cookie.substring(sIndex, eIndex);
}
```

#### 使用场景

存储用户基本信息，跟踪用户行为，登录验证，身份验证。

#### cookie 攻击与防范

常见攻击方式：

1. 通过`document.cookie`直接访问 cookie
2. 在客户端和服务端之间截取 cookie 信息，用以冒充身份操作

防范攻击：

1. 不要在 cookie 中存储敏感信息
2. cookie 中的信息应该加密
3. 使用 `https` 协议传输
4. 对从客户端取得的 cookie 进行严格校验
5. 一般情况下，设置`SameSite`为`Strict`或者`Lax`阻止跨域

### localStorage

#### 定义

由**前端写入**，大小**5MB**，用于存储`非敏感且不易变动`的数据，减轻服务器压力。

#### 特点

`localStorage`一旦写入，除非手动清除，否则一直存在，浏览器关闭也会存在。不参与服务端通信。遵循`同源策略`，即相同域名下localStorage也相同，即使新打开浏览器窗口，只要未清除缓存，改缓存都不会改变。

#### 读写操作

```js
// 增、改
localStorage.setItem(key, value: String)

// 删
localStorage.removeItem(key)

// 清空
localStorage.clear()

// 查
localStorage.getItem(key)
```

#### 使用场景

存储全国省、市、区等信息

### sessionStorage

#### 定义

由**前端写入**，大小**5M**，会话存储，用于存储刷新页面前的状态，并实现刷新页面后的记忆功能。

#### 特点

遵循`同源同窗口策略`。即只在页面刷新时有效。

#### 读写操作

```js
// 增、改
sessionStorage.setItem(key, value: String)

// 删
sessionStorage.removeItem(key)

// 清空
sessionStorage.clear()

// 查
sessionStorage.getItem(key)
```

#### 使用场景

页面间传递数据，关闭页面即消失

### 浏览器截图

:c-image-with-thumbnail{alt=application src=/img/application.png}

:c-image-with-thumbnail{alt=storage src=/img/storage.png}

### 对比总结

#### 共同点

都是保存在`浏览器端`，且都遵循`同源策略`。

#### 不同点

1. `cookie`可以在请求中携带；而`sessionStorage`和`localStorage`不参与请求
2. `cookie`大小仅`4KB`；而`sessionStorage`和`localStorage`可以达`5M`
3. `cookie`可以设置过期时间，超过该时间即消失；`localStorage`除非手动清除，否则一直存在；`sessionStorage`仅在当前窗口下的同源操作有效，关闭浏览器或者关闭窗口均消失
