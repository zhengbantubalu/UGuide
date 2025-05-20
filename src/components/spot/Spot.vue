<template>
    <div class="page-container">
        <van-list class="spot-list" :loading="loading" :finished="finished" @load="onLoadList">
            <div class="spot-item" v-for="item in spotList" @click="goToDetail(item.id)">
                <van-image class="spot-image" :src="item.cover" fit="contain" />
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
import { getAllSpot } from '/src/api/spot'

const spotList = ref([])
const loading = ref(false)
const finished = ref(false)
const router = useRouter()

const goToDetail = (id) => {
    router.push(`/spot/detail/${id}`)
}

const updateSpotList = async () => {
    spotList.value = await getAllSpot()
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
    padding: 0 10px 0px 20px;
    height: 120px;
    border-radius: 10px;
    overflow: hidden;
    background-color: white;
}

.spot-image {
    width: 80px;
    height: 80px;
    margin-right: 20px;
}

.spot-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 2px;
}

.spot-title {
    color: black;
    font-size: 18px;
    font-weight: bold;
}

.spot-info {
    color: #666;
    font-size: 14px;
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
