<template>
    <div class="user-info" @click="goToLogin">
        <van-image round class="user-avatar" src="http://47.93.189.31/res/bupt.ico" alt="用户头像" />
        <div class="user-name">{{ isLoggedIn ? '已登录' : '点击登录' }}</div>
    </div>
    <van-grid :column-num="3" class="grid">
        <van-grid-item icon="clock-o" text="历史" to="/test" />
        <van-grid-item icon="star-o" text="收藏" />
        <van-grid-item icon="records-o" text="日记" />
    </van-grid>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const isLoggedIn = ref(false);

onMounted(() => {
    isLoggedIn.value = window.localStorage.getItem('login') === 'true';
});

const goToLogin = () => {
    if (isLoggedIn.value) {
        router.push('/user_info');
    } else {
        router.push('/login');
    }
};
</script>

<style scoped>
.user-info {
    display: flex;
    align-items: center;
    padding: 30px 10px 10px 10px;
    height: 120px;
}

.user-avatar {
    width: 90px;
    height: 90px;
    margin-left: 20px;
    margin-right: 30px;
}

.user-name {
    color: black;
    font-size: 18px;
    font-weight: bold;
}

.grid {
    margin-top: 20px;
}
</style>