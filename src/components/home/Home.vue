<template>
    <!-- <van-nav-bar title="UGuide" /> -->
    <router-view />
    <van-tabbar route v-model="active">
        <van-tabbar-item name="spot" icon="location" to="/home/spot">景点</van-tabbar-item>
        <van-tabbar-item name="diary" icon="notes" to="/home/diary">日记</van-tabbar-item>
        <van-tabbar-item name="user" icon="user" to="/home/user">我的</van-tabbar-item>
    </van-tabbar>
</template>

<script setup></script>

<style scoped></style>
