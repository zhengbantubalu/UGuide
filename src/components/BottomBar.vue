<script setup>
</script>

<template>
    <div class="bottom-bar">
        <RouterLink to="/" class="bottom-bar-section">
            <span class="section-name">景点</span>
        </RouterLink>
        <RouterLink to="/diary" class="bottom-bar-section">
            <span class="section-name">日记</span>
        </RouterLink>
        <RouterLink to="/user" class="bottom-bar-section">
            <span class="section-name">我的</span>
        </RouterLink>
    </div>
</template>

<style scoped>
.bottom-bar {
    position: fixed;
    bottom: 0;
    left: 0;
    display: flex;
    width: 100%;
    height: 50px;
}

.bottom-bar-section {
    display: flex;
    align-items: center;
    flex: 1;
    justify-content: center;
    border: 1px solid gray;
    background: turquoise;
    text-align: center;
    cursor: pointer;
}

.section-name {
    color: black;
    font-size: 20px;
    font-weight: bold;
}
</style>