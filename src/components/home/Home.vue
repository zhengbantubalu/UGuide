<template>
    <!-- <van-nav-bar title="UGuide" /> -->
    <router-view />
    <van-tabbar route v-model="active">
        <van-tabbar-item name="diary" icon="medal" to="/home/diary">发现</van-tabbar-item>
        <van-tabbar-item name="spot" icon="location" to="/home/spot">景点</van-tabbar-item>
        <van-tabbar-item name="go" icon="play-circle" to="/home/go">出发</van-tabbar-item>
        <van-tabbar-item name="togo" icon="star" to="/home/togo">想去</van-tabbar-item>
        <van-tabbar-item name="user" icon="user" to="/home/user">我的</van-tabbar-item>
    </van-tabbar>
</template>

<script setup></script>

<style scoped></style>
