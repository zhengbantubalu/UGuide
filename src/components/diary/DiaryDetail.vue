<template>
    <van-swipe class="swipe" :autoplay="5000" lazy-render @click="onShowImagePreview" @change="onSwipeChange">
        <van-swipe-item class="image-container" v-for="(image, index) in imageUrls" :key="index">
            <van-image :src="image" fit="contain" />
        </van-swipe-item>
    </van-swipe>
    <div class="diary-container">
        <h1 class="diary-title">{{ title }}</h1>
        <pre class="diary-content">{{ content }}</pre>
        <div v-if="!isPreview" class="rate-container">
            <div style="color: #1989fa; font-size: 12px;">给本篇日记打个分吧</div>
            <van-rate v-model="scoreValue" icon="like" void-icon="like-o" />
            <van-button plain round type="primary" size="small" @click="onScore">提交评分</van-button>
        </div>
    </div>
    <van-action-bar style="padding: 0 30px;">
        <van-action-bar-icon v-if="isStar && !isPreview" icon="star" text="已收藏" color="#ff5000" @click="handleStar" />
        <van-action-bar-icon v-if="!isStar && !isPreview" icon="star-o" text="收藏" @click="handleStar" />
        <van-action-bar-button v-if="!isPreview" type="primary" text="景点详情" @click="onClickSpotDetail" />
        <van-action-bar-button v-if="isPreview" type="primary" text="发布" @click="onSubmit" />
    </van-action-bar>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getDiaryDetail, starDiary, unstarDiary, isDiaryStar } from '/src/api/diary'
import { showFailToast, showSuccessToast, showImagePreview } from 'vant'

const route = useRoute()
const router = useRouter()
const imageUrls = ref([])
const title = ref('')
const content = ref('')
const isStar = ref(false)
const spotId = ref('')
const isLoggedIn = ref(false)
const isPreview = ref(route.path === '/diary/detail/preview')
const scoreValue = ref(0)
const swipePosition = ref(0)

const onSwipeChange = (position) => {
    swipePosition.value = position
}

const onShowImagePreview = () => {
    console.log(swipePosition.value)
    showImagePreview({
        images: imageUrls.value,
        startPosition: swipePosition.value,
        closeable: true
    })
}

const onScore = async () => {
    if (!isLoggedIn.value) {
        showFailToast('请先登录')
        return
    }
    showSuccessToast('感谢您的评分')
}

const onSubmit = async () => {
    const editor = window.editorInstance
    if (editor && editor.onSubmit) {
        await editor.onSubmit()
    }
    router.back()
}

const handleStar = async () => {
    if (!isLoggedIn.value) {
        showFailToast('请先登录')
        return
    }
    const diaryId = route.params.id
    if (!isStar.value) {
        await starDiary(diaryId)
        isStar.value = true
    } else {
        await unstarDiary(diaryId)
        isStar.value = false
    }
    await new Promise(resolve => setTimeout(resolve, 500))
    isStar.value = await isDiaryStar(route.params.id)
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
    isStar.value = await isDiaryStar(route.params.id)
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
    background-color: #f6feff;
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

.rate-container {
    margin: 40px 0px 0px 0px;
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
    gap: 15px
}
</style>