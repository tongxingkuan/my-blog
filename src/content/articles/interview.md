---
title: "瀚海拾贝"
description: ""
querys: ['面试题', '面试', '知识点']
---

## 面试题

### Event Loop

事件循环。_js是单线程_，同一时间只能做一件事儿，如果有多个任务要执行，就要排队，排队也有优先级的划分，按照执行顺序依次是 _同步任务 - 异步微任务 - 异步宏任务_ ，在执行完第一梯队优先级的任务后，回过头来处理下一优先级的任务，在执行任务的同时又会有新的任务加入到队列中，将根据优先级放入对应的执行队列，这样循环往复，执行完所有的事件，这就是事件循环。用现实场景来举例的话，就像是去柜台办理业务要取号，客户又分vip和普通客户，vip客户直接进小房间，如果同时有两个vip用户，按照到来的先后顺序接待。参考文章 [promise-事件循环](/articles/promise#事件循环event-loop)

### Generator

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

### Map 和 Object

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

### git merge 和 git rebase

#### 使用场景

`merge` 命令一般用于将开发分支、热修复分支等合并到主分支上，因为该命令`不会修改分支的历史信息`，只会增加新节点，非常适合`主分支`这种`稳定性`且需要用于版本控制的分支上。

`rebase` 命令一般用于将主分支的新提交记录，合并到正在进行开发任务或修复任务的分支上，因为该命令能保证开发分支的历史与主分支的历史保持一致，从而减少污染性。

#### 操作步骤

1. 通过`git stash`，将自己开发分支的代码保存到暂存区中，恢复本地仓库到修改前的状态
2. `git checkout master`进入主分支，`git pull`拉取master的最新commits（提交记录）
3. `git checkout myDev`进入开发分支，通过`git rebase master`将master最新的提交，合并到自己的开发分支上， 保证该分支的历史提交与master相同
4. `git stash pop`将自己的修改取出；git commit、git push提交到远程开发分支上
5. 切换到master分支下，然后发起 `git merge myDev` 请求，将分支myDev合并到master分支

### 寻找数组第K大元素

改造冒泡排序：

```js
function findK(k, arr) {
    if (k >= arr.length) return
    for (let i = 0; i < k; i++) {
        for (let j = 0; j < arr.length - 1 - i; j++) {
            if (arr[j + 1] < arr[j]) {
                let temp = arr[j]
                arr[j] = arr[j + 1]
                arr[j + 1] = temp
            }
        }
        console.log(arr)
    }
    return arr[arr.length - k]
}
```

运行结果如下：

:c-image-with-thumbnail{alt=冒泡排序 src=/img/articles/bubbleSort.png}

改造选择排序：

```js
function findK(k, arr) {
  let len = arr.length
  if (k > len) return
  let temp, maxIndex
  for (let i = 0; i < k; i++) {
    maxIndex = i
    for (let j = i + 1; j < len; j++) {
      if (arr[j] > arr[maxIndex]) {
        maxIndex = j    // 找到最小数的索引
      }
    }
    temp = arr[i]
    arr[i] = arr[maxIndex]
    arr[maxIndex] = temp
    console.log(arr)
  }
  return arr[k - 1]
}
```

运行结果如下：

:c-image-with-thumbnail{alt=选择排序 src=/img/articles/selectionSort.png}

### 对象如何使用for ... of迭代

```js
let obj = {
  a: 1,
  b: 2
}
obj.__proto__[Symbol.iterator] = function* () {
  for (let k in this) {
    if (this.hasOwnProperty(k)) {
      yield [k, this[k]]
    }
  }
}

for (let k of obj) {
  console.log(k)
}
// ['a', 1]
// ['b', 2]
```

### 页面性能测量标准

页面性能的好坏跟用户视觉感受直接相关，分以下三个测量内容：

**LCP**：`largest content paint`，最大内容绘制，最大的元素出现在用户视觉范围，一般是图片，可以从优化手段减少资源体积，预加载，服务端渲染等方面入手

**FID**: `first input delay`，首次输入延迟，指用户首次输入到响应输入的时间，即页面的响应速度，可以从优化js代码等方面入手

**CLS**：`cumulative layout shift`，累积布局偏移，页面可见元素的偏移量，改进方案：每次都为图像、视频元素设置固定宽高，使用transform，而不是改变元素位置实现动画

### 文件断点续传

1. 将文件分片。通过 `File` 对象的 `slice` 方法。
2. 上传文件分片。依次传输每个文件分片，并记录当前传输的文件分片索引和总文件大小。
3. 保存上传进度。每次上传成功后计算并保存进度，可以保存到本地也可以保存到服务端。
4. 续传。读取上传进度，计算下一个文件分片的起始位置，继续上传剩余的文件分片。
5. 合并文件分片。在所有文件分片上传完后，服务端恢复文件完整性。

### CSS长宽比容器代码实现

在CSS中 `padding-top` 或 `padding-bottom` 的百分比值是根据容器的width来计算的。如此一来就很好的实现了容器的长宽比。采用这种方法,需要把容器的height设置为0。而容器内容的所有元素都需要采用 `position:absolute` ,不然子元素内容都将被padding挤出容器。

```css
.aa {
    position: relative;  /*因为容器所有子元素需要绝对定位*/
    height: 0;  /*容器高度是由padding来控制，盒模型原理*/
    width: 100%;
}
.aa[data-ratio="16:9"] {
   padding-top: 56.25%; /* 100%*(9/16)  */
}
.aa[data-ratio="4:3"] {
   padding-top: 75%;
}
```

### onpopstate可以监听到一个pushstate的事件吗

`onpopstate` 事件只能监听到浏览器历史记录的前进和后退操作，无法直接监听到 `pushState` 或 `replaceState` 的调用。

可以在调用 `pushState` 或 `replaceState` 之后手动触发 `popstate` 事件，来模拟类似的效果。

```js
// 监听 popstate 事件
window.addEventListener('popstate', function(event) {
  console.log('popstate event triggered');
});

// 调用 pushState 方法
window.history.pushState(null, null, '/new-url');

// 手动触发 popstate 事件
var popStateEvent = new PopStateEvent('popstate', { state: null });
window.dispatchEvent(popStateEvent);
```

### 手搓redux

```js
function createStore(reducer) {
  let state = {}
  let subscribers = []

  state = reducer({name: '张三', age: 18}) // 初始化状态

  const getState = () => {
    return state
  }

  const dispatch = (action) => {
    state = reducer(state, action)
    subscribers.forEach(subscriber => subscriber())
  }

  const subscribe = (subscriber => subscribers.push(subscriber))

  return {
    getState,
    dispatch,
    subscribe
  }
}

const userReducer = (state, action) => {
  if (!action) return state
  switch (action.type) {
    case 'changeName':
      state.name = action.name
      return state
    case 'changeAge':
      state.age += action.age
      return state
    default:
      return state
  }
}

let userStore = createStore(userReducer)

userStore.subscribe(() => {
  const state = userStore.getState()
  console.log(state)
})

userStore.dispatch({
  type: 'changeName',
  name: '李四'
})

userStore.dispatch({
  type: 'changeAge',
  age: -8
})
```