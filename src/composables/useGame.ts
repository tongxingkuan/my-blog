import { floor, ceil, random, shuffle } from "lodash-es"
const defaultConfig: GameConfig = {
  layers: 2,
  types: 3
}

export function useGame(config: GameConfig) {
  const { container, callbacks, ...initialConfig } = {  ...defaultConfig, ...config }
  const allCubes = ref<Cube[]>([])   // 存放所有的方块
  const slots = ref<Cube[]>([])      // 插槽，存放点击的方块
  const size = 40

  function updateState() {
    allCubes.value.forEach((cube) => {
      cube.status = cube.maskCubes.every(c => c.status > 0) ? 1 : 0
    })
  }
  // 点击方块
  function clickCube(cube: Cube) {
    if (slots.value.length === 7) return
    cube.status = 2
    let allIndex = allCubes.value.findIndex(item => item.id === cube.id);
    if (allIndex > -1)
      // 删除所有节点中改节点
      allCubes.value.splice(allIndex, 1)
    // 判断插槽是否消除
    // 首先获取插槽中相同类型的方块
    let filterSlotsCubes = slots.value.filter(item => item.type === cube.type)
    let length = filterSlotsCubes.length
    if (length === 2) {
      // 有二个相同方块，则消除所有方块
      let secondSlotsIndex = slots.value.findIndex(item => item.id === filterSlotsCubes[1].id)
      // 插入到相同方块后方
      slots.value.splice(secondSlotsIndex + 1, 0, cube)
      setTimeout(() => {
        for (let i = 0; i < 3; i++) {
          slots.value.splice(secondSlotsIndex - 1, 1)
        }
        if (allCubes.value.length === 0 && slots.value.length === 0) {
          callbacks?.winCallback && callbacks?.winCallback()
        }
      }, 100)
    } else {
      // 有一个相同方块，插入到相同方块后方
      let slotsIndex = slots.value.findIndex(item => item.type === cube.type)
      if (slotsIndex > -1)
        slots.value.splice(slotsIndex + 1, 0, cube)
      else
        slots.value.push(cube)
      if (slots.value.length === 7) {
        callbacks?.failCallback && callbacks?.failCallback()
      }
    }
  }

  function initGame(config: GameConfig) {
    let itemLists: number[] = []
    let layerLists: number[][] = []     // 每一层所有的方块数量和方块类型
    let previousCubes: Cube[] = []    // 待检查的方块数组，用于检测方块遮挡
    const indexSet = new Set()
    const { layers, types, trap } = { ...initialConfig, ...config }
    let typesArr = new Array(types).fill(0).map((_, index) => index + 1)
    // 此处约定层数的三倍是类型的组数，即2层时有六组类型，每组类型有三种，所以共生成方块3 * 6 = 18个
    for (let i = 0; i < 3 * layers; i++) {
      itemLists = [...itemLists, ...typesArr]
    }

    // 初始化层级以及层级方块个数
    const itemLen = itemLists.length

    // 设置陷阱
    if (trap && floor(random(0, 10)) > 5) {
      console.log('1')
      itemLists.splice(itemLen - types, itemLen)
    }

    // 打乱节点
    itemLists = shuffle(shuffle(itemLists))
    let len = 0
    let layer = 1
    while (len <= itemLen) {
      let maxLayerCount = layer ** 2
      // 每层放置方块范围：平方的一半到平方
      let layerCount = ceil(random(maxLayerCount / 2, maxLayerCount))
      // splice返回删除的部分，原数组改变
      layerLists.push(itemLists.splice(0, layerCount))
      len += layerCount
      layer++
    }
    
    const containerWidth = container?.value!.clientWidth || 0
    const containerHeight = container?.value!.clientHeight || 0
    const width = containerWidth / 2
    const height = containerHeight / 2
    // 每一层（方向从上到下）
    //  0 为最顶层
    layerLists.forEach((layerItems, index) => {
      let layer = index + 1
      indexSet.clear()
      let i = 0
      // 每一层的节点数组（用于下一次循环判断节点是否被遮挡）
      let perLayerCubes :Cube[] = []
      // 每层节点
      layerItems.forEach((type) => {
        // 位置计算因子
        i = floor(random(0, layer ** 2))
        // 确保同一层位置不会重合
        while (indexSet.has(i))
          i = floor(random(0, layer ** 2))
        const row = floor(i / layer)
        const column = layer ? i % layer : 0
        // 节点类型
        let cube: Cube = {
          id: `${layer}-${type}-${i}`, // id: 层数-类型-索引
          layer,                       // layer: 层级
          type,
          status: 0,
          maskCubes: [],
          x: width + (size * row - (size / 2) * layer),
          y: height + (size * column - (size / 2) * layer)
        }
        let xy = [cube.x, cube.y]
        // 遍历上层节点判断是否遮罩当前节点
        previousCubes.forEach(cb => {
          if (Math.abs(cb.x - xy[0]) <= size && Math.abs(cb.y - xy[1]) <= size) {
            cube.maskCubes.push(cb)
          }
        })
        perLayerCubes.push(cube)
        indexSet.add(i)
      })
      allCubes.value = allCubes.value.concat(perLayerCubes)
      previousCubes = perLayerCubes
    })
    updateState()
  }

  return {
    initGame,
    clickCube,
    allCubes,
    slots,
  }
}