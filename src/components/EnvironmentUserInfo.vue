<template>
  <div class="flex flex-col items-center gap-3 mt-1">
    <div class="environment-switch">
      <select
        :value="currentEnvironmentLocal"
        @change="onEnvironmentChange"
        class="px-3 py-2 border border-gray-300 rounded-md text-sm bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
      <option value="production" class="text-gray-700">Produktion</option>
      <option value="test" class="text-gray-700">Test</option>
    </select>
    </div>
    <div class="flex items-center gap-3 flex-wrap justify-center">
      <span class="text-sm text-gray-600 whitespace-nowrap">Angemeldet als: {{ username }}</span>
      <button 
        @click="$emit('logout')"
        class="group inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white text-sm font-medium rounded-lg shadow-md hover:from-red-600 hover:to-red-700 hover:shadow-lg transform hover:scale-105 transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 active:scale-95"
        aria-label="Abmelden"
      >
        <svg class="h-4 w-4 group-hover:rotate-12 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
        </svg>
        <span class="font-semibold">Abmelden</span>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
const props = defineProps({
  currentEnvironment: String,
  username: String
})
const emit = defineEmits(['update:currentEnvironment', 'logout'])
const currentEnvironmentLocal = ref(props.currentEnvironment)
watch(() => props.currentEnvironment, val => {
  currentEnvironmentLocal.value = val
})
function onEnvironmentChange(e) {
  emit('update:currentEnvironment', e.target.value)
}
</script>
