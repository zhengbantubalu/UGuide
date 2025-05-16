import axios from 'axios'

export const uploadAvatar = async (avatar) => {
    try {
        const formData = new FormData()
        formData.append('file', avatar)
        const token = window.localStorage.getItem('token')
        const response = await axios.post('/api/upload/user/avatar',
            formData,
            {
                headers: {
                    Authorization: token
                }
            }
        )

        return {
            success: response.data.success,
            message: response.data.message,
            avatarUrl: response.data.fileUrl
        }
    } catch (error) {
        console.error('上传头像时出错:', error)
        return {
            success: false,
            message: '上传头像时出错'
        }
    }
}

export const uploadDiaryCover = async (cover) => {
    try {
        const formData = new FormData()
        formData.append('file', cover)
        const token = window.localStorage.getItem('token')
        const response = await axios.post('/api/upload/diary',
            formData,
            {
                headers: {
                    Authorization: token
                }
            }
        )

        return {
            success: response.data.success,
            message: response.data.message,
            imgUrl: response.data.fileUrl
        }
    } catch (error) {
        console.error('上传封面时出错:', error)
        return {
            success: false,
            message: '上传封面时出错'
        }
    }
}