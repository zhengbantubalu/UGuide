import axios from 'axios'

const defaultInfo = '暂无信息'
const defaultUrl = 'http://47.93.189.31/res/bupt.ico'

// 获取所有景点，已弃用
const getAllSpot = async () => {
    try {
        const response = await axios.get('/api/data/scs')

        return response.data.map(item => ({
            id: item.scenicSpotId,
            title: item.name,
            info: item.info || defaultInfo,
            heat: item.hotnum || 0,
            score: Math.floor(item.score * 10) || 0,
            tags: item.tags == null ? [] : String(item.tags).split(','),
            cover: item.imgUr || defaultUrl
        }))
    } catch (error) {
        console.error('获取所有景点时出错:', error)
        return []
    }
}

const getSpotByIDs = async (ids) => {
    try {
        const response = await axios.post('/api/data/scs', ids)

        return response.data.map(item => ({
            id: item.scenicSpotId,
            title: item.name,
            info: item.info || defaultInfo,
            heat: item.hotnum || 0,
            score: Math.floor(item.score * 10) || 0,
            tags: item.tags == null ? [] : String(item.tags).split(','),
            cover: item.imgUr || defaultUrl
        }))
    } catch (error) {
        console.error('根据id获取景点列表时出错:', error)
        return []
    }
}

export const getRandomSpot = async () => {
    try {
        const randomIds = Array.from({ length: 20 }, () => Math.floor(Math.random() * 1000) + 2)
        randomIds[0] = 1

        return getSpotByIDs(randomIds)
    } catch (error) {
        console.error('获取随机景点时出错:', error)
        return []
    }
}

const handleSearchResponse = async (response) => {
    try {
        if (response.data.status !== 'success') {
            return {
                success: false,
                data: []
            }
        }

        return {
            success: true,
            data: await getSpotByIDs(response.data.ids)
        }
    } catch (error) {
        console.error('处理搜索结果时出错:', error)
        return {
            success: false,
            data: []
        }
    }
}

export const getSpotByNameSearch = async (query) => {
    try {
        const response = await axios.post('/api/arith/diary/scenic_spot/search/name', {
            query: query
        })

        return handleSearchResponse(response)
    } catch (error) {
        console.error('搜索景点名称时出错:', error)
        return {
            success: false,
            data: []
        }
    }
}

export const getSpotByTagSearch = async (query) => {
    try {
        const response = await axios.post('/api/arith/diary/scenic_spot/search/tags', {
            tag: query
        })

        return handleSearchResponse(response)
    } catch (error) {
        console.error('搜索景点标签时出错:', error)
        return {
            success: false,
            data: []
        }
    }
}

export const getTopSpot = async () => {
    try {
        const response = await axios.get('/api/arith/diary/top_spots')

        return getSpotByIDs(response.data.ids)
    } catch (error) {
        console.error('获取按热度排序景点时出错:', error)
        return []
    }
}

export const getRecommendSpot = async () => {
    try {
        const token = window.localStorage.getItem('token')
        const userRes = await axios.get('/api/data/users/info', {
            headers: {
                Authorization: token
            }
        })

        if (!userRes.data.success) {
            return []
        }

        const response = await axios.post('/api/arith/diary/scenic_spot/recommend', {
            user_id: userRes.data.data.id
        })

        return getSpotByIDs(response.data.ids)
    } catch (error) {
        console.error('获取个性化推荐景点时出错:', error)
        return []
    }
}

export const getSpotByID = async (id) => {
    try {
        return (await getSpotByIDs([id]))[0]
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

        if (!response.data.data.starSpot) {
            return {
                success: true,
                id: 1
            }
        }

        const starSpotIDList = response.data.data.starSpot.split(',')

        if (starSpotIDList[0].length === 0) {
            return {
                success: true,
                id: 1
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

        const starSpotIDList = response.data.data.starSpot.split(',').map(Number)

        return getSpotByIDs(starSpotIDList)
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
        const response = await axios.get('/api/data/users/info', {
            headers: {
                Authorization: token
            }
        })
        if (!response.data.success) {
            return
        }
        let starSpotIDList = ['']
        if (response.data.data.starSpot) {
            starSpotIDList = response.data.data.starSpot.split(',')
        }
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

        if (!response.data.data.starSpot) {
            return false
        }

        return response.data.data.starSpot.split(',').includes(id)
    } catch (error) {
        console.error('获取景点是否收藏时出错:', error)
    }
}