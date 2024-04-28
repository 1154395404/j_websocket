import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import ElementUI from 'element-ui'
import directives from '@/directives'
import 'element-ui/lib/theme-chalk/index.css'
import '@/assets/styles/index.css'
import 'animate.css'
import '@/permission'
import '@/plugins'

Vue.config.productionTip = false
Vue.use(ElementUI)
Vue.use(directives)
new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
