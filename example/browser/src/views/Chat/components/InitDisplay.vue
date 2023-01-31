<template>
<div class="wrap">
  <img draggable="false" :src="hug" alt="" class="animate__animated animate__bounce animate__delay-2s" @animationend="end">
  <p>快去找TA聊天吧！说不定人家已经偷偷想你很久了</p>
</div>
</template>

<script>
import hug from '@/assets/images/hug.png'
export default {
  name: 'InitDisplay',
  data () {
    return {
      hug
    }
  },
  methods: {
    end (e) {
      e.target.classList.remove('animate__bounce')
      setTimeout(() => {
        e.target.classList.add('animate__bounce')
      }, 500)
    }
  }
}
</script>

<style scoped lang="less">
.wrap{
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  width: 100%;
  height: 100%;

  img{
    width: 200px;
  }
  p{
    margin-top: 30px;
    font-size: 30px;
    font-weight: bold;
  }
  /*display: flex;*/
}
</style>
