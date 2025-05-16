import axios from 'axios'

const defaultUrl = 'http://47.93.189.31/res/Carto.jpg'
const defaultImages = [defaultUrl]

const mapResponse = (response) => {
    return response.data.map(item => ({
        id: item.id,
        title: item.head,
        username: item.username,
        coverUrl: item.imageurl || defaultUrl,
        num: item.num
    }))
}

export const getAllDiary = async () => {
    try {
        const response = await axios.get('/api/data/diary')

        return mapResponse(response)
    } catch (error) {
        console.error('获取所有日记时出错:', error)
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

        return mapResponse(response)
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

export const getDiaryDetail = async (id) => {
    try {
        const response = await axios.get('/api/data/diary/' + id)

        return {
            id: response.data.id,
            spotId: response.data.spotid,
            title: response.data.head,
            username: response.data.username,
            content: response.data.content,
            imageUrls: response.data.imageurl || defaultImages,
            num: response.data.num
        }
    } catch (error) {
        console.error('获取日记详情时出错:', error)
        return {}
    }
}

export const createDiary = async (title, content, imageUrl) => {
    try {
        const token = window.localStorage.getItem('token')
        const response = await axios.post('/api/data/diary/add', {
            head: title,
            content: content,
            imageurl: imageUrl
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

export const updateDiary = async (id, title, content, imageUrls) => {

}

export const deleteDiary = async (id) => {

}