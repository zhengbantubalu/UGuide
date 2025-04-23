<template>
    <van-popup class="popup" v-model:show="showPopup" round position="bottom" :overlay="false"
        :close-on-click-overlay="false" :style="{ height: `${drawerHeight}%`, transition: 'transform 0.3s' }">
        <div class="handle-bar" @touchstart="handleTouchStart" @touchmove="handleTouchMove" @touchend="handleTouchEnd">
            <div class="handle"></div>
            <van-tabs v-model:active="activeTab" swipeable>
                <van-tab title="打卡"></van-tab>
                <van-tab title="游记"></van-tab>
                <van-tab title="参考"></van-tab>
            </van-tabs>
        </div>
        <div class="tab-page">
            <van-tabs v-model:active="activeTab" swipeable :show-header="false">
                <van-tab>
                    <ToGoList ref="toGoListRef" @update-path="updatePath" />
                </van-tab>
                <van-tab>
                    <Editor />
                </van-tab>
                <van-tab>
                    <Diary />
                </van-tab>
            </van-tabs>
        </div>
    </van-popup>
</template>

<script setup>
import { ref } from 'vue';
import Diary from '../diary/Diary.vue';
import ToGoList from './ToGoList.vue';
import Editor from './Editor.vue';

const showPopup = ref(true);
const activeTab = ref(0);
const positions = [15, 50, 95];
const drawerHeight = ref(positions[1]);
const startY = ref(0);
const toGoListRef = ref(null);
const emit = defineEmits(['position-change'], ['update-path']);

const addToSpotList = (name, tag) => {
    toGoListRef.value.addToSpotList(name, tag);
};

defineExpose({ addToSpotList });

const updatePath = (coordinates) => {
    emit('update-path', coordinates);
}

const handleTouchStart = (e) => {
    startY.value = e.touches[0].clientY;
};

const handleTouchMove = (e) => {
    const currentY = e.touches[0].clientY;
    const deltaY = startY.value - currentY;
    const newHeight = drawerHeight.value + (deltaY / window.innerHeight) * 100;
    drawerHeight.value = Math.max(0, Math.min(100, newHeight));
    startY.value = currentY;
};

const handleTouchEnd = () => {
    const closest = positions.reduce((prev, curr) =>
        Math.abs(curr - drawerHeight.value) < Math.abs(prev - drawerHeight.value) ? curr : prev
    );
    drawerHeight.value = closest;
    emit('position-change', closest);
};
</script>

<style scoped>
.popup {
    height: '${drawerHeight}%';
    background-color: #f0f0f0;
    box-shadow: 0 -4px 12px rgba(0, 0, 0, 0.05);
}

.handle-bar {
    position: absolute;
    top: 0;
    z-index: 1;
    width: 100%;
    height: 60px;
    background-color: white;
}

.handle {
    width: 50px;
    height: 4px;
    border-radius: 2px;
    background-color: rgb(185, 185, 185);
    margin: 7px auto 0px auto;
}

.tab-page {
    padding-top: 60px;
    height: 100%;
    overflow: auto;
}
</style>