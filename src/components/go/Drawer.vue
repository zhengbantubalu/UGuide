<template>
    <van-popup class="popup" v-model:show="showPopup" round position="bottom" :overlay="false"
        :close-on-click-overlay="false"
        :style="{ height: `${drawerHeight}px`, transition: `${drawerTransition ? 'height 0.3s ease' : ''}` }">
        <div class="handle-bar" @touchstart="handleTouchStart" @touchmove="handleTouchMove" @touchend="handleTouchEnd">
            <div class="add-container">
                <van-button v-if="(!isEditing && !destinationAdded) || (isEditing && !inputName)" class="add-button"
                    round type="primary" icon="plus" @click="clickAddDestination"
                    :disabled="!(destinationName || destinationTag) || !destinationExist || (isEditing && !inputName)" />
                <van-button v-else-if="(!isEditing && destinationAdded)" class="add-button" round type="primary"
                    icon="minus" @click="clickDeleteDestination" />
                <van-button v-else class="add-button" round type="primary" icon="success" @click="clickConfirmEdit" />
                <div class="select-container" @click="switchToEditing">
                    <p class="selected-name" v-if="!isEditing">{{ destinationName }}</p>
                    <van-form v-else @submit="clickConfirmEdit">
                        <van-field ref="inputFieldRef" class="edit-field" v-model="inputName"
                            placeholder="请 输入/选中 目的地" />
                    </van-form>
                    <van-tag type="primary" :show="!isEditing && destinationExist">{{ destinationTag }}</van-tag>
                    <van-tag plain type="danger"
                        :show="!isEditing && destinationExist && destinationAdded">已添加</van-tag>
                    <van-tag plain type="danger" :show="!isEditing && !destinationExist">地点不存在</van-tag>
                </div>
            </div>
            <div class="arrow-button-container">
                <van-icon class="arrow-button" name="arrow-up" size="25" @click="drawerUp" />
                <van-icon class="arrow-button" name="arrow-down" size="25" @click="drawerDown" />
            </div>
        </div>
        <div class="tab-page">
            <van-tabs v-model:active="activeTab" swipeable :show-header="false">
                <van-tab>
                    <ToGoList ref="toGoListRef" @update-path="updatePath" @delete="updateExist" />
                </van-tab>
                <van-tab>
                    <Editor />
                </van-tab>
                <van-tab>
                    <Diary />
                </van-tab>
            </van-tabs>
        </div>
        <van-tabs class="tabs" v-model:active="activeTab" swipeable>
            <van-tab title="打卡"></van-tab>
            <van-tab title="游记"></van-tab>
            <van-tab title="参考"></van-tab>
        </van-tabs>
    </van-popup>
</template>

<script setup>
import { ref, nextTick } from 'vue';
import Diary from '../diary/Diary.vue';
import ToGoList from './ToGoList.vue';
import Editor from './Editor.vue';

const showPopup = ref(true);
const activeTab = ref(0);
const positions = [154, Math.floor(window.innerHeight * 0.5),
    Math.floor(window.innerHeight * 0.95)];
const drawerHeight = ref(positions[1]);
const drawerTransition = ref(true);
const toGoListRef = ref(null);
const destinationName = ref(null);
const destinationTag = ref(null);
const destinationAdded = ref(false);
const destinationExist = ref(true);
const isEditing = ref(true);
const inputName = ref('');
const inputFieldRef = ref(null);

const emit = defineEmits(['position-change'], ['update-path'], ['select-destination']);

const updateDestination = (name, tag) => {
    if (name && tag) {
        destinationAdded.value = toGoListRef.value.isSpotExist(name);
        isEditing.value = false;
        destinationExist.value = true;
    } else {
        destinationAdded.value = false;
        isEditing.value = true;
        inputName.value = '';
    }
    destinationName.value = name;
    destinationTag.value = tag;
}

defineExpose({ updateDestination });

const updatePath = (coordinates) => {
    emit('update-path', coordinates);
}

const updateExist = (name) => {
    if (destinationName.value === name) {
        destinationAdded.value = false;
    }
}

const switchToEditing = () => {
    isEditing.value = true;
    inputName.value = destinationExist.value ? '' : destinationName.value;
    nextTick(() => {
        if (inputFieldRef.value) {
            inputFieldRef.value.focus();
        }
    })
}

const clickDeleteDestination = () => {
    toGoListRef.value.deleteFromSpotList(destinationName.value);
    destinationAdded.value = false;
}

const clickConfirmEdit = () => {
    if (!inputName.value) {
        return;
    }
    destinationAdded.value = false;
    isEditing.value = false;
    destinationName.value = inputName.value;
    emit('select-destination', destinationName.value, (exists) => {
        if (exists) {
            destinationExist.value = true;
            inputName.value = '';
        } else {
            destinationExist.value = false;
        }
    })
}

const clickAddDestination = () => {
    if (destinationName.value && destinationTag.value) {
        toGoListRef.value.addToSpotList(destinationName.value, destinationTag.value)
        destinationAdded.value = toGoListRef.value.isSpotExist(destinationName.value);
    }
}

const drawerUp = () => {
    if (drawerHeight.value < positions[positions.length - 1]) {
        const index = positions.indexOf(drawerHeight.value);
        drawerHeight.value = positions[index + 1];
        emit('position-change', index + 1);
    }
}

const drawerDown = () => {
    if (drawerHeight.value > positions[0]) {
        const index = positions.indexOf(drawerHeight.value);
        drawerHeight.value = positions[index - 1];
        emit('position-change', index - 1);
    }
}

const handleTouchStart = () => {
    drawerTransition.value = false;
}

const handleTouchMove = (e) => {
    drawerHeight.value = Math.max(100, window.innerHeight - e.touches[0].clientY);
}

const handleTouchEnd = () => {
    drawerTransition.value = true;
    const closest = positions.reduce((prev, curr) =>
        Math.abs(curr - drawerHeight.value) < Math.abs(prev - drawerHeight.value) ? curr : prev
    );
    drawerHeight.value = closest;
    emit('position-change', positions.indexOf(closest));
}
</script>

<style scoped>
.popup {
    background-color: #f0f0f0;
    box-shadow: 0 -4px 12px rgba(0, 0, 0, 0.05);
    margin-top: 50px;
}

.handle-bar {
    position: absolute;
    top: 0;
    display: flex;
    align-items: center;
    width: 100%;
    height: 50px;
    background-color: white;
    margin-top: 0px;
    padding: 0 15px;
    z-index: 1;
    justify-content: space-between;
}

.handle {
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
    color: rgb(185, 185, 185);
}

.add-container {
    display: flex;
    align-items: center;
    gap: 10px;
}

.add-button {
    height: 35px;
    width: 35px;
}

.select-container {
    display: flex;
    align-items: center;
    gap: 10px;
}

.selected-name {
    font-size: 14px;
}

.edit-field {
    padding: 0px;
}

.arrow-button-container {
    display: flex;
    align-items: center;
    margin-right: 10px;
    gap: 20px;
}

.arrow-button {
    color: rgb(185, 185, 185);
}

.tab-page {
    padding-top: 50px;
    height: 100%;
    overflow: auto;
    background-color: #f0f0f0;
}

.tabs {
    position: absolute;
    bottom: 0;
    height: 50px;
    width: 100%;
    z-index: 1;
    background-color: white;
}
</style>