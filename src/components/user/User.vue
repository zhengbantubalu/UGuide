<template>
    <div class="page-container" ref="containerRef">
        <div class="user-info" @click="goToLogin">
            <van-image round class="user-avatar" :src="avatarUrl" fit="cover" />
            <div class="user-name">{{ username }}</div>
        </div>
        <van-tabs swipeable>
            <van-tab title="投稿">
                <Diary type="own" />
            </van-tab>
            <van-tab title="收藏">
                <Diary type="star" />
            </van-tab>
            <van-tab title="历史">
                <Diary type="history" />
            </van-tab>
        </van-tabs>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getUserInfo } from '/src/api/user'
import Diary from '../diary/Diary.vue'

const router = useRouter()
const isLoggedIn = ref(false)
const username = ref('')
const avatarUrl = ref('')

onMounted(async () => {
    isLoggedIn.value = (window.localStorage.getItem('login') === 'true')
    if (isLoggedIn.value) {
        const { success, data } = await getUserInfo()
        if (success) {
            username.value = data.username
            if (data.avatarUrl) {
                avatarUrl.value = data.avatarUrl
            } else {
                avatarUrl.value = "http://47.93.189.31/res/bupt.ico"
            }
        } else {
            window.localStorage.setItem('login', false)
            avatarUrl.value = "http://47.93.189.31/res/bupt.ico"
            isLoggedIn.value = false
            username.value = '点击登录'
        }
    }
    else {
        avatarUrl.value = "http://47.93.189.31/res/bupt.ico"
        username.value = '点击登录'
    }
})

const goToLogin = () => {
    if (isLoggedIn.value) {
        router.push('/user/info')
    } else {
        router.push('/login')
    }
}
</script>

<style scoped>
.page-container {
    background-color: #f0f0f0;
}

.user-info {
    display: flex;
    align-items: center;
    padding: 40px 10px 20px 10px;
    height: 120px;
    background-color: white;
}

.user-avatar {
    width: 80px;
    height: 80px;
    margin-left: 20px;
    margin-right: 30px;
}

.user-name {
    color: black;
    font-size: 18px;
}
</style>