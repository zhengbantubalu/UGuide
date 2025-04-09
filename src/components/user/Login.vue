<template>
    <div class="image-title-container">
        <img src="/bupt.ico" alt="Logo" class="logo-image">
        <div class="title">UGuide</div>
    </div>
    <van-form @submit="onSubmit" class="form">
        <van-cell-group inset>
            <van-field v-model="username" name="用户名" label="用户名" placeholder="用户名"
                :rules="[{ required: true, message: '请填写用户名' }]" />
            <van-field v-model="password" type="password" name="密码" label="密码" placeholder="密码"
                :rules="[{ required: true, message: '请填写密码' }]" />
        </van-cell-group>
        <div class="button-container">
            <van-button round block type="primary" native-type="button" to="/register">注册</van-button>
            <van-button round block type="primary" native-type="submit">登录</van-button>
        </div>
    </van-form>
</template>

<script setup>
import { ref } from 'vue';

const username = ref('');
const password = ref('');
const onSubmit = async (values) => {
    console.log('submit', values);
    try {
        const response = await axios.post('/api/login', {
            username: this.username,
            password: this.password
        });
        const { token } = response.data;
        window.localStorage.setItem("token", token);
    } catch (error) {
        console.error('登录失败', error);
    }
};
</script>

<style scoped>
.image-title-container {
    margin-top: 10vh;
    text-align: center;
    margin-bottom: 20px;
}

.logo-image {
    width: 100px;
    height: 100px;
    margin-bottom: 10px;
}

.title {
    font-size: 24px;
}

.form {
    padding: 10px;
    margin-top: 10vh;
}

.button-container {
    margin: 50px 20px;
    display: flex;
    justify-content: space-between;
    gap: 10px;
}
</style>
