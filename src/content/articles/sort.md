---
title: "数组排序算法"
description: "数组排序算法"
querys: ['快速排序', '冒泡排序', '选择排序', '希尔排序', '归并排序', '插入排序']
---

## 数组排序算法

### 快速排序

找一个基准数，然后比较数组剩余的元素，小于基准数的放在左边，大于或等于基准数的放在右边，再对左右区间重复以上步骤。

时间复杂度：最好情况是 _数组乱序_ ：**O(n * logn)** 最坏情况 _数组正序或倒序_ ：**O(n<sup>2</sup>)**
空间复杂度：**O(logn)**

```js
function quickSort(arr) {
  let len = arr.length
  if (len <= 1) return arr
  let spliceIndex = Math.floor(len / 2) // 位置任意，此处取中间
  let compareItem = arr.splice(spliceIndex, 1)[0]
  let left = []
  let right = []
  for (let i = 0; i < arr.length; i++) {
    if (arr[i] < compareItem) {
      left.push(arr[i])
    } else {
      right.push(arr[i])
    }
  }
  return quickSort(left).concat([compareItem], quickSort(right))
}
```

### 选择排序

时间复杂度：**O(n<sup>2</sup>)**
空间复杂度：**O(1)**

第一步，在未排序序列中找到最小（大）元素，存放到排序序列的起始位置（末尾位置），

第二步，再从剩余未排序元素中继续寻找最小（大）元素，如果是最小，`'push'` 到排序序列，如果是最大，`'pop'` 到排序序列，

重复第二步。

```js
function selectionSort(arr) {
  let len = arr.length
  let temp, minIndex
  for (let i = 0; i < len - 1; i++) {
    minIndex = i
    for (let j = i + 1; j < len; j++) {
      if (arr[j] < arr[minIndex]) {
        minIndex = j    // 找到最小数的索引
      }
    }
    temp = arr[i]
    arr[i] = arr[minIndex]
    arr[minIndex] = temp
  }
  return arr
}
```
### 插入排序

时间复杂度：**O(n<sup>2</sup>)**
空间复杂度：**O(1)**

将第一待排序序列第一个元素看做一个有序序列，把第二个元素到最后一个元素当成是未排序序列。从头到尾依次扫描未排序序列，将扫描到的每个元素插入有序序列的适当位置。（如果待插入的元素与有序序列中的某个元素相等，则将待插入元素插入到相等元素的后面。） _插入排序在处理小数组时比快排更适用。_

```js
function insertionSort(arr) {
  let len = arr.length
  let preIndex, current
  for (let i = 1; i < len; i++) {
    current = arr[i]
    preIndex = i - 1
    while(preIndex >= 0 && arr[preIndex] > current) {
      arr[preIndex + 1] = arr[preIndex]   // 将大于current的数往后移动
      preIndex--                          // 最终得到小于或等于current的元素索引
    }
    arr[preIndex + 1] = current           // 将current放在小于或等于它的数后
  }
  return arr
}
```

### 冒泡排序

时间复杂度：最好 **O(n)**，最坏 **O(n<sup>2</sup>)**
空间复杂度：**O(1)**

相邻元素比较，第一个比第二个大，则交换。具体过程参考如下打印：

```js
function bubbleSort(arr) {
  let len = arr.length
  for (let i = 0; i < len - 1; i++) {       // 外层循环循环到每一个元素，除了最后一个元素
    for (let j = 0; j < len - 1 - i; j++) { // 内层循环将每一轮的最大元素放到最后， len - 1 - i 是因为倒数i个数已经是排序了的
      if (arr[j] > arr[j + 1]) {
        let temp = arr[j]
        arr[j] = arr[j + 1]
        arr[j + 1] = temp
      }
    }
    console.log(`第${i}轮:`, arr)
  }
  return arr
}

bubbleSort([4, 3, 2, 1])
// 第0轮: [3, 2, 1, 4]
// 第1轮: [2, 1, 3, 4]
// 第2轮: [1, 2, 3, 4]
```

### 归并排序

时间复杂度：**O(n * logn)**
空间复杂度：**O(n)**

归并排序是一种经典的排序算法，其基本思想是将原始数组分成若干个子数组，然后逐步合并这些子数组，最终得到有序的结果。
归并排序的步骤如下：
1. 将原始数组不断地二分，直到每个子数组只有一个元素为止。
2. 逐层合并相邻的子数组，直到最终只剩下一个有序数组为止。

```js
function mergeSort(arr) {
  let len = arr.length
  if (len < 2) return arr
  let mid = Math.floor(len / 2)
  let left = arr.slice(0, mid)
  let right = arr.slice(mid)
  return merge(mergeSort(left), mergeSort(right))
}

function merge(left, right) {
  let result = [],
    lLen = left.length,
    rLen = right.length,
    l = 0,
    r = 0
  while(l < lLen && r < rLen) {
    if (left[l] < right[r]) {
      result.push(left[l++])
    } else {
      result.push(right[r++])
    }
  }
  return result.concat(left.slice(l), right.slice(r))
}
```