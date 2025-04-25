<template>
    <div class="page-container">
        <div class="map-container">
            <div id="map" class="map" :style="{
                transform: `scale(${scale}) translateY(${translateY}%)`,
                transition: 'transform 0.5s ease'
            }"></div>
        </div>
        <Drawer ref="drawerRef" @position-change="drawerPositionChange" @update-path="updatePath" />
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

const pointTypeToTag = {
    'Building': '建筑',
    'Scenery': '景观',
    'SportsGround': '运动场',
    'Canteen': '餐厅',
    'Shop': '商店',
    'ElecParkSpot': '停车点',
    'Gate': '大门',
    'Dormitory': '宿舍'
};

const updateDestination = (name) => {
    if (!name) {
        drawerRef.value.updateDestination(null, null);
        return;
    }
    const point = pointGeoJSON.value.features.find(f => f.properties.name === name);
    const tag = pointTypeToTag[point.pointType];
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
        });
    } else if (position === 1) {
        scale.value = 1;
        translateY.value = 0;
        mapChart.value.setOption({
            geo: {
                zoom: defaultZoom.value,
                center: defaultCenter.value
            }
        });
    } else if (position === 2) {
        scale.value = 0;
        translateY.value = -30;
    }
};

onMounted(async () => {
    congestionIndex.value = Math.floor(Math.random() * 3);
    await fetchMapData();
    initMapChart();
    await renderMap();
});

const fetchMapData = async () => {
    try {
        const { roadJSON, buildingJSON, pointJSON } = await fetchMapJson();
        roadGeoJSON.value = roadJSON;
        buildingGeoJSON.value = buildingJSON;
        pointGeoJSON.value = pointJSON;
    } catch (error) {
        console.error('请求地图时出错:', error);
    }
};

const initMapChart = () => {
    echarts.registerMap('building', buildingGeoJSON.value);
    mapChart.value = echarts.init(document.getElementById('map'));
}

const updatePath = (coordinates) => {
    const currentOption = mapChart.value.getOption();
    const pathSeriesIndex = currentOption.series.findIndex(series => series.name === 'path');
    currentOption.series[pathSeriesIndex].data = [{
        coords: coordinates,
    }];
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
            geoSelectChanged: (params) => {
                if (params.selected && params.selected.length > 0) {
                    selectedBuilding.value = params.selected[0].name;
                } else {
                    selectedBuilding.value = null;
                }
            },
            series: [{
                type: 'lines',
                coordinateSystem: 'geo',
                polyline: true,
                data: roadGeoJSON.value.features.map(feature => ({
                    coords: feature.geometry.coordinates[0],
                    lineStyle: {
                        color: congestionColor[feature.congestion[congestionIndex.value]],
                        width: 1.5
                    }
                })),
            }, {
                name: 'path',
                type: 'lines',
                coordinateSystem: 'geo',
                polyline: true,
                lineStyle: {
                    color: '#1989fa',
                    width: 3,
                    opacity: 0.3
                },
                effect: {
                    show: true,
                    period: 4,
                    trailWidth: 10,
                    color: '#88eeff',
                    symbolSize: 6,
                    symbol: 'circle',
                },
            }, {
                type: 'scatter',
                coordinateSystem: 'geo',
                symbolSize: 10,
                data: pointGeoJSON.value.features
                    .filter(feature => feature.pointType === "Scenery")
                    .map(feature => {
                        return {
                            name: feature.properties.name,
                            value: feature.geometry.coordinates.concat([1])
                        };
                    }),
                itemStyle: {
                    color: '#33aa00'
                },
                emphasis: {
                    itemStyle: {
                        color: '#ff0000'
                    }
                },
                label: {
                    show: true,
                    formatter: '{b}',
                    position: 'top'
                }
            }, {
                type: 'scatter',
                coordinateSystem: 'geo',
                symbolSize: 10,
                data: pointGeoJSON.value.features
                    .filter(feature => feature.pointType === "Gate")
                    .map(feature => {
                        return {
                            name: feature.properties.name,
                            value: feature.geometry.coordinates.concat([1])
                        };
                    }),
                itemStyle: {
                    color: '#ff8800'
                },
                emphasis: {
                    itemStyle: {
                        color: '#ff0000'
                    }
                },
                label: {
                    show: true,
                    formatter: '{b}',
                    position: 'top'
                }
            }]
        });
        mapChart.value.on('geoselectchanged', (params) => {
            if (params.allSelected && params.allSelected.length > 0) {
                updateDestination(params.allSelected[0].name[0]);
            } else {
                updateDestination(null);
            }
        });
        mapChart.value.on('click', function (params) {
            if (params.seriesType === 'scatter') {
                updateDestination(params.name);
            }
        });
    } catch (error) {
        console.error('渲染地图时出错:', error);
    }
};
</script>

<style scoped>
.page-container {
    height: 100vh;
    background-color: rgb(246, 254, 255);
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
</style>