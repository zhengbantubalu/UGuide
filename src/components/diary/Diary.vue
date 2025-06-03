<template>
    <div class="page-container" ref="containerRef">
        <van-list class="diary-list" :loading="loading" :finished="finished" @load="onLoadList">
            <div class="diary-item" v-for="item in diaryList" @click="goToDetail(item.id)" :key="item.id">
                <van-image class="diary-image" :src="item.coverUrl" fit="cover" />
                <div class="diary-content">
                    <div class="diary-title">{{ item.title }}</div>
                    <div class="diary-info">
                        <van-icon class="diary-username" name="user-o">{{ item.username }}</van-icon>
                        <div class="diary-subinfo">
                            <van-icon class="diary-username" name="eye-o">{{ item.num }}</van-icon>
                            <van-icon class="diary-username" name="award-o">{{ item.score }}</van-icon>
                        </div>
                    </div>
                </div>
            </div>
        </van-list>
    </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
    getRandomDiary, getTopDiary, getRecommendDiary, getOwnDiary, getHistoryDiary,
    getStarDiary, getDiaryBySpotID, getDiaryBySemanticSearch,
    getDiaryByTitleSearch, getDiaryByExactSearch
} from '/src/api/diary'
import { showFailToast } from 'vant'

const props = defineProps({
    type: {
        type: String,
        required: true,
        default: 'all'
    }
})

const diaryList = ref([])
const loading = ref(false)
const finished = ref(false)
const router = useRouter()
const route = useRoute()

const searchDiary = async (query, option) => {
    if (query === '') {
        updateDiaryList()
        return
    }
    let success = false
    let data = []
    if (option === 'semantic') {
        ({ success, data } = await getDiaryBySemanticSearch(query))
    }
    else if (option === 'title') {
        ({ success, data } = await getDiaryByTitleSearch(query))
    }
    else if (option === 'exact') {
        ({ success, data } = await getDiaryByExactSearch(query))
    }
    if (success) {
        diaryList.value = data
    } else {
        updateDiaryList()
        showFailToast('未搜索到结果')
    }
}

const showTopDiary = async () => {
    diaryList.value = await getTopDiary()
}

const showRecommendDiary = async () => {
    if (window.localStorage.getItem('login') === 'true') {
        diaryList.value = await getRecommendDiary()
    }
    else {
        showFailToast('请先登录')
    }
}

defineExpose({ searchDiary, showTopDiary, showRecommendDiary })

const goToDetail = (id) => {
    router.push(`/diary/detail/${id}`)
}

const updateDiaryList = async () => {
    if (props.type === 'own') {
        diaryList.value = await getOwnDiary()
    } else if (props.type === 'star') {
        diaryList.value = await getStarDiary()
    } else if (props.type === 'history') {
        diaryList.value = await getHistoryDiary()
    } else if (router.currentRoute.value.path === '/home/diary') {
        diaryList.value = await getRandomDiary()
    } else if (props.type === 'spot') {
        diaryList.value = await getDiaryBySpotID(route.params.id)
    }
    loading.value = false
    finished.value = true
}

const onLoadList = async () => {
    loading.value = true
    await updateDiaryList()
}
</script>

<style scoped>
.page-container {
    padding: 5px 0px 100px 5px;
    background-color: #f0f0f0;
}

.diary-list {
    display: flex;
    flex-wrap: wrap;
    gap: 5px;
}

.diary-item {
    width: calc(50% - 5px);
    aspect-ratio: 5 / 6;
    position: relative;
    border-radius: 10px;
    overflow: hidden;
    background-color: white;
}

.diary-image {
    width: 100%;
    height: 60%;
}

.diary-content {
    padding: 0px 10px 20px 10px;
    background-color: white;
    height: 40%;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    align-items: flex-start;
}

.diary-title {
    color: black;
    font-size: 16px;
    word-wrap: break-word;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    overflow: hidden;
    text-overflow: ellipsis;
}

.diary-info {
    width: 100%;
    display: flex;
    justify-content: space-between;
}

.diary-subinfo {
    display: flex;
    gap: 5px;
}

.diary-username {
    color: gray;
    font-size: 12px;
    display: flex;
    gap: 3px;
}
</style>