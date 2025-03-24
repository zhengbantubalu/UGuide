<template>
  <div class="map-container">
    <div id="map"></div>
    <div v-if="userPosition" class="location-info">
      当前位置：经度 {{ userPosition[0].toFixed(6) }}，纬度 {{ userPosition[1].toFixed(6) }}
    </div>
  </div>
</template>

<script>
import * as echarts from 'echarts';

export default {
  name: 'App',
  data() {
    return {
      chart: null,
      userPosition: null,
      // 添加地图边界范围
      mapBounds: {
        minLng: 116.3490,
        maxLng: 116.3547,
        minLat: 39.9583,
        maxLat: 39.9635
      }
    };
  },
  async mounted() {
    // 先获取用户位置，成功后再加载地图
    await this.getUserLocation();
    this.loadAndRenderMap(); // 加载并渲染地图
  },
  methods: {
    // 加载并渲染地图
    async loadAndRenderMap() {
      try {
        // 加载道路 GeoJSON 文件
        const roadResponse = await fetch('/北邮全图.geojson');
        const roadGeoJSON = await roadResponse.json();

        // 注册地图
        echarts.registerMap('road', roadGeoJSON);

        // 初始化 ECharts 实例
        this.chart = echarts.init(document.getElementById('map'));

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
                symbol: 'circle',
                symbolSize: 20,
                itemStyle: {
                  color: '#ff0000'
                },
                label: {
                  position: 'top',
                  color: '#fff'
                },
                data: [
                  {
                    name: '您的位置（假的，定位不准，硬编码）',
                    coord: this.clampPosition(this.userPosition) // 仅在显示红点时处理坐标
                  }
                ]
              }
            }
          ]
        };

        // 设置配置项并渲染地图
        this.chart.setOption(option);

      } catch (error) {
        console.error('Error loading map:', error);
      }
    },

    // 获取用户地理位置
    async getUserLocation() {
      this.userPosition = [116.3495, 39.9606];
      return;//不定位
      return new Promise((resolve, reject) => {
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              // 获取经纬度
              const { latitude, longitude } = position.coords;
              // 保留原始坐标
              this.userPosition = [longitude, latitude];
              console.log('User Position:', this.userPosition);
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
    },

    // 新增方法：限制坐标在边界范围内
    clampPosition(position) {
      const [lng, lat] = position;
      // return position;//不进行处理
      return [
        Math.max(this.mapBounds.minLng, Math.min(this.mapBounds.maxLng, lng)),
        Math.max(this.mapBounds.minLat, Math.min(this.mapBounds.maxLat, lat))
      ];
    },
  }
};
</script>

<style>
.map-container {
  margin-top: 30px;
  width: 100%;
}

#map {
  width: 100%;
  height: 80vh;
}

.location-info {
  text-align: center;
  font-size: 16px;
  color: #333;
  padding: 10px 0;
}
</style>