// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  srcDir: 'src/',
  modules: ['@nuxt/content'],
  content: {
    markdown: {
      toc: {
        depth: 5,
        searchDepth: 5,
      },
      anchorLinks: {
        depth: 6,
        exclude: [1]
      },
    },
    highlight: {
      preload: [
        'javascript',
        'typescript',
        'html',
        'css',
        'less',
        'json',
        'cmd',
        'jsx',
        'tsx',
        '文言'
      ]
    },
  },
  css: [
    '@/assets/style/normalize.less',
    'element-plus/dist/index.css',
    '@/assets/style/theme.less',
    '@/assets/style/animate.less'
  ],
   //跨域处理 https://blog.csdn.net/weixin_42888568/article/details/130533216
   nitro: {
    devProxy: {
      "/apiproxy": {
        target: "",
        changeOrigin: true,
        // prependPath: true,
      },
    },
  },
})
