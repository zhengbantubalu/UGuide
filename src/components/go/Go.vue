<template>
    <div class="page-container">
        <div class="map-container">
            <div id="map" class="map" :style="{
                transform: `scale(${scale}) translateY(${translateY}%)`,
                transition: 'transform 0.5s ease'
            }"></div>
        </div>
        <div class="legend-container">
            <div class="legend-row">
                <div class="legend-item" v-for="(config, type) in pointTypeConfig" :key="type"
                    @click="switchPointType(type)" :style="{ backgroundColor: config.color }"
                    :class="{ active: displayPointTypes.includes(type) }">
                    {{ config.tag }}
                </div>
            </div>
            <div class="legend-row">
                <div class="legend-item" v-for="(config, type) in legendConfig" :key="type"
                    @click="switchPointType(type)" :style="{ backgroundColor: config.color }"
                    :class="{ active: legendActive.includes(type) }">
                    {{ config.tag }}
                </div>
            </div>
        </div>
        <Drawer ref="drawerRef" @position-change="drawerPositionChange" @update-path="updatePath"
            @select-destination="selectDestination" />
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { fetchMapJson } from '/src/api/map';
import * as echarts from 'echarts';
import Drawer from './Drawer.vue';

const defaultCenter = ref([116.3518, 39.9582]);
const bigCenter = ref([116.3519, 39.96]);
const defaultZoom = ref(0.9);
const bigZoom = ref(1.1);
const scale = ref(1);
const translateY = ref(0);
const mapChart = ref(null);
const roadGeoJSON = ref(null);
const buildingGeoJSON = ref(null);
const pointGeoJSON = ref(null);
const congestionIndex = ref(1);
const congestionColor = ['#00ff00', '#ffcc00', '#ff0000'];
const drawerRef = ref(null);
const displayPointTypes = ref(['Scenery', 'Gate']);
const legendActive = ref(['Essential']);

const pointTypeConfig = {
    'SportsGround': { tag: '运动场', color: '#e6194b' },
    'Gate': { tag: '大门', color: '#f58231' },
    'Dormitory': { tag: '宿舍', color: '#ffe119' },
    'Scenery': { tag: '景观', color: '#3cb44b' },
    'Building': { tag: '建筑', color: '#42d4f4' },
    'Canteen': { tag: '餐厅', color: '#911eb4' },
    'Shop': { tag: '商店', color: '#f032e6' },
    // 'ElecParkSpot': { tag: '停车点', color: '#bfef45' },
}

const legendConfig = {
    'Essential': { tag: '必要标点', color: '#800000' },
    'All': { tag: '全部标点', color: '#000075' }
}

const switchPointType = (type) => {
    if (type === 'All') {
        legendActive.value = ['All'];
        displayPointTypes.value = Object.keys(pointTypeConfig).filter(key => key !== 'All');
    } else if (type === 'Essential') {
        legendActive.value = ['Essential'];
        displayPointTypes.value = ['Gate', 'Scenery'];
    } else {
        legendActive.value = [];
        displayPointTypes.value = [type];
    }
    const currentOption = mapChart.value.getOption();
    currentOption.series[0].data = pointGeoJSON.value.features
        .filter(feature => displayPointTypes.value.includes(feature.pointType))
        .map(feature => ({
            name: feature.properties.name,
            value: feature.geometry.coordinates,
            itemStyle: { color: pointTypeConfig[feature.pointType].color }
        }));
    mapChart.value.setOption(currentOption, { notMerge: true });
};

const selectDestination = (name, callback) => {
    if (buildingGeoJSON.value && buildingGeoJSON.value.features) {
        if (pointGeoJSON.value.features.some(feature => feature.properties.name === name)) {
            if (buildingGeoJSON.value.features.some(feature => feature.properties.name === name)) {
                mapChart.value.dispatchAction({
                    type: 'geoSelect',
                    name: name
                });
            } else {
                mapChart.value.dispatchAction({
                    type: 'select',
                    seriesIndex: 0,
                    name: name
                });
            }
            updateDestination(name);
            callback(true);
            return;
        }
        callback(false);
        return;
    }
    callback(false);
    return;
}

const updateDestination = (name) => {
    if (!name) {
        drawerRef.value.updateDestination(null, null);
        return;
    }
    const point = pointGeoJSON.value.features.find(f => f.properties.name === name);
    const tag = pointTypeConfig[point.pointType].tag;
    drawerRef.value.updateDestination(name, tag);
}

const drawerPositionChange = (position) => {
    if (position === 0) {
        scale.value = 1;
        translateY.value = 0;
        mapChart.value.setOption({
            geo: {
                zoom: bigZoom.value,
                center: bigCenter.value
            }
        })
    } else if (position === 1) {
        scale.value = 1;
        translateY.value = 0;
        mapChart.value.setOption({
            geo: {
                zoom: defaultZoom.value,
                center: defaultCenter.value
            }
        })
    } else if (position === 2) {
        scale.value = 0;
        translateY.value = -30;
    }
}

onMounted(async () => {
    congestionIndex.value = Math.floor(Math.random() * 3);
    await fetchMapData();
    initMapChart();
    await renderMap();
})

const fetchMapData = async () => {
    try {
        const { roadJSON, buildingJSON, pointJSON } = await fetchMapJson();
        roadGeoJSON.value = roadJSON;
        buildingGeoJSON.value = buildingJSON;
        pointGeoJSON.value = pointJSON;
    } catch (error) {
        console.error('请求地图时出错:', error);
    }
}

const initMapChart = () => {
    echarts.registerMap('building', buildingGeoJSON.value);
    mapChart.value = echarts.init(document.getElementById('map'));

    //选中建筑改变，用户点击触发
    mapChart.value.on('geoselectchanged', (params) => {
        if (params.allSelected && params.allSelected.length > 0) {
            //用户手动选中建筑
            updateDestination(params.allSelected[0].name[0]);
            mapChart.value.dispatchAction({
                type: 'select',
                seriesIndex: 0
            });
        } else {
            //用户手动取消选中建筑
            updateDestination(null);
        }
    })

    //选中建筑改变，函数调用触发
    mapChart.value.on('geoselected', (params) => {
        if (params.name) {
            //通过搜索选中建筑
            mapChart.value.dispatchAction({
                type: 'select',
                seriesIndex: 0
            });
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
                const selectedData = mapChart.value.getOption()
                    .series[0].data[params.selected[0].dataIndex];
                updateDestination(selectedData.name);
                mapChart.value.dispatchAction({
                    type: 'geoSelect',
                    name: null
                });
            } else {
                //用户手动取消选中标点
                updateDestination(null);
            }
        } else {
            if (params.selected && params.selected.length > 0) {
                //通过搜索选中标点
                mapChart.value.dispatchAction({
                    type: 'geoSelect',
                    name: null
                });
            } else {
                //在选中建筑时取消选中标点
            }
        }
    })
}

const updatePath = (coordinates) => {
    const currentOption = mapChart.value.getOption();
    currentOption.series[2] = {
        data: [{
            coords: coordinates,
        }]
    }
    mapChart.value.setOption(currentOption);
}

const renderMap = async () => {
    try {
        mapChart.value.setOption({
            geo: {
                map: 'building',
                roam: true,
                zoom: defaultZoom.value,
                center: defaultCenter.value,
                scaleLimit: {
                    min: 0.9,
                    max: 2.5
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
    } catch (error) {
        console.error('渲染地图时出错:', error);
    }
}
</script>

<style scoped>
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
    bottom: 154px;
    left: 0;
    right: 0;
}

.legend-row {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 8px;
    margin: 0px 8px 8px 8px;
}

.legend-item {
    padding: 4px 8px;
    border-radius: 4px;
    color: white;
    font-size: 12px;
    cursor: pointer;
    opacity: 0.5;
}

.legend-item.active {
    opacity: 1;
}
</style>