<template>
    <div class="map-container">
        <div id="map" class="map"></div>
    </div>
    <div class="legend">
        <div class="legend-item" v-for="(item, index) in legendItems" :key="index" @click="selectLegend(item.type)">
            <span :style="{ backgroundColor: item.color }" class="legend-color"></span>
            <span>{{ item.label }}</span>
        </div>
        <div class="legend-item" style="background: #ccffcc" @click="selectLegend(null)">
            <span style="background: #008800" class="legend-color"></span>
            <span>全部</span>
        </div>
    </div>
    <div v-if="userPosition && pathInfo" class="dev-info">
        <p>经度：{{ userPosition[0] }}</p>
        <p>纬度：{{ userPosition[1] }}</p>
        <p>起点：{{ pathInfo.start_location }}</p>
        <p>终点：{{ pathInfo.end_location }}</p>
        <p>途径点：{{ pathInfo.visit_order.slice(0, -1).join('，') }}</p>
        <!-- <p>总时间：{{ pathInfo.time.toFixed(0) }} 秒</p> -->
        <p>总路径长度：{{ pathInfo.distance.toFixed(0) }} 米</p>
    </div>
    <van-action-bar style="padding: 0 30px;">
        <van-action-bar-icon icon="good-job" text="已点赞" color="#ff5000" />
        <van-action-bar-button type="success" text="想去这里" to="/home/togo" />
    </van-action-bar>
</template>

<script setup>
import * as echarts from 'echarts';
import axios from 'axios';
import { ref, onMounted } from 'vue';

const isMapInitialized = ref(false);
const chart = ref(null);
const userPosition = ref(null);
const mapBounds = ref({
    minLng: 116.3490,
    maxLng: 116.3547,
    minLat: 39.9583,
    maxLat: 39.9635
});
const pathInfo = ref(null);
const selectedLegend = ref(null);
const roadGeoJSON = ref(null);
const pointGeoJSON = ref(null);
const pathData = ref(null);

// 合并图例数据和图标颜色映射对象
const legendItems = [
    { type: 'Start', color: '#00dd00', label: '起点' },
    { type: 'Destination', color: '#dd0000', label: '目的地' },
    { type: 'Building', color: '#00dddd', label: '建筑' },
    { type: 'Scenery', color: '#42a600', label: '景观' },
    { type: 'SportsGround', color: '#ffaa00', label: '运动场' },
    { type: 'Canteen', color: '#ffdd00', label: '餐厅' },
    { type: 'Shop', color: '#bd00de', label: '商店' },
    { type: 'ElecParkSpot', color: '#6459ff', label: '停车点' },
    { type: 'Gate', color: '#ff5900', label: '大门' }
];

// 从 legendItems 生成图标颜色映射对象
const pointTypeColorMap = legendItems.reduce((acc, item) => {
    acc[item.type] = item.color;
    return acc;
});

onMounted(async () => {
    await getUserLocation();
    await loadAndRenderMap();
});

// 加载并渲染地图
const loadAndRenderMap = async () => {
    try {
        await fetchData();
        await renderMap();
    } catch (error) {
        console.error('加载地图时出错:', error);
    }
};

// 处理图例点击事件
const selectLegend = (type) => {
    selectedLegend.value = type;
    renderMap();
};

// 获取用户地理位置
const getUserLocation = async () => {
    try {
        // 检查浏览器是否支持地理定位
        if (!navigator.geolocation) {
            throw new Error('Geolocation is not supported by this browser.');
        }
        await new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    // 获取经纬度
                    const { latitude, longitude } = position.coords;
                    userPosition.value = [longitude, latitude];
                    // 限制坐标在边界范围内
                    userPosition.value = clampPosition(userPosition.value);
                    console.log('User Position:', userPosition.value);
                    resolve();
                },
                (error) => {
                    console.error('Error getting user location:', error);
                    reject(error);
                },
                {
                    enableHighAccuracy: true, // 启用高精度模式
                    timeout: 5000,
                    maximumAge: 0
                }
            );
        });
    } catch (error) {
        console.error('定位时出错:', error);
        userPosition.value = [116.3519666, 39.9632888];
    }
};

// 限制坐标在边界范围内
const clampPosition = (position) => {
    const [lng, lat] = position;
    return [
        Math.max(mapBounds.value.minLng, Math.min(mapBounds.value.maxLng, lng)),
        Math.max(mapBounds.value.minLat, Math.min(mapBounds.value.maxLat, lat))
    ];
};

// 请求地图和路径数据
const fetchData = async () => {
    try {
        // 发起道路请求
        const roadResponse = await axios.get('/api/data/maps');
        const originalGeoJSON = roadResponse.data; // 保存原始数据

        // 深拷贝原始数据，避免引用问题
        roadGeoJSON.value = JSON.parse(JSON.stringify(originalGeoJSON));
        pointGeoJSON.value = JSON.parse(JSON.stringify(originalGeoJSON));

        // 过滤掉 roadGeoJSON 中 type 为 Point 的 Feature 对象
        if (roadGeoJSON.value.features) {
            roadGeoJSON.value.features = roadGeoJSON.value.features.filter(feature => {
                return feature.geometry && feature.geometry.type !== 'Point';
            });
        }

        // 过滤掉 pointGeoJSON 中非 Point 类型的 Feature 对象
        if (pointGeoJSON.value.features) {
            pointGeoJSON.value.features = pointGeoJSON.value.features.filter(feature => {
                return feature.geometry && feature.geometry.type === 'Point';
            });
        }

        // 发起路径请求
        const requestData = {
            "start": {
                // "name": "学6公寓",
                "coordinates": userPosition.value
            },
            "end": {
                "name": "教三楼"
            },
            "destinations": [
                { "name": "教一楼" },
                { "name": "教二楼" },
                { "name": "教三楼" },
                { "name": "教四楼" },
                { "name": "主教学楼" },
                { "name": "网络中心" },
                { "name": "校训石" },
                { "name": "科研楼" },
                { "name": "北邮科技大厦" },
                { "name": "篮球场" },
                { "name": "麦当劳" },
                { "name": "图书馆" },
                { "name": "学6公寓" },
                { "name": "主席像" },
                { "name": "东门" },
                { "name": "田径场" },
            ],
            "speed_type": "walk",
            "congestion_index": 1
        };

        // const pathResponse = await axios.post('/api/arith/path/time/single', requestData);
        // pathInfo.value = {
        //     start_location: pathResponse.data.start_location.name,
        //     end_location:pathResponse.data.end_location.name,
        //     time: pathResponse.data.time,
        //     distance: pathResponse.data.distance,
        // };

        const pathResponse = await axios.post('/api/arith/path/multi', requestData);
        pathInfo.value = {
            start_location: pathResponse.data.start_location.name,
            end_location: pathResponse.data.visit_order[pathResponse.data.visit_order.length - 1],
            visit_order: pathResponse.data.visit_order,
            time: pathResponse.data.time,
            distance: pathResponse.data.distance
        };

        pathData.value = pathResponse.data;
    } catch (error) {
        console.error('请求数据时出错:', error);
    }
};

// 渲染地图
const renderMap = async () => {
    try {
        const pathCoordinates = pathData.value.path.map(point => [point.longitude, point.latitude]);

        if (!isMapInitialized.value) {
            echarts.registerMap('road', roadGeoJSON.value);
            chart.value = echarts.init(document.getElementById('map'));
            isMapInitialized.value = true;
        }

        // 配置项
        const option = {
            title: {
                text: '北京邮电大学',
                left: 'center'
            },
            tooltip: {
                trigger: 'item',
                formatter: '{b}'
            },
            geo: {
                map: 'road',
                roam: false,
                itemStyle: {
                    areaColor: '#f4f4f4',
                    borderColor: '#333',
                    borderWidth: 1
                },
                emphasis: {
                    itemStyle: {
                        areaColor: '#e0e0e0'
                    }
                }
            },
            series: [
                {
                    name: 'Road',
                    type: 'map',
                    map: 'road',
                    // roam: true,
                    itemStyle: {
                        areaColor: '#f4f4f4', // 区域填充颜色
                        borderColor: '#333',  // 道路颜色
                        borderWidth: 1        // 道路宽度
                    },
                    emphasis: {
                        itemStyle: {
                            borderWidth: 3,      // 鼠标悬停时的道路宽度
                            borderColor: '#ffaa00' // 鼠标悬停时的道路颜色
                        }
                    },
                    markPoint: {
                        symbolSize: 12,
                        symbol: 'circle',
                        label: {
                            position: 'top',
                            color: '#fff'
                        },
                        data: [
                            ...pointGeoJSON.value.features.filter(feature => {
                                return !selectedLegend.value || feature.pointType === selectedLegend.value;
                            }).map(feature => {
                                let color = '#ff0000';
                                const pointTypeConfig = pointTypeColorMap[feature.pointType];
                                if (pointTypeConfig) {
                                    color = pointTypeConfig;
                                }
                                return {
                                    name: feature.properties.name,
                                    coord: feature.geometry.coordinates,
                                    itemStyle: {
                                        color: color
                                    }
                                };
                            })
                        ]
                    }
                },
                {
                    name: 'Path',
                    type: 'lines',
                    coordinateSystem: 'geo',
                    polyline: true,
                    data: [{
                        coords: pathCoordinates
                    }],
                    lineStyle: {
                        color: '#00cc00', // 路径颜色
                        width: 5,         // 路径宽度
                        opacity: 0.3      // 路径透明度
                    },
                    effect: {
                        show: true,
                        period: 4,
                        trailWidth: 5,
                        color: '#00ff00',
                        symbolSize: 10,
                        symbol: 'circle',
                    },
                    markPoint: {
                        symbolSize: 30,
                        symbol: 'pin',
                        label: {
                            position: 'top',
                            color: '#fff'
                        },
                        data: [
                            {
                                name: '起点',
                                coord: userPosition.value,
                                itemStyle: {
                                    color: '#00dd00'
                                }
                            },
                            {
                                name: '目的地',
                                coord: pathCoordinates[pathCoordinates.length - 1],
                                itemStyle: {
                                    color: '#dd0000'
                                }
                            }
                        ]
                    }
                },
            ]
        };
        chart.value.setOption(option);
    } catch (error) {
        console.error('渲染地图时出错:', error);
    }
};
</script>

<style>
.map-container {
    padding-top: 20px;
    width: 100%;
    height: 500px;
}

.map {
    width: 100%;
    height: 100%;
}

.legend {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    padding: 0px 10px;
    gap: 10px;
}

.legend-item {
    border: 1px solid #ccc;
    padding: 2px 6px;
    border-radius: 10px;
}

.legend-color {
    display: inline-block;
    width: 10px;
    height: 10px;
    margin-right: 5px;
}

.dev-info {
    text-align: center;
    font-size: 16px;
    padding: 20px 20px 100px 20px;
}
</style>
