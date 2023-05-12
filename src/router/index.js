import Vue from 'vue'
import VueRouter from 'vue-router'
import Login from '../pages/Login.vue'

Vue.use(VueRouter)

const routes = [{
  path: '/',
  name: 'login',
  component: Login
}, {
  path: '/openWallet',
  name: 'openWallet',
  component: () => import('../pages/OpenWallet.vue'),
}, {
  path: '/createWallet',
  name: 'createWallet',
  component: () => import('../pages/CreateWallet.vue'),
}, {
  path: '/homeIndex',
  name: 'homeIndex',
  component: () => import('../pages/Index.vue'),
  redirect: '/home',
  children: [{
    path: '/home',
    name: 'home',
    component: () => import('../pages/Home.vue')
  }, {
    path: '/transfer',
    name: 'transfer',
    component: () => import('../pages/Transfer.vue')
  }, {
    path: '/transfered',
    name: 'transfered',
    component: () => import('../pages/Transfered.vue')
  }, {
    path: '/accountManagement',
    name: 'accountManagement',
    component: () => import('../pages/AccountManage.vue')
  }, {
    path: '/assetManagement',
    name: 'assetManagement',
    component: () => import('../pages/AssetManage.vue')
  }, {
    path: '/addressManagement',
    name: 'addressManagement',
    component: () => import('../pages/AddressManage.vue')
  }, {
    path: '/setting',
    name: 'setting',
    component: () => import('../pages/Setting.vue')
  }]
}]

const router = new VueRouter({
  routes
})

export default router