
export default class Flip {
  constructor (container) {
    this.list = container.children || []
  }

  first () {
    Array.from(this.list).forEach((e) => {
      // e.style.transition = `none`
      e.flipStart = e.getBoundingClientRect()
    })
  }

  last () {
    Array.from(this.list).forEach((e) => {
      e.flipEnd = e.getBoundingClientRect()
    })
  }

  invert () {
    // Array.from(this.list).forEach((e) => {
    //   const dx = e.flipStart?.x - e.flipEnd?.x
    //   const dy = e.flipStart?.y - e.flipEnd?.y
    //   console.log(dx, dy)
    //   e.style.transform = `translate(${dx}px,${dy}px)`
    //
    // })
    Array.from(this.list).forEach((e) => {
      // 倒置后的位置，虽然图片移动到最新位置了，但你先给我回去，等着我来让你做动画。
      const invert = {
        left: e.flipStart?.left - e.flipEnd?.left,
        top: e.flipStart?.top - e.flipEnd?.top,
        width: e.flipStart?.width / e.flipEnd?.width,
        height: e.flipStart?.height / e.flipEnd?.height
      }

      const keyframes = [
        // 初始位置是倒置后的位置
        {
          transform: `translate(${invert.left}px, ${invert.top}px) scale(${invert.width},${invert.height})`
        },
        // 图片更新后本来应该在的位置
        { transform: 'none' }
      ]

      const options = {
        duration: 300,
        easing: 'cubic-bezier(0,0,0.32,1)'
      }

      // 开始运动！
      e.animate(keyframes, options)
    })
  }

  play () {
    // requestAnimationFrame(() => {
    //   Array.from(this.list).forEach((e) => {
    //     e.style.transition = `1s ease`
    //     e.style.transform = `none`
    //   })
    // })
  }
}
