<template>
    <div class="image-title-container">
        <van-image class="logo-image" round src="http://47.93.189.31/res/bupt.ico" />
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
            <van-button round block plain type="primary" native-type="button"
                :to="{ name: 'Register', query: { username: username, password: password } }">注册</van-button>
            <van-button round block type="primary" native-type="submit">登录</van-button>
        </div>
    </van-form>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { showSuccessToast, showFailToast } from 'vant'
import { login } from '/src/api/user'

const router = useRouter()
const username = ref('')
const password = ref('')

const onSubmit = async () => {
    const { success, message } = await login(username.value, password.value)
    if (success) {
        window.localStorage.setItem('login', true)
        showSuccessToast(message)
        router.back()
    } else {
        showFailToast(message)
    }
}
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
    padding: 10px 20px;
    display: flex;
    justify-content: space-between;
    gap: 10px;
}
</style>
