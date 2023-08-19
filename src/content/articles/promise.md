---
title: "Promise"
description: "Promise"
querys: ['Promise', 'promise', '同步', '异步']
---

## Promise

Promise是`异步微任务`，解决了异步多层回调嵌套的问题，使代码可读性更高，更容易维护。

### 事件循环（Event Loop）

js中任务分为同步和异步，对于`同步任务`，按照顺序执行；对于`异步任务`，在同步任务执行完后才开始执行，异步任务按照优先级也分`宏任务`和`微任务`。

#### 宏任务

包括`setTimeout`，`setInterval`，`setImmediate`，`I/O`，`postMessage`， `MessageChannel`等，宏任务的本质是参与了`时间循环`（event loop）的异步任务。

#### 微任务

主要有`promise`。

#### 执行顺序

js是`单线程`，执行顺序：先执行同步代码，遇到`异步宏任务`则将异步宏任务放入宏任务队列中，遇到`异步微任务`则将异步微任务放入微任务队列中，当所有同步代码执行完毕后，再将异步微任务从队列中调入主线程执行，微任务执行完毕后再将异步宏任务从队列中调入主线程执行，一直`循环`直至所有任务执行完毕。

```js
setTimeout(function(){
    console.log(1);             // 1. 遇到setTimout，异步宏任务，放入宏任务队列中
});
new Promise(function(resolve){		    
    console.log(2);             // 2. 遇到new Promise，new Promise在实例化的过程中所执行的代码都是同步进行的，所以输出2
    resolve();
}).then(function(){		    
    console.log(3);             // 3. Promise.then，异步微任务，将其放入微任务队列中
}).then(function(){
    console.log(4)              // 3. Promise.then，异步微任务，将其放入微任务队列中
}); 		
console.log(5);                 // 4. 遇到同步任务console.log(5);输出5；主线程中同步任务执行完

// 2 5 3 4 1
```

```js
setTimeout(()=>{
  new Promise(resolve =>{
    resolve();
  }).then(()=>{
    console.log(1);         // 宏任务 - 微任务
  });
  console.log(2);           // 宏任务
});
new Promise(resolve => {
  resolve();
  console.log(3)            // 同步任务
}).then(() => {
  console.log(4);           // 微任务
  Promise.resolve().then(() => {
    console.log(5);         // 微任务
  }).then(() => {
    Promise.resolve().then(() => {
      console.log(6)        // 微任务
    })
  })
})
console.log(7)              // 同步任务

// 3 7 4 5 6 2 1
```

```js
console.log(1)                      // 同步      
setTimeout(function() {
  console.log(2)                    // 宏任务1
  new Promise(function(resolve) {
    console.log(3)                  // 宏任务1 - 同步
    resolve()
  }).then(function() {
    console.log(4)                  // 宏任务1 - 微任务
  })
  setTimeout(() => {
    console.log(5)                  // 宏任务1 - 宏任务
  })
})
 
new Promise(function(resolve) {
  console.log(6)                    // 同步
  resolve()
}).then(function() {
  console.log(7)                    // 微任务
})
 
setTimeout(function() {
  console.log(8)                    // 宏任务2
  new Promise(function(resolve) {
    console.log(9)                  // 宏任务2 - 同步
    resolve()
  }).then(function() {
    console.log(10)                 // 宏任务2 - 微任务
  })
  setTimeout(() => {
    console.log(11)                 // 宏任务2 - 宏任务
  })
})
console.log(12)                     // 同步
// 注意： 宏任务1中的任何任务高于宏任务2中的任何任务而且宏任务1中的宏任务优先级低于宏任务2中的非宏任务
// 1 6 12 7 2 3 4 8 9 10 5 11
```

### 特点

`Promise`是es6提供的一个构造函数，可以使用new操作符进行实例化，其参数是一个函数，该函数有两个参数，`resolve`和`reject`，resolve将Promise的状态由等待变为成功，并将异步操作的结果作为参数传递出去，通过`then`中的回调函数进行接收；`reject`将Promise的状态由等待变为失败，并将异步操作的报错传递，通过`catch`中的回调函数进行接收，用于失败捕获。

1. Promise的三种状态： `resolve又称fulfilled`, `reject`, `pending`。其中pending为初始状态，resolve和reject都是结束状态，表示Promise生命周期结束。
2. 一旦状态改变就无法再变。
3. then和catch最终返回也是一个Promise对象，所以 _Promise支持链式调用。_

### API

#### Promise.all([promise1, promise2, ...])

如果所有的promise均是resolve状态，那么在最后一个promise变为resolve状态之后，打印结果数组
如果有一个promise执行到了reject，那么返回第一个进入reject状态的Promise的执行结果

```js
Promise.all([
  new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve(1)
    }, 1000)
  }),
  new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve(2)
    }, 2000)
  }),
  new Promise((resolve, reject) => {
    setTimeout(() => {
      // resolve(3)
      reject(3)
    }, 3000)
  })
]).then(res => {
  console.log(res)   // 延迟3秒后打印[1, 2, 3]
}).catch(err => {
  console.log(err)   // 延迟3秒后打印3
})
```

#### Promise.any([promise1, promise2, ...])

有一个子实例成功就算成功，全部子实例失败才算失败。

```js
Promise.any([
  new Promise((resolve, reject) => {
    setTimeout(() => {
      reject(1)
    }, 1000)
  }),
  new Promise((resolve, reject) => {
    setTimeout(() => {
      reject(2)
    }, 2000)
  }),
  new Promise((resolve, reject) => {
    setTimeout(() => {
      reject(3)
    }, 3000)
  })
]).then(res => {
  console.log(res)
}).catch(e => {
  console.log(e)    // AggregateError: All promises were rejected
})
```

#### Promise.race([promise1, promise2, ...])

类似赛跑机制，看最先的Promise子实例是成功还是失败。


### await/async

 `await` 只能放在 `async` 声明的异步函数之前，表示等待异步函数执行结果。并不是函数声明前添加`async`关键字的都是异步函数。

看一下下列代码的打印结果

```js
async function async1 () {
  console.log('async1 start')
  await async2()
  console.log('async1 end')
}
async function async2 () {
  console.log('async2')
}
console.log('start')
async1()
console.log('end')
// start
// async1 start 
// async2
// end
// async1 end
```

如果去掉await：

```js
async function async1 () {
  console.log('async1 start')
  async2()
  console.log('async1 end')
}
async function async2 () {
  console.log('async2')
}
console.log('start')
async1()
console.log('end')
// start
// async1 start 
// async2
// async1 end
// end
```

可以理解为`async`有点类似于`new Promise()`，其后的函数内部的代码是同步代码，如果函数内部有`await`，那么 _await之后的代码可以作为Promise.then_。

再看一个例子：

```js
async function getData() {
  return new Promise((resolve, reject) => {
    console.log(1)
    setTimeout(() => {
      console.log(2)
      resolve('data')
    })
  })
}
console.log(3)
const data = await getData()
console.log(4)
// 3 1 2 4
```

`await`解决了异步回调嵌套的问题，提升了代码的可阅读性。

### 面试题

```js
async function async1() {
    console.log('1');       // sync
    await async2();
    console.log('2');       // microTask
}

async function async2() {
    console.log('3');       // sync
}

console.log('4');           // sync
async1();

setTimeout(() => {
    console.log('5');       // macroTask
}, 0)

new Promise((resolve, reject) => {
    console.log('6');       // sync
    resolve();
}).then(() => {
    console.log('7');       // microTask
})

console.log('8');           // sync
```

首先为每一句代码打上注释可以帮助分析，理清顺序。然后按照执行顺序，依次打印： 4 1 3 6 8 2 7 5
