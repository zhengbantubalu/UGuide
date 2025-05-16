import axios from 'axios'

const defaultInfo = '暂无信息'
const defaultUrl = 'http://47.93.189.31/res/bupt.ico'

export const getAllSpot = async () => {
    try {
        const response = await axios.get('/api/data/scs')

        return response.data.map(item => ({
            title: item.name,
            info: item.info || defaultInfo,
            heat: item.heat || 0,
            score: item.score,
            tags: item.tags == null ? [] : String(item.tags).split(','),
            cover: item.imgUr || defaultUrl
        }))
    } catch (error) {
        console.error('所有景点时出错:', error)
        return []
    }
}