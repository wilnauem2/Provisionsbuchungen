<template>
  <span class="ml-2">
    <svg 
      v-if="active"
      class="w-4 h-4 text-blue-500" 
      fill="none" 
      viewBox="0 0 24 24" 
      stroke="currentColor"
      :class="{ 'transform rotate-180': !ascending }"
    >
      <path 
        stroke-linecap="round" 
        stroke-linejoin="round" 
        stroke-width="2" 
        d="M5 15l7-7 7 7"
      />
    </svg>
  </span>
</template>

<script setup>
defineProps({
  active: {
    type: Boolean,
    default: false
  },
  ascending: {
    type: Boolean,
    default: true
  }
});
</script>
