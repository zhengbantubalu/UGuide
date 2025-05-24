<template>
    <div class="page-container">
        <van-list class="spot-list" :loading="loading" :finished="finished" @load="onLoadList">
            <div class="spot-item" v-for="(item, index) in spotList" :key="index" @click="goToDetail(item.id)">
                <van-image class="spot-image" :src="item.cover" fit="contain" />
                <div class="spot-content">
                    <div class="spot-title">{{ item.title }}</div>
                    <div class="spot-info">{{ item.info }}</div>
                    <div class="spot-tags">
                        <van-tag v-for="tag in item.tags" type="primary">{{ tag }}</van-tag>
                    </div>
                </div>
                <div class="arrow-button-group">
                    <van-button class="arrow-button" plain type="primary" @click.stop="moveUp(index)"
                        :disabled="index === 0" icon="arrow-up" />
                    <van-button class="arrow-button" plain type="primary" @click.stop="moveDown(index)"
                        :disabled="index === spotList.length - 1" icon="arrow-down" />
                </div>
            </div>
        </van-list>
    </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { getStarSpot, setStarSpot } from '/src/api/spot'

const spotList = ref([])
const loading = ref(false)
const finished = ref(false)
const router = useRouter()

const goToDetail = (id) => {
    router.push(`/spot/detail/${id}`)
}

const updateSpotList = async () => {
    spotList.value = await getStarSpot()
    loading.value = false
    finished.value = true
}

const onLoadList = async () => {
    loading.value = true
    await updateSpotList()
}

const moveUp = (index) => {
    if (index > 0) {
        const temp = spotList.value[index]
        spotList.value[index] = spotList.value[index - 1]
        spotList.value[index - 1] = temp
        const ids = spotList.value.map(item => item.id).join(',')
        setStarSpot(ids)
    }
}

const moveDown = (index) => {
    if (index < spotList.value.length - 1) {
        const temp = spotList.value[index]
        spotList.value[index] = spotList.value[index + 1]
        spotList.value[index + 1] = temp
        const ids = spotList.value.map(item => item.id).join(',')
        setStarSpot(ids)
    }
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
    padding: 0px 20px;
    height: 120px;
    border-radius: 10px;
    overflow: hidden;
    background-color: white;
    justify-content: space-between;
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

.spot-score {
    color: #ff9900;
    font-size: 20px;
    font-weight: bold;
}

.spot-item:first-child {
    background-color: rgb(220, 255, 220);
}

.arrow-button-group {
    display: flex;
    flex-direction: column;
    gap: 5px;
}

.arrow-button {
    border: none;
    outline: none;
    background-color: transparent;
}
</style>