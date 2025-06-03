<template>
    <div class="page-container" ref="containerRef">
        <van-list class="spot-list" :loading="loading" :finished="finished" @load="onLoadList">
            <div class="spot-item" v-for="item in spotList" @click="goToDetail(item.id)">
                <van-image class="spot-image" :src="item.cover" fit="cover" radius="10" />
                <div class="spot-content">
                    <div class="spot-title">{{ item.title }}</div>
                    <div class="spot-info">{{ item.info }}</div>
                    <div class="spot-tags">
                        <van-tag v-for="tag in item.tags" type="primary">{{ tag }}</van-tag>
                    </div>
                </div>
                <div class="spot-score-group">
                    <van-icon class="spot-heat" name="fire">{{ item.heat }}</van-icon>
                    <van-icon class="spot-score" name="award">{{ item.score }}</van-icon>
                </div>
            </div>
        </van-list>
    </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import {
    getRandomSpot, getTopSpot, getRecommendSpot,
    getSpotByNameSearch, getSpotByTagSearch
} from '/src/api/spot'
import { showFailToast } from 'vant'

const spotList = ref([])
const loading = ref(false)
const finished = ref(false)
const router = useRouter()

const searchSpot = async (query, option) => {
    if (query === '') {
        updateSpotList()
        return
    }
    let success = false
    let data = []
    if (option === 'name') {
        ({ success, data } = await getSpotByNameSearch(query))
    }
    else if (option === 'tag') {
        ({ success, data } = await getSpotByTagSearch(query))
    }
    if (success) {
        spotList.value = data
    } else {
        updateSpotList()
        showFailToast('未搜索到结果')
    }
}

const showTopSpot = async () => {
    spotList.value = await getTopSpot()
}

const showRecommendSpot = async () => {
    if (window.localStorage.getItem('login') === 'true') {
        spotList.value = await getRecommendSpot()
    }
    else {
        showFailToast('请先登录')
    }
}

defineExpose({ searchSpot, showTopSpot, showRecommendSpot })

const goToDetail = (id) => {
    router.push(`/spot/detail/${id}`)
}

const updateSpotList = async () => {
    spotList.value = await getRandomSpot()
    finished.value = true
    loading.value = false
}

const onLoadList = async () => {
    loading.value = true
    await updateSpotList()
}
</script>

<style scoped>
.page-container {
    padding: 5px 5px 100px 5px;
    background-color: #f0f0f0;
}

.spot-list {
    display: flex;
    flex-direction: column;
    gap: 5px;
}

.spot-item {
    display: flex;
    align-items: center;
    gap: 20px;
    padding: 0 10px 0px 20px;
    height: 120px;
    border-radius: 10px;
    overflow: hidden;
    background-color: white;
    justify-content: space-between;
}

.spot-image {
    min-width: 80px;
    width: 80px;
    height: 80px;
}

.spot-content {
    max-width: 50%;
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 2px;
}

.spot-title {
    width: 100%;
    color: black;
    font-size: 16px;
    text-overflow: ellipsis;
    white-space: nowrap;
    overflow: hidden;
}

.spot-info {
    color: #666;
    font-size: 12px;
}

.spot-tags {
    display: flex;
    gap: 5px;
}

.spot-score-group {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
    width: 60px;
    min-width: 60px;
}

.spot-heat {
    color: #ff0000;
    font-size: 16px;
    font-weight: bold;
    display: flex;
    gap: 5px;
}

.spot-score {
    color: #ff9900;
    font-size: 16px;
    font-weight: bold;
    display: flex;
    gap: 5px;
}
</style>
