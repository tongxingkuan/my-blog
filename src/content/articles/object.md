---
title: "内置对象"
description: "由内置对象走进对象"
querys: ["object", "对象", "数组", "正则", "可迭代对象"]
---

## 内置对象

在 js 中可谓“万物皆对象”， `面向对象编程`曾风靡一时。本文将走进对象。首先介绍一下[数据类型](/articles/datatype)文章中提到的几个特殊对象。由此展开对象的神秘面。

### 数组

数组表示`有序数据的集合`。

#### 语法

声明方式有：`new Array(length)`以及`let arr = []`，使用`new`关键字是实例化一个对象。

首先要知道`typeof []`的返回是`object`。可见数组实际上也是对象。为什么这么说，请接着往下看。对象一般都有两个通用方法：`valueOf()`和`toString()`，那么我们看下数组是的执行结果。

```js
let a = [1, 2, 3];
a.toString(); // '1,2,3'
a.valueOf(); // [1, 2, 3]

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

要检测某个`构造函数`的`原型prototype`是否在一个对象`实例`的`原型链`上，我们使用`instanceof`。这句话的信息量很大，涉及到有关对象的定义也比较多，[面向对象](/articles/oop)将进行分析。

```js
let a = [1, 2, 3];
a instanceof Object; // true
a instanceof Array; // true
```

为什么都返回 true，原因就是`原型链可以向上查找，最终到Object`。所以可以得到数组的原型链如下：

:c-image-with-thumbnail{alt=数组原型链 src=/img/articles/prototype.png}

由此我们知道数组也是对象，既然是对象，那么就有属性和方法

#### 属性

##### length

设置或返回数组长度

##### prototype

该属性可以访问和修改原型方法

##### constructor

返回构造函数

#### 方法（ES6 新增）

更多方法见 :c-link{name=菜鸟教程-数组 href=https://www.runoob.com/jsref/jsref-obj-array.html target=blank}

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

#### 其它非 es6 方法（部分）

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
- `howmany`, 可选。规定应该删除多少元素。必须是数字，但可以是 "0"。如果未规定此参数，则删除从 index 开始到原数组结尾的所有元素。
- `item1, ..., itemX`, 可选。要添加到数组的新元素
- 返回的是删除的项组成的数组，_该操作影响原数组_

```js
let arr = [1, 2, 3, 4];

// 数组长度增加（itemX 中 X > howmany）
arr.splice(0, 2, 5, 6, 7); // [1, 2]
arr; // [5, 6, 7, 3, 4]

// 数组长度减少（itemX 中 X < howmany）
let arr = [1, 2, 3, 4];
arr.splice(0, 3, 5); // [1, 2, 3]
arr; // [5, 4]

// 数组长度不变（itemX 中 X = howmany）
let arr = [1, 2, 3, 4];
arr.splice(0, 1, 5); // [1]
arr; // [5, 2, 3, 4]
```

##### reduce(fn, initValue)

累积函数

`fn`: 回调函数。由开发者提供 reduce 来回调
`initValue`: 第一次回调 fn 时会将 initValue 传入到 Function 的第一个参数中

其中 `fn(pre, cur, index, arr)` 参数说明如下：

- `pre`：上一次的结果集
- `cur`：当前元素
- `index`：当前元素索引
- `arr`：当前数组

面试题：实现管道函数

```js
function pipe(...fns) {
  return function(input) {
    return fns.reduce((output, fn) => fn(output), input)
  }
}

function addOne(num) {
  return num + 1
}

function addTwo(num) {
  return num + 2
}

function addThree(num) {
  return num + 3
}

let pipeFn = pipe(addOne, addTwo, addThree)

pipeFn(0)  // 6
```

### 正则表达式

#### 语法

`new RegExp(pattern, modifiers)`或者`let reg = /pattern/modifiers`。

既然正则表达式也是一个对象，同样看下其`toString()`和`valueOf()`的返回

```js
let reg = /\w/g;
reg.toString(); // '/\\w/g'，toString()方法返回是转义后的字符串
reg.valueOf(); // /\w/g，valueOf()方法返回的是正则对象本身
```

#### 属性

参考 :c-link{name=菜鸟教程-正则表达式 href=https://www.runoob.com/jsref/jsref-obj-regexp.html target=blank}

#### 方法

##### exec(string)

> 用于检索字符串`string`中的正则表达式的匹配。
> 返回一个数组，其中存放匹配的结果，如果未找到匹配，则返回值为 null。
> 此数组的第 1 个元素是与正则表达式相匹配的文本，第 2 个元素是与 RegExpObject 的第 1 个子表达式相匹配的文本（如果有的话），第 3 个元素是与 RegExpObject 的第 2 个子表达式相匹配的文本（如果有的话），以此类推。子表达式划分可以见下代码：
> ES2018 引入了具名组匹配（Named Capture Groups），允许为每一个组匹配指定一个名字，既便于阅读代码，又便于引用。

> 摘自 :c-link{name=原文链接 href=https://www.cnblogs.com/pzw23/p/13039118.html target=blank}

```js
let reg = /\w/g;
reg.exec("hello world")[0]; // 'h'

let reg = /\w+/g;
reg.exec("hello world")[0]; // 'hello'

let reg = /(((a)b)c)|(ba)/g; // 共有4个子表达式，按顺序分别为：(((a)b)c)、((a)b)、(a)、(ba)
reg.exec("5aabcaba_a4aba_a a_a_abca_a a a_acbbaa b aa"); // 因此该数组第一个元素为'abc'；第二个元素为'abc'；第三个元素为'ab'；第四个元素为'a'；第五个元素为undefined

let reg = /(?<first>(?<second>(?<third>a)b)c)|(?<fourth>ba)/g;
reg.exec("5aabcaba_a4aba_a a_a_abca_a a a_acbbaa b aa"); // 执行结果见下图
```

:c-image-with-thumbnail{alt=exec src=/img/articles/exec.png}

##### test(string)

用于检测一个字符串`string`是否匹配某个模式.
如果字符串中有匹配的值返回 true ，否则返回 false。

```js
// 移动端检测
if (
  /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  )
) {
  console.log("移动");
} else {
  console.log("PC");
}
```

#### 支持正则表达式的 String 对象方法

##### search(reg)

前往站内文章： [字符串 API-search](/articles/datatype#search)

##### match(reg)

前往站内文章： [字符串 API-match](/articles/datatype#match)

##### replace(reg)

前往站内文章： [字符串 API-replace](/articles/datatype#replace)

#### 语法规范

##### 方括号

用于查找某个范围内的字符

```js
/[A-Z]/     // 查找任何从大写A到大写Z的字符。
/[^A-Z]/    // 查找任何非大写A到大写Z的字符。如果是 /^[A-Z]/ 则是匹配以大写A到大写Z开头的字符
```

##### 元字符

参考 :c-link{name=菜鸟教程-正则表达式 href=https://www.runoob.com/jsref/jsref-obj-regexp.html target=blank}

##### 量词

参考 :c-link{name=菜鸟教程-正则表达式 href=https://www.runoob.com/jsref/jsref-obj-regexp.html target=blank}

#### 常用正则表达式

参考 :c-link{name=最全常用正则表达式大全 href=https://blog.csdn.net/ZYC88888/article/details/98479629 target=blank}

### 可迭代对象

#### 定义

> 迭代器接口是我们获取对象迭代器时默认调用的接口，一个实现了迭代接口的对象即是可迭代对象。JS 的默认迭代接口是[Symbol.iterator], 一个对象实现了[Symbol.iterator]接口就成为了可迭代对象。
> [Symbol.iterator]是一个特殊的 Symbol 属性，它用于 JS 内部检测一个对象是否为可迭代对象。接口一词的含义代表它是一个函数，其结果应该返回一个迭代器。结合上面迭代器必须要有 next()操作，所以，对可迭代对象，调用链`iterableObj[Symbol.iterator]().next()`应该是可行的。

> 摘自 :c-link{name=稀土掘金-非羽 href=https://juejin.cn/post/6873457657018728456 target=blank}

```js
let arr = [1, 2, 3];
let arrIterable = arr[Symbol.iterator]();
arrIterable.next(); // {value: 1, done: false}
arrIterable.next(); // {value: 2, done: false}
arrIterable.next(); // {value: 3, done: false}
arrIterable.next(); // {value: undefined, done: true}
arrIterable.toString(); // '[object Array Iterator]'
arrIterable.valueOf(); // Array Iterator {}
typeof arrIterable; // 'object'
arrIterable instanceof Object; // true
```

#### 自定义一个可迭代对象

一个自定义对象应当满足一下几点：

> 1. 实现对象的迭代器接口`[Symbol.iterator]()`，注意它是一个方法，
> 2. 在迭代器接口中返回一个迭代器对象，
> 3. 确保迭代器对象具有 next()接口，并且返回`{value: any, done: boolean}`的结构。

> 摘自 :c-link{name=稀土掘金-非羽 href=https://juejin.cn/post/6873457657018728456 target=blank}

```js
function Range(from, to) {
  this.from = from;
  this.to = to;
}

Range.prototype[Symbol.iterator] = function () {
  return {
    cur: this.from,
    to: this.to,
    next() {
      return this.cur < this.to
        ? {
            value: this.cur++,
            done: false,
          }
        : {
            value: undefined,
            done: true,
          };
    },
  };
};

let range = new Range(0, 5);
// for of 遍历
for (let item of range) {
  console.log(item);
}
// 0
// 1
// 2
// 3
// 4

// 转换为数组（并非所有可迭代对象都可以转换为有元素的数组，也有可能是空数组）
let arr = Array.from(range);
console.log(arr); // [0, 1, 2, 3, 4]
```

##### 使用 Generator 函数作为迭代器接口

因为`Generator`函数产生的 generator 对象是一种特殊的迭代器，所以我们可以将上述方法改写成如下形式：

```js
Range.prototype[Symbol.iterator] = function* () {
  for (let i = this.from; i < this.to; i++) {
    yield i;
  }
};
```

这种写法更加简洁易懂，是最为推荐的写法，**Generator 函数中产生的值就是遍历过程中得到的值。**

##### 迭代器实现

同样通过改写上述代码：

```js
function Range(from, to) {
  this.from = from;
  this.to = to;
}

Range.prototype.next = function () {
  if (this.from < this.to) {
    return {
      value: this.from++,
      done: false,
    };
  } else {
    return {
      value: undefined,
      done: true,
    };
  }
};

Range.prototype[Symbol.iterator] = function () {
  // 返回this是因为自身就是一个可迭代对象
  return this;
};
```

#### 为什么要引入可迭代对象

解决了遍历只能通过数组的方式，提升代码的通用性。

#### 内置可迭代对象

> 1. 非`weak`的数据结构,包括`Array`, `Set`, `Map`。
> 2. DOM 中的 NodeList 对象。
> 3. String 对象。
> 4. 函数的 arguments 属性。

> 摘自 :c-link{name=稀土掘金-非羽 href=https://juejin.cn/post/6873457657018728456 target=blank}

#### 操作可迭代对象

##### for...of

###### for...in和for...of

`for...in`适用于遍历 _对象_ ，而`for...of`适用于遍历 _数组、可迭代对象或者字符串_ ，`forEach`也是遍历数组但是不能通过`break`退出当前循环。

- `for...in`可以遍历原型链上的属性，通常配合`hasOwnProperty`保留自身属性，且遍历顺序可能被打乱。
- `for...of`总是得到对象的 value 或数组、字符串的值，另外还可以用于遍历 Map 和 Set。

##### ...iterable

展开语法和解构赋值

##### Object.fromEntries(iterable)

把键值对列表转换为一个对象，这个方法是和 `Object.entries()` 相对的。

###### 常用场景

- 过滤

```js
let courses = {
  Chinese: 82,
  Math: 96,
  English: 59,
};

// 转换为数组，此处不能用obj.entries()，因为entries是Object的原型方法
let obj2Arr = Object.entries(courses);
// 过滤不及格科目
let failCourse = Object.fromEntries(
  obj2Arr.filter(([course, score]) => score < 60)
);
console.log(failCourse); // {English: 59}
```

- url 参数提取

`URLSearchParams`可以将字符串参数转换为可迭代的参数对象

```js
// let url = "xxx?name=th&age=28&height=1.75"
// queryString 为 window.location.search
const queryString = "?name=th&age=28&height=1.75";
const queryParams = new URLSearchParams(queryString); // 可迭代对象
const paramObj = Object.fromEntries(queryParams);     // {name: 'th', age: '28', height: '1.75'}
```

##### promise.all(iterable)和promise.race(iterable)

`promise.all(iterable)`即等到可迭代对象中每一项均resolve后进入`promise.all(iterable).resolve(result)`，其中`result`是可迭代对象中每一项resolve的`结果`组成的`数组`。只要这些项中有一项reject，就会进入`promise.all(iterable).catch(e)`中，其中`e`是第一被reject的项的`reject(err)`中的err。

### Map

Map 用于保存键值对，其中键可以是任意类型数据，Map 会记住键的原始插入顺序。

`new Map()`用于生成一个 Map 对象，存储映射。

可以通过数组构建 Map

```js
let map = new Map([
  ["a", 1],
  ["b", 2],
  ["c", 3],
]);

typeof map;               // 'object'
map instanceof Map;       // true
map.toString();           // '[object Map]'
map.valueOf();            // Map(3) {'a' => 1, 'b' => 2, 'c' => 3}
Object.fromEntries(map);  // {a: 1, b: 2, c: 3}
Array.from(map);          // [['a': 1], ['b': 2], ['c': 3]]
```

也可以通过`set`方法增加或者修改现有的值，`get`方法获取值。

### Set

Set 是一组唯一值的集合。生成方式：`new Set()`。

```js
let set = new Set(["a", "b", "c"]);

typeof set;               // 'object'
set instanceof Set;       // true
set.toString();           // '[object Set]'
set.valueOf();            // Set(3) {'a', 'b', 'c'}
Object.fromEntries(set);  // set不是可迭代对象
Array.from(set);          // ['a', 'b', 'c']


// 数组去重
let arr = [1, 1, 1, 2, 3, 2, 2, 2, 2, 2, 3, 33, 2]
const newArr = [...new Set(arr)]  //  [1, 2, 3, 33]
```

可以通过`add`、`delete`添加或移除现有的值。

### 函数也是对象

#### 定义

js中规范了`Funtion`实例是`Object`实例的子集。也就是说**函数就是一个对象**。

#### 声明方式

函数声明有三种方式：

- 第一种：函数声明
```js
let f1 = function() {
  console.log('f1')
}
```
- 第二种：函数表达式
```js
function f2() {
  console.log('f2')
}
```
- 第三种：`new Function`
```js
let f3 = new Function('a', 'b', 'return a + b'); 
// new Function('a,b', 'return a + b'); 
// new Function('a , b', 'return a + b');
// 与以上两种声明等价，
```
第三种声明方式存在作用域等问题，一般不用此方式。
```js
let a = 1
function createFn() {
  let a = 2
  let fn1 = new Function('console.log(a)')
  let fn2 = function() {
    console.log(a)
  }
  fn1()  // 打印的是1，访问全局变量
  fn2()  // 打印的是2，访问局部变量
}
createFn()
```

#### 属性和方法

首先，检测一下函数的对象基本属性返回值

```js
function fn() {
  console.log('fn')
}

typeof fn                 // 'function'
fn instanceof Function    // true
fn.toString()             // "function fn() {\n  console.log('fn')\n}"
fn.valueOf()              
/*
ƒ fn() {
  console.log('fn')
}
*/
fn.name                   // 'fn' 函数名
fn.length                 // 0 参数个数
```

除以上这些内置对象以外，还有Date日期对象，Math对象，window对象，location对象等等。在日常编程中经常会用到这些对象，那么对象既然如此常见且功能也如此强大，我们接下来就要自己创建一个对象......[>>面向对象](/articles/oop)
