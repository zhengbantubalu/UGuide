import axios from 'axios'

export const generateDiary = async (content) => {
    try {
        const response = await axios.post('/api/ai', {
            "model": "x1",
            "user": "user_id",
            "messages": [
                {
                    "role": "system",
                    "content": "你是一个游览北京邮电大学的游客，我将给你打卡列表，根据打卡列表生成200字左右的游记，首行为15字以内的游记标题。打卡点格式如下：自邮制造|商店|0,田径场|运动场|0,西门|大门|1,学2公寓|宿舍|1，其中第一个表示地点名称，第二个表示地点类型，第三个为1表示去打卡了，为0表示想去但是没去成。直接输出结果，首行为标题，其余为正文，标题和正文之间不要空行"
                },
                {
                    "role": "user",
                    "content": content
                }
            ]
        }, {
            headers: {
                Authorization: "Bearer FCSfGGgzhtoMvQrhUHDp:ABJMWqfrCKrWhogsebSk",
                "Content-Type": "application/json"
            }
        })

        const text = response.data.choices[0].message.content
        return {
            title: text.split('\n')[0],
            content: text.split('\n').slice(1)
        }
    }
    catch (error) {
        console.error('生成日记时出错:', error)
        return []
    }
}