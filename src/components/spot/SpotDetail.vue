<template>
    <div class="page-container">
        <div class="title-container">
            <van-image class="spot-image" :src="cover" fit="contain" />
            <div class="title">{{ title }}</div>
        </div>
        <div class="map-container">
            <div id="map" class="map" :style="{
                transform: `scale(${scale}) translateY(${translateY}%)`,
                transition: 'transform 0.5s ease'
            }"></div>
        </div>
        <div class="legend-container">
            <div class="legend-row">
                <van-button class="legend-item" v-for="(config, type) in pointLegendConfig" :key="type"
                    @click="switchPointType(type)" :style="{ backgroundColor: config.color }"
                    :class="{ active: displayPointTypes.includes(type) }">
                    {{ config.tag }}
                </van-button>
            </div>
            <div class="legend-row">
                <van-button class="legend-item" v-for="(config, type) in legendConfig" :key="type"
                    @click="switchLegend(type)" :style="{ backgroundColor: config.color }"
                    :class="{ active: legendActive.includes(type) }">
                    {{ config.tag }}
                </van-button>
            </div>
        </div>
        <van-action-bar style="padding: 0 30px;">
            <van-action-bar-icon v-if="isStar" icon="star" text="已收藏" color="#ff5000" @click="handleStar" />
            <van-action-bar-icon v-else icon="star-o" text="收藏" @click="handleStar" />
            <van-action-bar-button type="primary" text="相关日记" @click="onClickDiaryAbout" />
        </van-action-bar>
        <van-popup class="popup" v-model:show="showDiaryPopup" position="bottom" round :style="{ height: '50%' }">
            <div class="popup-header">
                <div class="popup-title">相关日记</div>
            </div>
            <div class="popup-content">
                <Diary type="spot" />
            </div>
        </van-popup>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { fetchMapJson } from '/src/api/map'
import { getDistanceOrder } from '/src/api/path'
import { getSpotByID } from '/src/api/spot'
import { useRoute, useRouter } from 'vue-router'
import * as echarts from 'echarts'
import { showFailToast } from 'vant'
import Diary from '/src/components/diary/Diary.vue'

const defaultCenter = ref([116.3519, 39.9605])
const defaultZoom = ref(1.1)
const scale = ref(1)
const translateY = ref(0)
const mapChart = ref(null)
const roadGeoJSON = ref(null)
const buildingGeoJSON = ref(null)
const pointGeoJSON = ref(null)
const congestionIndex = ref(1)
const congestionColor = ['#00ff00', '#ffcc00', '#ff0000']
const displayPointTypes = ref(['Scenery', 'Gate'])
const legendActive = ref(['Essential'])
const selectedPoint = ref(null)
const selectedBuilding = ref(null)
const showLabelOrder = ref(false)
const title = ref('')
const cover = ref('')
const route = useRoute()
const isLoggedIn = ref(false)
const isStar = ref(false)
const router = useRouter()

//所有标点种类
const pointTypeConfig = {
    'SportsGround': { tag: '运动场', color: '#e6194b' },
    'Gate': { tag: '大门', color: '#f58231' },
    'Dormitory': { tag: '宿舍', color: '#ffe119' },
    'Scenery': { tag: '景观', color: '#3cb44b' },
    'Building': { tag: '建筑', color: '#aaffc3' },
    'Classroom': { tag: '教学楼', color: '#42d4f4' },
    'Canteen': { tag: '餐厅', color: '#911eb4' },
    'Shop': { tag: '商店', color: '#f032e6' },
    'ElecParkSpot': { tag: '停车点', color: '#bfef45' },
    'Toilet': { tag: '卫生间', color: '#dcbeff' }
}

//第一行图例
const pointLegendConfig = {
    'SportsGround': { tag: '运动场', color: '#e6194b' },
    'Gate': { tag: '大门', color: '#f58231' },
    'Dormitory': { tag: '宿舍', color: '#ffe119' },
    'Scenery': { tag: '景观', color: '#3cb44b' },
    'Classroom': { tag: '教学楼', color: '#42d4f4' },
    'Canteen': { tag: '餐厅', color: '#911eb4' },
    'Shop': { tag: '商店', color: '#f032e6' }
}

//第二行图例
const legendConfig = {
    'ElecParkSpot': { tag: '停车点', color: '#bfef45' },
    'Toilet': { tag: '卫生间', color: '#dcbeff' },
    'Essential': { tag: '必要标点', color: '#800000' },
    'All': { tag: '全部标点', color: '#000075' }
}
const legendTagToType = Object.fromEntries(
    Object.entries(legendConfig).map(([type, config]) => [config.tag, type])
)

//选中第一行图例项
const switchPointType = (type) => {
    showLabelOrder.value = false
    legendActive.value = []
    displayPointTypes.value = [type]
    updatePoints()
}

//选中第二行图例项
const switchLegend = async (type) => {
    showLabelOrder.value = false
    if (type === 'All') {
        legendActive.value = ['All']
        displayPointTypes.value = Object.keys(pointTypeConfig).filter(key => key !== 'All')
    } else if (type === 'Essential') {
        legendActive.value = [type]
        displayPointTypes.value = ['Gate', 'Scenery']
    } else if (type === 'ElecParkSpot') {
        legendActive.value = [type]
        displayPointTypes.value = [type]
        await updatePointOrder(type)
    } else if (type === 'Toilet') {
        legendActive.value = [type]
        displayPointTypes.value = [type]
        await updatePointOrder(type)
    }
    updatePoints()
}

//按类别筛选标点时进行排序
const updatePointOrder = async (type) => {
    if (selectedPoint.value || selectedBuilding.value) {
        let selectedPosition = null
        if (selectedPoint.value) {
            //如果选中标点属于即将进行排序的种类，则不排序
            let pointType = pointGeoJSON.value.features.find(
                f => f.properties.name === selectedPoint.value.name)?.pointType
            if (pointType === type) {
                showLabelOrder.value = false
                return
            }
            selectedPosition = selectedPoint.value.value
        } else {
            selectedPosition = selectedBuilding.value.value
        }
        //发送排序请求
        const order = await getDistanceOrder(type, selectedPosition.slice(0, 2))
        const typeSpots = pointGeoJSON.value.features
            .filter(f => f.pointType === type)
        typeSpots.sort((a, b) => {
            const indexA = order.indexOf(a.properties.name)
            const indexB = order.indexOf(b.properties.name)
            return indexA - indexB
        })
        typeSpots.forEach((spot, index) => {
            spot.order = index + 1
        })
        showLabelOrder.value = true
    } else {
        showLabelOrder.value = false
    }
}

const showDiaryPopup = ref(false)

const onClickDiaryAbout = () => {
    showDiaryPopup.value = true
}

const handleStar = async () => {
    if (!isLoggedIn.value) {
        showFailToast('请先登录')
        return
    }
    const spotId = route.params.id
    if (spotId) {
        await starSpot(spotId)
        isStar.value = !isStar.value
    }
}

onMounted(async () => {
    congestionIndex.value = Math.floor(Math.random() * 3)
    isLoggedIn.value = (window.localStorage.getItem('login') === 'true')
    const spot = await getSpotByID(route.params.id)
    title.value = spot.title
    cover.value = spot.cover
    await fetchMapData()
    initMapChart()
    await renderMap()
})

const fetchMapData = async () => {
    const { roadJSON, buildingJSON, pointJSON } = await fetchMapJson()
    roadGeoJSON.value = roadJSON
    buildingGeoJSON.value = buildingJSON
    pointGeoJSON.value = pointJSON
}

const initMapChart = () => {
    echarts.registerMap('building', buildingGeoJSON.value)
    mapChart.value = echarts.init(document.getElementById('map'))

    //选中建筑改变，用户点击触发
    mapChart.value.on('geoselectchanged', (params) => {
        selectedPoint.value = null
        if (params.allSelected[0].name[0]) {
            //用户手动选中建筑
            updateDestination(params.name)
            selectedBuilding.value = {
                name: params.name,
                value: pointGeoJSON.value.features.find(
                    f => f.properties.name === params.name)?.geometry.coordinates
            }
            //取消选中标点
            mapChart.value.dispatchAction({
                type: 'select',
                seriesIndex: 0
            })
        } else {
            //用户手动取消选中建筑
            updateDestination(null)
            selectedBuilding.value = null
        }
    })

    //选中建筑改变，函数调用触发
    mapChart.value.on('geoselected', (params) => {
        if (params.name) {
            //通过搜索选中建筑
            selectedPoint.value = null
            selectedBuilding.value = {
                name: params.name,
                value: pointGeoJSON.value.features.find(
                    f => f.properties.name === params.name)?.geometry.coordinates
            }
            //取消选中标点
            mapChart.value.dispatchAction({
                type: 'select',
                seriesIndex: 0
            })
        } else {
            //在选中标点时取消选中建筑
        }
    })

    //选中标点改变，用户点击和函数调用都会触发
    mapChart.value.on('selectchanged', (params) => {
        if (params.isFromClick) {
            if (params.selected && params.selected.length > 0
                && params.selected[0].seriesIndex == 0) {
                //用户手动选中标点
                selectedBuilding.value = null
                const selectedData = mapChart.value.getOption()
                    .series[0].data[params.selected[0].dataIndex]
                selectedPoint.value = selectedData
                updateDestination(selectedData.name)
                mapChart.value.dispatchAction({
                    type: 'geoSelect',
                    name: null
                })
            } else {
                //用户手动取消选中标点
                updateDestination(null)
                selectedPoint.value = null
            }
        } else if (params.selected && params.selected.length > 0) {
            //通过搜索选中标点
            mapChart.value.dispatchAction({
                type: 'geoSelect',
                name: null
            })
        } else {
            //在选中建筑时取消选中标点
        }
    })
}

//根据标点顺序计算颜色，序号越大颜色越淡
const darkenColor = (hex, index) => {
    let intensity = 0
    if (index === 0) {
        return '#ff0000'
    } else {
        intensity = index * 5
    }
    let r = parseInt(hex.slice(1, 3), 16)
    let g = parseInt(hex.slice(3, 5), 16)
    let b = parseInt(hex.slice(5, 7), 16)
    r = Math.min(Math.floor(r + intensity), 255)
    g = Math.min(Math.floor(g + intensity), 255)
    b = Math.min(Math.floor(b + intensity), 255)
    return `rgba(${r}, ${g}, ${b})`
}

const updatePoints = () => {
    const currentOption = mapChart.value.getOption()
    const filteredPoints = pointGeoJSON.value.features
        .filter(feature => displayPointTypes.value.includes(feature.pointType))
    //根据是否显示序号设置标点数据
    if (showLabelOrder.value) {
        currentOption.series[0].data = filteredPoints.map(feature => {
            const baseColor = pointTypeConfig[feature.pointType]?.color
            return {
                name: feature.properties.name,
                value: [...feature.geometry.coordinates, feature.order],
                symbolSize: 20,
                itemStyle: { color: darkenColor(baseColor, feature.order - 1) },
                label: {
                    formatter: '{@[2]}',
                    position: 'inside',
                    fontWeight: 'bold',
                    fontSize: 10
                }
            }
        })
    } else {
        currentOption.series[0].data = filteredPoints.map(feature => ({
            name: feature.properties.name,
            value: feature.geometry.coordinates,
            itemStyle: { color: pointTypeConfig[feature.pointType]?.color }
        }))
    }
    //若选中了一个标点，将其添加到标点列表中
    if (selectedPoint.value) {
        let feature = pointGeoJSON.value.features.find(
            f => f.properties.name === selectedPoint.value.name)
        if (!displayPointTypes.value.includes(feature.pointType)) {
            currentOption.series[0].data.push({
                name: feature.properties.name,
                value: feature.geometry.coordinates,
                itemStyle: { color: pointTypeConfig[feature.pointType]?.color }
            })
        }
    }
    mapChart.value.setOption(currentOption)
}

const renderMap = async () => {
    mapChart.value.setOption({
        geo: {
            map: 'building',
            roam: true,
            zoom: defaultZoom.value,
            center: defaultCenter.value,
            scaleLimit: {
                min: 0.9,
                max: 5
            },
            itemStyle: {
                areaColor: '#edfcff',
                borderColor: '#666666',
                borderWidth: 1
            },
            selectedMode: 'single',
            select: {
                itemStyle: {
                    areaColor: '#88eeff',
                    borderColor: '#1989fa',
                    borderWidth: 1
                }
            }
        },
        series: [{
            type: 'scatter',
            coordinateSystem: 'geo',
            symbolSize: 10,
            data: pointGeoJSON.value.features
                .filter(feature => displayPointTypes.value.includes(feature.pointType))
                .map(feature => ({
                    name: feature.properties.name,
                    value: feature.geometry.coordinates,
                    itemStyle: { color: pointTypeConfig[feature.pointType].color }
                })),
            selectedMode: 'single',
            select: {
                itemStyle: {
                    color: '#1989fa',
                    borderColor: '#1989fa',
                    borderWidth: 3
                }
            },
            label: {
                show: true,
                formatter: '{b}',
                position: 'top'
            }
        }, {
            type: 'lines',
            coordinateSystem: 'geo',
            polyline: true,
            data: roadGeoJSON.value.features.map(feature => ({
                coords: feature.geometry.coordinates[0],
                lineStyle: {
                    color: congestionColor[feature.congestion[congestionIndex.value]]
                }
            })),
            lineStyle: {
                width: 1.5
            }
        }, {
            name: 'path',
            type: 'lines',
            coordinateSystem: 'geo',
            polyline: true,
            lineStyle: {
                color: '#1989fa',
                width: 3,
                opacity: 0.3,
                cap: 'round'
            },
            effect: {
                show: true,
                period: 4,
                trailWidth: 10,
                color: '#88eeff',
                symbolSize: 6,
                symbol: 'circle'
            }
        }]
    })
}
</script>

<style scoped>
.popup {
    background-color: #f6feff;
}

.popup-header {
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
}

.popup-title {
    font-size: 16px;
}

.popup-content {
    height: calc(100% - 50px);
    overflow-y: auto;
}

.title-container {
    position: absolute;
    top: 0;
    left: 0;
    height: 80px;
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    z-index: 1;
}

.spot-image {
    width: 40px;
    height: 40px;
}

.title {
    font-size: 16px;
}

.page-container {
    height: 100vh;
    background-color: #f6feff;
    position: relative;
}

.map-container {
    width: 100%;
    height: 100%;
    padding: 0px;
}

.map {
    width: 100%;
    height: 100%;
}

.legend-container {
    position: absolute;
    bottom: 100px;
    left: 0;
    right: 0;
}

.legend-row {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 5px;
    margin: 0px 5px 5px 5px;
}

.legend-item {
    height: 30px;
    padding: 4px 8px;
    border-radius: 8px;
    color: white;
    font-size: 12px;
    opacity: 0.5;
    border-color: white;
}

.legend-item.active {
    opacity: 1;
}
</style>