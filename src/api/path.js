import axios from 'axios'

export const pathPlanMulti = async (names) => {
    try {
        const response = await axios.post('/api/arith/path/path/multi', {
            'start': {
                'name': names[0],
            },
            'destinations': names.slice(1).map(name => ({
                'name': name
            }))
        })

        return {
            path: response.data.path.map(point => [point.longitude, point.latitude]),
            distance: response.data.distance,
            visitOrder: response.data.visit_order
        }
    } catch (error) {
        console.error('多目的地路径规划时出错:', error)
        return {
            path: [],
            distance: 0,
            visitOrder: []
        }
    }
}

export const getDistanceOrder = async (type, position) => {
    try {
        let response
        if (type === 'ElecParkSpot') {
            response = await axios.post('/api/arith/path/electric_spots/nearest', {
                'current_location': position,
            })
        }
        else if (type === 'Toilet') {
            response = await axios.post('/api/arith/path/toilet_spots/nearest', {
                'current_location': position,
            })
        } else {
            console.error('类型不存在:', type)
            return []
        }

        return response.data.names
    } catch (error) {
        console.error('距离排序时出错:', error)
        return []
    }
}