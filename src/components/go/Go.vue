<template>
    <div class="page-container">
        <div class="title-container" :style="{
            transform: `scale(${scale}) translateY(${translateY}%)`,
            transition: 'transform 0.3s ease'
        }">
            <div class="spot-title">
                <van-image class="spot-image" :src="spotLogoUrl" fit="contain" />
                <div class="title">{{ spotName }}</div>
            </div>
            <div class="path-info">
                <div v-if="showPathTime || pathOptimizing" style="height: 10px;"></div>
                <div v-if="showPathLength">{{ pathLength }} 米</div>
                <div v-if="showPathLength && pathOptimizing" style="color: #1989fa;">优化中</div>
                <div v-if="showPathTime">{{ Math.floor(pathTime / 60) > 0 ?
                    `${Math.floor(pathTime / 60)} 分 ${pathTime % 60} 秒` :
                    `${pathTime % 60} 秒` }}</div>
                <div v-if="!showPathTime && !pathOptimizing" style="height: 10px;"></div>
            </div>
        </div>
        <div class="map-container">
            <div id="map" class="map" :style="{
                transform: `scale(${scale})`,
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
        <Drawer ref="drawerRef" @position-change="drawerPositionChange" @update-path="updatePath"
            @select-destination="selectDestination" @update-path-optimizing="updatePathOptimizing" />
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { fetchMapJson } from '/src/api/map'
import { getDistanceOrder } from '/src/api/path'
import * as echarts from 'echarts'
import Drawer from './Drawer.vue'

const defaultCenter = ref([116.3518, 39.9582])
const bigCenter = ref([116.3519, 39.96])
const defaultZoom = ref(0.9)
const bigZoom = ref(1.1)
const scale = ref(1)
const translateY = ref(0)
const mapChart = ref(null)
const roadGeoJSON = ref(null)
const buildingGeoJSON = ref(null)
const pointGeoJSON = ref(null)
const congestionIndex = ref(1)
const congestionColor = ['#00ff00', '#ffcc00', '#ff0000']
const drawerRef = ref(null)
const displayPointTypes = ref(['Scenery', 'Gate'])
const legendActive = ref(['Essential'])
const selectedPoint = ref(null)
const selectedBuilding = ref(null)
const showLabelOrder = ref(false)
const pathPoints = ref([])
const pathLength = ref(0)
const pathTime = ref(63)
const spotName = ref('北京邮电大学')
const spotLogoUrl = ref('http://47.93.189.31/res/spot/logo/北京邮电大学.png')
const showPathLength = ref(false)
const showPathTime = ref(false)
const pathOptimizing = ref(false)

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
const pointTagToType = Object.fromEntries(
    Object.entries(pointLegendConfig).map(([type, config]) => [config.tag, type])
)

//第二行图例
const legendConfig = {
    'ElecParkSpot': { tag: '停车点', color: '#bfef45' },
    'Toilet': { tag: '卫生间', color: '#dcbeff' },
    'Essential': { tag: '必要标点', color: '#800000' },
    'All': { tag: '全部标点', color: '#000075' },
    'None': { tag: '关闭标点', color: '#666666' }
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
    } else if (type === 'None') {
        legendActive.value = [type]
        displayPointTypes.value = []
    }
    updatePoints()
}

const updatePathOptimizing = (optimizing) => {
    pathOptimizing.value = optimizing
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

//搜索目的地，子组件调用
const selectDestination = (name, callback) => {
    if (pointGeoJSON.value.features.some(feature => feature.properties.name === name)) {
        //搜索的是地点名称
        if (buildingGeoJSON.value.features.some(feature => feature.properties.name === name)) {
            //地点为建筑
            mapChart.value.dispatchAction({
                type: 'geoSelect',
                name: name
            })
        } else {
            //地点为标点
            selectedBuilding.value = null
            const selectedData = mapChart.value.getOption().series[2].data.find(
                point => point.name === name
            )
            if (selectedData) {
                selectedPoint.value = selectedData
            } else {
                //搜索到的标点当前未显示，更新标点使其显示
                const pointFeature = pointGeoJSON.value.features.find(
                    f => f.properties.name === name
                )
                if (pointFeature) {
                    selectedPoint.value = {
                        name: pointFeature.properties.name,
                        value: pointFeature.geometry.coordinates
                    }
                }
                updatePoints()
            }
            //选中标点
            mapChart.value.dispatchAction({
                type: 'select',
                seriesIndex: 2,
                name: name
            })
        }
        updateDestination(name)
        callback('point')
    } else if (pointTagToType[name]) {
        //搜索的是第一行图例中的类型名称
        switchPointType(pointTagToType[name])
        callback('tag')
    } else if (legendTagToType[name]) {
        //搜索的是第二行图例中的类型名称
        switchLegend(legendTagToType[name])
        callback('tag')
    } else {
        //搜索的名称不存在
        callback('none')
    }
}

//抽屉高度改变，子组件调用
const drawerPositionChange = (position) => {
    if (position === 0) {
        scale.value = 1
        translateY.value = 0
        mapChart.value.setOption({
            geo: {
                zoom: bigZoom.value,
                center: bigCenter.value
            }
        })
    } else if (position === 1) {
        scale.value = 1
        translateY.value = 0
        mapChart.value.setOption({
            geo: {
                zoom: defaultZoom.value,
                center: defaultCenter.value
            }
        })
    } else if (position === 2) {
        scale.value = 0
        translateY.value = -30
    }
}

//选中了目的地，调用子组件更新
const updateDestination = (name) => {
    if (!name) {
        drawerRef.value.updateDestination(null, null)
        return
    }
    const point = pointGeoJSON.value.features.find(f => f.properties.name === name)
    const tag = pointTypeConfig[point.pointType].tag
    drawerRef.value.updateDestination(name, tag)
}

onMounted(async () => {
    initCongestionIndex()
    await fetchMapData()
    initMapChart()
    await renderMap()
})

const initCongestionIndex = () => {
    congestionIndex.value = Math.floor(Math.random() * 3)
    //如果 setCongestionIndex 立刻调用，此时 Drawer 的 ToGoListRef 还未初始化，所以等一会后再调用
    setTimeout(() => {
        drawerRef.value.setCongestionIndex(congestionIndex.value)
    }, 1000)
}

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
                seriesIndex: 2
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
                seriesIndex: 2
            })
        } else {
            //在选中标点时取消选中建筑
        }
    })

    //选中标点改变，用户点击和函数调用都会触发
    mapChart.value.on('selectchanged', (params) => {
        if (params.isFromClick) {
            if (params.selected && params.selected.length > 0
                && params.selected[0].seriesIndex == 2) {
                //用户手动选中标点
                selectedBuilding.value = null
                const selectedData = mapChart.value.getOption()
                    .series[2].data[params.selected[0].dataIndex]
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

const updatePath = (coordinates, time, distance, visitOrder) => {
    switchLegend('None')
    const currentOption = mapChart.value.getOption()
    currentOption.series[1] = {
        data: [{
            coords: coordinates,
        }],
    }
    pathTime.value = time
    pathLength.value = distance
    showPathTime.value = time > 0
    showPathLength.value = distance > 0
    mapChart.value.setOption(currentOption)
    pathPoints.value = visitOrder
    updatePoints()
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
        currentOption.series[2].data = filteredPoints.map(feature => {
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
        currentOption.series[2].data = filteredPoints.map(feature => ({
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
            currentOption.series[2].data.push({
                name: feature.properties.name,
                value: feature.geometry.coordinates,
                itemStyle: { color: pointTypeConfig[feature.pointType]?.color }
            })
        }
    }
    //将路径规划途径点添加到标点列表中
    pathPoints.value.forEach((name, index) => {
        let feature = pointGeoJSON.value.features.find(
            f => f.properties.name === name
        )
        if (!displayPointTypes.value.includes(feature.pointType)) {
            let pointConfig = {
                name: feature.properties.name,
                value: [...feature.geometry.coordinates, index + 1],
                symbolSize: 15,
                itemStyle: {
                    color: index === 0 ? '#00ff00' :
                        (index === pathPoints.value.length - 1 ? '#ff0000' : '#1989fa')
                },
                label: {
                    formatter: '{@[2]}',
                    position: 'inside',
                    fontWeight: 'bold',
                    fontSize: 8
                }
            }
            currentOption.series[2].data.push(pointConfig)
        }
    })
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
        }, {
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
        }]
    })
}
</script>

<style scoped>
.page-container {
    height: 100vh;
    background-color: #f6feff;
    position: relative;
}

.title-container {
    height: 50px;
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    padding: 0px 15px 0px 10px;
    z-index: 1;
    display: flex;
    justify-content: space-between;
}

.spot-title {
    display: flex;
    align-items: center;
    gap: 10px;
}

.spot-image {
    width: 30px;
    height: 30px;
}

.title {
    font-size: 12px;
}

.path-info {
    width: fit-content;
    font-size: 12px;
    text-align: right;
    display: flex;
    flex-direction: column;
    justify-content: center;
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
    bottom: 154px;
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