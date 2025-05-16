<template>
    <div class="page-container">
        <van-list class="diary-list" :loading="loading" :finished="finished" @load="onLoadList">
            <div class="diary-item" v-for="item in diaryList" @click="goToDetail(item.id)" :key="item.id">
                <van-image class="diary-image" :src="item.coverUrl" fit="cover" />
                <div class="diary-content">
                    <div class="diary-title">{{ item.title }}</div>
                    <van-icon class="diary-username" name="user-o">{{ item.username }}</van-icon>
                </div>
            </div>
        </van-list>
    </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { getAllDiary, getOwnDiary, getHistoryDiary, getStarDiary } from '/src/api/diary'

const props = defineProps({
    type: {
        type: String,
        required: true,
        default: 'all'
    }
})

const diaryList = ref([])
const loading = ref(false)
const finished = ref(false)
const router = useRouter()

const goToDetail = (id) => {
    router.push(`/diary/detail/${id}`)
}

const updateDiaryList = async () => {
    if (props.type === 'own') {
        diaryList.value = await getOwnDiary()
    } else if (props.type === 'star') {
        diaryList.value = await getStarDiary()
    } else if (props.type === 'history') {
        diaryList.value = await getHistoryDiary()
    } else {
        diaryList.value = await getAllDiary()
    }
    loading.value = false
    finished.value = true
}

const onLoadList = async () => {
    loading.value = true
    await updateDiaryList()
}
</script>

<style scoped>
.page-container {
    padding: 5px 0px 100px 5px;
    background-color: #f0f0f0;
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