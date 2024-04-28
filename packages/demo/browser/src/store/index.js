import Vue from 'vue'
import Vuex from 'vuex'
import auth from '@/utils/auth'
import { getUserInfo } from '@/api/user'

Vue.use(Vuex)
// privateChat groupChat
export default new Vuex.Store({
  state: {
    token: auth.get(),
    userInfo: {
      avatar: 'default.png'
    },
    userList: {},
    currentChatTarget: {
      type: '是群聊还是私发',
      name: '',
      id: ''
    },
    groupChatInfo: {
      lastMessage: {},
      notReadMessageCount: 0
    }
  },
  getters: {
    userInfo: (state) => state.userInfo
  },
  mutations: {
    setToken (state, token) {
      state.token = token
    },
    setUserInfo (state, userInfo) {
      state.userInfo = userInfo
    },
    setUserList (state, userList) {
      state.userList = userList
    },
    setCurrentChatTarget (state, currentChatTarget) {
      state.currentChatTarget = currentChatTarget
    },
    setGroupChatInfo (state, groupChatInfo) {
      state.groupChatInfo = groupChatInfo
    }
  },
  actions: {
    async getUserInfo ({ commit }) {
      try {
        const { data } = await getUserInfo()
        commit('setUserInfo', data)
      } catch (error) {
        console.log(error)
      }
    }

  },
  modules: {}
})
