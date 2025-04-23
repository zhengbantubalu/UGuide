<template>
    <!-- <van-nav-bar title="UGuide" /> -->
    <router-view />
    <van-tabbar route>
        <van-tabbar-item replace name="diary" icon="medal" to="/home/diary">发现</van-tabbar-item>
        <van-tabbar-item replace name="spot" icon="location" to="/home/spot">景点</van-tabbar-item>
        <div class="gap"></div>
        <van-tabbar-item name="go" icon="play-circle" to="/go" class="go">出发</van-tabbar-item>
        <div class="gap"></div>
        <van-tabbar-item replace name="togo" icon="star" to="/home/togo">想去</van-tabbar-item>
        <van-tabbar-item replace name="user" icon="user" to="/home/user">我的</van-tabbar-item>
    </van-tabbar>
</template>

<script setup></script>

<style scoped>
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
</style>