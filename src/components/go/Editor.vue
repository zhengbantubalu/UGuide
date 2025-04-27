<template>
    <div class="page-container">
        <van-field class="title-editor" v-model="editorTitle" center input-align="center" maxlength="20"
            placeholder="请输入游记标题" />
        <div class="uploader-container">
            <van-uploader v-model="fileList" multiple :max-count="8" :preview-full-image="false" upload-text="上传图片"
                class="uploader" />
        </div>
        <van-field class="content-editor" v-model="editorContent" autosize type="textarea" maxlength="1000"
            show-word-limit placeholder="随手写下旅行中的见闻和感受吧" />
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
const editorTitle = ref('');
const editorContent = ref('');

const handleSubmit = () => {
    if (!editorTitle.value.trim()) {
        showFailToast('请输入标题');
        return;
    }
}
</script>

<style scoped>
.page-container {
    display: flex;
    flex-direction: column;
    padding: 10px 10px 100px 10px;
    gap: 10px;
}

.title-editor {
    border-radius: 10px;
    font-size: 16px;
}

.content-editor {
    border-radius: 10px;
}

.content-editor :deep(.van-field__control) {
    overflow-y: hidden;
    touch-action: pan-y;
}

.uploader-container {
    background-color: white;
    border-radius: 10px;
    padding: 10px 10px 2px 10px;
}

.uploader {
    --van-uploader-border-radius: 10px;
    --van-uploader-delete-icon-size: 30px;
    --van-uploader-delete-color: #1989fa;
    --van-uploader-delete-background: #0000;
}

.button-container {
    padding: 0px 5px;
    display: flex;
    justify-content: space-between;
    gap: 10px;
}
</style>