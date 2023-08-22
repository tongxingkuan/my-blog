---
title: "瀚海拾贝"
description: ""
querys: ['面试题', '面试', '知识点']
---

## 面试题

###### Event Loop

事件循环。_js是单线程_，同一时间只能做一件事儿，如果有多个任务要执行，就要排队，排队也有优先级的划分，按照执行顺序依次是 _同步任务 - 异步微任务 - 异步宏任务_ ，在执行完第一梯队优先级的任务后，回过头来处理下一优先级的任务，在执行任务的同时又会有新的任务加入到队列中，将根据优先级放入对应的执行队列，这样循环往复，执行完所有的事件，这就是事件循环。用现实场景来举例的话，就像是去柜台办理业务要取号，客户又分vip和普通客户，vip客户直接进小房间，如果同时有两个vip用户，按照到来的先后顺序接待。参考文章 [promise-事件循环](/articles/promise#事件循环event-loop)

###### Generator

`ES6` 新增特性函数，可以被暂停和恢复，在调用Generator函数时，不会立即执行，而是返回一个可暂停执行的Generator对象，之后调用该对象的 `.next()` 方法，恢复函数的执行。使得我们能够编写更加灵活和更具表现力的代码。

```js
function* generate1() {
    yield 1;
    yield 2;
    yield 3;
}

let gen = generate1()

console.log(gen.next())    // {value: 1, done: false}
console.log(gen.next())    // {value: 2, done: false}
console.log(gen.next())    // {value: 1, done: false}
console.log(gen.next())    // {value: undefined, done: true}
```

`for await ... of` 循环语句可以遍历 Generator 函数生成的迭代器，从而实现异步迭代。

```js
function* generate2() {
    yield 1;
    yield 2;
    yield 3;
}
async function test() {
    for await (const result of generate2()) {
        console.log(result)
    }
}
test() // 1 2 3
```

###### Map 和 Object

Map的原型链最终指向Object，所以Map本质也是一个对象，但是它和Object也有一些重要的区别：

1. Map的键值可以是函数、对象或其他任意类型的值，而Object的键必须是一个String或者Symbol
2. Map中的键是有序的，因此遍历一个Map对象以插入的顺序返回键值；而Object最好不要依赖属性的顺序
3. Map在频繁增删键值对的场景下表现更好
4. 没有元素的序列化和解析的支持

针对以上第四点，有如下解决方案：

```js
function JsonStringifyForMap(mapData) {
  function replacer(key, value) {
    if (value instanceof Map) {
      return {
        dataType: 'Map',
        value: Array.from(value.entries()) // 或者用 [...value]
      }
    } else {
      return value
    }
  }
  const mapToString = JSON.stringify(mapData, replacer)
  return mapToString;
}
function JsonParseToMap(str) {
  function receiver(key, value) {
    if (typeof value === 'object' && value !== null) {
      if (value.dataType === 'Map') {
        return new Map(value.value)
      } else {
        return value
      }
    } else {
      return value
    }
  }
  const stringToMap = JSON.parse(str, receiver)
  return stringToMap
}
```

