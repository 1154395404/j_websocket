import lazy from '@/directives/lazy'
export default {
  install (app) {
    app.directive('lazy', lazy)
  }
}
