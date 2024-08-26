<script setup>
import HeaderComponent from "./components/HeaderComponent.vue";
</script>
<template>
  <HeaderComponent />
  <div class="page">
    <RouterView />
  </div>
</template>

<style lang="scss">
@import "assets/scss/style.scss?v=1.1";
</style>
