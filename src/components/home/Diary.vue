<template>
    <div class="page-container">
        <van-list class="diary-list" :loading="loading" :finished="finished" @load="onLoad">
            <div class="diary-item" v-for="item in diaryList" @click="goToPost">
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

// 模拟列表数据
const diaryList = ref([
    { cover: 'http://47.93.189.31/res/Carto.jpg', username: '大夫', title: '这是受到广泛大广泛大概士大夫士大夫随风倒家分工四道口附近啊文库标题' },
    { cover: 'http://47.93.189.31/res/Carto.jpg', username: '大概士夫', title: '泛大广泛大概士大夫士大夫随风倒家分工四道口附近啊文库标' },
    { cover: 'http://47.93.189.31/res/Carto.jpg', username: '大概士大夫', title: '泛大广泛大概士大夫士大夫随风倒家分工四' },
    { cover: 'http://47.93.189.31/res/Carto.jpg', username: '大概士概士夫', title: '广泛大概士大夫士大夫随' },
    { cover: 'http://47.93.189.31/res/Carto.jpg', username: '大概士大大概士夫', title: '大广泛大概士大' },
    { cover: 'http://47.93.189.31/res/Carto.jpg', username: '大概士大夫大概士大夫', title: '泛大概士' },
    { cover: 'http://47.93.189.31/res/Carto.jpg', username: '用户1', title: '标题 1' },
    { cover: 'http://47.93.189.31/res/Carto.jpg', username: '用户1', title: '标题 1' },
    { cover: 'http://47.93.189.31/res/Carto.jpg', username: '用户1', title: '标题 1' },
    { cover: 'http://47.93.189.31/res/Carto.jpg', username: '用户1', title: '标题 1' },
    { cover: 'http://47.93.189.31/res/Carto.jpg', username: '用户1', title: '标题 1' },
    { cover: 'http://47.93.189.31/res/Carto.jpg', username: '用户1', title: '标题 1' },
    { cover: 'http://47.93.189.31/res/Carto.jpg', username: '用户1', title: '标题 1' }
]);
const loading = ref(false);
const finished = ref(false);
const router = useRouter();

const goToPost = () => {
    router.push('/map');
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