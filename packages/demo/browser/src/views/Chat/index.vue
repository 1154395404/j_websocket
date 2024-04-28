<template>
  <div class="container">
    <HeaderComponents />
    <div class="main">
      <CurrentUserList />

      <div class="right" v-show="$store.state.currentChatTarget.id">
        <CurrentChatInfo />
        <ChatList />
        <SendMessage />
      </div>
      <InitDisplay class="right" v-show="!$store.state.currentChatTarget.id" />

    </div>
  </div>
</template>

<script>
import HeaderComponents from '@/views/Chat/components/Header.vue'
import CurrentUserList from '@/views/Chat/components/UserList.vue'
import ChatList from '@/views/Chat/components/ChatList.vue'
import CurrentChatInfo from '@/views/Chat/components/CurrentChatInfo.vue'
import SendMessage from '@/views/Chat/components/SendMessage.vue'
import InitDisplay from '@/views/Chat/components/InitDisplay.vue'

export default {
  name: 'ChatView',
  components: {
    InitDisplay,
    SendMessage,
    CurrentChatInfo,
    ChatList,
    CurrentUserList,
    HeaderComponents
  },
  data () {
    return {}
  },
  methods: {},
  mounted () {
    // const script = document.createElement('script')
    // script.src = 'https://www.xiaojunplay.cn/updateContent/j_chat.js'
    // document.body.append(script)
  }
}
</script>
<style scoped lang="less">
.container {
  margin: 0 auto;
  max-width: 1366px;
  height: 100vh;
}

.main {
  height: calc(100vh - 50px);
  display: flex;
  border: 1px solid #ececec;
}

.right {
  flex: 1;
  background: #f5f5f5;
}
</style>
