---
title: "diff算法"
description: "对比Vue2、Vue3的diff算法"
querys: ['diff']
---

## diff算法

> 内容转载自 :c-link{name=哈啰技术团队 href=https://segmentfault.com/a/1190000042586883#item-3-3 target=blank}

### Vue2 Diff 算法

Vue2 使用的是`基于递归的双指针 diff 算法`。

#### 基本原理

1. 头与头对比，尾与尾对比，找到未移动的节点
2. 交叉对比，即老节点头与新节点尾对比，老节点尾与新节点头对比，寻找移动后可复用的节点。
3. 创建一个老节点`key`值的哈希表，然后遍历查找新节点，在剩余新老节点中对比寻找可复用的节点。
4. 节点遍历完成后，通过新老索引，进行移除多余老节点或者增加新节点的操作。

```js
let oldStartIdx = 0                 // 老vnode遍历的开始下标
let newStartIdx = 0                 // 新vnode遍历的开始下标
let oldEndIdx = oldCh.length - 1    // 老vnode 列表长度
let oldStartVnode = oldCh[0]        // 老vnode列表第一个子元素
let oldEndVnode = oldCh[oldEndIdx]  // 老vnode列表最后一个子元素
let newEndIdx = newCh.length - 1    // 新vnode列表长度
let newStartVnode = newCh[0]        // 新vnode列表第一个子元素
let newEndVnode = newCh[newEndIdx]  // 新vnode列表最后一个子元素
```

#### 过程详解

第一步对比结果有五种情形及对应的处理：

**a**. 老头节点与新头节点是同一节点，则`pathVnode`直接复用，同时新老节点的开始索引加 1 。

```js
if (sameVnode(oldStartVnode, newStartVnode)) {
  patchVnode(oldStartVnode, newStartVnode, insertedVnodeQueue, newCh, newStartIdx)
  oldStartVnode = oldCh[++oldStartIdx]
  newStartVnode = newCh[++newStartIdx]
}
```

**b**. 老尾节点与新尾节点是同一节点，则`pathVnode`直接复用，同时新老节点的结束索引减 1 。

```js
else if (sameVnode(oldEndVnode, newEndVnode)) {
  patchVnode(oldEndVnode, newEndVnode, insertedVnodeQueue, newCh, newEndIdx)
  oldEndVnode = oldCh[--oldEndIdx]
  newEndVnode = newCh[--newEndIdx]
}
```

**c**. 老头结点与新尾节点是同一节点，说明更新以后老头节点已经跑到老尾节点后面去了，`patchVnode`复用老头节点以后，将生成的真实 DOM 移动到老尾节点对应的真实 DOM 之后，同时老节点开始索引加 1 ，新节点结束索引减 1 。

```js
else if (sameVnode(oldStartVnode, newEndVnode)) {
  patchVnode(oldStartVnode, newEndVnode, insertedVnodeQueue, newCh, newEndIdx)
  canMove && nodeOps.insertBefore(parentElm, oldStartVnode.elm, nodeOps.nextSibling(oldEndVnode.elm))
  oldStartVnode = oldCh[++oldStartIdx]
  newEndVnode = newCh[--newEndIdx]
}
```

**d**. 老尾节点与新头结点是同一节点，说明更新以后老尾节点已经跑到老头节点后面去了，`patchVnode`复用老尾节点以后，将生成的真实 DOM 移动到老头节点对应的真实 DOM 之后，同时老节点结束索引减 1 ，新节点开始索引加 1 。

```js
else if (sameVnode(oldEndVnode, newStartVnode)) {
  patchVnode(oldEndVnode, newStartVnode, insertedVnodeQueue, newCh, newStartIdx);
  canMove && nodeOps.insertBefore(parentElm, oldEndVnode.elm, oldStartVnode.elm);
  oldEndVnode = oldCh[--oldEndIdx];
  newStartVnode = newCh[++newStartIdx];
}
```

**e**. 建立哈希表，通过查找新头结点对应的key，如果找到，则复用，如果没找到，则调用`createElm`新建节点， 无论找到与否，新节点开始索引加 1。

```js
else {
 // 创建一个 { key: oldVnode } 的映射表
 if (isUndef(oldKeyToIdx)) oldKeyToIdx = createKeyToOldIdx(oldCh, oldStartIdx, oldEndIdx)
 // 查找这个表，如果 newStartVnode 中有 key，则直接去映射表中查；否则通过 findIdxInOld 查
  idxInOld = isDef(newStartVnode.key)
   ? oldKeyToIdx[newStartVnode.key]
   : findIdxInOld(newStartVnode, oldCh, oldStartIdx, oldEndIdx)
  if (isUndef(idxInOld)) {
   // 如果没找到，那么新建节点
   createElm(newStartVnode, insertedVnodeQueue, parentElm, oldStartVnode.elm, false, newCh, newStartIdx)
  } else {
    vnodeToMove = oldCh[idxInOld]
    // 相同节点的话
    if (sameVnode(vnodeToMove, newStartVnode)) {
      // 进行patch
      patchVnode(vnodeToMove, newStartVnode, insertedVnodeQueue)
      // 因为该位置对应的节点处理完毕，因此，将该位置设置为 undefined，后续指针遍历进来后可以直接跳过遍历下一个
      oldCh[idxInOld] = undefined
      // 后移动对应的真实DOM
      canMove && nodeOps.insertBefore(parentElm, vnodeToMove.elm, oldStartVnode.elm)
    } else {
      // 不是相同节点的话，那么需要新建节点
      createElm(newStartVnode, insertedVnodeQueue, parentElm, oldStartVnode.elm, false, newCh, newStartIdx)
    }
  }
  newStartVnode = newCh[++newStartIdx]
}
```

**f**. 退出循环，新增或删除节点

```js
// oldStartIdx > oldEndIdx 说明老的 vnode 先遍历完
// 就添加从 newStartIdx 到 newEndIdx 之间的节点
if (oldStartIdx > oldEndIdx) {
  refElm = isUndef(newCh[newEndIdx + 1]) ? null : newCh[newEndIdx + 1].elm
  addVnodes(parentElm, refElm, newCh, newStartIdx, newEndIdx, insertedVnodeQueue)
  // 否则就说明新的 vnode 先遍历完
} else if (newStartIdx > newEndIdx) {
  // 就删除掉老的 vnode 里没有遍历的节点
  removeVnodes(oldCh, oldStartIdx, oldEndIdx)
}
```

配套图如下：

:c-image-with-thumbnail{alt=初始状态 src=/img/articles/vue2-init.png}
:c-image-with-thumbnail{alt=步骤a src=/img/articles/vue2-step1.png}
:c-image-with-thumbnail{alt=步骤b src=/img/articles/vue2-step2.png}
:c-image-with-thumbnail{alt=步骤c src=/img/articles/vue2-step3.png}
:c-image-with-thumbnail{alt=步骤d src=/img/articles/vue2-step4.png}
:c-image-with-thumbnail{alt=步骤e src=/img/articles/vue2-step5.png}
:c-image-with-thumbnail{alt=步骤f src=/img/articles/vue2-step6.png}



### Vue3 Diff 算法

Vue3 使用的是基于`数组的动态规划的 diff 算法`。

#### 基本原理

1. 首先进行新老节点头尾对比，头与头、尾与尾对比，寻找未移动的节点。（与Vue2相同）
2. 然后创建一个新节点在旧节点中的位置的映射表，这个映射表的元素如果不为空，代表可复用。
3. 然后根据这个映射表计算出最长递增子序列，这个序列中的结点代表可以原地复用。之后移动剩下的新结点到正确的位置即递增序列的间隙中。

```js
let i = 0;                // 新老vnode遍历的开始下标
const l2 = c2.length;     // 新vnode的遍历长度
let e1 = c1.length - 1;   // 老vnode的末尾下标
let e2 = l2 - 1;          // 新vnode的末尾下标
```

:c-image-with-thumbnail{alt=初始化 src=/img/articles/vue3-init.png}

#### 过程详解

**a**. 对新老头节点开始进行比较，寻找相同节点，如果有，则 `patch` 复用节点。新老头节点向后移动。

```js
while (i <= e1 && i <= e2) {
  const prevChild = c1[i];
  const nextChild = c2[i];
  // 如果不是相同节点，遍历终止
  if (!isSameVNodeType(prevChild, nextChild)) {
    break;
  }
  // 是相同节点，继续往后遍历，新老节点末尾索引加一
  patch(prevChild, nextChild, container, parentAnchor, parentComponent);
  i++;
}
```

:c-image-with-thumbnail{alt=步骤a src=/img/articles/vue3-stepa.png}

**b**. 对新老尾节点开始进行比较，寻找相同节点，如果有，则 `patch` 复用节点。新老尾节点向前移动。

```js
while (i <= e1 && i <= e2) {
  // 从右向左取值
  const prevChild = c1[e1];
  const nextChild = c2[e2];
  // 如果不是相同节点，遍历终止
  if (!isSameVNodeType(prevChild, nextChild)) {
    break;
  }
  // 是相同节点，继续往后遍历，新老节点末尾索引减一
  patch(prevChild, nextChild, container, parentAnchor, parentComponent);
  e1--;
  e2--;
}
```

:c-image-with-thumbnail{alt=步骤b src=/img/articles/vue3-stepb.png}

**c**. 遍历完新老头尾节点后存在两种特殊情况：

  1. 老节点先遍历完，新节点还剩余：创建剩余新节点。
  
```js
if (i > e1 && i <= e2) {
  // 如果是这种情况的话就说明 e2 也就是新节点的数量大于旧节点的数量
  // 也就是说新增了 vnode
  // 应该循环 c2
  // 锚点的计算：新的节点有可能需要添加到尾部，也可能添加到头部，所以需要指定添加的问题
  // 要添加的位置是当前的位置(e2 开始)+1
  // 因为对于往左侧添加的话，应该获取到 c2 的第一个元素
  // 所以我们需要从 e2 + 1 取到锚点的位置
  const nextPos = e2 + 1;
  const anchor = nextPos < l2 ? c2[nextPos].el : parentAnchor;
  while (i <= e2) {
    patch(null, c2[i], container, anchor, parentComponent);
    i++;
  }
}
```

  2. 新节点先遍历完，老节点还剩余：删除剩余旧节点。

```js
else if (i > e2 && i <= e1) {
  // 这种情况的话说明新节点的数量是小于旧节点的数量的
  // 那么我们就需要把多余的删除
  while (i <= e1) {
    hostRemove(c1[i].el);
    i++;
  }
}
```

  3. 新老节点都有剩余

3-1. 在新老剩余节点中寻找可复用节点。创建新节点剩余节点对应的映射表 `keyToNewIndexMap` 。

```js
let s1 = i; // 2
let s2 = i; // 2
const keyToNewIndexMap = new Map(); // 新节点剩余节点映射哈希表
let moved = false; // 移动标识
let maxNewIndexSoFar = 0; // 判断是否需要移动
// 先把 key 和 newIndex 绑定好，方便后续基于 key 找到 newIndex
// 时间复杂度是 O(1)
for (let i = s2; i <= e2; i++) { // i= 2 ~ 6
  const nextChild = c2[i];
  keyToNewIndexMap.set(nextChild.key, i);
}
```

:c-image-with-thumbnail{alt=步骤c-3-1 src=/img/articles/vue3-stepc-3-1.png}

3-2. 再创建一个 `newIndexToOldIndexMap` 数组，用来存储新节点数组中的剩余节点在旧节点数组上的索引，后面将使用它计算出一个最长递增子序列，并初始化数组为0。

```js
// 需要处理新节点的数量
const toBePatched = e2 - s2 + 1; // 6 - 2 + 1 = 5
let patched = 0; // 记录新老节点都有的数量
// 初始化 从新的index映射为老的index
// 创建数组的时候给定数组的长度，这个是性能最快的写法
const newIndexToOldIndexMap = new Array(toBePatched);
// 初始化为 0 , 后面处理的时候 如果发现是 0 的话，那么就说明新值在老的里面不存在
for (let i = 0; i < toBePatched; i++) newIndexToOldIndexMap[i] = 0;
```

:c-image-with-thumbnail{alt=步骤c-3-2 src=/img/articles/vue3-stepc-3-2.png}

3-3. 遍历老节点，存储新节点数组中的剩余节点在旧节点数组上的索引。

```js
// 遍历老节点
// 1. 需要找出老节点有，而新节点没有的 -> 需要把这个节点删除掉
// 2. 新老节点都有的，—> 需要 patch
// 老节点 => [c,d,e,f]
// 新节点剩余索引 keyToNewIndexMap = { f: 2, c: 3, d: 4, e: 5, h: 6 }
for (i = s1; i <= e1; i++) {
  const prevChild = c1[i];
  // 如果新老节点都有的数量大于新节点的数量的话，那么这里在处理老节点的时候就直接删除即可
  if (patched >= toBePatched) {
    hostRemove(prevChild.el);
    continue;
  }
  let newIndex; // 老节点在新节点的索引
  if (prevChild.key != null) {
  // 这里就可以通过key快速的查找了， 看看在新的里面这个节点存在不存在
  // 时间复杂度O(1)
    newIndex = keyToNewIndexMap.get(prevChild.key);
  } else {
    // 如果没key 的话，那么只能是遍历所有的新节点来确定当前节点存在不存在了
    // 时间复杂度O(n)
    for (let j = s2; j <= e2; j++) {
      if (isSameVNodeType(prevChild, c2[j])) {
        newIndex = j;
        break;
      }
    }
  }
  // 因为有可能 nextIndex 的值为0（0也是正常值）
  // 所以需要通过值是不是 undefined 或者 null 来判断
  if (newIndex === undefined) {
    // 当前节点的key 不存在于 newChildren 中，需要把当前节点给删除掉
    hostRemove(prevChild.el);
  } else {
    // 老节点 => [c,d,e,f]
    // 新节点剩余索引 keyToNewIndexMap = { f: 2, c: 3, d: 4, e: 5, h: 6 }
    // 老节点在新节点中的索引newIndex: [3,4,5,2]
    // i + 1 是因为 i 有可能是0 (0 的话会被认为新节点在老的节点中不存在)
    newIndexToOldIndexMap[newIndex - s2] = i + 1;
    // newIndexToOldIndexMap = [6, 3, 4, 5, 0]
    // 来确定中间的节点是不是需要移动
    // 新的 newIndex 如果一直是升序的话，那么就说明没有移动
    // 所以我们可以记录最后一个节点在新的里面的索引，然后看看是不是升序
    // 不是升序的话，我们就可以确定节点移动过了
    if (newIndex >= maxNewIndexSoFar) {
      maxNewIndexSoFar = newIndex;
    } else {
      moved = true;
    }
    patch(prevChild, c2[newIndex], container, null, parentComponent); // 继续递归diff
    patched++; // 记录新老节点都有的数量
  }
}
```

:c-image-with-thumbnail{alt=步骤c-3-3 src=/img/articles/vue3-stepc-3-3.png}


3-4. 计算newIndexToOldIndexMap数组，得到最长增长子序列。

```js
// 利用最长递增子序列来优化移动逻辑
// 因为元素是升序的话，那么这些元素就是不需要移动的
// 而我们就可以通过最长递增子序列来获取到升序的列表
// 在移动的时候我们去对比这个列表，如果对比上的话，就说明当前元素不需要移动
// 通过 moved 来进行优化，如果没有移动过的话 那么就不需要执行算法
// getSequence 返回的是 newIndexToOldIndexMap 的索引值
// 所以后面我们可以直接遍历索引值来处理，也就是直接使用 toBePatched 即可
const increasingNewIndexSequence = moved
  ? getSequence(newIndexToOldIndexMap)
  : [];
// increasingNewIndexSequence = [1,2,3]
/*
最长增长子序列方法
贪心加二分获取最长序列
根据前驱序列得到正确索引序列
*/
function getSequence(arr) {
  const preIndex = new Array(arr.length), indexResult = [0];
  let resultLastIndex, left, right, mid;
  const len = arr.length;
  for (let i = 0; i < len; i++) {
    const arrI = arr[i];
    if (arrI !== 0) {
      resultLastIndex = indexResult[indexResult.length - 1];
      // 当前项大于最后一项，直接加入结果res
      if (arr[resultLastIndex] < arrI) {
        preIndex[i] = resultLastIndex;
        indexResult.push(i);
        continue;
      }
      // 当前项小于最后一项，二分查找+替换，找到并替换比当前项大的那项
      left = 0, right = indexResult.length - 1;
      while (left < right) { // 重合就说明找到了 对应的值,时间复杂度O(logn)
        mid = (left + right) >> 1;
        // mid的值比当前项小，所以不包括mid的值
        if (arr[indexResult[mid]] < arrI) {
          left = mid + 1;
        } else {
          right = mid;
        }
      }
      // 只替换比当前项大的那一项，如果相同、比当前项的还小就不换了
      if (arrI < arr[indexResult[left]]) {
        if (left > 0) {
          preIndex[i] = indexResult[left - 1];
        }
        indexResult[left] = i;
      }
    }
  }
  // 利用前驱节点重新计算result
  let length = indexResult.length; //总长度
  let prev = indexResult[length - 1]; // 最后一项
  while (length-- > 0) { // 根据前驱节点一个个向前查找
    indexResult[length] = prev;
    prev = preIndex[prev];
  }
  return indexResult;
}
```

:c-image-with-thumbnail{alt=步骤c-3-4 src=/img/articles/vue3-stepc-3-4.png}

3-5. 遍历新节点，根据最长增长子序列进行移动、添加、删除节点。

- 第一个节点为h，在newIndexToOldIndexMap中值为0，说明是新增的节点，创建

- 第二个节点为e，索引为3，与最长增长子序列中3命中，跳过

- 第三个节点为d，索引为2，与最长增长子序列中2命中，跳过

- 第四个节点为c，索引为1，与最长增长子序列中1命中，跳过

- 第五个节点为f，索引为0，均不符合，进行hostInsert，将节点f的真实dom移动到节点nextChild节点c的前面

- 遍历结束完成

```js
let j = increasingNewIndexSequence.length - 1; // 2
// 遍历新节点，用toBePatched，是之前记录的新节点个数
// 1. 需要找出老节点没有，而新节点有的(如节点h) -> 需要把这个节点创建
// 2. 最后需要移动一下位置，比如 [c,d,e,f] -> [f,c,d,e]
// 这里倒循环是因为在 insert 的时候，需要保证锚点是处理完的节点（也就是已经确定位置了）
// 因为 insert 逻辑是使用的 insertBefore()
// [ 0:a, 1:b, 2:f, 3:c, 4:d, 5:e, 6:h, 7:g ], s2 = 2
for (let i = toBePatched - 1; i >= 0; i--) { // 4, 3, 2, 1, 0与increasingNewIndexSequence下标相同
  // 确定当前要处理的节点索引，拿到正确的下标
  const nextIndex = s2 + i; // 6 -> 'h'
  const nextChild = c2[nextIndex]; // 'h'节点
  // 锚点等于当前节点索引+1
  // 也就是当前节点的后面一个节点(又因为是倒遍历，所以锚点是位置确定的节点)
  const anchor = nextIndex + 1 < l2 ? c2[nextIndex + 1].el : parentAnchor;
  // newIndexToOldIndexMap = [6, 3, 4, 5, 0]
  if (newIndexToOldIndexMap[i] === 0) {
    // 说明新节点在老的里面不存在，需要创建
    patch(null, nextChild, container, anchor, parentComponent);
  } else if (moved) {
    // 需要移动
    // 1. j 已经没有了 说明剩下的都需要移动了
    // 2. 最长子序列里面的值和当前的值匹配不上， 说明当前元素需要移动
    if (j < 0 || increasingNewIndexSequence[j] !== i) {
      // 移动的话使用 insert 即可
      hostInsert(nextChild.el, container, anchor);
    } else {
      // 这里就是命中了 index 和 最长递增子序列的值
      // 所以可以移动指针了
      j--;
    }
  }
}
```

### Diff 算法对比


相同点：

每次比较的都是同一层下的虚拟DOM节点。

不同点：

1. Vue3 的 diff 算法会跳过静态子树的比较，只对动态节点进行更新。这减少了不必要的比较操作，提高了性能。 
2. Vue2 是通过对旧节点列表建立一个 { key, oldVnode }的映射表，然后遍历新节点列表的剩余节点，根据newVnode.key在旧映射表中寻找可复用的节点，然后打补丁并且移动到正确的位置。Vue3 则是建立一个存储新节点数组中的剩余节点在旧节点数组上的索引的映射关系数组，建立完成这个数组后也即找到了可复用的节点，然后通过这个数组计算得到 `最长递增子序列` ，这个序列中的节点保持不动，然后将新节点数组中的剩余节点移动到正确的位置。