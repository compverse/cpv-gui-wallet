import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    tronWeb: ""
  },
  mutations: {
    initTronWeb(state, value) {
      if (state.tronWeb == "") {
        state.tronWeb = value;
      }
    }
  },
  actions: {
  },
  modules: {
  }
})

