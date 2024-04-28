<template>
  <div>
    <p v-if="message.type==='text'">{{ message.content }}</p>
    <el-image class="imageType" v-else-if="message.type==='image'" :class="{emoji:message.des==='emoji'}" :src="message.src" :lazy="true"
              :preview-src-list="[message.src]">
      <div slot="placeholder" class="image-slot">
        <div v-loading="true"
             element-loading-text="图片拼命加载中..." style="width: 200px;height: 100px;"></div>
      </div>
    </el-image>
    <div v-else-if="message.fileType==='audio'||message.fileType==='video'" class="file" target="_blank">
      <a :href="message.src" target="_blank">
        <el-button class="inner" style="min-width: 250px">
          <img :src="getFileInfo(message.fileType).src" alt="">
          <div>
            <p> {{ message.name }}</p>
            <p class="size">{{ message.size }}</p>
          </div>
        </el-button>
      </a>
      <div>
        <audio v-if="message.fileType==='audio'" :src="message.src" controls
               class="audio" @play="play"></audio>
        <video v-else v-lazy="message.src" ref="_video" controls class="video" @play="play"></video>
      </div>
    </div>
    <a v-else :href="message.src" class="file" target="_blank">
      <el-button class="inner">
        <img :src="getFileInfo(message.fileType).src" alt="">
        <div>
          <p> {{ message.name }}</p>
          <p class="size">{{ message.size }}</p>
        </div>
      </el-button>
    </a>

    <!--      <div v-else-if="message.type==='img'">{{message.content}}</div>-->
  </div>

</template>

<script>
import ppt from '@/assets/images/files/ppt-1.png'
import { getFileInfo } from '@/utils/fileType'

const MESSAGE = [
  {
    type: 'text',
    content: 'ddddd'
  },
  {
    type: 'img',
    src: 'https://www4.bing.com//th?id=OHR.HighArchChina_ZH-CN8170154553_1920x1080.jpg&rf=LaDigue_1920x1080.jpg&pid=hp&w=1920&h=1080'
  }, {
    type: 'file',
    src: 'https://www4.bing.com//th?id=OHR.HighArchChina_ZH-CN8170154553_1920x1080.jpg&rf=LaDigue_1920x1080.jpg&pid=hp&w=1920&h=1080',
    suffix: '.pdf',
    name: '简历.pdf',
    fileType: 'audio'
  }
]
export default {
  name: 'RenderMessage',
  data () {
    return {
      ppt,
      MESSAGE
    }
  },
  props: {
    message: {
      type: Object,
      default: () => (MESSAGE[2])
    }
  },
  methods: {
    getFileInfo,
    play (e) {
      document.querySelectorAll('video').forEach((v) => {
        if (e.target !== v) v.pause()
      })
      document.querySelectorAll('audio').forEach((a) => {
        if (e.target !== a) a.pause()
      })
    }

  },
  mounted () {
    const video = this.$refs._video || {
      parentNode: {},
      style: {}
    }
    video.style.width = video.parentNode.clientWidth + 'px'
    video.style.display = 'block'
  }
}
</script>

<style scoped lang="less">
.file {
  //display: flex;
  //align-items: center;
  img {
    width: 35px;
    margin-right: 8px;
    //height: 40px;
    //height: 50px;
  }

  .size {
    //text-align: right;
    //text-align: center;
    margin-top: 5px;
    font-weight: normal;
    color: #909399;
    font-size: 14px;
  }

  .inner {
    padding: 8px 10px 8px 5px;
    white-space: unset;
    text-align: left;
    line-height: unset;
    font-weight: bold;

    /deep/ span {
      display: flex;
      height: 100%;
      align-items: center;
    }
  }
}

.imageType {
  max-width: 200px;
  min-width: 100px;

}
.emoji{
  max-width: 36px ;
  min-width: 36px ;
  img{

  }
}

.audio {
  width: 100%;
  margin-top: 10px
}

.video {
  margin-top: 10px;
  display: none;
  border-radius: 6px;
}

</style>
