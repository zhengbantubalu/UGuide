import axios from 'axios'

export const getToGoList = async () => {
    try {
        const token = window.localStorage.getItem('token')
        const response = await axios.get('/api/data/users/info', {
            headers: {
                Authorization: token
            }
        })

        return {
            success: response.data.success,
            data: response.data.data.toGoList
        }
    } catch (error) {
        console.error('获取打卡列表时出错:', error)
        return {
            success: false,
            data: ''
        }
    }
}

export const setToGoList = async (toGoList) => {
    try {
        const token = window.localStorage.getItem('token')
        const response = await axios.post('/api/data/users/changemessage', {
            toGoList: toGoList
        }, {
            headers: {
                Authorization: token
            }
        })

        return {
            success: response.data.success
        }
    } catch (error) {
        console.error('修改打卡列表时出错:', error)
        return {
            success: false
        }
    }
}