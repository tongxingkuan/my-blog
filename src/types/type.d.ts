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

interface CachedApiConfig {
  url: string,        // 要缓存的接口名
  filePath?: string,  // 缓存接口对应资源路径
  noCache?: boolean,  // 是否设置协商缓存，默认为true
  maxAge?: number     // 如果noCache为false，则maxAge设置强制缓存生效时间
}