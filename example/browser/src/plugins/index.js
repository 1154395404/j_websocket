import Vue from 'vue'

Vue.use({
  install (Vue) {
    // Vue.prototype.imgUrlPrefix = 'http://127.0.0.1:3000/upload/'
    Vue.prototype.imgUrlPrefix = process.env.VUE_APP_SERVER_URL + '/upload/'
  }
})
