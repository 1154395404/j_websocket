<template>
  <div class="header">
    <div class="userInfo ">
      <el-image style="width:40px;height:40px;border-radius:8px"
                :preview-src-list="[imgUrlPrefix+userInfo.avatar]"
                :src="imgUrlPrefix+userInfo.avatar" alt=""/>
      <span>您好：{{ userInfo.name }}</span>
      <el-tag v-if="delay<200" type="success">延时{{ delay }}ms</el-tag>
      <el-tag v-else-if="delay>200&&delay<500" type="warning">延时{{ delay }}ms</el-tag>
      <el-tag v-else type="danger">延时{{ delay }}ms</el-tag>
    </div>
    <div class="animate__animated animate__backInRight">
      <el-button type="primary" @click="openDialog">修改个人信息</el-button>
      <el-button type="success">当前在线人数
        {{ Object.values($store.state.userList).reduce((pre, cur) => pre + cur.isOnline, 0) }}
      </el-button>
      <el-button type="info" @click="logout">退出登录</el-button>
    </div>

    <el-dialog :visible.sync="dialogVisible" title="修改信息" width="400px">
      <div style="display: flex;align-items: center;justify-content: center">
        <el-form :label-position="'left'" label-width="80px" :model="formData" style="width: 300px;" :rules="rule">
          <el-form-item label="用户名" prop="name">
            <el-input v-model="formData.name"></el-input>
          </el-form-item>
          <el-form-item label="头像">
            <div style="display: flex;justify-content: space-between">
              <el-image style="width: 100px;height: 100px" :src="imgUrlPrefix+formData.avatar"
                        :preview-src-list="[imgUrlPrefix+formData.avatar]"/>
              <el-upload
                class="avatar-uploader"
                :action="action+'/api/upload'"
                :headers="{Authorization :`Bearer ${$store.state.token}`}"
                :show-file-list="false"
                :on-success="handleAvatarSuccess"
                :before-upload="beforeAvatarUpload">
                <i class="el-icon-plus avatar-uploader-icon"></i>
              </el-upload>
            </div>

            <!--            <el-input v-model="formData.avatar"></el-input>-->
          </el-form-item>
        </el-form>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="update">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import { updateUserInfo } from '@/api/user'
import auth from '@/utils/auth'
import router from '@/router'
import socket from '@/utils/socket'
// import { avatarUrlPrefix } from '@/utils/variable'
export default {
  name: 'HeaderComponents',
  data () {
    return {
      dialogVisible: false,
      rule: {
        name: [{
          required: true,
          trigger: 'blur',
          message: '名称不能为空'
        }]
      },
      formData: {
        avatar: '',
        name: ''
      },
      imageUrl: '',
      delay: 0,
      action: process.env.VUE_APP_SERVER_URL

    }
  },
  computed: {
    ...mapState(['userInfo'])
  },
  methods: {
    handleAvatarSuccess (res, file) {
      this.formData.avatar = res.data.filename
    },
    beforeAvatarUpload (file) {
      // const isJPG = file.type === 'image/jpeg'
      const isLt2M = file.size / 1024 / 1024 < 2

      // if (!isJPG) {
      //   this.$message.error('上传头像图片只能是 JPG 格式!')
      // }
      if (!isLt2M) {
        this.$loading().close()
        this.$message.error('上传头像图片大小不能超过 2MB!')
      }

      return isLt2M
    },
    openDialog () {
      this.formData.name = this.userInfo.name
      this.formData.avatar = this.userInfo.avatar
      this.dialogVisible = true
    },
    async update () {
      const {
        data,
        message
      } = await updateUserInfo(this.formData)
      this.$store.commit('setUserInfo', data)
      this.$message.success(message)
      this.dialogVisible = false
    },
    logout () {
      this.$message.success('已退出')
      this.$store.commit('setCurrentChatTarget', {})
      auth.set('')
      router.push('/login')
      socket.close()
    },
    onSendHeartBeat (count, delay) {
      this.delay = delay
    }
  },
  mounted () {
    this.unsubscribeonSendHeartBeat = socket.heartbeat.onSendHeartBeat(this.onSendHeartBeat)
  },
  beforeDestroy () {
    this.unsubscribeonSendHeartBeat && this.unsubscribeonSendHeartBeat()
  }
}
</script>

<style scoped lang="less">
.header {
  display: flex;
  width: 100%;
  height: 50px;
  justify-content: space-between;
  align-items: center;

  .userInfo {
    display: flex;
    align-items: center;

    span {
      margin-left: 20px;
      font-size: 20px;
      font-weight: bold;
    }
  }

  //background: #0b65ec;
  /deep/ .avatar-uploader .el-upload {
    border: 1px dashed #d9d9d9;
    border-radius: 6px;
    cursor: pointer;
    position: relative;
    overflow: hidden;
  }

  /deep/ .avatar-uploader .el-upload:hover {
    border-color: #409EFF;
  }

  /deep/ .avatar-uploader-icon {
    font-size: 28px;
    color: #8c939d;
    width: 100px;
    height: 100px;
    line-height: 100px;
    text-align: center;
  }

  /deep/ .avatar {
    width: 100px;
    height: 100px;
    display: block;
  }
}

</style>
