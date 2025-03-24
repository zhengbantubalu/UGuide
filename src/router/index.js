import { createRouter, createWebHistory } from 'vue-router';

const router = createRouter({
    history: createWebHistory(),
    routes: [
        {
            path: '/',
            component: () => import('../components/Spot.vue')
        },
        {
            path: '/diary',
            component: () => import('../components/Diary.vue')
        },
        {
            path: '/user',
            component: () => import('../components/User.vue')
        },
        {
            path: '/map',
            component: () => import('../components/Map.vue')
        }
    ]
});

export default router;
