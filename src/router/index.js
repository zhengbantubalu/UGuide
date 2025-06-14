import { createRouter, createWebHistory } from 'vue-router'
import Home from '../components/Home.vue'
import Spot from '../components/spot/Spot.vue'
import SpotDetail from '../components/spot/SpotDetail.vue'
import StarSpot from '../components/spot/StarSpot.vue'
import Diary from '../components/diary/Diary.vue'
import DiaryDetail from '../components/diary/DiaryDetail.vue'
import Go from '../components/go/Go.vue'
import User from '../components/user/User.vue'
import Login from '../components/user/Login.vue'
import Register from '../components/user/Register.vue'
import UserInfo from '../components/user/UserInfo.vue'

const routes = [
    {
        path: '/',
        redirect: '/home/diary'
    },
    {
        path: '/home',
        name: 'Home',
        component: Home,
        children: [
            {
                path: 'diary',
                name: 'Diary',
                component: Diary
            },
            {
                path: 'spot',
                name: 'Spot',
                component: Spot
            },
            {
                path: 'togo',
                name: 'ToGo',
                component: StarSpot
            },
            {
                path: 'user',
                name: 'User',
                component: User
            }
        ]
    },
    {
        path: '/go/:id',
        name: 'Go',
        component: Go
    },
    {
        path: '/spot/detail/:id',
        name: 'SpotDetail',
        component: SpotDetail
    },
    {
        path: '/login',
        name: 'Login',
        component: Login
    },
    {
        path: '/register',
        name: 'Register',
        component: Register
    },
    {
        path: '/user/info',
        name: 'UserInfo',
        component: UserInfo
    },
    {
        path: '/diary/detail/:id',
        name: 'DiaryDetail',
        component: DiaryDetail
    },
    {
        path: '/diary/detail/preview',
        name: 'DiaryDetailPreview',
        component: DiaryDetail
    },
    {
        path: '/diary/about/:id',
        name: 'DiaryAbout',
        component: Diary
    }
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

export default router
