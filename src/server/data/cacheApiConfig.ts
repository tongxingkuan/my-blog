// 需要缓存的接口
export const cachedApiConfig: CachedApiConfig[] = [
  {
    url: '/api/articles',
    filePath: '/src/server/data/demos.js',
    noCache: true
  },
  {
    url: '/api/demos',
    noCache: false,
    maxAge: 10
  }
]
