<template>
    <!-- <van-nav-bar title="UGuide" /> -->
    <router-view class="home-page" />
    <van-tabbar route :border="false">
        <van-tabbar-item replace icon="medal" to="/home/diary">发现</van-tabbar-item>
        <van-tabbar-item replace icon="location" to="/home/spot">景点</van-tabbar-item>
        <div class="gap"></div>
        <van-tabbar-item icon="play-circle" class="go" @click="go">出发</van-tabbar-item>
        <div class="gap"></div>
        <van-tabbar-item replace icon="star" to="/home/togo">想去</van-tabbar-item>
        <van-tabbar-item replace icon="user" to="/home/user">我的</van-tabbar-item>
    </van-tabbar>
</template>

<script setup>
import { getFirstStarSpotID } from '/src/api/spot'
import { useRouter } from 'vue-router'
import { showFailToast } from 'vant'

const router = useRouter()

const go = async () => {
    const { success, state, message, id } = await getFirstStarSpotID()
    if (success) {
        router.push(`/go/${id}`)
    } else {
        showFailToast(message)
        if (state === 'notLogin') {
            router.push('/login')
        } else if (state === 'notStarSpot') {
            router.push('/home/spot')
        }
    }
}
</script>

<style scoped>
.home-page {
    min-height: 100vh;
    background-color: #f0f0f0;
}

.go {
    position: absolute;
    left: 50%;
    z-index: 1;
    transform: translateX(-50%) translateY(-25%);
    height: 60px;
    width: 60px;
    border-radius: 50%;
    box-shadow: inset 0 0 10px rgba(0, 0, 0, 0.2), 0 0 0 8px white;
    background-color: #50a7ff;
    color: white;
}

.gap {
    width: 40px;
}
</style>