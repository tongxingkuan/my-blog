// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  srcDir: 'src/',
  modules: ['@nuxt/content'],
  content: {
    // markdown: {
    //   anchorLinks: {
    //     depth: 0,
    //     exclude: [1, 2, 3, 4, 5, 6],
    //   }
    // },
    highlight: {
      preload: [
        'javascript',
        'typescript',
        'html',
        'css',
        'less',
        'json',
        'git-commit'
      ]
    }
  },
  css: [
    '@/assets/style/normalize.less',
    'element-plus/dist/index.css',
    '@/assets/style/theme.less',
  ]
})
