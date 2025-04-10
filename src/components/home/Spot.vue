<template>
    <van-list v-model:loading="loading" :finished="finished" @load="onLoad">
        <van-cell v-for="item in spotList" :title="item.name" to="/map">
            <div class="spot-list-item">
                <img class="spot-image" :src="item.imgUrl" alt="景点图片">
                <div class="spot-content">
                    <div class="spot-title">{{ item.text }}</div>
                    <div class="spot-info">{{ item.info }}</div>
                    <div class="spot-tags">
                        <van-tag v-for="tag in item.tags" type="primary">{{ tag }}</van-tag>
                    </div>
                </div>
                <div class="spot-score">{{ item.score }}</div>
            </div>
        </van-cell>
    </van-list>
</template>

<script setup>
import { ref } from 'vue';
import axios from 'axios';

const spotList = ref([]);
const loading = ref(false);
const finished = ref(false);

const onLoad = async () => {
    loading.value = true;
    try {
        const response = await axios.get('/api_sb/scs');
        const data = response.data;
        spotList.value = data.map(item => ({
            text: item.name,
            info: item.info || '暂无信息',
            score: item.score,
            tags: item.tags == null ? [] : String(item.tags).split(','),
            imgUrl: /*item.imgUr ||*/ '/bupt.ico'
        }));
        if (spotList.value.length >= 40) {
            finished.value = true;
        }
    } catch (error) {
        console.error('获取数据时出错:', error);
    } finally {
        loading.value = false;
    }
}
</script>

<style scoped>
.spot-list-item {
    display: flex;
    align-items: center;
    padding: 10px;
    height: 100px;
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
</style>
