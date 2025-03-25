<script setup>
import { ref, onMounted } from "vue"
import TopBar from "./TopBar.vue"
import BottomBar from "./BottomBar.vue"

// 定义响应式变量 spotList
const spotList = ref([])

// 在组件挂载时发起请求
onMounted(async () => {
    try {
        // 发起 HTTP 请求
        const response = await fetch('/api/scs')
        if (!response.ok) {
            throw new Error('网络响应失败')
        }
        // 解析响应数据
        const data = await response.json()
        // 转换数据格式并赋值给 spotList
        spotList.value = data.map(item => ({
            text: item.name,
            info: item.info || '暂无信息',
            score: item.score,
            tags: item.tags || '暂无标签',
            imgUrl: /*item.imgUr ||*/ '/bupt.ico'
        }))
    } catch (error) {
        console.error('获取数据时出错:', error)
    }
})
</script>

<template>
    <TopBar />
    <div class="spot-list">
        <RouterLink to="/map" v-for="item in spotList" :key="item.scenicSpotId">
            <div class="spot-list-item">
                <img class="spot-image" :src="item.imgUrl" alt="spot image">
                <div class="spot-content">
                    <span class="spot-name">{{ item.text }}</span>
                    <p class="spot-subtitle">{{ item.info }}</p>
                </div>
                <div class="spot-score">{{ item.score }}</div>
            </div>
        </RouterLink>
    </div>
    <BottomBar />
</template>

<style scoped>
.spot-list {
    display: flex;
    flex-direction: column;
    box-sizing: border-box;
    width: 100%;
    padding: 5px 10px;
}

.spot-list-item {
    display: flex;
    overflow: hidden;
    align-items: center;
    justify-content: space-between;
    margin-top: 10px;
    padding: 20px;
    width: 100%;
    height: 120px;
    border-radius: 20px;
    background: #eeffff;
    box-shadow: rgba(0, 0, 0, 0.2) 0px 4px 12px;
}

.spot-image {
    width: 80px;
    height: 80px;
    object-fit: cover;
    margin-right: 20px;
}

.spot-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
}

.spot-subtitle {
    color: #666;
    font-size: 14px;
}

.spot-score {
    color: #ff9900;
    font-size: 20px;
    font-weight: bold;
}

.spot-name {
    color: black;
    font-size: 25px;
    font-weight: bold;
}
</style>