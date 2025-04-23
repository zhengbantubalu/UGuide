<template>
    <div class="page-container">
        <div class="button-container">
            <van-button round block plain type="primary">定制化规划</van-button>
            <van-button round block type="primary" @click="clickPathPlanMulti">全自动规划</van-button>
        </div>
        <van-list class="spot-list" :loading="loading" :finished="finished" @load="onLoad">
            <div class="spot-item" v-for="(item, index) in spotList" :key="index">
                <div class="checkbox-container"><van-checkbox v-model="item.checked" @click="clickCheckbox(index)" />
                </div>
                <div class="spot-content">
                    <div :class="{ 'checked-text': item.checked }" class="spot-title">{{ item.title }}</div>
                    <div class="spot-tags">
                        <van-tag :class="{ 'checked-tag': item.checked }" type="primary">{{ item.tag }}</van-tag>
                    </div>
                </div>
                <div class="button-group">
                    <div class="arrow-button-group">
                        <van-button class="arrow-button" plain type="primary" @click="moveUp(index)"
                            :disabled="index === 0 || index > spotList.length - checkedNum - 1" icon="arrow-up" />
                        <van-button class="arrow-button" plain type="primary" @click="moveDown(index)"
                            :disabled="index >= spotList.length - checkedNum - 1" icon="arrow-down" />
                    </div>
                    <van-button class="button" plain type="primary" @click="deleteItem(index)" icon="close" />
                </div>
            </div>
        </van-list>
    </div>
</template>

<script setup>
import { pathPlanMulti } from '/src/api/path';
import { ref } from 'vue';

const spotList = ref([]);
const loading = ref(false);
const finished = ref(false);
const checkedNum = ref(0);
const checkboxLocked = ref(false);
const emit = defineEmits(['update-path']);

const addToSpotList = (name, tag) => {
    spotList.value.unshift({
        title: name,
        tag: tag,
        checked: false
    });
};

defineExpose({ addToSpotList });

const onLoad = () => {
    loading.value = true;
    try {
        finished.value = true;
    } catch (error) {
        console.error('获取数据时出错:', error);
    } finally {
        loading.value = false;
    }
};

const clickCheckbox = async (index) => {
    const item = spotList.value[index];
    if (checkboxLocked.value) {
        item.checked = !item.checked;
        return;
    }
    checkboxLocked.value = true;
    if (item.checked) {
        await new Promise(resolve => setTimeout(resolve, 300));
        spotList.value.splice(index, 1);
        spotList.value.push(item);
        item.checked = true;
        checkedNum.value++;
    } else {
        await new Promise(resolve => setTimeout(resolve, 300));
        spotList.value.splice(index, 1);
        spotList.value.unshift(item);
        item.checked = false;
        checkedNum.value--;
    }
    checkboxLocked.value = false;
};

const clickPathPlanMulti = async () => {
    try {
        const spotNames = spotList.value.map(item => item.title);
        const response = await pathPlanMulti(spotNames);
        emit('update-path', response.path.map(point => [point.longitude, point.latitude]));
    } catch (error) {
        console.error('路径规划时出错:', error);
    }
}

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

const deleteItem = (index) => {
    if (spotList.value[index].checked) {
        checkedNum.value--;
    }
    spotList.value.splice(index, 1);
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
    height: 80px;
    border-radius: 10px;
    overflow: hidden;
    background-color: white;
    justify-content: space-between;
}

.checkbox-container {
    display: flex;
    align-items: center;
    padding: 0px 30px 0px 10px;
}

.spot-content {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding-right: 20px;
}

.spot-title {
    color: black;
    font-size: 18px;
}

.spot-tags {
    display: flex;
    gap: 5px;
}

.spot-item:first-child {
    background-color: rgb(220, 255, 220);
}

.button-group {
    display: flex;
    align-items: center;
}

.arrow-button-group {
    display: flex;
    flex-direction: column;
    gap: 5px;
}

.arrow-button {
    height: 25px;
    border: none;
    outline: none;
    background-color: transparent;
}

.button {
    height: 30px;
    width: 30px;
    border: none;
    outline: none;
    background-color: transparent;
}

.checked-text {
    text-decoration: line-through;
    color: #999;
}

.checked-tag {
    background-color: #999;
    color: white;
}

.button-container {
    padding: 0px 10px 5px 10px;
    display: flex;
    justify-content: space-between;
    gap: 10px;
}
</style>