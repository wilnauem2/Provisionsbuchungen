<template>
  <div class="tabs mb-4">
    <button 
      @click="$emit('update:activeTab', 'main')" 
      :class="{ 'border-b-2 border-blue-500 text-blue-600': activeTab === 'main' }"
      class="px-4 py-2 font-medium text-gray-700 hover:text-blue-600 focus:outline-none"
    >
      Übersicht
    </button>
    <button 
      @click="$emit('update:activeTab', 'history')" 
      :class="{ 'border-b-2 border-blue-500 text-blue-600': activeTab === 'history' }"
      class="px-4 py-2 font-medium text-gray-700 hover:text-blue-600 focus:outline-none"
    >
      Abrechnungsverlauf
    </button>
  </div>
</template>

<script setup>
const props = defineProps({
  activeTab: {
    type: String,
    required: true
  }
})
</script>
