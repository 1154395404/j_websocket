type Callback = (...args: any[]) => void

class J_EventBus {
  private callbackId: number
  private eventList: Record<string, Record<string, Callback>>

  constructor() {
    this.callbackId = 0
    this.eventList = {}
  }

  private publishByCallbackMap(
    callbackMap: Record<string, Callback>,
    args: any[],
  ) {
    const callbackList = Object.entries(callbackMap)
    callbackList.forEach(([id, handleFn]) => {
      handleFn(...args)
      if (id.includes('once')) {
        delete callbackMap[id]
      }
    })
  }

  private deleteEventTypeIfEmpty(type: string) {
    if (Object.keys(this.eventList[type]).length === 0) {
      delete this.eventList[type]
    }
  }

  publish(type: string, ...args: any[]) {
    const callbackMap = this.eventList[type]
    if (!callbackMap) {
      console.warn(`${type}事件未被订阅!`)
      return
    }
    this.publishByCallbackMap(callbackMap, args)
    this.deleteEventTypeIfEmpty(type)
  }

  async publishByInterceptor(
    executePromiseChain: (...args: any[]) => Promise<void>,
    type: string,
    ...args: any[]
  ) {
    const callbackMap = this.eventList[type]
    if (!callbackMap) {
      console.warn(`${type}事件未被订阅!`)
      return
    }
    const callbackList = Object.entries(callbackMap)
    for (const [id, handleFn] of callbackList) {
      await executePromiseChain(...args, handleFn)
      if (id.includes('once')) {
        delete callbackMap[id]
      }
    }
    this.deleteEventTypeIfEmpty(type)
  }

  private subscribeValidate(type: any, callback: any): asserts type is string {
    if (typeof type !== 'string') {
      throw new Error('第一个参数类型必须为string')
    }
    if (typeof callback !== 'function') {
      throw new Error('第二个参数必须为一个函数')
    }
  }

  private unSubscribe(type: string, id: string): () => void {
    return () => {
      delete this.eventList[type][id]
      this.deleteEventTypeIfEmpty(type)
    }
  }

  subscribe(type: string, callback: Callback): () => void {
    this.subscribeValidate(type, callback)
    if (!this.eventList[type]) this.eventList[type] = {}
    const id = String(this.callbackId++)
    this.eventList[type][id] = callback
    return this.unSubscribe(type, id)
  }

  subscribeOnce(type: string, callback: Callback): () => void {
    this.subscribeValidate(type, callback)
    if (!this.eventList[type]) this.eventList[type] = {}
    const id = 'once' + this.callbackId++
    this.eventList[type][id] = callback
    return this.unSubscribe(type, id)
  }
}

export default J_EventBus
