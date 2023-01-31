<template>
  <div class="editArea" :class="{isDrop}" @dragenter="dragenter" @drop="drop">
    <!--    <div class="uploadTip" >松开鼠标即可上传</div>-->
    <Transition enter-active-class="animate__animated animate__fadeInDown"
                leave-active-class="animate__animated animate__fadeOutUp">
      <el-progress v-show="percent" style="transform: translate(10px,5px)" :percentage="percent" :status="status"/>
    </Transition>

    <div class="upload">
      <el-button :loading="loading" type=""><label for="file">上传<i class="el-icon-upload el-icon--right"></i></label>
      </el-button>
    </div>
    <textarea class="edit" v-model="message" @keyup.enter="sendMessage"
              @dragleave="dragleave"></textarea>
    <div class="send" @click="sendMessage">发送</div>
    <input type="file" id="file" hidden="hidden" @change="changeFile"/>
    <EmojiComponent class="emoji" @send="sendEmoji"/>
  </div>
</template>

<script>

import socket from '@/utils/socket'
import event from '@/utils/event'
import { mapState } from 'vuex'
import { sendType } from '@/api/enum'
import uploadImg from '@/assets/images/files/shangchuan-1.png'
import { calcFileSize, getFileType } from '@/utils/fileType'
import EmojiComponent from '@/views/Chat/components/Emoji.vue'

const COS = require('cos-js-sdk-v5')

// SECRETID 和 SECRETKEY请登录 https://console.cloud.tencent.com/cam/capi 进行查看和管理
const cos = new COS({
  SecretId: '',
  SecretKey: ''
})
export default {
  name: 'SendMessage',
  components: { EmojiComponent },
  data () {
    return {
      message: '',
      uploadImg,
      loading: false,
      percent: 0,
      status: null,
      isDrop: false
    }
  },
  methods: {
    sendMessage () {
      // console.log(this.message..length)
      if (!this.message.trim()) {
        this.$message.info('不能发送空白消息')
        return 0
      }
      this.sendMessageToServer({
        type: 'text',
        content: this.message
      })
      this.message = ''
    },
    changeFile (e) {
      const file = e.target.files[0]
      if (!file) return
      this.upload(file)
    },
    sendMessageToServer (message) {
      const Message = {
        to: this.currentChatTarget.id,
        from: this.userInfo.id,
        message,
        date: new Date()
      }
      if (this.currentChatTarget.type === sendType.private) {
        this.userList[Message.to].lastMessage = Message
      } else {
        this.groupChatInfo.lastMessage = Message
      }
      socket.emit(this.currentChatTarget.type, Message)
      event.emit('addMessage', Message)
    },
    dragenter (e) {
      e.stopPropagation()
      e.preventDefault()
      this.isDrop = true
    },
    drop (e) {
      e.stopPropagation()
      e.preventDefault()
      this.isDrop = false
      const file = e.dataTransfer.files[0]
      if (!file) return
      this.upload(file)
    },
    dragleave (e) {
      e.stopPropagation()
      e.preventDefault()
      this.isDrop = false
    },
    upload (file) {
      if (this.loading) return
      const {
        type,
        name,
        size
      } = file
      const suffix = name.split('.').reverse()[0].toLowerCase()
      const message = {
        type: 'file',
        src: '',
        suffix,
        name,
        size: calcFileSize(size),
        fileType: getFileType(suffix)
      }
      if (type.includes('image')) {
        message.type = 'image'
      }
      cos.putObject({
        Bucket: 'weichat-1301368439', /* 必须 */
        Region: 'ap-beijing', /* 存储桶所在地域，必须字段 */
        Key: (parseInt(Math.random() * 100 + '_qingzhi_')) + file.name, /* 必须 */
        StorageClass: 'STANDARD',
        Body: file, // 上传文件对象
        onProgress: (progressData) => {
          this.loading = true
          this.percent = parseInt(progressData.percent * 100)
        }
      }, (err, data) => {
        this.loading = false
        if (err) {
          this.status = 'exception'
          this.$message.error('请配置腾讯云cos账号信息')
          // this.$message.error('上传失败')
          return
        }
        this.status = 'success'
        setTimeout(() => {
          this.percent = 0
          this.status = null
        }, 1000)
        message.src = 'https://' + data.Location
        this.sendMessageToServer(message)
      })
    },
    sendEmoji (src) {
      const message = {
        type: 'image',
        fileType: 'image',
        src,
        des: 'emoji'
      }
      this.sendMessageToServer(message)
    }

  },
  computed: {
    ...mapState(['userList', 'currentChatTarget', 'userInfo', 'groupChatInfo'])
  },
  mounted () {

  }
}
</script>

<style scoped lang="less">
.editArea {
  position: relative;
  height: 20%;
  //outline: 1px solid #1766be;
  border-top: 2px solid #ececec;

  .upload {
    position: absolute;
    right: 20px;
    bottom: 58px;
    //top: -32px;

    button {
      //padding: 5px;
      border-radius: 5px;
      padding: 9px 17px;

    }

    //img {
    //  width: 20px;
    //  margin-right: 5px;
    //}
    ///deep/span{
    //  display: flex;
    //  align-items: center;
    //  //color: #07c160;
    //}

    //top: 100%;
  }

  .edit {
    display: flex;
    padding: 10px;
    width: 100%;
    height: 100%;
    background: #f5f5f5;
    font-size: 20px;
    resize: none;
    border: none;
    outline: none;
    box-sizing: border-box;
  }

  .send {
    position: absolute;
    padding: 5px 25px;
    right: 20px;
    bottom: 20px;
    color: #07c160;
    background: #e9e9e9;
    cursor: pointer;
    border-radius: 5px;

    &:hover {
      background: #d2d2d2;
    }
  }
}

.uploadTip {
  display: none;
}

.isDrop {
  background: #ECEAE8;

  .send, .upload {
    display: none;
  }

  .edit {
    opacity: 0;
  }

  position: relative;

  &::before {
    content: '松开鼠标即可上传文件';
    display: block;
    position: absolute;
    color: #8095FF;
    font-weight: bold;
    font-size: 32px;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    z-index: 0;
    user-select: none;
  }

}
.emoji{
  position: absolute;
  right: 20px;
  bottom: 100px;
}

</style>
