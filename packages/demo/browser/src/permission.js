// import router from '@/router'
// const whiteList = []
import store from '@/store'
store.dispatch('getUserInfo')
//

// router.beforeEach((to, from, next) => {
//   // if ('有token') {
//   //   if (to.path === '/login') {
//   //     next('/')
//   //   } else {
//   //     next()
//   //   }
//   // } else {
//   //   if (whiteList.includes(to.path)) {
//   //     next()
//   //   } else {
//   //     next('/login')
//   //   }
//   // }
//   next()
// })
