import axios from 'axios'

const defaultInfo = '暂无信息'
const defaultUrl = 'http://47.93.189.31/res/bupt.ico'

export const getAllSpot = async () => {
    try {
        const response = await axios.get('/api/data/scs')

        return response.data.map(item => ({
            id: item.scenicSpotId,
            title: item.name,
            info: item.info || defaultInfo,
            heat: item.heat || 0,
            score: item.score,
            tags: item.tags == null ? [] : String(item.tags).split(','),
            cover: item.imgUr || defaultUrl
        }))
    } catch (error) {
        console.error('获取所有景点时出错:', error)
        return []
    }
}

export const getSpotByID = async (id) => {
    try {
        const allSpots = await getAllSpot()
        if (allSpots.length === 0) {
            return []
        }

        return allSpots.find(spot => spot.id === +id)
    } catch (error) {
        console.error('获取景点详情时出错:', error)
        return []
    }
}

export const getStarSpot = async () => {
    try {
        const token = window.localStorage.getItem('token')
        const response = await axios.get('/api/data/users/info', {
            headers: {
                Authorization: token
            }
        })

        if (!response.data.success) {
            return []
        }

        const allSpots = await getAllSpot()
        if (allSpots.length === 0) {
            return []
        }

        const starSpotIDList = response.data.data.starSpot.split(',').map(Number)

        // 创建id到景点的映射
        const spotMap = new Map(allSpots.map(spot => [spot.id, spot]))

        // 按照starSpotIDList的顺序构建结果数组
        return starSpotIDList
            .map(id => spotMap.get(id))
            .filter(spot => spot !== undefined)
    } catch (error) {
        console.error('获取收藏景点时出错:', error)
        return []
    }
}

export const setStarSpot = async (starSpot) => {
    try {
        const token = window.localStorage.getItem('token')
        const response = await axios.post('/api/data/users/changemessage', {
            starSpot: starSpot
        }, {
            headers: {
                Authorization: token
            }
        })

        return {
            success: response.data.success
        }
    } catch (error) {
        console.error('修改收藏景点时出错:', error)
        return {
            success: false
        }
    }
}