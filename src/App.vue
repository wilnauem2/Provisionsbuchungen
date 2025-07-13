<template>
  <div class="app">
    <router-view></router-view>
  </div>
</template>

<style>
body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
}

.app {
  min-height: 100vh;
  background-color: #f3f4f6;
}

.header-container {
  position: sticky;
  top: 0;
  z-index: 10;
}

.content {
  padding-top: 1rem;
}
</style>
