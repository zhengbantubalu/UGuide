<template>
    <div class="page-container">
        <van-field class="text-editor" v-model="editorContent" autosize type="textarea" maxlength="1000"
            placeholder="随手写下感受吧" show-word-limit />
        <div class="uploader-container">
            <van-uploader v-model="fileList" multiple :max-count="8" :preview-full-image="false" upload-text="上传图片"
                class="uploader" />
        </div>
        <div class="button-container">
            <van-button round block plain type="primary" to="/diary/detail">预览</van-button>
            <van-button round block type="primary" @click="handleSubmit">提交</van-button>
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue';
import { showFailToast } from 'vant';

const fileList = ref([]);
const editorContent = ref('');

const handleSubmit = () => {
    if (!editorContent.value.trim()) {
        showFailToast('请输入内容');
        return;
    }
    showToast('提交成功');
    editorContent.value = '';
    fileList.value = [];
};
</script>

<style scoped>
.page-container {
    display: flex;
    flex-direction: column;
    padding: 10px 10px 100px 10px;
}

.text-editor {
    border-radius: 10px;
}

.uploader-container {
    padding: 10px 10px 0px 15px;
}

.button-container {
    padding: 5px;
    display: flex;
    justify-content: space-between;
    gap: 10px;
}
</style>