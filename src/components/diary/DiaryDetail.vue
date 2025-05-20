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
        <van-action-bar-icon v-if="isStar" icon="star" text="已收藏" color="#ff5000" @click="handleStar" />
        <van-action-bar-icon v-else icon="star-o" text="收藏" @click="handleStar" />
        <van-action-bar-button type="primary" text="景点详情" @click="onClickSpotDetail" />
    </van-action-bar>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getDiaryDetail, starDiary } from '/src/api/diary'
import { showFailToast } from 'vant'

const route = useRoute()
const router = useRouter()
const imageUrls = ref([])
const title = ref('')
const content = ref('')
const isStar = ref(false)
const spotId = ref('')
const isLoggedIn = ref(false)

const handleStar = async () => {
    if (!isLoggedIn.value) {
        showFailToast('请先登录')
        return
    }
    const diaryId = route.params.id
    if (diaryId) {
        await starDiary(diaryId)
        isStar.value = !isStar.value
    }
}

const onClickSpotDetail = () => {
    if (spotId.value) {
        router.push(`/spot/detail/${spotId.value}`)
    } else {
        const random = Math.floor(Math.random() * 20) + 1
        router.push(`/spot/detail/${random}`)
    }
}

onMounted(async () => {
    isLoggedIn.value = (window.localStorage.getItem('login') === 'true')
    if (route.path === '/diary/detail/preview') {
        title.value = localStorage.getItem('draftTitle')
        content.value = localStorage.getItem('draftContent')
        imageUrls.value = localStorage.getItem('draftImageUrls').split(',')
    } else {
        const diaryId = route.params.id
        if (diaryId) {
            const res = await getDiaryDetail(diaryId)
            imageUrls.value = res.imageUrls
            title.value = res.title
            content.value = res.content
            spotId.value = res.spotId
        }
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