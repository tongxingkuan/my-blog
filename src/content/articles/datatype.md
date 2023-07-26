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
    "数据",
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
          // 函数处理！！
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

接下来将分别介绍这些数据类型，以及我们平时难以区分的一些 api。再者由于 js 是弱类型语言，因此各个数据之前存在`隐式转换`，本文也会介绍各种类型之间转换的规则。

### number

#### 隐式转换

```js
// undefined转换为number：NaN
let a
+a // NaN

// null转换为number：0
+null // 0
-null // -0
+null === -null // true

// boolean转换为number：true - 1 | false - 0
true + 0 // 1
false * 1 // 0

// string转换为number：
// 存在非数字：NaN
+'a111' // NaN
+'123a' // NaN

// object转换为number：
// 整体规则是：调用valueOf或者toString方法，以取得一个非对象的值。如果两个值相加，其中有一个值为string类型，则进行字符串拼接，如果两个值均为数字，则执行加法运算。
[] + {}   // '[object Object]' 首先分析[].valueOf() 返回仍然是 []，所以通过[].toString()，得到空字符串，然后Object.prototype.toString.bind({})得到字符串'[object Object]'，因此结果就是'[object Object]'
{} + []   // 本例中{}被当做是空的代码块block，也即相当于执行了+[]，由于[]转换为空字符串，因此+[]最终结果为 0
// 可以按照上面的例子来分析如下打印结果的原因
{} + 0    // 0
0 + {}    // '0[object Object]'
({} + []) // '[object Object]'
+{}       // NaN

// symbol值转换为number，无论是隐式转换还是显示转换都会报错。
// bigInt转换为number报错
123456789n + 0 // Cannot mix BigInt and other types
```

#### API

##### parseInt

**parseInt(string, radix)**。 `string`必需，要被解析的字符串；`radix`可选，表示要解析的数字的基数。该值介于 2 ~ 36 之间。

- 当参数 radix 的值为 0，或没有设置该参数时，parseInt() 会根据 string 来判断数字的基数。
  - 如果 string 以 `0x` 或者 `0X` 开头，会把 string 的其余部分解析为十六进制的整数。
  - 如果 string 以 `0 ~ 9 的数字` 开头，将把它解析为十进制的整数。
- 如果 string 首位以非数字开头，则把它解析为 `NaN`。
- 开头和结尾的空格是允许的。

##### parseFloat

**parseFloat(string)**。`string`必需，要被解析的字符串。

- 如果字符串的第一个字符不能被转换为数字，那么 parseFloat() 会返回 NaN。
- 开头和结尾的空格是允许的。

##### isNaN

`NaN: Not a Number`，判断一个值能否被 `Number()` 或者 `隐式转换` 合法地转化成数字。

**isNaN(value)**。`value`必须，要检测的值。

### string

#### 隐式转换

```js
// undefined转换为string
let a
a + '' // 'undefined'

// null转换为string
null + '' // 'null'

// boolean转换为string
true + '' // 'true'
false + '' // 'false'

// number转换为string
0 + '' // '0'

// object转换为string
// 调用toString()方法
[] + '' // ''
'' + {} // '[object Object]'
{} + '' // 0

// bigInt转换为string：调用toString()，去掉末尾n
1233455678000000000000000000000000000000000090n + '' // '1233455678000000000000000000000000000000000090'
```

#### API

关于字符串的 API 有很多，大概分为四种

##### 查

###### `charAt`

```js
"hello world".charAt(4); // 'o'
```

###### `charCodeAt`

```js
"hello world".charCodeAt(4); // 111（'o'的 Unicode 编码）
```

###### `indexOf`

```js
"hello world".indexOf("o"); // 4，返回第一个匹配的索引
```

###### `lastIndexOf`

```js
"hello world".lastIndexOf("o"); // 7，从后往前，返回第一个匹配的索引
```

###### `includes`

```js
"hello world".includes("wor", 0); // true，查询是否包含子串，第二个参数指定起始位置，默认从开始查询（区分大小写）
```

###### `match`

查找找到一个或多个正则表达式的匹配。

```js
"hello wOrld".match(/o/ig); // ['o', 'O']，
```

###### `search`

寻找匹配正则表达式的子字符串，找到则返回其索引，否则返回-1

```js
"hello world".search(/orld/); // 7
```

###### `startsWith`

查询是否以指定的子字符串开头，第二个参数指定起始位置，默认从开始查询（区分大小写）

```js
"hello world".startsWith("hello", 0); // true
```

###### `endsWith`

查询是否以指定的子字符串结尾，第二个参数指定字符串长度，默认为原始字符串的长度（区分大小写）

```js
"hello world".endsWith("hello", 5); // false
```

##### 增

###### `repeat`

复制字符串指定次数，并将它们连接在一起返回。

```js
"hello world".repeat(2); // 'hello worldhello world'
```

###### `concat`

字符串拼接，不改变原字符串。

```js
"hello world".concat("test"); // 'hello worldtest'
```

##### 改

###### `replace`

在字符串中查找匹配的子串，并替换与正则表达式匹配的子串。

```js
"hello world".replace(/o/g, 0); // 'hell0 w0rld'
```

##### 截取

###### `slice`

`slice(start, end)` 方法可提取字符串的某个部分，并以新的字符串返回被提取的部分。截取区间[start, end)，如果 start 为负数且没有 end，表示位置从后往前数，截取到末尾，end 为负数时，`-1`指字符串的最后一个字符的位置。_slice 操作不影响原字符串_，因此也常用来复制字符串`slice(0)`。

```js
"hello world".slice(1, 2); // 'e'
"hello world".slice(-2, -1); // 'l'
"hello world".slice(-1); // 'd'
let a = "hello world";
let b = a.slice(0); // 拷贝
```

###### `substr`

`substr(start, length)` 方法可在字符串中抽取从 `start` 下标开始的指定长度的字符。_substr 不影响原字符串_。

```js
"hello world".substr(1, 1); // 'e'
"hello world".substr(-2, 1); // 'l'
```

###### `substring`

`substring(start, end)` 用法同 slice，但是 start，end 均不支持负数。_substring 不影响原字符串_。

###### `split`

`split()` 将字符串拆分成数组

### boolean

#### 隐式转换

布尔值只有两个，`true`和`false`。在我们的代码中经常会出现`if-else`、`while`、`三目运算符`等等分支代码。判断条件被称为 condition，condition 往往都不是简单的 true 和 false，而是我们根据 condition 结果最后隐式转换成 boolean。

```js
// undefined转换为boolean  false
let a;
!!a; // false

// number转换为boolean 0 - false 其他为true
let a = 0;
!!a; // false

// string转换为boolean '' - false 其他为true
let a = "0";
!!a; // true

// null转换为boolean false

// object转换为boolean 任何对象均转换为 true
let a = {};
!!a; // true
```

### object

本博客将专门写一篇文章针对对象进行讲解--[面向对象](/articles/object)

### symbol

表示一个独一无二的值。不参与运算

```js
// 创建方式
let a = Symbol();
console.log(a); // Symbol()
```

### bigInt

`bigInt` 用来表示整数，没有位数的限制，任何位数的整数都可以精确表示。

#### 隐式转换

```js
const a = 1234567890n;
const b = 234567890123456789n;

// bigInt 可以保持精度
a * b; // 289589985171467887501905210n

// 普通整数无法保持精度
Number(a) * Number(b); // 289589985171467900000000000

123n === 123; // false
123n == 123; // true

// bigInt可以用负号（-）不能用正号（+）
// bigInt只能与bigInt进行运算

// bigInt转换为boolean
!!0n; // false
!!1n; // true

// bigInt转换为number
Number(1n); // 1

// bigInt转换为string
String(1n); // '1'
```
