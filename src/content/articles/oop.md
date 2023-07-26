---
title: "面向对象"
description: "深入对象"
querys: ["object", "面向对象", "对象", "原型", "数组", "正则"]
---

## 面向对象编程 OOP

### 创建一个自己的对象

我们知道创建对象有两种方式，一种是`对象字面量`，还有一种是通过`new Object`。

先说一下两个方法

- `typeof`

返回一个字符串，表示数据类型，可能的值有`number`、`string`、 `boolean`、`symbol`、`object`、`function`、`undefined`、`bigint`。 _需要注意的是`typeof null`返回的是`object`_。

- `instanceof`

返回一个布尔值，用于检测某个构造函数的`prototype`属性是否在实例的原型链上。 _需要注意的是`instanceof`检测不了原始值_。
例如以下两段代码返回都是`true`。

```js
[] instanceof Array
[] instanceof Object
```

这两个方法可以帮助我们区分`基本数据类型和对象`以及`不同的对象所属的原型链`。

回到创建对象，在 js 中，万物皆对象，可以说对象贯穿你在 js 领域编程的一生。

在本博客中，我要定义`一个人`，`人`有五官、身高、体重等等，这些可以作为属性；`人`也有行为：唱、跳、rap，这些可以作为方法。那么人就可以用对象来表示了，但是考虑以下几点：

- 如果单单是列举`一个人`的所有属性和方法，那么代码显然就已经有很多，此时如果还有`第二个人`、`第三个人`......
- 我们还要考虑同样都是`人`，可以有相同的方法即都可以唱、跳、rap，当然也可能 A 会打篮球，B 不会，属性也同理。为此，我们还要求同存异。
- 为了方便管理，我们还需要`对人进行分类`，比如老师是一类，程序员是一类。

### 引入构造函数

本博文采用对比 es5 和 es6 的写法。

```js
// es5
function Person(name, gender, idNumber) {
  // 记录人的基本属性
  this.name = name;
  this.gender = gender;
  // 后期私有属性
  this._idNumber = idNumber;

  this.obj = {
    a: 1
  }
}

// 鉴权
Person.prototype.validate = (idNumber) => {
  return String(this._idNumber) === String(idNumber)
}

// 吃
Person.prototype.eat = () => {
  console.log('eat')
}
```

```js
// es6
class Person {

  constructor(name, gender, idNumber) {
    // 记录人的基本属性
    this.name = name;
    this.gender = gender;
  // 后期私有属性
    this._idNumber = idNumber;
  }

  // 记录人的基本方法

  // 身份核对
  validate(idNumber) {
    return String(this._idNumber) === String(idNumber);
  }

  // 吃饭
  eat() {
    console.log("eat");
  }
}
```

以上我们构造了一个`关于人的类`，那么要创建各种各样的`人`，我们就要调用构造函数，实例化人这个对象。为此引入`new`操作符。

```js
// 张三 - 人
let zhangsan = new Person("zhangsan", "男", "123XX");
```

至此先分析一波：`new Person`即实例化操作，参数依次对应：`name`、`gender`、`_idNumber`。实例化过程中，`this`指向当前实例对象，并且最终返回实例对象。

### 面向对象三大特性

#### 封装

封装指的是将代码集中管理，能够体现代码的公用性，以上两种构造函数的写法就体现了面向对象的封装性。

#### 继承

考虑到人也分多种职业，例如老师、程序员、农民等等，但是他们又都具有`人构造函数`所定义的这些基本特征，为了体现面向对象的`封装性`，我们要新建`其他类`，并继承自`人类`。

##### 构造函数绑定

- 实现方式：在`Teacher`的构造函数中加一行。

```js
function Teacher(name, gender, idNumber, course) {
  Person.apply(this, arguments) // Person.call(this, name, gender, idNumber)
  // 定义老师特有的属性和方法
  this.course = course
}
// 李四 - 老师
let lisi = new Teacher('lisi', '男', '123X', 'english')
lisi.eat()  // undefined
```

- 缺点：_该方式无法继承Person的原型对象上的属性和方法。_

##### 原型链继承

- 实现方式： 让`Coder`的`prototype`属性指向`Person`的实例

```js
function Coder(language) {
  this.language = language
}
// 原型链继承
Coder.prototype = new Person()
Coder.prototype.constructor = Coder

// 王五 - 程序员
let wangwu = new Coder('javascript')
// 赵六 - 程序员
let zhaoliu = new Coder('c++')
wangwu.name             // undefined
wangwu.eat()            // 'eat'
wangwu.obj.a = 2
zhaoliu.obj.a           // 2
```

- 缺点：_1. 无法向父构造函数传递参数；2. 所有的实例共享原型对象，如果一个实例修改了`原型对象`，其他实例的属性和方法也会受到影响。_

##### 组合继承（伪经典继承）

- 实现方式：就是将上述两种继承方式组合起来

```js
function Combine() {
  Person.apply(this, arguments)
}

Combine.prototype = new Person()
Combine.prototype.constructor = Combine

let combine = new Combine('combine', '女', '123456X')
```

- 缺点：_可以看到`Person`被两次调用。_

##### 寄生式继承

- 实现方式：利用空对象作为中介，解决了两次调用`Person`的问题

```js
if (!Object.create) {
  Object.create = function(proto) {
    var F = function(){}
    F.prototype = proto
    return new F()
  }
}

function Farmer() {}
Farmer.prototype = Object.create(Person.prototype)
Farmer.prototype.constructor = Farmer

let f1 = new Farmer() // 此处无法传参给Person
```

- 缺点：_没有解决构造函数参数传递问题。_

##### 寄生式组合继承（经典继承）

- 实现方式：组合使用经典继承和构造函数继承

```js
if (!Object.create) {
  Object.create = function(proto) {
    var F = function(){}
    F.prototype = proto
    return new F()
  }
}

function Farmer() {
  Person.apply(this, arguments)
}
Farmer.prototype = Object.create(Person.prototype)
Farmer.prototype.constructor = Farmer
let f2 = new Farmer('f2', '男', '222X')
```

#### 多态

维基百科这样解释：多态 (计算机科学)（polymorphism）：为不同资料类型的实体提供统一的界面，或使用一个单一的符号来表示多个不同的类型。

通俗来说就是：不同的数据类型进行同一个操作，表现出不同的行为，就是多态的体现。

在js中，一般是指根据参数的个数、类型等不同，在函数内部判断，进而引导程序走向不同的分支，最终产生不同的结果。

```ts
// TODO 源码demo 解读多态
```

### 关于Object的API

更多API参考 :c-link{name=MDN文档-Object href=https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Object target=blank}

#### defineProperty(obj, prop, descriptor)

`obj`是要定义的对象，`prop`是属性名，`descriptor`是一个对象描述符，如下：

##### `configurable`

默认为`false`，该属性不可配置。当`configurable`为`true`时：可以通过`descriptor`修改其定义，也可以通过点语法或者方括号语法直接修改属性的值，同时该属性支持删除操作。

```js
let obj = {};
// 此种方式定义的属性无法被变更或者删除
Object.defineProperty(obj, 'canEdit', {
  value: false
})
obj.canEdit           // false
delete obj.canEdit
obj                   // {canEdit: false}
obj.canEdit = true
obj                   // {canEdit: false}
```

##### `enumerable`

默认为`false`，定义了该属性是否可以被`for...in`或者`Object.keys()`枚举。

##### `value`

定义属性的值

##### `writable`

默认为false，定义了属性是否可以被重新赋值。

##### `get`

getter函数，该函数的返回值作为属性的值。

```js
let _a = 0
// window.a每访问一次，其值将自增 1
Object.defineProperty(window, 'a', {
  get() {
    return ++_a
  }
})

if (a === 1 && a === 2 && a === 3) {
  console.log('win')  // win
}
```

##### `set`

setter函数，该函数的参数就是被赋予的新值。

```js
let obj = {}
Object.defineProperty(obj, 'a', {
  set (value) {
    console.log('set a to', value)
  }
})
obj.a = 1     // set a to 1
obj.a = 2     // set a to 2
obj.a = 3     // set a to 3
```

_在vue2源码中，就是利用defineProperty来定义 :c-link{name=响应式对象 href=https://ustbhuangyi.github.io/vue-analysis/v2/reactive/reactive-object.html target=blank}，其中 :c-link{name=getter href=https://ustbhuangyi.github.io/vue-analysis/v2/reactive/getters.html target=blank} 被用来做依赖收集， :c-link{name=setter href=https://ustbhuangyi.github.io/vue-analysis/v2/reactive/setters.html target=blank} 被用来做派发更新。_


#### Object.assign(target, ...sources)

该方法将`...sources`（即可以是多个对象源）中的可枚举属性添加到`target`（目标对象）中，可以实现[深拷贝](/articles/datatype#深拷贝)。

#### Object.create(proto)

方法创建一个新对象，使用现有的对象来提供新创建的对象的__proto__。

#### Object.entries(obj) 

将对象转换为数组

#### Object.fromEntries()

把键值对列表转换为对象，_值得注意的是在将对象用Object.entries()转换后，再用Object.fromEntires()转换回来，和原对象用的不是同一个引用地址。_

#### Object.freeze(obj)

冻结对象，被冻结的对象 _不可修改、不可删除、不可添加属性（不可扩展）_，冻结后的原型不可修改。`Object.defineProperty()`同样也不能对冻结后的对象进行操作。

_不论是Object.freeze()、Object.preventExtensions()、Objext.seal()，对对象的操作都是对属性的第一层的操作，即浅冻结。_

```js
function deepFreeze(obj) {
  let keys = Object.getOwnPropertyNames(obj)
  if (keys.length) {
    keys.forEach(key => {
      let value = obj[key]
      if (typeof value === 'object' && value !== null) {
        deepFreeze(value)
      }
    })
  }
  return Object.freeze(obj)
}
```

#### Object.seal(obj)

密封对象，被密封的对象 _支持修改、不可删除、不可扩展_。

#### Object.preventExtensions(obj)

返回的对象 _可修改、可删除、不可扩展。_ `Object.defineProperty()` 也不能给其扩展。

#### Object.getOwnPropertyNames(obj)

返回一个数组，其元素是与给定对象 obj 直接关联的可枚举和不可枚举 _属性_ 对应的字符串。数组中可枚举属性的顺序与使用 for...in 循环（或 Object.keys()）遍历对象属性时所暴露的顺序一致。

#### Object.prototype.hasOwnProperty(key)

返回一个布尔值，指示对象自身属性中是否具有指定的属性`key`。
