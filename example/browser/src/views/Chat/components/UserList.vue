<template>
  <ul class="userList" ref="userList" v-loading="loadingUserList" element-loading-text="正在加载用户列表...">
    <li class="user " :class="{active:currentClickId==='-1'}"
        @click="changeChatTarget({name:'群聊',id:'-1'},sendType.group)">
      <div
        style="
              width: 40px;
              height: 40px;
              background: white;
              border-radius: 6px;
            "
        class="avatarGroup"
      >
        <lord-icon
          style="width: 40px; height: 40px"
          src="https://cdn.lordicon.com/flvisirw.json"
          trigger="hover"
        >
        </lord-icon>
        <i class="ellipsis-1" v-show="groupChatInfo.notReadMessageCount">{{ groupChatInfo.notReadMessageCount }}</i>
      </div>
      <div class="r">
        <div class="userStatus">
          <p class="ellipsis-1">群聊</p>
          <span class="time">{{ getRelativeTime(groupChatInfo.lastMessage.date) }}</span>
        </div>
        <span class="ellipsis-1"
        >{{
            calcGroupWhoSpeak(groupChatInfo.lastMessage.from) + (getLastMessage(groupChatInfo.lastMessage.message) || '群里还没有人发消息哦')
          }}</span
        >
      </div>
    </li>
    <transition-group v-if="isEnter" enter-active-class="animate__animated animate__backInLeft">
      <li class="user "
          :style="{animationDelay: 0.1*index+'s'}"
          :class="{active:user.id===currentClickId}"
          v-for="(user,index) in sortUserList" :key="user.id"
          @click="changeChatTarget(user,sendType.private)"
      >
        <div class="avatarGroup">
          <img :src="imgUrlPrefix+user.avatar" alt=""/>
          <i class="ellipsis-1" v-show="user.notReadMessageCount">{{ user.notReadMessageCount }}</i>
        </div>
        <div class="r">
          <div class="userStatus">
            <p class="ellipsis-1">{{ user.name }}</p>
            <el-tag v-if="user.isOnline" class="tag" type="success" effect="dark">在线</el-tag>
            <el-tag v-else class="tag" type="info" effect="dark">离线</el-tag>
            <span class="time">{{ getRelativeTime(user.lastMessage.date) }}</span>
          </div>
          <span class="ellipsis-1">{{ getLastMessage(user.lastMessage.message) || '快来找我聊天吧' }}</span>
        </div>
      </li>
    </transition-group>
    <!--    <transition-group enter-active-class="animate__animated animate__backInLeft">-->
    <template v-else>
      <li class="user "

          :class="{active:user.id===currentClickId}"
          v-for="(user) in sortUserList" :key="user.id"
          @click="changeChatTarget(user,sendType.private)"
      >
        <div class="avatarGroup">
          <img :src="imgUrlPrefix+user.avatar" alt=""/>
          <i class="ellipsis-1" v-show="user.notReadMessageCount">{{ user.notReadMessageCount }}</i>
        </div>
        <div class="r">
          <div class="userStatus">
            <p class="ellipsis-1">{{ user.name }}</p>
            <el-tag v-if="user.isOnline" class="tag" type="success" effect="dark">在线</el-tag>
            <el-tag v-else class="tag" type="info" effect="dark">离线</el-tag>
            <span class="time">{{ getRelativeTime(user.lastMessage.date) }}</span>
          </div>
          <span class="ellipsis-1">{{ getLastMessage(user.lastMessage.message) || '快来找我聊天吧' }}</span>
        </div>
      </li>
    </template>
    <!--    </transition-group>-->
  </ul>
</template>

<script>
import { getUserList } from '@/api/user'
import socket from '@/utils/socket'
import day from '@/utils/day'
import { mapState } from 'vuex'
import { sendType } from '@/api/enum'
import { Loading } from 'element-ui'
import { getFileInfo } from '@/utils/fileType'
import Flip from '@/vendor/flip'

// dayjs
export default {
  name: 'CurrentUserList',
  data () {
    return {
      currentClickId: '',
      plusMinusOneFlag: false,
      setIntervalId: 0,
      sendType,
      loadingInstance: {},
      flip: {
        first: () => {
        },
        last: () => {
        },
        invert: () => {
        },
        play: () => {
        }

      },
      loadingUserList: false,
      isEnter: true
    }
  },
  methods: {
    changeChatTarget (user, type) {
      if (this.currentClickId === user.id) {
        return 0
      }
      this.currentClickId = user.id
      // console.log(user, type)
      this.$store.commit('setCurrentChatTarget', {
        ...user,
        type
      })
    },
    getRelativeTime (date) {
      if (date < 100) {
        return '未知~'
      }
      // setTimeout(this.getRelativeTime, 1000, date)
      return day(date).fromNow()
    },
    onOnline (data) {
      const { id } = data
      this.$store.state.userList[id] && (this.$store.state.userList[id].isOnline = true)
    },
    onOffline (data) {
      const { id } = data
      this.$store.state.userList[id] && (this.$store.state.userList[id].isOnline = false)
    },
    getPlusMinusOne () {
      this.plusMinusOneFlag = !this.plusMinusOneFlag
      return this.plusMinusOneFlag ? 1 : -1
    },
    calcGroupWhoSpeak (fromId) {
      if (fromId === this.userInfo.id) {
        return '我：'
      } else if (this.userList[fromId]) {
        return this.userList[fromId].name + '：'
      } else {
        return ''
      }
    },
    onClose () {
      this.$confirm('连接已中断是否重连?', '提示', {
        confirmButtonText: '确定',
        type: 'warning'
      }).then(() => {
        socket.reconnect()
        this.loadingInstance = Loading.service({ text: '正在重连请稍后' })
      })
    },
    onConnect () {
      this.$message.success('重连连接成功')
      this.online()
      this.$nextTick(() => {
        this.loadingInstance.close && this.loadingInstance.close()
      })
      //
    },
    online () {
      // 上线
      socket.request('online').then((data) => {
        const {
          onlineList,
          enableGroupList
        } = data
        onlineList.forEach((id) =>
          this.$store.state.userList[id] && (this.$store.state.userList[id].isOnline = true)
        )
        enableGroupList.lastMessage.date = new Date(enableGroupList.lastMessage.date).getTime() || new Date().getTime()
        this.$store.commit('setGroupChatInfo', enableGroupList)
      })
    },
    getLastMessage (message) {
      if (!message) return false
      if (message.type === 'text') return message.content
      return getFileInfo(message.fileType).name
    },
    animationend (e) {
      // animate__animated animate__backInLeft"
      // :style="{animationDelay: 0.1*index+'s'}"
      e.target.classList.remove('animate__animated')
      e.target.classList.remove('animate__backInLeft')
      // console.log(e.target)
    }

  },
  mounted () {
    this.setIntervalId = setInterval(() => {
      Object.values(this.$store.state.userList).forEach((user) => {
        user.lastMessage.date = new Date(user.lastMessage.date).getTime() + this.getPlusMinusOne()
      })
      this.groupChatInfo.lastMessage.date = new Date(this.groupChatInfo.lastMessage.date).getTime() + this.getPlusMinusOne()
    }, 1000 * 60)

    this.flip = new Flip(this.$refs.userList)
  },
  watch: {
    sortUserList () {
      this.$nextTick(() => {
        this.flip.last()
        this.flip.invert()
      })
    }
  },
  computed: {
    ...mapState(['userList', 'groupChatInfo', 'userInfo']),
    sortUserList () {
      // console.log(Object.values(this.userList).sort((userA, userB) => userB.date - userA.date))
      // console.log(Object.values(this.userList).sort((userA, userB) => userB.lastMessage.date - userA.lastMessage.date))
      this.flip.first()

      // eslint-disable-next-line vue/no-async-in-computed-properties

      // this.$nextTick(() => {

      // })
      return Object.values(this.userList).sort((userA, userB) => new Date(userB.lastMessage.date).getTime() - new Date(userA.lastMessage.date).getTime())
    }
  },
  async created () {
    this.loadingUserList = true
    const { data } = await getUserList()
    this.loadingUserList = false
    Object.values(data).forEach((user) => {
      user.isOnline = false
      // user.lastMessage.date = new Date(user.lastMessage.date).getTime() || new Date().getTime()
      user.lastMessage.date = new Date(user.lastMessage.date).getTime() || 0
    })
    this.$store.commit('setUserList', data)
    this.online()
    this.unsubscribeonOnline = socket.on('onOnline', this.onOnline)
    this.unsubscribeonOffline = socket.on('onOffline', this.onOffline)
    this.unsubscribeheartbeatonClose = socket.heartbeat.onClose(this.onClose)
    this.unsubscribeonconnect = socket.connect(this.onConnect)
    setTimeout(() => {
      this.isEnter = false
    }, Object.values(data).length * 200)
  },
  beforeDestroy () {
    clearInterval(this.setIntervalId)
    this.unsubscribeonOnline && this.unsubscribeonOnline()
    this.unsubscribeonOffline && this.unsubscribeonOffline()
    this.unsubscribeheartbeatonClose && this.unsubscribeheartbeatonClose()
    this.unsubscribeonconnect && this.unsubscribeonconnect()
  }
}
</script>

<style scoped lang="less">
.userList {
  width: 300px;
  height: 100%;
  //outline: 1px solid red;
  list-style: none;
  overflow: auto;

  .user {
    display: flex;
    align-items: center;
    //height: 80px;
    padding: 10px;
    ////outline: 1px solid pink;
    cursor: pointer;
    background: #eceae8;

    &:hover {
      background: #dfdddb;
    }

    &.active {
      background: #c5c4c4;
    }

    .avatarGroup {
      position: relative;

      i {
        position: absolute;
        top: -5px;
        right: -5px;
        display: flex;
        width: 20px;
        height: 20px;
        justify-content: center;
        align-items: center;
        background: #f00;
        color: #ffffff;
        border-radius: 50%;
        font-size: 12px;
      }
    }

    img {
      border-radius: 6px;
      width: 40px;
      height: 40px;
      //height: 20px;
    }

    .r {
      //flex: 1;

      width: calc(100% - 50px);
      margin-left: 10px;

      .userStatus {
        position: relative;
        display: flex;

        .tag {
          margin-left: 10px;
          color: #fff;
          width: unset;
          height: unset;
          padding: 2px 4px;
          line-height: unset;
          //font-size: 12px;
          //padding: 5px;
        }

        .time {
          position: absolute;
          width: unset;
          //bottom: 0;
          right: 0;
        }

      }

      p {
        //用户名
      }

      span {
        // 当前消息
        display: inline-block;
        width: 100%;
        color: #a0a0a0;
        font-size: 14px;
      }
    }
  }
}

</style>
