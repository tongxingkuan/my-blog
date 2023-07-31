// x了个x游戏配置
interface GameConfig {
  container?: Ref<HTMLElement | undefined>,   // 容器
  layers: number,        // 层数
  types: number,         // 类型数
  trap?: boolean,         // 设置陷阱
  callbacks?: {
    winCallback?: () => void
    failCallback?: () => void
  }
}

// 方块
interface Cube {
  id: string,          // 方块id
  layer: number,      // 层
  type: number,       // 类型
  x: number,          // 水平坐标
  y: number,          // 垂直坐标
  maskCubes: Cube[],  // 遮挡方块
  status: number      // 方块状态
}