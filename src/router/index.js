import { createRouter, createWebHistory } from 'vue-router';
import Home from '../components/home/Home.vue';
import Spot from '../components/home/Spot.vue';
import Diary from '../components/home/Diary.vue';
import User from '../components/home/User.vue';
import Map from '../components/spot/Map.vue';
import Login from '../components/user/Login.vue';
import Register from '../components/user/Register.vue';

const routes = [
    {
        path: '/',
        redirect: '/home/spot'
    },
    {
        path: '/home',
        name: 'Home',
        component: Home,
        children: [
            {
                path: 'spot',
                name: 'Spot',
                component: Spot
            },
            {
                path: 'diary',
                name: 'Diary',
                component: Diary
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
    }
];

const router = createRouter({
    history: createWebHistory(),
    routes
});

export default router;
