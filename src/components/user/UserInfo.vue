<template>
    <div class="cell-group-container">
        <van-cell-group inset>
            <van-cell center title="头像" is-link @click="editAvatar">
                <van-image round class="user-avatar" src="http://47.93.189.31/res/bupt.ico" alt="用户头像" />
            </van-cell>
            <van-cell center title="用户名" is-link :value="userName" @click="editUsername" />
            <van-cell center title="密码" is-link @click="editPassword" />
        </van-cell-group>
    </div>
    <div class="button-container">
        <van-button round block plain type="danger" @click="logout">退出登录</van-button>
    </div>
    <van-popup v-model:show="showAvatar" round position="top" class="popup">
        <van-form @submit="onAvatarSubmit">
            <div class="uploader-container">
                <van-uploader v-model="fileList" reupload :deletable="false" :after-read="afterRead" :max-count="1"
                    preview-size="300px" />
            </div>
            <div class="button-container">
                <van-button round block type="primary" native-type="submit" :disabled="!avatarOk">提交</van-button>
            </div>
        </van-form>
    </van-popup>
    <van-popup v-model:show="showUsername" round position="top" class="popup">
        <van-form @submit="onUsernameSubmit">
            <van-cell-group inset>
                <van-field v-model="username" name="新用户名" label="新用户名" placeholder="新用户名"
                    :rules="[{ required: true, message: '请填写新用户名' }]" />
            </van-cell-group>
            <div class="button-container">
                <van-button round block type="primary" native-type="submit">提交</van-button>
            </div>
        </van-form>
    </van-popup>
    <van-popup v-model:show="showPassword" round position="top" class="popup">
        <van-form @submit="onPasswordSubmit">
            <van-cell-group inset>
                <van-field v-model="old_password" type="password" name="旧密码" label="旧密码" placeholder="旧密码"
                    :rules="[{ required: true, message: '请填写旧密码' }]" />
                <van-field v-model="new_password" type="password" name="新密码" label="新密码" placeholder="新密码"
                    :rules="[{ required: true, message: '请填写新密码' }]" />
                <van-field v-model="new_password_confirm" type="password" name="确认新密码" label="确认新密码" placeholder="确认新密码"
                    :rules="[{ required: true, message: '请再次填写新密码' }, { validator, message: '密码不一致' }]" />
            </van-cell-group>
            <div class="button-container">
                <van-button round block type="primary" native-type="submit">提交</van-button>
            </div>
        </van-form>
    </van-popup>
</template>

<script setup>
import axios from 'axios';
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { showSuccessToast, showFailToast } from 'vant';

const router = useRouter();
const avatarOk = ref(false);
const username = ref('');
const old_password = ref('');
const new_password = ref('');
const new_password_confirm = ref('');
const fileList = ref([]);
const userName = ref('');

onMounted(async () => {
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
            showFailToast('请先登录');
            window.localStorage.setItem('login', false);
            router.back();
        }
    } catch (error) {
        console.error('获取用户信息时出错:', error);
        showFailToast('获取用户信息时出错');
    }
});

const onAvatarSubmit = async () => {
    const formData = new FormData();
    formData.append('file', fileList.value[0].file);
    try {
        const response = await axios.post('/api/upload/user/avatar', formData);
        const { success, message, fileUrl } = response.data;
        if (success) {
            showSuccessToast(message);
            // updateAvatar(fileUrl); 
            showAvatar.value = false;
        } else {
            showFailToast(message);
        }
    } catch (error) {
        console.error('上传时出错:', error);
        showFailToast('上传时出错');
    }
};

const onUsernameSubmit = async () => {

}

const onPasswordSubmit = async () => {
    try {
        const old_token = window.localStorage.getItem('token');
        const response = await axios.patch('/api/data/users/password', {
            oldPassword: old_password.value,
            newPassword: new_password.value
        }, {
            headers: {
                Authorization: `${old_token}`
            }
        });
        const { success, message, data } = response.data;
        if (success) {
            window.localStorage.setItem('token', data);
            showPassword.value = false;
            showSuccessToast(message);
        } else {
            showFailToast(message);
            console.error(response.data);
        }
    } catch (error) {
        console.error('修改密码时出错:', error);
        showFailToast('修改密码时出错');
    }
}

const afterRead = (file) => {
    avatarOk.value = true;
};

const validator = (val) => {
    return val === new_password.value;
};

const showAvatar = ref(false);
const editAvatar = () => {
    showAvatar.value = true;
};

const showUsername = ref(false);
const editUsername = () => {
    showUsername.value = true;
};

const showPassword = ref(false);
const editPassword = () => {
    showPassword.value = true;
};

const logout = () => {
    window.localStorage.setItem('login', false);
    window.localStorage.removeItem('token');
    showSuccessToast('退出成功');
    router.back();
};
</script>

<style scoped>
.cell-group-container {
    padding-top: 20px;
}

.user-avatar {
    width: 60px;
    height: 60px;
}

.button-container {
    padding: 20px 30px;
}

.uploader-container {
    padding: 10px;
    display: flex;
    justify-content: center;
}

.popup {
    padding: 20px 0px;
}
</style>
