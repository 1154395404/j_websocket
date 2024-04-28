// 定义 Interceptor 类型，它包含 resolve 和 optional 的 reject 方法
interface Interceptor<T = any, R = T> {
  resolve: (value: T) => T | Promise<T>
  reject?: (value: R) => R | Promise<R>
}

// 定义 J_InterceptorManager 类，使用泛型以适应不同类型的 interceptor
class J_InterceptorManager<T = any, R = T> {
  private handlers: Array<Interceptor<T, R>>

  constructor() {
    this.handlers = []
  }

  // 使用泛型函数访问泛型接口 Interceptor
  use(
    resolve: (value: T) => T | Promise<T>,
    reject?: (value: R) => R | Promise<R>,
  ): void {
    this.handlers.push({
      resolve,
      reject,
    })
  }

  // 暴露一个方法来获取 interceptors 列表
  getHandlers(): Array<Interceptor<T, R>> {
    return this.handlers
  }
}

export default J_InterceptorManager
