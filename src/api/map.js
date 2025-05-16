import axios from 'axios'

export const fetchMapJson = async () => {
    try {
        const response = await axios.get('/api/data/maps')

        const roadFeatures = []
        const buildingFeatures = []
        const pointFeatures = []

        response.data.features.forEach(feature => {
            if (feature.geometry.type === 'MultiLineString') {
                roadFeatures.push(feature)
            } else if (feature.geometry.type === 'MultiPolygon') {
                buildingFeatures.push(feature)
            } else if (feature.geometry.type === 'Point') {
                pointFeatures.push(feature)
            }
        })

        return {
            roadJSON: { features: roadFeatures },
            buildingJSON: { features: buildingFeatures },
            pointJSON: { features: pointFeatures }
        }
    } catch (error) {
        console.error('地图时出错:', error)
        return {
            roadJSON: { features: [] },
            buildingJSON: { features: [] },
            pointJSON: { features: [] }
        }
    }
}