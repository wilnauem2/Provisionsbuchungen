<template>
  <div class="search-bar mb-6">
    <div class="relative group">
      <!-- Search Icon -->
      <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none" style="padding-left: 1rem;">
        <svg class="h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
        </svg>
      </div>
      
      <!-- Search Input -->
      <input 
        v-model="searchFilter" 
        @input="$emit('update:searchFilter', searchFilter)"
        @focus="isFocused = true"
        @blur="isFocused = false"
        type="text"
        placeholder="Versicherer suchen..."
        class="w-full py-3 text-gray-900 placeholder-gray-500 bg-white border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:shadow-md transition-all duration-200 hover:border-gray-400" style="padding-left: 3.5rem; padding-right: 2.5rem;"
      />
      
      <!-- Clear Button -->
      <button 
        v-if="searchFilter" 
        @click="clearSearch"
        class="absolute inset-y-0 right-0 pr-3 flex items-center group/clear"
        aria-label="Suche löschen"
      >
        <div class="p-1 rounded-full bg-gray-100 hover:bg-gray-200 group-hover/clear:bg-red-100 transition-all duration-200">
          <svg class="h-4 w-4 text-gray-400 group-hover/clear:text-red-500 transition-colors duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </div>
      </button>
      
      <!-- Focus Ring Animation -->
      <div 
        :class="[
          'absolute inset-0 rounded-xl pointer-events-none transition-all duration-200',
          isFocused ? 'ring-2 ring-blue-500 ring-opacity-50' : ''
        ]"
      ></div>
    </div>
    
    <!-- Search Results Count (optional) -->
    <div v-if="searchFilter" class="mt-2 text-sm text-gray-500 flex items-center gap-1">
      <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
      </svg>
      Suche nach: "{{ searchFilter }}"
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
const props = defineProps({
  searchFilter: {
    type: String,
    default: ''
  }
})
const emit = defineEmits(['update:searchFilter'])
const searchFilter = ref(props.searchFilter)
const isFocused = ref(false)

watch(() => props.searchFilter, (newVal) => {
  searchFilter.value = newVal
})

function clearSearch() {
  searchFilter.value = ''
  emit('update:searchFilter', '')
}
</script>
