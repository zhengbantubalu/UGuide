<template>
    <div class="user-info" @click="goToLogin">
        <img class="user-avatar" src="/bupt.ico" alt="用户头像">
        <div class="user-name">点击登录</div>
    </div>
    <van-grid :column-num="3" class="grid">
        <van-grid-item icon="clock-o" text="历史" />
        <van-grid-item icon="star-o" text="收藏" />
        <van-grid-item icon="records-o" text="日记" />
    </van-grid>
</template>

<script setup>
import { useRouter } from 'vue-router';

const router = useRouter();

const goToLogin = () => {
    router.push('/login');
};
</script>

<style scoped>
.user-info {
    display: flex;
    align-items: center;
    margin-top: 20px;
    padding: 10px;
    height: 120px;
}

.user-avatar {
    width: 100px;
    height: 100px;
    margin-left: 30px;
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