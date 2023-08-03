import ElementPlus, { ID_INJECTION_KEY } from 'element-plus'
import zhCn from 'element-plus/es/locale/lang/zh-cn'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
export default defineNuxtPlugin(nuxtApp => {
  nuxtApp.vueApp.use(ElementPlus, {
    size: 'small',
    locale: zhCn
  });
  nuxtApp.vueApp.provide(ID_INJECTION_KEY,{
    prefix: Math.floor(Math.random() * 10000),
    current: 0,
  })
  for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
    if (key === 'Link') {
      continue
    }
    nuxtApp.vueApp.component(key, component)
  }
})