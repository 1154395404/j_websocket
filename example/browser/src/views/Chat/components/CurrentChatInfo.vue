<template>
  <div class="currentInfo">
    <p>{{$store.state.currentChatTarget?.name}}</p>
  </div>
</template>

<script>
export default {
  name: 'CurrentChatInfo',
  data () {
    return {

    }
  },
  methods: {

  },
  watch: {
    // '$store.state.currentChatTarget': {
    //   handler (list) {
    //     // console.log('userListChange-----watch')
    //     // this.userList = Object.values(list)
    //   },
    //   deep: true, // 深度监听
    //   immediate: true // 第一次改变就执行
    // }
  },
  mounted () {

  }
}
</script>

<style scoped lang="less">
.currentInfo {
  display: flex;
  align-items: center;
  user-select: none;
  height: 8%;
  border-bottom: 2px solid #ececec;

  p {
    margin-left: 30px;
    font-size: 18px;
    font-weight: bold;
  }
}
</style>
