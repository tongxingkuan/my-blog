import { registerMicroApps } from "qiankun";

export default defineNuxtPlugin((nuxtApp) => {
  registerMicroApps([
    {
      name: "vue-sub-app",
      entry: "//localhost:3001",
      container: "#vueSubApp",
      activeRule: "/vueSubApp",
    },
  ]);
});
