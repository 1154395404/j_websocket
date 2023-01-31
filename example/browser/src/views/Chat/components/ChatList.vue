<template>
  <div class="chatList" v-loading="loading"   element-loading-text="正在加载聊天记录...">
    <ul class="chatListScroll" ref="chatListScroll" :class="[$store.state.currentChatTarget.type]">
      <li
        class="chatItem"
        :class="{ myself:isMySelf(item.from)}"
        v-for="(item,index) in chatList"
        :key="index"
      >
        <el-image
          class="avatar"
          :src="getAvatar(item.from)"
          :preview-src-list="[getAvatar(item.from)]"
          alt=""
        />
        <div>
          <p class="name">{{ getUsername(item.from) }}</p>
          <el-tooltip class="item" effect="dark" :content="calcTime(item.date)"
                      :placement="isMySelf(item.from)?'left-start':'right-start'">
            <p class="message">
             <RenderMessage :message="item.message"/>
            </p>
          </el-tooltip>
        </div>
      </li>
    </ul>
  </div>
</template>

<script>
import socket from '@/utils/socket'
import event from '@/utils/event'
import { mapState } from 'vuex'
import playNewMessage from '@/utils/playNewMessage'
import { sendType } from '@/api/enum'
import day from '@/utils/day'
import RenderMessage from '@/views/Chat/components/RenderMessage.vue'

export default {
  name: 'ChatList',
  components: { RenderMessage },
  data () {
    return {
      chatList: [],
      loading: false
    }
  },
  methods: {
    onMessage (data) {
      // 接收私发消息
      const {
        to,
        from
      } = data
      if (to === this.userInfo.id) {
        console.log('????')
        playNewMessage()
        this.userList[from].lastMessage = data
        if (from === this.currentChatTarget.id) {
          this.chatList.push(data)
          socket.emit('setNotReadMessageZero', { targetId: from })
          this.scrollBottom()
        } else {
          this.userList[from].notReadMessageCount = ++this.userList[from].notReadMessageCount
        }
      }
    },
    onGroupMessage (data) {
      // 接收群发消息
      playNewMessage()
      this.groupChatInfo.lastMessage = data
      if (this.currentChatTarget.type === sendType.group) {
        this.chatList.push(data)
        socket.emit('setNotReadMessageZero', { targetId: '-1' })
        this.scrollBottom()
      } else {
        this.groupChatInfo.notReadMessageCount = this.groupChatInfo.notReadMessageCount + 1
      }
    },
    getUsername (fromId) {
      if (this.isMySelf(fromId)) {
        return this.userInfo.name
      } else {
        return this.userList[fromId].name
      }
    },
    getAvatar (fromId) {
      if (this.isMySelf(fromId)) {
        return this.imgUrlPrefix + this.userInfo.avatar
      } else {
        return this.imgUrlPrefix + this.userList[fromId].avatar
      }
    },
    isMySelf (from) {
      return from === this.userInfo.id
    },
    addMessage (message) {
      // console.log(message)

      this.chatList.push(message)
      this.scrollBottom()
    },
    scrollBottom () {
      this.$nextTick(() => {
        if (this.$refs.chatListScroll) {
          this.$refs.chatListScroll.scrollTop = this.$refs.chatListScroll.scrollHeight + this.$refs.chatListScroll.clientHeight
        }
      })
    },
    calcTime (date) {
      return day(date).format('YYYY-MM-DD HH:mm:ss') + ' ' + day(date).fromNow()
    }
  },
  mounted () {
    this.unsubscribeonMessage = socket.on('onMessage', this.onMessage)
    this.unsubscribeonGroupMessage = socket.on('onGroupMessage', this.onGroupMessage)
    event.on('addMessage', this.addMessage)
  },
  computed: {
    ...mapState(['userInfo', 'userList', 'currentChatTarget', 'groupChatInfo'])
  },
  watch: {
    '$store.state.currentChatTarget': {
      async handler (val, old) {
        if (!val.id) return
        this.chatList = []
        this.loading = true
        const { list } = await socket.request('getChatList', { targetId: val.id })
        this.chatList = list
        setTimeout(() => { this.scrollBottom() }, 50)
        socket.emit('setNotReadMessageZero', { targetId: val.id })
        this.loading = false
        if (val.id !== '-1') {
          // 私发消息
          this.userList[val.id].notReadMessageCount = 0
          // console.log(this.$store.state.currentChatTarget)
        } else {
          // * 群聊
          // socket.emit('setNotReadMessageZero', { targetId:  })
          this.groupChatInfo.notReadMessageCount = 0
        }
      },
      deep: false, // 深度监听
      immediate: false
    }
  },
  beforeDestroy () {
    this.unsubscribeonMessage && this.unsubscribeonMessage()
    this.unsubscribeonGroupMessage && this.unsubscribeonGroupMessage()
  }
}
</script>

<style scoped lang="less">
.chatList {
  width: 100%;
  height: 72%;
  //outline: 1px solid #ECECEC;

  .chatListScroll {
    display: flex;
    flex-direction: column;
    padding: 20px;
    width: 100%;
    height: 100%;
    box-sizing: border-box;
    list-style: none;
    overflow: auto;
    //scroll-behavior: smooth;

    .chatItem {
      display: flex;
      width: 70%;
      margin: 10px 0;

      .name {
        color: #8d8d8d;
        font-size: 14px;
        margin-bottom: 8px;
      }

      .message {
        display: inline-block;
        padding: 10px;
        background: #fff;
        border-radius: 6px;
        cursor: pointer;
        word-break: break-all;
        &:hover {
          background: #ebebeb;
        }
      }

      .avatar {
        flex-shrink: 0;
        margin-right: 10px;
        width: 40px;
        height: 40px;
        border-radius: 6px;
      }
    }

    &.privateChat {
      .name {
        display: none;
      }
    }

    .myself {
      flex-direction: row-reverse;
      align-self: end;

      .message {
        background: #95ec69;

        &:hover {
          background: #89d961;
        }
      }

      .name {
        display: none;
      }

      .avatar {
        margin-left: 10px;
      }
    }
  }
}

</style>
