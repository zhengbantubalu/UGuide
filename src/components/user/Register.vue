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
            <van-field v-model="password_confirm" type="password" name="确认密码" label="确认密码" placeholder="确认密码"
                :rules="[{ required: true, message: '请再次填写密码' }, { validator, message: '密码不一致' }]" />
        </van-cell-group>
        <div class="button-container">
            <van-button round block type="primary" native-type="submit">注册</van-button>
        </div>
    </van-form>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { showSuccessToast, showFailToast } from 'vant'
import { register } from '/src/api/user'

const route = useRoute()
const router = useRouter()
const username = ref('')
const password = ref('')
const password_confirm = ref('')

const validator = (val) => {
    return val === password.value
}

onMounted(() => {
    const { username: queryUsername, password: queryPassword } = route.query
    if (queryUsername) {
        username.value = queryUsername
    }
    if (queryPassword) {
        password.value = queryPassword
    }
})

const onSubmit = async () => {
    const { success, message } = await register(username.value, password.value)
    if (success) {
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
