import axios from 'axios'

export const getUserInfo = async () => {
    try {
        const token = window.localStorage.getItem('token')
        const response = await axios.get('/api/data/users/info', {
            headers: {
                Authorization: token
            }
        })

        return {
            success: response.data.success,
            data: {
                username: response.data.data.username,
                avatarUrl: response.data.data.imageUrl,
                ownDiary: response.data.data.ownDiary,
                starSpot: response.data.data.starSpot
            }
        }
    } catch (error) {
        console.error('获取用户信息时出错:', error)
        return {
            success: false,
            data: {}
        }
    }
}

export const changeAvatarUrl = async (avatarUrl) => {
    try {
        const token = window.localStorage.getItem('token')
        const response = await axios.post('/api/data/users/changemessage', {
            imageUrl: avatarUrl
        }, {
            headers: {
                Authorization: token
            }
        })

        return {
            success: response.data.success,
            message: response.data.message
        }
    } catch (error) {
        console.error('修改头像时出错:', error)
        return {
            success: false,
            message: '修改头像时出错'
        }
    }
}

export const changeUserName = async (username) => {
    try {
        const token = window.localStorage.getItem('token')
        const response = await axios.post('/api/data/users/changemessage', {
            username: username
        }, {
            headers: {
                Authorization: token
            }
        })

        if (response.data.success) {
            window.localStorage.setItem('token', response.data.data)
        }

        return {
            success: response.data.success,
            message: response.data.message
        }
    } catch (error) {
        console.error('修改用户名时出错:', error)
        return {
            success: false,
            message: '修改用户名时出错'
        }
    }
}

export const changePassword = async (oldPassword, newPassword) => {
    try {
        const token = window.localStorage.getItem('token')
        const response = await axios.patch('/api/data/users/password', {
            oldPassword: oldPassword,
            newPassword: newPassword
        }, {
            headers: {
                Authorization: token
            }
        })

        if (response.data.success) {
            window.localStorage.setItem('token', response.data.data)
        }

        return {
            success: response.data.success,
            message: response.data.message
        }
    } catch (error) {
        console.error('修改密码时出错:', error)
        return {
            success: false,
            message: '修改密码时出错'
        }
    }
}

export const login = async (username, password) => {
    try {
        const response = await axios.post('/api/data/users/login', {
            username: username,
            password: password
        })

        if (response.data.success) {
            window.localStorage.setItem('token', response.data.token)
        }

        return {
            success: response.data.success,
            message: response.data.message
        }
    } catch (error) {
        console.error('登录时出错:', error)
        return {
            success: false,
            message: '登录时出错'
        }
    }
}

export const register = async (username, password) => {
    try {
        const response = await axios.post('/api/data/users/register', {
            username: username,
            password: password
        })

        return response.data
    } catch (error) {
        console.error('注册时出错:', error)
        return {
            success: false,
            message: '注册时出错'
        }
    }
}