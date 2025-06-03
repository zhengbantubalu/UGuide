import axios from 'axios'

const defaultUrl = 'http://47.93.189.31/res/diary/Carto.jpg'
const defaultImages = [defaultUrl, defaultUrl, defaultUrl, defaultUrl, defaultUrl]

const mapResponse = (response) => {
    return response.data.map(item => {
        const originalCoverUrl = (item.imageurl && item.imageurl.split(',')[0]) || defaultUrl
        const coverUrl = originalCoverUrl.replace('/diary/', '/diary/thumb/')

        return {
            id: item.id,
            title: item.head,
            username: item.username,
            coverUrl: coverUrl,
            num: item.num || 0,
            score: item.score || 0
        }
    })
}

const getDiaryByIDs = async (ids) => {
    try {
        const response = await axios.post('/api/data/diary/get', ids)

        return mapResponse(response)
    }
    catch (error) {
        console.error('根据id获取日记列表时出错:', error)
        return []
    }
}

const getAllDiary = async () => {
    try {
        const response = await axios.get('/api/data/diary')

        return mapResponse(response).reverse()
    } catch (error) {
        console.error('获取所有日记时出错:', error)
        return []
    }
}

export const getRandomDiary = async () => {
    try {
        const allDiary = await getAllDiary()
        return allDiary
        return allDiary.sort(() => Math.random() - 0.5).slice(0, 20)
    }
    catch (error) {
        console.error('获取随机日记时出错:', error)
        return []
    }
}

export const getDiaryBySpotID = async (spotId) => {
    try {
        const response = await axios.post('/api/arith/diary/search_by_category', {
            spot_id: spotId
        })

        if (response.data.status !== 'success') {
            return []
        }

        return getDiaryByIDs(response.data.ids)
    } catch (error) {
        console.error('获取景点下的日记时出错:', error)
        return []
    }
}

export const getOwnDiary = async () => {
    try {
        const token = window.localStorage.getItem('token')
        const response = await axios.get('/api/data/users/owndiary', {
            headers: {
                Authorization: token
            }
        })

        return mapResponse(response).reverse()
    } catch (error) {
        console.error('获取用户发布日记时出错:', error)
        return []
    }
}

export const getHistoryDiary = async () => {
    try {
        const token = window.localStorage.getItem('token')
        const response = await axios.get('/api/data/users/historydiary', {
            headers: {
                Authorization: token
            }
        })

        return mapResponse(response)
    } catch (error) {
        console.error('获取用户历史日记时出错:', error)
        return []
    }
}

export const getStarDiary = async () => {
    try {
        const token = window.localStorage.getItem('token')
        const response = await axios.get('/api/data/users/stardiary', {
            headers: {
                Authorization: token
            }
        })

        return mapResponse(response)
    } catch (error) {
        console.error('获取用户收藏日记时出错:', error)
        return []
    }
}

const handleSearchResponse = async (response) => {
    if (response.data.status !== 'success') {
        return {
            success: false,
            data: []
        }
    }

    return {
        success: true,
        data: await getDiaryByIDs(response.data.ids)
    }
}

export const getDiaryByExactSearch = async (query) => {
    try {
        const response = await axios.post('/api/arith/diary/search', {
            query: query
        })

        return handleSearchResponse(response)
    } catch (error) {
        console.error('精确搜索日记时出错:', error)
        return {
            success: false,
            data: []
        }
    }
}

export const getDiaryByTitleSearch = async (query) => {
    try {
        const response = await axios.post('/api/arith/diary/title_search', {
            query: query
        })

        return handleSearchResponse(response)
    } catch (error) {
        console.error('搜索日记标题时出错:', error)
        return {
            success: false,
            data: []
        }
    }
}

export const getDiaryBySemanticSearch = async (query) => {
    try {
        const response = await axios.post('/api/arith/diary/semantic_search', {
            query: query
        })

        return handleSearchResponse(response)
    } catch (error) {
        console.error('语义搜索日记时出错:', error)
        return {
            success: false,
            data: []
        }
    }
}

export const getTopDiary = async () => {
    try {
        const response = await axios.get('/api/arith/diary/top_diaries')

        return getDiaryByIDs(response.data.ids)
    } catch (error) {
        console.error('获取按热度排序日记时出错:', error)
        return []
    }
}

export const getRecommendDiary = async () => {
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

        const response = await axios.post('/api/arith/diary/diary/recommend', {
            user_id: userRes.data.data.id
        })

        return getDiaryByIDs(response.data.ids)
    } catch (error) {
        console.error('获取个性化推荐日记时出错:', error)
        return []
    }
}

export const getDiaryDetail = async (id) => {
    try {
        const token = window.localStorage.getItem('token')
        const response = await axios.get('/api/data/diary/' + id, {
            headers: {
                Authorization: token
            }
        })

        return {
            id: response.data.id,
            spotId: response.data.spotId,
            title: response.data.head,
            content: response.data.content,
            imageUrls: (response.data.imageUrl && response.data.imageUrl.split(',')) || defaultImages,
            num: response.data.num
        }
    } catch (error) {
        console.error('获取日记详情时出错:', error)
        return {}
    }
}

export const createDiary = async (title, content, imageUrl, spotId) => {
    try {
        const token = window.localStorage.getItem('token')
        const response = await axios.post('/api/data/diary/add', {
            head: title,
            content: content,
            imageUrl: imageUrl,
            spotId: spotId
        }, {
            headers: {
                Authorization: token
            }
        })

        let id = -1
        if (response.data.success) {
            const token = window.localStorage.getItem('token')
            const response = await axios.get('/api/data/users/info', {
                headers: {
                    Authorization: token
                }
            })
            if (response.data.success) {
                id = response.data.data.ownDiary.split(',').pop()
            }
        }

        return {
            success: response.data.success,
            message: response.data.message,
            id: id
        }
    } catch (error) {
        console.error('创建日记时出错:', error)
        return {}
    }
}

export const updateDiary = async (id, title, content, imageUrls) => { }

export const deleteDiary = async (id) => { }

export const starDiary = async (id) => {
    try {
        const token = window.localStorage.getItem('token')
        axios.get('/api/data/users/diary/addstar/' + id, {
            headers: {
                Authorization: token
            }
        })
    } catch (error) {
        console.error('收藏日记时出错:', error)
    }
}

export const unstarDiary = async (id) => {
    try {
        const token = window.localStorage.getItem('token')
        axios.post('/api/data/users/stardiary',
            [id]
            , {
                headers: {
                    Authorization: token
                }
            })
    } catch (error) {
        console.error('取消收藏日记时出错:', error)
    }
}

export const isDiaryStar = async (id) => {
    try {
        const token = window.localStorage.getItem('token')
        const response = await axios.get('/api/data/users/info', {
            headers: {
                Authorization: token
            }
        })

        if (!response.data.data.starDiary) {
            return false
        }

        return response.data.data.starDiary.split(',').includes(id)
    } catch (error) {
        console.error('获取日记是否收藏时出错:', error)
    }
}

export const refreshDiarySearch = async () => {
    try {
        axios.post('/api/arith/diary/refresh_index')
    } catch (error) {
        console.error('刷新日记搜索时出错:', error)
    }
}