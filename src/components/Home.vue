<template>
    <van-nav-bar v-if="currentRoute === '/home/diary' || currentRoute === '/home/spot'" right-text="搜索"
        :right-disabled="searchBtnDisabled" @click-right="onSearch" z-index="5">
        <template #left>
            <van-image round class="user-avatar" :src="avatarUrl" :show-loading="false" fit="cover" />
        </template>
        <template #title>
            <van-search ref="searchRef" v-model="searchValue" right-icon="filter-o" placeholder="请输入关键词" shape="round"
                @search="onSearch" @click-left-icon="onSearch" @click-right-icon="handleFilter"
                @focus="searchBtnDisabled = false" />
        </template>
    </van-nav-bar>
    <van-nav-bar v-else-if="currentRoute === '/home/togo'" title="想去" />
    <van-nav-bar v-else-if="currentRoute === '/home/user'" title="我的" />
    <router-view class="home-page" v-slot="{ Component }" v-if="currentRoute === '/home/diary'">
        <component :is="Component" ref="diaryRef" />
    </router-view>
    <router-view class="home-page" v-else />
    <van-button class="back-to-top" icon="back-top" @click="scrollToTop" round />
    <van-tabbar route :border="false">
        <van-tabbar-item replace icon="medal" to="/home/diary" @click="scrollToTop">发现</van-tabbar-item>
        <van-tabbar-item replace icon="location" to="/home/spot" @click="scrollToTop">景点</van-tabbar-item>
        <div class="gap"></div>
        <van-tabbar-item icon="play-circle" class="go" @click="go">出发</van-tabbar-item>
        <div class="gap"></div>
        <van-tabbar-item replace icon="star" to="/home/togo" @click="scrollToTop">想去</van-tabbar-item>
        <van-tabbar-item replace icon="user" to="/home/user" @click="scrollToTop">我的</van-tabbar-item>
    </van-tabbar>
    <van-popup class="popup" v-model:show="showDiaryFilter" round position="top" z-index="3">
        <van-checkbox-group class="checkbox-group" v-model="diarySearchType" direction="horizontal"
            @change="handleDiaryCheckboxChange">
            <van-checkbox name="exact">全文精确匹配</van-checkbox>
            <van-checkbox name="title">标题精确匹配</van-checkbox>
        </van-checkbox-group>
    </van-popup>
    <van-popup class="popup" v-model:show="showSpotFilter" round position="top" z-index="3">
        <van-checkbox-group class="checkbox-group" v-model="spotSearchType" direction="horizontal"
            @change="handleSpotCheckboxChange">
            <van-checkbox name="exact">选项一</van-checkbox>
            <van-checkbox name="title">选项二</van-checkbox>
            <van-checkbox name="fds">选项三</van-checkbox>
        </van-checkbox-group>
    </van-popup>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { getFirstStarSpotID } from '/src/api/spot'
import { useRouter, useRoute } from 'vue-router'
import { getUserInfo } from '/src/api/user'
import { showFailToast } from 'vant'

const router = useRouter()
const route = useRoute()
const searchValue = ref('')
const avatarUrl = ref('')
const searchBtnDisabled = ref(true)
const searchRef = ref(null)
const currentRoute = computed(() => route.path)
const diaryRef = ref(null)
const showDiaryFilter = ref(false)
const showSpotFilter = ref(false)
const diarySearchType = ref([])
const spotSearchType = ref([])

const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
}

const onSearch = async () => {
    const query = searchValue.value
    if (currentRoute.value === '/home/diary') {
        let option = 'semantic'
        if (diarySearchType.value.length !== 0) {
            option = diarySearchType.value[0]
        }
        diaryRef.value.searchDiary(query, option)
    }
    searchRef.value.blur()
    searchBtnDisabled.value = true
    showDiaryFilter.value = false
}

const handleFilter = () => {
    window.scrollTo({ top: 0 })
    if (currentRoute.value === '/home/diary') {
        showDiaryFilter.value = !showDiaryFilter.value
        if (showDiaryFilter.value) {
            searchRef.value.focus()
        }
    } else if (currentRoute.value === '/home/spot') {
        showSpotFilter.value = !showSpotFilter.value
        if (showSpotFilter.value) {
            searchRef.value.focus()
        }
    }
}

const handleDiaryCheckboxChange = (names) => {
    if (names.length > 1) {
        diarySearchType.value = [names[names.length - 1]]
    }
}

const handleSpotCheckboxChange = (names) => {
    if (names.length > 1) {
        spotSearchType.value = [names[names.length - 1]]
    }
}

onMounted(async () => {
    if (window.localStorage.getItem('login') === 'true') {
        const { success, data } = await getUserInfo()
        if (success) {
            if (data.avatarUrl) {
                avatarUrl.value = data.avatarUrl
            } else {
                avatarUrl.value = "http://47.93.189.31/res/bupt.ico"
            }
        } else {
            window.localStorage.setItem('login', false)
            avatarUrl.value = "http://47.93.189.31/res/bupt.ico"
        }
    }
    else {
        avatarUrl.value = "http://47.93.189.31/res/bupt.ico"
    }
})

const go = async () => {
    const { success, state, message, id } = await getFirstStarSpotID()
    if (success) {
        router.push(`/go/${id}`)
    } else {
        showFailToast(message)
        if (state === 'notLogin') {
            router.push('/login')
        } else if (state === 'notStarSpot') {
            router.push('/home/spot')
        }
    }
}
</script>

<style scoped>
.home-page {
    min-height: 100vh;
    background-color: #f0f0f0;
}

.back-to-top {
    position: fixed;
    right: 20px;
    bottom: 80px;
    z-index: 1;
    width: 45px;
    height: 45px;
    background-color: #50a7ff;
    font-size: 18px;
    color: white;
    --van-button-border-width: 0px;
}

.user-avatar {
    margin-left: 10px;
    width: 34px;
    height: 34px;
}

.go {
    position: absolute;
    left: 50%;
    z-index: 1;
    transform: translateX(-50%) translateY(-25%);
    height: 60px;
    width: 60px;
    border-radius: 50%;
    box-shadow: inset 0 0 10px rgba(0, 0, 0, 0.2), 0 0 0 8px white;
    background-color: #50a7ff;
    color: white;
}

.gap {
    width: 40px;
}

.popup {
    padding: 60px 40px 15px 40px;
}

.checkbox-group {
    display: flex;
    align-items: center;
    justify-content: space-between;
}

:deep(.van-nav-bar__left) {
    padding: 0;
}

:deep(.van-nav-bar__title) {
    max-width: 100%;
    width: 100%;
    margin: 0px 40px;
}

:deep(.van-search) {
    padding: 0px 15px;
}

:deep(.van-button--default) {
    border: 0px;
}
</style>