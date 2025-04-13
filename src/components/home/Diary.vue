<template>
    <div class="page-container">
        <van-list class="diary-list" :loading="loading" :finished="finished" @load="onLoad">
            <div class="diary-item" v-for="item in diaryList" @click="goToDetail">
                <van-image class="diary-image" :src="item.cover" fit="cover" />
                <div class="diary-content">
                    <div class="diary-title">{{ item.title }}</div>
                    <van-icon class="diary-username" name="user-o">{{ item.username }}</van-icon>
                </div>
            </div>
        </van-list>
    </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const randomTitles = [
    '今日的奇妙冒险',
    '美食探索之旅',
    '大自然的宁静时刻',
    '艺术的灵感碰撞',
    '运动带来的活力',
    '与朋友的欢乐时光',
    '工作中的小成就',
    '学习新技能的挑战',
    '夜晚的星空之美',
    '阅读带来的心灵滋养'
];

const randomUsernames = [
    '大夫',
    '大概士夫',
    '大概士大夫',
    '大概士概士夫',
    '大概士大大概士夫',
    '大概士大夫大概士大夫',
    '旅行者',
    '探险家'
];

// 生成随机标题的函数
const getRandomTitle = () => {
    const randomIndex = Math.floor(Math.random() * randomTitles.length);
    return randomTitles[randomIndex];
};

// 生成随机用户名的函数
const getRandomUsername = () => {
    const randomIndex = Math.floor(Math.random() * randomUsernames.length);
    return randomUsernames[randomIndex];
};

// 模拟列表数据
const diaryList = ref([
    {
        cover: 'http://47.93.189.31/res/Carto.jpg',
        username: getRandomUsername(),
        title: getRandomTitle()
    },
    {
        cover: 'http://47.93.189.31/res/Carto.jpg',
        username: getRandomUsername(),
        title: getRandomTitle()
    },
    {
        cover: 'http://47.93.189.31/res/Carto.jpg',
        username: getRandomUsername(),
        title: getRandomTitle()
    },
    {
        cover: 'http://47.93.189.31/res/Carto.jpg',
        username: getRandomUsername(),
        title: getRandomTitle()
    },
    {
        cover: 'http://47.93.189.31/res/Carto.jpg',
        username: getRandomUsername(),
        title: getRandomTitle()
    },
    {
        cover: 'http://47.93.189.31/res/Carto.jpg',
        username: getRandomUsername(),
        title: getRandomTitle()
    },
    {
        cover: 'http://47.93.189.31/res/Carto.jpg',
        username: getRandomUsername(),
        title: getRandomTitle()
    },
    {
        cover: 'http://47.93.189.31/res/Carto.jpg',
        username: getRandomUsername(),
        title: getRandomTitle()
    },
    {
        cover: 'http://47.93.189.31/res/Carto.jpg',
        username: getRandomUsername(),
        title: getRandomTitle()
    },
    {
        cover: 'http://47.93.189.31/res/Carto.jpg',
        username: getRandomUsername(),
        title: getRandomTitle()
    },
    {
        cover: 'http://47.93.189.31/res/Carto.jpg',
        username: getRandomUsername(),
        title: getRandomTitle()
    },
    {
        cover: 'http://47.93.189.31/res/Carto.jpg',
        username: getRandomUsername(),
        title: getRandomTitle()
    },
    {
        cover: 'http://47.93.189.31/res/Carto.jpg',
        username: getRandomUsername(),
        title: getRandomTitle()
    }
]);
const loading = ref(false);
const finished = ref(false);
const router = useRouter();

const goToDetail = () => {
    router.push('/diary/detail');
};

</script>

<style scoped>
.page-container {
    background-color: #f0f0f0;
    padding: 5px 0px 100px 5px;
}

.diary-list {
    display: flex;
    flex-wrap: wrap;
    gap: 5px;
}

.diary-item {
    width: calc(50% - 5px);
    aspect-ratio: 5 / 6;
    position: relative;
    border-radius: 10px;
    overflow: hidden;
    background-color: white;
}

.diary-image {
    width: 100%;
    height: 60%;
}

.diary-content {
    padding: 0px 10px 20px 10px;
    background-color: white;
    height: 40%;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    align-items: flex-start;
}

.diary-title {
    color: black;
    font-size: 16px;
    word-wrap: break-word;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    overflow: hidden;
    text-overflow: ellipsis;
}

.diary-username {
    color: gray;
    font-size: 12px;
    display: flex;
    gap: 3px;
}
</style>