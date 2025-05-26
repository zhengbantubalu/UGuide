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

export const getFirstStarSpotID = async () => {
    try {
        const token = window.localStorage.getItem('token')
        const response = await axios.get('/api/data/users/info', {
            headers: {
                Authorization: token
            }
        })

        if (!response.data.success) {
            return {
                success: false,
                state: 'notLogin',
                message: '请先登录'
            }
        }

        const starSpotIDList = response.data.data.starSpot.split(',')

        if (starSpotIDList[0].length === 0) {
            return {
                success: true,
                id: 1
            }
            return {
                success: false,
                state: 'noStarSpot',
                message: '请先收藏一个景点'
            }
        }

        return {
            success: true,
            message: response.data.message,
            id: starSpotIDList[0]
        }
    }
    catch (error) {
        console.error('获取首个收藏景点ID时出错:', error)
        return {
            success: false,
            state: 'error',
            message: '获取景点时出错'
        }
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

        const spotMap = new Map(allSpots.map(spot => [spot.id, spot]))

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

export const starSpot = async (id) => {
    try {
        const token = window.localStorage.getItem('token')
        // axios.get('/api/data/users/starspot/' + id,
        //     {
        //         headers: {
        //             Authorization: token
        //         }
        //     }
        // )
        const response = await axios.get('/api/data/users/info', {
            headers: {
                Authorization: token
            }
        })
        if (!response.data.success) {
            return
        }
        const starSpotIDList = response.data.data.starSpot.split(',')
        if (starSpotIDList.includes(id)) {
            return
        }
        if (starSpotIDList[0].length === 0) {
            setStarSpot(id)
        } else {
            starSpotIDList.push(id)
            setStarSpot(starSpotIDList.join(','))
        }
    } catch (error) {
        console.error('收藏景点时出错:', error)
    }
}

export const unstarSpot = async (id) => {
    try {
        const token = window.localStorage.getItem('token')
        // axios.post('/api/data/users/starspot',
        //     [id]
        //     , {
        //         headers: {
        //             Authorization: token
        //         }
        //     })
        const response = await axios.get('/api/data/users/info', {
            headers: {
                Authorization: token
            }
        })
        if (!response.data.success) {
            return
        }
        const starSpotIDList = response.data.data.starSpot.split(',')
        if (!starSpotIDList.includes(id)) {
            return
        }
        starSpotIDList.splice(starSpotIDList.indexOf(id), 1)
        setStarSpot(starSpotIDList.join(','))
    } catch (error) {
        console.error('取消收藏景点时出错:', error)
    }
}

export const isSpotStar = async (id) => {
    try {
        const token = window.localStorage.getItem('token')
        const response = await axios.get('/api/data/users/info', {
            headers: {
                Authorization: token
            }
        })

        return response.data.data.starSpot.split(',').includes(id)
    } catch (error) {
        console.error('获取景点是否收藏时出错:', error)
    }
}