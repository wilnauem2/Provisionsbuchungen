<template>
  <div style="padding: 20px; background-color: lightblue; min-height: 100vh;">
    <h1 style="color: darkblue; font-size: 24px;">Basic Vue Test</h1>
    <p style="color: black; font-size: 16px;">This is a basic Vue component without Tailwind CSS.</p>
    <button 
      @click="count++" 
      style="background-color: blue; color: white; padding: 10px 20px; border: none; border-radius: 5px; cursor: pointer;"
    >
      Count: {{ count }}
    </button>
    <div style="margin-top: 20px;">
      <p>Current time: {{ currentTime }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const count = ref(0)
const currentTime = ref('')

onMounted(() => {
  currentTime.value = new Date().toLocaleString()
  console.log('BasicTest component mounted successfully!')
})
</script>
