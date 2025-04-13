<template>
    <div class="page-container">
        <van-list class="spot-list" :loading="loading" :finished="finished" @load="onLoad">
            <div class="spot-item" v-for="(item, index) in spotList" :key="index" @click="goToMap">
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
import { ref } from 'vue';
import axios from 'axios';
import { useRouter } from 'vue-router';

const spotList = ref([]);
const loading = ref(false);
const finished = ref(false);
const router = useRouter();

const goToMap = () => {
    router.push('/map');
};

const onLoad = async () => {
    loading.value = true;
    try {
        const response = await axios.get('/api/data/scs');
        const data = response.data;
        spotList.value = data.map(item => ({
            title: item.name,
            info: item.info || '暂无信息',
            score: item.score,
            tags: item.tags == null ? [] : String(item.tags).split(','),
            cover: item.imgUr || 'http://47.93.189.31/res/bupt.ico'
        }));
        finished.value = true;
    } catch (error) {
        console.error('获取数据时出错:', error);
    } finally {
        loading.value = false;
    }
};

const moveUp = (index) => {
    if (index > 0) {
        const temp = spotList.value[index];
        spotList.value[index] = spotList.value[index - 1];
        spotList.value[index - 1] = temp;
    }
};

const moveDown = (index) => {
    if (index < spotList.value.length - 1) {
        const temp = spotList.value[index];
        spotList.value[index] = spotList.value[index + 1];
        spotList.value[index + 1] = temp;
    }
};
</script>

<style scoped>
.page-container {
    background-color: #f0f0f0;
    padding: 5px 5px 100px 5px;
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
    /* 让内容和箭头按钮分开 */
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
    height: 150px;
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
