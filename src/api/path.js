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
            distance: Math.floor(response.data.distance),
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

export const pathPlanSingle = async (start, end) => {
    try {
        const response = await axios.post('/api/arith/path/path/single', {
            'start': {
                'name': start,
            },
            'end': {
                'name': end
            }
        })

        return {
            path: response.data.path.map(point => [point.longitude, point.latitude]),
            distance: Math.floor(response.data.distance)
        }
    } catch (error) {
        console.error('单目的地路径规划时出错:', error)
        return {
            path: [],
            distance: 0
        }
    }
}

export const pathPlanMultiRemain = async (names) => {
    try {
        const requests = []
        for (let i = 0; i < names.length; i++) {
            const nextIndex = (i + 1) % names.length
            requests.push(pathPlanSingle(names[i], names[nextIndex]))
        }

        const results = await Promise.all(requests)

        const combinedPath = results.flatMap(result => result.path)
        const totalDistance = results.reduce((sum, result) => sum + result.distance, 0)

        return {
            path: combinedPath,
            distance: totalDistance
        }
    } catch (error) {
        console.error('多目的地保持顺序路径规划时出错:', error)
        return {
            path: [],
            distance: 0
        }
    }
}

export const pathPlanSingleTime = async (start, end, vehicle, congestionIndex) => {
    try {
        const response = await axios.post('/api/arith/path/path/time/single', {
            'start': {
                'name': start,
            },
            'end': {
                'name': end
            },
            'speed_type': vehicle,
            'congestion_index': congestionIndex
        })

        return {
            path: response.data.path.map(point => [point.longitude, point.latitude]),
            time: Math.floor(response.data.time),
            distance: Math.floor(response.data.distance),
            elecSpot: response.data.electric_spot_name || null
        }
    } catch (error) {
        console.error('单目的地基于时间路径规划时出错:', error)
        return {
            path: [],
            time: 0,
            distance: 0
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