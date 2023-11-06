---
title: "this指向问题"
description: "call，bind，apply"
---

## this指向

### 下列代码的打印结果是什么？

```js
function fun() {
    console.log('[fun]', this)
    this.num++
}

let num = 10
let user1 = { num: 10, fun }
let user2 = { num: 10, fun }

fun()
let fun1 = fun.bind(user1)
let fun2 = fun1.bind(user2)

fun1()
fun2()

console.log(window.num) // NaN
console.log(user1.num)  // 12
console.log(user2.num)  // 10
```

首先 _let_ 关键字声明的变量只存在于块级作用域中，所以通过 let 声明的 `num` 不能通过 `window.num` 访问，而 `fun()` 执行的时候，this指向的是`window全局对象`，也就是 `window.num === undefined` ，所以 `this.num++` 使得 window.num 变成了 `NaN`。

然后就是通过 _bind改变this指向_ 的问题。`bind` 绑定过一次，第二次 `bind` 会改变this指向吗？

MDN文档中这样解释道：

>  ECMAScript 5 引入了 Function.prototype.bind。调用f.bind(someObject)会创建一个与f具有相同函数体和作用域的函数。但是在这个新函数中，this将永久地被绑定到了bind的第一个参数，无论这个函数是如何被调用的。

至此，答案都出来了。

### 手搓bind - ES6

利用ES6 `new.target` 和 `扩展运算符`。

```js
Function.prototype.myBind = function (thisArgs, ...prefixArgs) {
    const F = this
    let returnFn = function(...callArgs) {
        let args = prefixArgs.concat(callArgs)
        if (new.target) {
            return new F(...args)
        }
        return F.apply(thisArgs, args)
    }
    returnFn.prototype = F.prototype
    return returnFn
}
```

### 手搓bind - ES5

```js
Function.prototype.myBind = function(thisArg) {
    var F = this
    var preArgs = [].slice.call(arguments, 1)
    var returnFn = function() {
        var callArgs = [].slice.call(arguments, 0)
        var args = preArgs.concat(callArgs)
        var context
        if (F.prototype.isPrototypeOf(this)) {
            context = this
        } else {
            context = thisArgs
        }
        return F.apply(context, args)
    }

    returnFn.prototype = F.prototype
    return returnFn
}
```

### 箭头函数中的this

如下代码打印结果：

```js
let obj = {
    name: '11',
    age: 27,
    getName: () => {
        console.log(this.name)
    },
    getAge: function() {
        console.log(this.age)
    }
}
var name = '22'
var age = 72
obj.getName() // 22
obj.getAge() // 27

obj.getName.bind(obj)() // 22
obj.getAge.bind(obj)()  // 27
```

_在箭头函数 getName 中，this 是在函数定义时绑定的，而不是在函数调用时绑定的。_ 因此，bind无法修改箭头函数中的this指向。
