<script setup>
import { ref } from "vue"
import TopBar from "./TopBar.vue"
import BottomBar from "./BottomBar.vue"
const spotList = ref([
    {
        text: "北京邮电大学1"
    },
    {
        text: "北京邮电大学2"
    },
    {
        text: "北京邮电大学3"
    },
    {
        text: "北京邮电大学4"
    },
    {
        text: "北京邮电大学5"
    },
    {
        text: "北京邮电大学6"
    },
    {
        text: "北京邮电大学7"
    },
    {
        text: "北京邮电大学8"
    },
    {
        text: "北京邮电大学9"
    },
    {
        text: "北京邮电大学10"
    },
    {
        text: "北京邮电大学11"
    },
    {
        text: "北京邮电大学12"
    }
])
</script>

<template>
    <TopBar />
    <div class="spot-list">
        <RouterLink to="/map" v-for="item in spotList">
            <div class="spot-list-item">
                <span class="spot-name">{{ item.text }}</span>
            </div>
        </RouterLink>
    </div>
    <BottomBar />
</template>

<style scoped>
.spot-list {
    display: flex;
    flex-direction: column;
    box-sizing: border-box;
    width: 100%;
    padding: 5px 10px;
}

.spot-list-item {
    display: flex;
    overflow: hidden;
    align-items: center;
    justify-content: center;
    margin-top: 10px;
    padding: 20px;
    width: 100%;
    height: 120px;
    border-radius: 20px;
    background: #eeffff;
    box-shadow: rgba(0, 0, 0, 0.2) 0px 4px 12px;
}

.spot-name {
    color: black;
    font-size: 25px;
    font-weight: bold;
}
</style>