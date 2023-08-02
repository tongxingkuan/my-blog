---
title: "x了个x代码解读"
description: "应用nuxt3仿羊了个羊实现x了个x"
querys: ["羊了个羊", "了个", "x"]
---

## X 了个 X 代码解读

### 分析

该游戏实现关键逻辑在于小方块的生成、定位、遮挡、消除。[演示地址](/demos/xlegex)

#### 游戏规则

1. 首先小方块有类型，不同类型对应不同的图标，只有相同类型才能三消
2. 小方块的位置层级随机，且存在遮罩效果，关键就是要实现遮罩效果
3. 会有一个选中槽，用来存放每次点击的小方块，如果槽中有三个相同类型的方块，即消除，槽最多存放七个，一旦达到七个且没有消除，游戏结束
4. 所有方块以及槽中方块消除完毕，游戏结束

#### 模型分析

##### 方块数和层数

方块作为一个对象，有 type 属性区分不同类型的方块，宽高固定且相等，方块个数必须是类型数量的 3 倍，其中类型可以重复

###### 代码实现

```js
let itemLists: number[] = [];
let layerLists: number[][] = []; // 每一层所有的方块数量和方块类型
let typesArr = new Array(types).fill(0).map((_, index) => index + 1);
// 此处约定层数的三倍是类型的组数，即2层时有六组类型，每组类型有三种，所以共生成方块3 * 6 = 18个
for (let i = 0; i < 3 * layers; i++) {
  itemLists = [...itemLists, ...typesArr];
}
// 打乱节点
itemLists = shuffle(shuffle(itemLists));
let len = 0;
let layer = 1;
// 将所有节点分配到每一次
while (len <= itemLen) {
  let maxLayerCount = layer ** 2;
  // 每层放置方块范围：平方的一半到平方
  let layerCount = ceil(random(maxLayerCount / 2, maxLayerCount));
  // splice返回删除的部分，原数组改变
  layerLists.push(itemLists.splice(0, layerCount));
  len += layerCount;
  layer++;
}
```

##### 方块和遮挡

遮罩模型：上层遮挡下层方块，可以理解为上一层的坐标减去当前方块坐标如果小于方块的宽高即为遮罩，遮罩采用 `css`-`绝对定位`-`zIndex`，注意这里的 zIndex 要从大到小，也就是层数从最上层开始，那么对应 css 的 z-index 属性值要反着来。

###### 代码实现

```js
// 每一层（方向从上到下）
//  0 为最顶层
layerLists.forEach((layerItems, index) => {
  let layer = index + 1;
  indexSet.clear();
  let i = 0;
  // 每层方块
  layerItems.forEach((type) => {
    // 位置计算因子
    i = floor(random(0, layer ** 2));
    // 确保同一层位置不会重合
    while (indexSet.has(i)) i = floor(random(0, layer ** 2));
    const row = floor(i / layer);
    const column = layer ? i % layer : 0;
    // 方块类型
    let cube: Cube = {
      id: `${layer}-${type}-${i}`, // id: 层数-类型-索引
      layer, // layer: 层级
      type,
      status: 1, // 初始化方块类型为1
      maskCubes: [],
      x: width + (size * row - (size / 2) * layer),
      y: height + (size * column - (size / 2) * layer),
    };
    let xy = [cube.x, cube.y];
    // 遍历上层方块判断是否遮罩当前方块
    previousCubes.forEach((cb) => {
      if (Math.abs(cb.x - xy[0]) <= size && Math.abs(cb.y - xy[1]) <= size) {
        cube.maskCubes.push(cb);
      }
    });
    indexSet.add(i);
    allCubes.value.push(cube);
    previousCubes.push(cube);
  });
});
```

##### 点击方块

点击方块，首先判断插槽中方块数量，如果等于 7，则不作处理。
如果小于 7，分三种情况：

1. 方块类型 _未出现在插槽中_，将方块放在插槽末尾
2. 插槽中 _存在一个同类型的方块_，则将点击方块紧跟在同类型方块后面
3. 插槽中 _存在两个同类型的方块_，则先将方块紧跟在第二个同类型方块的后面，之后，移除三个方块。并且，要判断插槽中方块个数，如果等于 0 而且 _总方块数`allCubes`_ 也为 0，则关卡通过，进入下一关。

最后都要判断插槽中的方块个数，如果等于 7，则游戏结束。

###### 代码实现

```js
// 点击方块
function clickCube(cube: Cube) {
  if (slots.value.length === 7) return;
  cube.status = 2; // 插槽中方块类型为2
  let allIndex = allCubes.value.findIndex((item) => item.id === cube.id);
  if (allIndex > -1)
    // 删除所有方块中改方块
    allCubes.value.splice(allIndex, 1);
  // 判断插槽是否消除
  // 首先获取插槽中相同类型的方块
  let filterSlotsCubes = slots.value.filter((item) => item.type === cube.type);
  let length = filterSlotsCubes.length;
  if (length === 2) {
    // 有二个相同方块，则消除所有方块
    let secondSlotsIndex = slots.value.findIndex(
      (item) => item.id === filterSlotsCubes[1].id
    );
    // 插入到相同方块后方
    slots.value.splice(secondSlotsIndex + 1, 0, cube);
    setTimeout(() => {
      for (let i = 0; i < 3; i++) {
        slots.value.splice(secondSlotsIndex - 1, 1);
      }
      if (allCubes.value.length === 0 && slots.value.length === 0) {
        callbacks?.winCallback && callbacks?.winCallback();
      }
    }, 100);
  } else {
    // 有一个相同方块，插入到相同方块后方
    let slotsIndex = slots.value.findIndex((item) => item.type === cube.type);
    if (slotsIndex > -1) slots.value.splice(slotsIndex + 1, 0, cube);
    else slots.value.push(cube);
    if (slots.value.length === 7) {
      callbacks?.failCallback && callbacks?.failCallback();
    }
  }
}
```

#### 问题

1. 为什么在方块外部添加 transition 无法实现点击动画
