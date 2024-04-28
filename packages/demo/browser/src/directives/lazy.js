// import defalut from '@/assets/images/200.png'
export default {
  inserted (el, binding) {
    const intersectionObserver = new IntersectionObserver(async ([{ isIntersecting: isVisible }]) => {
      if (isVisible) {
        el.src = binding.value
        intersectionObserver.disconnect()
      }
    })
    intersectionObserver.observe(el)
    // el.onerror = function () {
    //   el.src = defalut
    // }
  }
}
