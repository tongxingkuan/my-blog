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
        depth: 5,
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
        'tsx'
      ]
    },
  },
  css: [
    '@/assets/style/normalize.less',
    'element-plus/dist/index.css',
    '@/assets/style/theme.less',
    '@/assets/style/animate.less'
  ]
})
