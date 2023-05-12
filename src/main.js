import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
// import './rem';
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
// import axios from '../src/assets/js/http'
import Clipboard from 'v-clipboard'
Vue.use(Clipboard)

import i18n from './i18n/index'

//self components
import myMessage from "./components/myMessage"
Vue.component("my-message", myMessage)

Vue.use(ElementUI)

import globalIP from './assets/js/globalIP'
globalIP.getChainConfig()
globalIP.init()

Vue.config.productionTip = false

new Vue({
  i18n,
  router,
  store,
  // axios,
  render: h => h(App)
}).$mount('#app')