---
title: "x了个x代码解读"
description: "应用nuxt3仿羊了个羊实现x了个x"
querys: ["羊了个羊", "了个", "x"]
---

## X 了个 X 代码解读

### 分析

该游戏实现关键逻辑在于小方块的生成、定位、消除。

#### 规则：

1. 首先小方块有类型，不同类型对应不同的图标，只有相同类型才能三消
2. 小方块的位置层级随机，且存在遮罩效果，关键就是要实现遮罩效果
3. 会有一个选中槽，用来存放每次点击的小方块，如果槽中有三个相同类型的方块，即消除，槽最多存放七个，一旦达到七个且没有消除，游戏结束
4. 所有方块以及槽中方块消除完毕，游戏结束

#### 模型分析：

1. 方块作为一个对象，有 type 属性区分不同类型的方块，宽高固定且相等，方块个数必须是类型数量的 3 倍，其中类型可以重复

```js

```

2. 遮罩模型：上层遮挡下层方块，可以理解为以中心点坐标为中心，向外的 2 个单位长度都是遮挡区域，遮罩采用 css-绝对定位-zIndex

#### 代码实现：

```js
// 方块生成伪代码
forEach floors                                            // 确保唯一性集合
  def Set                                                 // 通过集合确保每层方块位置不会重合
  def prevFloorCubes                                      // 存储上一层方块
  forEach cubes                                           // 每层方块数组
    def i: random(0, floor ** 2)                          // 方块位置计算因子
    while Set.has(i)                                      // i去重，保证每次位置不相同
      define i: random(0, floor ** 2)                     // 方块位置计算因子
    def row: floor(i / floor)                             // [0, floor)
    def column: floor ? i % floor : 0                     // [0, floor]
    def cube: {
      id: `${layer}-${type}-${i}`,                        // id: 层数-类型-索引
      layer,                                              // layer: 层级
      type,                                               // 方块类型
      status: 0,                                          // 方块状态，初始化为0，即可以点击
      maskCubes: [],                                      // 上一层遮挡方块数组
      x: width + (size * row - (size / 2) * layer),       // 坐标
      y: height + (size * column - (size / 2) * layer)    // 坐标
    }
    forEach prevFloorCubes                                // 遍历上层方块，如果坐标减去当前方块坐标小于方块长宽，则判定为遮挡
      if (Math.abs(prevFloorCube.x - cube.x) <= size && Math.abs(prevFloorCube.y - cube.y) <= size) {
        cube.maskCubes.push(prevFloorCube)
      }
    Set.add(i)
```
