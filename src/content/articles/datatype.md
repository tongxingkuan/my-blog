---
title: "数据类型"
description: "介绍前端js中的数据类型：包括基本数据类型和引用数据类型"
querys:
  [
    "number",
    "boolean",
    "string",
    "undefined",
    "null",
    "symbol",
    "bigInt",
    "object",
    "array",
    "数据类型",
  ]
---

## 数据类型

### 基本数据类型

基本数据类型又称简单数据类型，`ES6`中，包括：`number`、`string`、`undefined`、`null`、`boolean`、`symbol`、`bigInt`，共七种。

### 引用数据类型

引用数据类型又称复杂数据类型，仅一种为`object`。像`Array数组`、`Date日期`等均属于`object对象`。

### 区别

之所以要区分两种数据类型，是因为两种数据的存储方式不同，且 js 对两种数据的操作处理也不相同。

#### 存储方式

基本数据类型存储在**栈内存**中。引用数据类型存储在**堆内存**中，且**栈内存**存储**所在堆内存的地址**。

#### 拷贝方式

将一个变量通过赋值操作符（`=`）赋值给另一个变量就涉及到了拷贝操作。分为`深拷贝`和`浅拷贝`。

##### 浅拷贝

针对基本数据类型或称简单数据类型的赋值操作，浅拷贝只需要在栈内存中开辟一处内存空间，用于存储拷贝后的数据。
针对引用数据类型或称复杂数据类型的赋值操作，浅拷贝同样需要在栈内存开辟一处内存空间，只不过此时存储的数据是一处`地址`，该地址指向堆内存存放数据的地方。也即引用数据类型浅拷贝以后，会在栈内存上有两处空间存储着相同的一个地址，地址均指向堆内存的同一位置。

##### 深拷贝

通过分析可以知道，浅拷贝存在的问题是，将一个引用类型的变量 A 赋值给另一个变量 B 以后，会出现对 B 的修改同样作用到 A。为了避免，引入深拷贝。

1. **Object.assign(obj1, obj2)**，此方法可以实现深拷贝。

2. 手写深拷贝代码：

```js
// 此方法不能处理循环引用
function deepCopy(source) {
  if (source) {
    let result = Array.isArray(source) ? [] : {};
    for (let k in source) {
      // 过滤原型链属性
      if (source.hasOwnProperty(k)) {
        if (typeof source[k] === "object") {
          // 如果是Date对象
          if (source[k] instanceof Date) {
            result[k] = new Date(source[k].valueOf());
          } else if (source[k] instanceof RegExp) {
            // 正则表达式
            let pattern = source[k].valueOf();
            var flags = "";
            flags += pattern.global ? "g" : "";
            flags += pattern.ignoreCase ? "i" : "";
            flags += pattern.multiline ? "m" : "";
            result[k] = new RegExp(pattern.source, flags);
          } else if (
            Object.prototype.toString.call(source[k]) == "[object Array]" ||
            Object.prototype.toString.call(source[k]) == "[object Object]"
          ) {
            // 普通对象或数组
            result[k] = deepCopy(source[k]);
          } else {
            // Number、Boolean等构造函数生成的对象
            result[k] = source[k].valueOf();
          }
        } else if (typeof source[k] === "function") {
          result[k] = new Function("return " + source[k].toString())();
        } else {
          result[k] = source[k];
        }
      }
    }
    return result;
  }
}
```

3. 其他深拷贝方法还有 **JSON.parse(JSON.stringify())** ，但是它也有局限性：无法处理函数和 undefined、无法处理特殊对象，如 RegExp（正则表达式对象），Date（日期对象）等。

接下来将分别介绍这些数据类型，以及我们平时难以区分的一些api。

### number
