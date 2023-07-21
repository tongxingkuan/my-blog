---
title: "内置对象"
description: "由内置对象走进对象"
querys: ["object", "对象", "数组", "正则", "可迭代对象"]
---

## 内置对象

在 js 中可谓“万物皆对象”， `面向对象编程`曾风靡一时。本文将走进对象。首先介绍一下[数据类型](/articles/datatype)文章中提到的几个特殊对象。由此展开对象的神秘面。

### 数组

数组表示`有序数据的集合`。

首先要知道`typeof []`的返回是`object`。可见数组实际上也是对象。为什么这么说，请接着往下看。对象一般都有两个通用方法：`valueOf()`和`toString()`，那么我们看下数组是的执行结果。

```js
let a = [1, 2, 3];
a.valueOf(); // [1, 2, 3]
a.toString(); // '1,2,3'

// 题目：将一个字符串第一位和最后一位交换并返回新字符串
function reverseBeginEnd(str: String) {
  if (str === "") {
    return "";
  }
  let str2Arr = str.split("");
  let len = str2Arr.length;
  if (len === 1) {
    return str;
  }
  let begin = str2Arr[0];
  let end = str2Arr[len - 1];
  str2Arr[0] = end;
  str2Arr[len - 1] = begin;
  return str2Arr.join("");
}
```

要检测某个`构造函数`的`原型prototype`是否在一个对象`实例`的`原型链`上，我们使用`instanceof`。这句话的信息量很大，涉及到有关对象的定义也比较多，接下来一点一点来分析。

```js
let a = [1, 2, 3];
a instanceof Object; // true
a instanceof Array; // true
```

为什么都返回 true，原因就是`原型链可以向上查找，最终到Object`。所以可以得到数组的原型链如下：

:c-image-with-thumbnail{alt=数组原型链 src=/img/prototype.png}

由此我们知道数组也是对象，既然是对象，那么就有属性和方法

#### 属性

##### length

设置或返回数组长度

##### prototype

该属性可以访问和修改原型方法

##### constructor

返回构造函数

#### 方法（ES6 新增）

更多方法见[菜鸟教程-数组](https://www.runoob.com/jsref/jsref-obj-array.html)

##### copyWithin(target[, start[, end]])

- `target`,必需。粘贴到指定目标位置索引值。
- `start`,可选。复制起始位置索引值。默认数组开始位置。
- `end`,可选。复制结束位置索引值。默认数组结束位置。
- 返回值为结果数组，不改变数组长度，_此方法修改原数组_。

```js
let a = [1, 2, 3, 4, 5, 6, 7];
let b = a.copyWithin(0); // 复制整个数组元素，然后从位置0替换，所以结果数组为[1, 2, 3, 4, 5, 6, 7]。

// 需要注意的是该操作每次都会修改原数组。void 0 表示不传参

let a = [1, 2, 3, 4, 5, 6, 7];
let c = a.copyWithin(0, void 0, 2); // 复制[1, 2]，从位置0替换，所以结果数组为[1, 2, 3, 4, 5, 6, 7]。

let a = [1, 2, 3, 4, 5, 6, 7];
let d = a.copyWithin(0, 1, void 0); // 复制[2, 3, 4, 5, 6, 7]从位置0替换，所以结果数组为[2, 3, 4, 5, 6, 7, 7]

let a = [1, 2, 3, 4, 5, 6, 7];
let e = a.copyWithin(1); // 复制整个数组元素，然后从位置1替换，结果为[1, 1, 2, 3, 4, 5, 6]
```

##### entries()

返回一个数组的[可迭代对象](#可迭代对象)，该对象包含数组的键值对。

```js
let a = [1, 2, 3, 4, 5];
let iterableA = a.entries();
for (let k of iterableA) {
  console.log(k[0] + ": " + k[1]);
}
// 0: 1
// 1: 2
// 2: 3
// 3: 4
// 4: 5
```

##### fill(value[, start[, end]])

- `value`：必须，要填充的值
- `start`：可选，开始填充位置索引值。默认数组开始位置。
- `end`：可选，停止填充位置索引值。默认数组结束位置。
- 返回填充后的数组，_此方法修改原数组_。

使用一个固定值来填充数组。

```js
let a = [1, 2, 3];
let b = a.fill("tonghua");
console.log(a); // ['tonghua', 'tonghua', 'tonghua']
console.log(b); // ['tonghua', 'tonghua', 'tonghua']

let a = [1, 2, 3];
let b = a.fill("tonghua", 1, 2); // [1, 'tonghua', 3]
```

##### find(function(value, index, arr)[, thisValue])

返回符合条件的数组元素值，此方法返回第一个匹配到的元素后结束。

关于可选参数`thisValue`，如果测试函数是用箭头函数书写的，那么可以忽略该值；如果不是箭头函数，那么函数中的`this`值就是`thisValue`。

```js
let a = [1, 2, 3, 4, 5, 6];
let b = a.find((item) => item > 3); // 4

// 利用thisValue
function findItem(list, value) {
  return list.find(function (item) {
    // 虽然thisValue传的是3，但是经验证，实际this是一个new Number(3)创建的实例对象，所以加了一步类型转换
    return Number(item.value) === Number(this);
  }, value);
}
let arr = [{ value: 1 }, { value: 2 }, { value: 3 }];
let item = findItem(arr, 3);
```

##### findIndex(function(value, index, arr)[, thisValue])

返回符合条件的数组元素值的索引，此方法返回第一个匹配到的元素索引后结束。

```js
let a = [1, 2, 3, 4, 5, 6];
let b = a.findIndex((item) => item > 3); // 3
```

##### from(obj[, function[, thisValue]])

用于通过拥有 length 属性的对象或可迭代的对象来返回一个数组。实际场景将获取 DOM List 的伪类转换为真实数组。

```js
let a = [1, 2, 3, 4, 5, 6];
let iterableA = a.entries();
Array.from(iterableA, (item) => {
  return (item[1] += 1);
});
// [2, 3, 4, 5, 6, 7]，将可迭代对象转换成数组，期间对可迭代对象的值每一项执行 +1 操作

let obj = {
  a: 1,
  b: 2,
  length: 2,
};
Array.from(obj); // [undefined, undefined]
```

##### includes(searchElement[, fromIndex])

判断一个数组是否包含一个指定的值

- `searchElement`必须。需要查找的元素值。
- `fromIndex`可选。从该索引处开始查找。

##### keys()

从数组创建一个包含数组键的可迭代对象。

##### of([ele1[, ele2[, ele3, ...]]])

将一组值转换为数组，不考虑参数的数量或类型。

```js
Array.of(); // []
Array.of(1, 2, 3); // [1, 2, 3]
Array.of(undefined); // [undefined]
Array.of([1, 2], [3], 4); // [[1, 2], [3], 4]
```

##### at(index)

在传递非负数时，`at()` 方法等价于`括号表示法[]`。但是，当你需要从数组的末端开始倒数时，因为方括号内的所有值都会被视为字符串属性，因此你最终读取的是 `array['-1']`，这只是一个普通的字符串属性而不是数组索引。 array.at(-1)，当 index < 0 时，该方法将访问索引 index + array.length。

```js
let a = [1, 2, 3];
a[-1]; // undefined
a.at(-1); // 3
a.at(-4); // undefined
```

##### flat(depth)

扁平化嵌套数组

```js
var arr1 = [1, 2, [3, 4]];
arr1.flat();
// [1, 2, 3, 4]

var arr2 = [1, 2, [3, 4, [5, 6]]];
arr2.flat();
// [1, 2, 3, 4, [5, 6]]

var arr3 = [1, 2, [3, 4, [5, 6]]];
arr3.flat(2);
// [1, 2, 3, 4, 5, 6]

// 使用 Infinity，可展开任意深度的嵌套数组
var arr4 = [1, 2, [3, 4, [5, 6, [7, 8, [9, 10]]]]];
arr4.flat(Infinity);
// [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]

// flat() 方法会移除数组中的空项：
var arr5 = [1, 2, , 4, 5];
arr5.flat();
// [1, 2, 4, 5]
```

##### flatMap(callbackFn)

返回一个新的数组，其中每个元素都是回调函数返回的结果，并且结构深度 depth 值为 1。

```js
var arr1 = [1, 2, 3, 4];
arr1.flatMap((x) => [x * 2]); // [2, 4, 6, 8]
arr1.flatMap((x) => [[x * 2]]); // [[2], [4], [6], [8]]
arr1.flatMap((x) => [x, x * 2]); // [1, 2, 2, 4, 3, 6, 4, 8]
```

#### 其它非es6方法（部分）

##### sort()

数组排序，_该操作影响原数组_。不传参数则按照字符串首位顺序排列

```js
let arr = [40, 100, 1, 5, 25, 10];
// 升序a-b
arr.sort((a, b) => {
  return a - b;
});
// 降序b-a
arr.sort((a, b) => {
  return b - a;
});
```

##### splice(index, howmany, item1, ..., itemX)

对数组元素增、删、改：
- `index`, 必需。规定从何处添加/删除元素。
- `howmany`, 	可选。规定应该删除多少元素。必须是数字，但可以是 "0"。如果未规定此参数，则删除从 index 开始到原数组结尾的所有元素。
- `item1, ..., itemX`, 可选。要添加到数组的新元素
- 返回的是删除的项组成的数组，_该操作影响原数组_

```js
let arr = [1, 2, 3, 4]

// 数组长度增加（itemX 中 X > howmany）
arr.splice(0, 2, 5, 6, 7)     // [1, 2]
arr                           // [5, 6, 7, 3, 4]

// 数组长度减少（itemX 中 X < howmany）
let arr = [1, 2, 3, 4]
arr.splice(0, 3, 5)           // [1, 2, 3]
arr                           // [5, 4]

// 数组长度不变（itemX 中 X = howmany）
let arr = [1, 2, 3, 4]
arr.splice(0, 1, 5)           // [1]
arr                           // [5, 2, 3, 4]
```
