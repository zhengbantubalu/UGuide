<template>
    <div class="user-info" @click="goToLogin">
        <van-image round class="user-avatar" src="http://47.93.189.31/res/bupt.ico" />
        <div class="user-name">{{ userName }}</div>
    </div>
    <van-grid :column-num="2" class="grid">
        <van-grid-item icon="clock-o" text="浏览历史" to="/test" />
        <van-grid-item icon="star-o" text="游记收藏" to="/test" />
    </van-grid>
    <Diary />
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';
import Diary from './Diary.vue';

const router = useRouter();
const isLoggedIn = ref(false);
const userName = ref('');

onMounted(async () => {
    isLoggedIn.value = window.localStorage.getItem('login') === 'true';
    if (isLoggedIn.value) {
        try {
            const token = window.localStorage.getItem('token');
            const response = await axios.get('/api/data/users/info', {
                headers: {
                    Authorization: `${token}`
                }
            });
            const { success, data } = response.data;
            if (success) {
                userName.value = data.username;
            } else {
                window.localStorage.setItem('login', false);
                isLoggedIn.value = false;
                userName.value = '点击登录';
            }
        } catch (error) {
            console.error('获取用户信息时出错:', error);
        }
    }
    else {
        userName.value = '点击登录';
    }
});

const goToLogin = () => {
    if (isLoggedIn.value) {
        router.push('/user/info');
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