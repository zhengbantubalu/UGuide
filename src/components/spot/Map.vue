<template>
  <div class="map-container">
    <div id="map"></div>
    <div v-if="userPosition && pathInfo" class="dev-info">
      <p>经度：{{ userPosition[0].toFixed(4) }}</p>
      <p>纬度：{{ userPosition[1].toFixed(4) }}</p>
      <p>起点：{{ pathInfo.start_location }}</p>
      <!-- <p>途径点：{{ pathInfo.visit_order.slice(0, -1).join('，') }}</p> -->
      <p>终点：{{ pathInfo.end_location }}</p>
      <p>总时间：{{ pathInfo.time.toFixed(0) }} 秒</p>
      <p>总路径长度：{{ pathInfo.distance.toFixed(0) }} 米</p>
    </div>
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

// 定义响应式数据
const chart = ref(null);
const userPosition = ref(null);
const mapBounds = ref({
  minLng: 116.3490,
  maxLng: 116.3547,
  minLat: 39.9583,
  maxLat: 39.9635
});
const pathInfo = ref(null);

// 获取用户地理位置
const getUserLocation = async () => {
  userPosition.value = [116.349054, 39.959761];
  return; // 不定位
  return new Promise((resolve, reject) => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          // 获取经纬度
          const { latitude, longitude } = position.coords;
          // 保留原始坐标
          userPosition.value = [longitude, latitude];
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
    } else {
      const error = new Error('Geolocation is not supported by this browser.');
      console.error(error);
      reject(error);
    }
  });
};

// 新增方法：限制坐标在边界范围内
const clampPosition = (position) => {
  const [lng, lat] = position;
  // return position;//不进行处理
  return [
    Math.max(mapBounds.value.minLng, Math.min(mapBounds.value.maxLng, lng)),
    Math.max(mapBounds.value.minLat, Math.min(mapBounds.value.maxLat, lat))
  ];
};

// 加载并渲染地图
const loadAndRenderMap = async () => {
  try {
    // 发起道路请求
    const roadResponse = await axios.get('/api/data/maps');
    const roadGeoJSON = roadResponse.data;

    // 过滤掉 type 为 Point 的 Feature 对象
    if (roadGeoJSON.features) {
      roadGeoJSON.features = roadGeoJSON.features.filter(feature => {
        return feature.geometry && feature.geometry.type !== 'Point';
      });
    }

    // 发起路径请求
    const requestData = {
      "start": {
        "name": "学6公寓"
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
      "congestion_index": 0
    };
    const pathResponse = await axios.post('/api/arith/path/time/single', requestData);
    const pathData = pathResponse.data;
    // console.log('获取到的最优路径数据:', pathData);

    // 存储路径信息
    pathInfo.value = {
      start_location: pathData.start_location.name,
      time: pathData.time,
      distance: pathData.distance,
      end_location: pathData.end_location.name,
    };

    const pathCoordinates = pathData.path.map(point => [point.longitude, point.latitude]);
    // 打印 pathCoordinates
    // console.log('提取的路径坐标:', pathCoordinates);

    // 获取目的地坐标
    const destination = pathCoordinates[pathCoordinates.length - 1];

    console.log('地图:', roadGeoJSON);
    // 注册地图
    echarts.registerMap('road', roadGeoJSON);

    // 初始化 ECharts 实例
    chart.value = echarts.init(document.getElementById('map'));

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
      // 添加 geo 组件配置
      geo: {
        map: 'road',
        roam: false, // 是否开启鼠标缩放和平移漫游
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
              borderWidth: 4,      // 鼠标悬停时的道路宽度
              borderColor: '#ff0000' // 鼠标悬停时的道路颜色
            }
          },
          markPoint: {
            symbolSize: 30,
            symbol: 'pin', // 使用 pin 图标
            itemStyle: {
              color: '#00aa00'
            },
            label: {
              position: 'top',
              color: '#fff'
            },
            data: [
              {
                name: '起点',
                coord: pathCoordinates[0]
                // name: '我的位置（硬编码）',
                // coord: clampPosition(userPosition.value) // 仅在显示红点时处理坐标
              }
            ]
          }
        },
        // 新增系列用于显示路径
        {
          name: 'Path',
          type: 'lines',
          coordinateSystem: 'geo',
          polyline: true,
          data: [{
            coords: pathCoordinates
          }],
          lineStyle: {
            color: '#0000ff', // 路径颜色
            width: 5,         // 路径宽度
            opacity: 0.8      // 路径透明度
          },
          effect: {
            show: true,
            period: 4,
            trailWidth: 5,
            color: '#00ffff',
            symbolSize: 10,
            symbol: 'circle',
          },
          markPoint: {
            symbolSize: 30,
            symbol: 'pin', // 使用 pin 图标
            itemStyle: {
              color: '#ee0000'
            },
            label: {
              position: 'top',
              color: '#fff'
            },
            data: [
              {
                name: '目的地',
                coord: destination
              }
            ]
          }
        },
      ]
    };

    // 设置配置项并渲染地图
    chart.value.setOption(option);

  } catch (error) {
    console.error('加载地图时出错:', error);
    // 这里可以添加更多错误处理逻辑，比如显示错误提示给用户
  }
};

onMounted(async () => {
  // 先获取用户位置，成功后再加载地图
  await getUserLocation();
  loadAndRenderMap(); // 加载并渲染地图
});
</script>

<style>
.map-container {
  padding-top: 20px;
  width: 100%;
  height: 65vh;
}

#map {
  width: 100%;
  height: 100%;
}

.dev-info {
  text-align: center;
  font-size: 16px;
  padding: 20px;
}
</style>