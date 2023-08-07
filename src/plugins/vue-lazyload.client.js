import VueLazyLoad from 'vue-lazyload'

export default defineNuxtPlugin(nuxtApp => {
  nuxtApp.vueApp.use(VueLazyLoad, {
    observer: true,
  });
})