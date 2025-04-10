<template>
    <div class="image-title-container">
        <img src="/bupt.ico" alt="Logo" class="logo-image">
        <div class="title">UGuide</div>
    </div>
    <van-form @submit="onSubmit" class="form">
        <van-cell-group inset class="input-container">
            <van-field v-model="username" name="用户名" label="用户名" placeholder="用户名"
                :rules="[{ required: true, message: '请填写用户名' }]" />
            <van-field v-model="password" type="password" name="密码" label="密码" placeholder="密码"
                :rules="[{ required: true, message: '请填写密码' }]" />
        </van-cell-group>
        <div class="button-container">
            <van-button round block type="primary" native-type="button"
                :to="{ name: 'Register', query: { username: username, password: password } }">注册</van-button>
            <van-button round block type="primary" native-type="submit">登录</van-button>
        </div>
    </van-form>
</template>

<script setup>
import axios from 'axios';
import { ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { showSuccessToast, showFailToast } from 'vant';

const router = useRouter();
const username = ref('');
const password = ref('');

const onSubmit = async (values) => {
    try {
        const response = await axios.post('/api_sb/users/login', {
            username: username.value,
            password: password.value
        });
        const { success, message, token } = response.data;
        if (success) {
            // window.localStorage.setItem('token', token);
            showSuccessToast(message);
            router.back();
        } else {
            showFailToast(message);
        }
    } catch (error) {
        console.error('登录时出错:', error);
    }
};
</script>

<style scoped>
.image-title-container {
    padding-top: 50px;
    text-align: center;
}

.logo-image {
    width: 90px;
    height: 90px;
}

.title {
    font-size: 20px;
}

.form {
    padding: 0px 10px;
}

.input-container {
    height: 200px;
    display: flex;
    flex-direction: column;
    justify-content: center;
}

.button-container {
    padding: 0px 20px;
    display: flex;
    justify-content: space-between;
    gap: 10px;
}
</style>
