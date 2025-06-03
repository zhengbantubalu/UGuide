<template>
    <div class="page-container">
        <div class="button-container" v-if="!showCustomForm">
            <van-button round block plain type="primary" @click="clickCustomPlan">定制化规划</van-button>
            <van-button round block type="primary" @click="clickPathPlanMulti">全自动规划</van-button>
        </div>
        <van-list v-if="!showCustomForm" class="spot-list" :loading="loading" :finished="finished" @load="onLoadList">
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
                    <van-button class="delete-button" plain type="primary" @click="deleteItem(index)" icon="close" />
                </div>
            </div>
        </van-list>
        <van-picker v-else class="custom-picker" v-model="customFormData" title="定制化规划" :columns="columns"
            @confirm="onPickerConfirm" @cancel="showCustomForm = false" @change="onPickerChange" visible-option-num="5">
            <template #title>
                <div class="picker-title-container">
                    <div>定制化规划</div>
                    <div class="picker-subtitle">{{ customOptionInfo }}</div>
                </div>
            </template>
        </van-picker>
    </div>
</template>

<script setup>
import { pathPlanMulti, pathPlanMultiSa, pathPlanMultiRemain, pathPlanSingleTime } from '/src/api/path'
import { getToGoList, setToGoList } from '/src/api/togo'
import { ref } from 'vue'
import { showFailToast } from 'vant'

const spotList = ref([])
const loading = ref(false)
const finished = ref(false)
const checkedNum = ref(0)
const checkboxLocked = ref(false)
const congestionIndex = ref(0)
const showCustomForm = ref(false)
const customFormData = ref([])
const lastRequestId = ref(0)
const infos = ref([
    '仅规划前两个打卡点之间的路线',
    '先到最近的停车点再前往目的地',
    '不会改变打卡列表的顺序',
    '会根据路程重新排列打卡点顺序',
    '与全自动规划功能一致'
])
const customOptionInfo = ref(infos.value[0])
const columns = [
    {
        text: '最短时间', value: 'time',
        children: [
            { text: '步行', value: 'walk', children: [] },
            { text: '自行车', value: 'bike', children: [] },
            { text: '电动车', value: 'e_bike', children: [] }
        ]
    },
    {
        text: '最短路程', value: 'distance',
        children: [
            {
                text: '优化顺序', value: 'reorder',
                children: [
                    { text: '返回起点', value: 'return' },
                    { text: '不返回起点', value: 'n_return' }
                ]
            },
            {
                text: '保持顺序', value: 'remain',
                children: [
                    { text: '返回起点', value: 'return' },
                    { text: '不返回起点', value: 'n_return' }
                ]
            }
        ]
    }
]
const defaultSpotList = [
    { title: '西门', tag: '大门' },
    { title: '自邮制造', tag: '商店' },
    { title: '主席像', tag: '景观' },
    { title: '图书馆', tag: '建筑' },
    { title: '主教学楼', tag: '教学楼' },
    { title: '学6公寓', tag: '宿舍' },
    { title: '田径场', tag: '运动场' },
    { title: '麦当劳', tag: '餐厅' },
]

const emit = defineEmits(['update-path'], ['delete'], ['update-path-optimizing'])

const onPickerChange = () => {
    if (customFormData.value[0] === 'time') {
        if (customFormData.value[1] === 'e_bike') {
            customOptionInfo.value = infos.value[1]
        } else {
            customOptionInfo.value = infos.value[0]
        }
    } else {
        if (customFormData.value[1] === 'remain') {
            customOptionInfo.value = infos.value[2]
        } else {
            if (customFormData.value[2] === 'n_return') {
                customOptionInfo.value = infos.value[3]
            } else {
                customOptionInfo.value = infos.value[4]
            }
        }
    }
}

const onPickerConfirm = async () => {
    showCustomForm.value = false
    if (customFormData.value[0] === 'time') {
        const start = spotList.value[0].title
        const end = spotList.value[1].title
        const { path, time, distance, elecSpot } = await pathPlanSingleTime(start, end, customFormData.value[1], congestionIndex.value)
        if (customFormData.value[1] === 'e_bike') {
            emit('update-path', path, time, distance, [start, elecSpot, end])
        } else {
            emit('update-path', path, time, distance, [start, end])
        }
    } else {
        const validItems = spotList.value.slice(0, spotList.value.length - checkedNum.value)
        const spotNames = validItems.map(item => item.title)
        if (customFormData.value[1] === 'remain') {
            const returnToStart = customFormData.value[2] === 'return'
            const { path, distance } = await pathPlanMultiRemain(spotNames, returnToStart)
            emit('update-path', path, 0, distance, spotNames)
        } else {
            const returnToStart = customFormData.value[2] === 'return'
            const { path, distance, visitOrder } = await pathPlanMulti(spotNames, returnToStart)
            emit('update-path', path, 0, distance, [spotNames[0], ...visitOrder])
            updateList(visitOrder)

            const requestId = ++lastRequestId.value
            emit('update-path-optimizing', true)
            const { path: optimizedPath, distance: optimizedDistance } = await pathPlanMultiSa(spotNames, returnToStart)
            if (requestId === lastRequestId.value) {
                emit('update-path', optimizedPath, 0, optimizedDistance, [spotNames[0], ...visitOrder])
                updateList(visitOrder)
                emit('update-path-optimizing', false)
            }
        }
    }
}

const spotListToString = () => {
    return spotList.value.map(item =>
        `${item.title}|${item.tag}|${item.checked ? '1' : '0'}`).join(',')
}

const addToSpotList = (name, tag) => {
    spotList.value.unshift({
        title: name,
        tag: tag,
        checked: false
    })
    setToGoList(spotListToString())
}

const deleteFromSpotList = (name) => {
    const index = spotList.value.findIndex(item => item.title === name)
    if (index !== -1) {
        spotList.value.splice(index, 1)
        setToGoList(spotListToString())
    }
}

const isSpotExist = (name) => {
    return spotList.value.some(item => item.title === name)
}

const setCongestionIndex = (index) => {
    congestionIndex.value = index
}

defineExpose({ addToSpotList, deleteFromSpotList, isSpotExist, setCongestionIndex })

const onLoadList = async () => {
    finished.value = true
    loading.value = false
    const { success, data } = await getToGoList()
    if (success) {
        console.log(data)
        if (!data) {
            spotList.value = defaultSpotList
        } else {
            spotList.value = data.split(',').map(item => {
                const [title, tag, checked] = item.split('|')
                return { title, tag, checked: checked === '1' }
            })
        }
        checkedNum.value = spotList.value.filter(item => item.checked).length
    } else {
        spotList.value = defaultSpotList
    }
}

const clickCheckbox = async (index) => {
    const item = spotList.value[index]
    if (checkboxLocked.value) {
        item.checked = !item.checked
        return
    }
    checkboxLocked.value = true
    if (item.checked) {
        await new Promise(resolve => setTimeout(resolve, 300))
        spotList.value.splice(index, 1)
        spotList.value.push(item)
        item.checked = true
        checkedNum.value++
    } else {
        await new Promise(resolve => setTimeout(resolve, 300))
        spotList.value.splice(index, 1)
        spotList.value.unshift(item)
        item.checked = false
        checkedNum.value--
    }
    checkboxLocked.value = false
    setToGoList(spotListToString())
}

const updateList = (visitOrder) => {
    const firstItem = spotList.value[0]
    let lastItems = []
    if (checkedNum.value > 0) {
        lastItems = spotList.value.slice(-checkedNum.value)
    }
    const remainingItems = spotList.value.slice(1, spotList.value.length - checkedNum.value)
    const sortedItems = visitOrder.map(name => {
        return remainingItems.find(item => item.title === name)
    }).filter(item => item)
    spotList.value = [firstItem, ...sortedItems, ...lastItems]
    setToGoList(spotList.value.map(item => `${item.title}|${item.tag}|${item.checked ? '1' : '0'}`).join(','))
}

const clickCustomPlan = () => {
    const validItems = spotList.value.slice(0, spotList.value.length - checkedNum.value)
    const spotNames = validItems.map(item => item.title)
    if (spotNames.length < 2) {
        showFailToast('至少添加2个地点')
        return
    }
    showCustomForm.value = true
}

const clickPathPlanMulti = async () => {
    const validItems = spotList.value.slice(0, spotList.value.length - checkedNum.value)
    const spotNames = validItems.map(item => item.title)
    if (spotNames.length < 2) {
        showFailToast('至少添加2个地点')
        return
    }
    const { path, distance, visitOrder } = await pathPlanMulti(spotNames)
    emit('update-path', path, 0, distance, [spotNames[0], ...visitOrder])
    updateList(visitOrder)

    const requestId = ++lastRequestId.value
    emit('update-path-optimizing', true)
    const { path: optimizedPath, distance: optimizedDistance } = await pathPlanMultiSa(spotNames, true)
    if (requestId === lastRequestId.value) {
        emit('update-path', optimizedPath, 0, optimizedDistance, [spotNames[0], ...visitOrder])
        updateList(visitOrder)
        emit('update-path-optimizing', false)
    }
}

const moveUp = (index) => {
    if (index > 0) {
        const temp = spotList.value[index]
        spotList.value[index] = spotList.value[index - 1]
        spotList.value[index - 1] = temp
        setToGoList(spotListToString())
    }
}

const moveDown = (index) => {
    if (index < spotList.value.length - 1) {
        const temp = spotList.value[index]
        spotList.value[index] = spotList.value[index + 1]
        spotList.value[index + 1] = temp
        setToGoList(spotListToString())
    }
}

const deleteItem = (index) => {
    if (spotList.value[index].checked) {
        checkedNum.value--
    }
    emit('delete', spotList.value[index].title)
    spotList.value.splice(index, 1)
    setToGoList(spotListToString())
}
</script>

<style scoped>
.page-container {
    padding: 5px 5px 50px 5px;
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
    padding-right: 20px;
    gap: 10px;
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

.delete-button {
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

.custom-picker {
    height: 280px;
    border-radius: 10px;
}

.picker-title-container {
    padding-top: 25px;
    display: flex;
    flex-direction: column;
    align-items: center;
    z-index: 2;
}

.picker-subtitle {
    font-size: 12px;
    color: #999;
    margin-top: 4px;
}
</style>