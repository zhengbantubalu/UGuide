<template>
    <van-swipe class="swipe" :autoplay="0" lazy-render>
        <van-swipe-item class="image-container" v-for="(image, index) in imageUrls" :key="index">
            <van-image :src="image" fit="contain" />
        </van-swipe-item>
    </van-swipe>
    <div class="diary-container">
        <h1 class="diary-title">{{ title }}</h1>
        <pre class="diary-content">{{ content }}</pre>
    </div>
    <van-action-bar style="padding: 0 30px;">
        <van-action-bar-icon icon="good-job-o" text="点赞" />
        <van-action-bar-icon icon="star" text="已收藏" color="#ff5000" />
        <van-action-bar-button type="primary" text="景点详情" to="/map" />
    </van-action-bar>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { getDiaryDetail } from '/src/api/diary'

const route = useRoute()
const imageUrls = ref([])
const title = ref('')
const content = ref('')

onMounted(async () => {
    const diaryId = route.params.id
    if (diaryId) {
        const res = await getDiaryDetail(diaryId)
        imageUrls.value = res.imageUrls
        title.value = res.title
        content.value = res.content
    }
})
</script>

<style scoped>
.swipe {
    width: 100%;
    aspect-ratio: 16 / 9;
}

.image-container {
    display: flex;
    justify-content: center;
    background-color: white;
}

.diary-container {
    padding: 20px 20px 100px 20px;
}

.diary-title {
    font-size: 24px;
}

.diary-content {
    margin-top: 10px;
    font-size: 16px;
    line-height: 1.6;
    white-space: pre-wrap;
    word-wrap: break-word;
    overflow-wrap: break-word;
    font-family: inherit;
}
</style>