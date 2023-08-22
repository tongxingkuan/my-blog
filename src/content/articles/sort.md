---
title: "数组排序算法"
description: "数组排序算法"
querys: ['快速排序', '冒泡排序', '选择排序', '希尔排序', '归并排序', '插入排序']
---

## 数组排序算法

### 快速排序

找一个基准数，然后比较数组剩余的元素，小于基准数的放在左边，大于或等于基准数的放在右边，再对左右区间重复以上步骤。

时间复杂度：最好：**O(n * logn)** 最坏：**O(n<sup>2</sup>)**
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
  let minIndex, temp
  for (let i = 0; i < len - 1; i++) {
    minIndex = i
    for (let j = i + 1; j < len; j++) {
      if (arr[j] < arr[minIndex]) {
        minIndex = j // 找到最小元素所在的索引
      }
    }
    temp = arr[i]
    arr[i] = arr[minIndex]
    arr[minIndex] = temp
  }
  return arr
}
```