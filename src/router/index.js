import { createRouter, createWebHistory } from 'vue-router';
import Home from '../components/home/Home.vue';
import Diary from '../components/home/Diary.vue';
import Spot from '../components/home/Spot.vue';
import Go from '../components/home/Go.vue';
import ToGo from '../components/home/ToGo.vue';
import User from '../components/home/User.vue';
import Map from '../components/spot/Map.vue';
import Login from '../components/user/Login.vue';
import Register from '../components/user/Register.vue';
import UserInfo from '../components/user/UserInfo.vue';
import DiaryDetail from '../components/diary/DiaryDetial.vue';
import Test from '../components/Test.vue';

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
                path: 'go',
                name: 'Go',
                component: Map
            },
            {
                path: 'togo',
                name: 'ToGo',
                component: ToGo
            },
            {
                path: 'user',
                name: 'User',
                component: User
            }
        ]
    },
    {
        path: '/map',
        name: 'Map',
        component: Map
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
        path: '/diary/detail',
        name: 'DiaryDetail',
        component: DiaryDetail
    },
    {
        path: '/test',
        name: 'Test',
        component: Diary
    }
];

const router = createRouter({
    history: createWebHistory(),
    routes
});

export default router;
