<template>
    <van-form @submit="onSubmit" class="page-container">
        <van-field class="title-editor" v-model="editorTitle" center input-align="center" maxlength="15"
            placeholder="请输入游记标题" :rules="[{ required: true, message: '请输入标题' }]" />
        <div class="uploader-container">
            <van-uploader v-model="fileList" multiple :max-count="8" :preview-full-image="false" upload-text="上传图片"
                class="uploader" />
        </div>
        <van-field class="content-editor" v-model="editorContent" autosize type="textarea" maxlength="1000"
            show-word-limit placeholder="随手写下旅行中的见闻和感受吧" :rules="[{ validator, message: '请至少填写30字' }]" />
        <div class="button-container">
            <van-button round block plain type="primary" to="/diary/detail/1">预览</van-button>
            <van-button round block type="primary" native-type="submit">提交</van-button>
        </div>
    </van-form>
</template>

<script setup>
import { ref } from 'vue'
import { showSuccessToast, showFailToast } from 'vant'
import { createDiary } from '/src/api/diary'
import { uploadDiaryCover } from '/src/api/file'
import { useRouter } from 'vue-router'

const fileList = ref([])
const editorTitle = ref('')
const editorContent = ref('')
const router = useRouter()

const validator = (val) => {
    return val.length >= 30
}

const onSubmit = async () => {
    if (fileList.value.length === 0) {
        showFailToast('至少添加1张图片')
        return
    }
    uploadDiaryCover(fileList.value[0].file).then(res => {
        if (res.success) {
            console.log(res.imgUrl)
            createDiary(editorTitle.value, editorContent.value, res.imgUrl).then(res => {
                if (res.success) {
                    showSuccessToast('发布成功')
                    console.log(res.id)
                    if (res.id != -1) {
                        router.push(`/diary/detail/${res.id}`)
                    }
                } else {
                    showFailToast(res.message)
                }
            })
        } else {
            showFailToast(res.message)
        }
    })
}
</script>

<style scoped>
.page-container {
    display: flex;
    flex-direction: column;
    padding: 5px 5px 55px 5px;
    gap: 5px;
}

.title-editor {
    border-radius: 10px;
    font-size: 16px;
}

.content-editor {
    border-radius: 10px;
    --van-field-word-limit-line-height: 10px;
}

.content-editor :deep(.van-field__control) {
    overflow-y: hidden;
    touch-action: pan-y;
}

.uploader-container {
    background-color: white;
    border-radius: 10px;
    padding: 8px 0px 0px calc((100% - 344px) / 2);
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