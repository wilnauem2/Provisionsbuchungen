<template>
  <div class="h-full flex flex-col">
    <h2 class="text-lg font-semibold mb-4 text-gray-800">
      Versicherer ({{ insurers.length }})
    </h2>
    
    <div class="flex-1 overflow-y-auto">
      <div class="space-y-2">
        <div 
          v-for="insurer in insurers" 
          :key="insurer.name"
          :class="[
            'p-3 rounded-lg cursor-pointer transition-all duration-200 border',
            selectedInsurer?.name === insurer.name 
              ? 'bg-blue-100 border-blue-300 shadow-md' 
              : 'bg-gray-50 border-gray-200 hover:bg-gray-100 hover:border-gray-300'
          ]"
          @click="selectInsurer(insurer)"
        >
          <div class="flex items-center justify-between">
            <div class="flex-1 min-w-0">
              <h3 class="font-medium text-gray-900 truncate text-sm">
                {{ insurer.name }}
              </h3>
              
              <!-- Zusätzliche Informationen -->
              <div class="mt-1 space-y-1">
                <div v-if="insurer.turnus" class="text-xs text-gray-600">
                  {{ insurer.turnus }}
                </div>
                
                <div v-if="insurer.lastSettlement" class="text-xs text-green-600 flex items-center">
                  <svg class="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                  </svg>
                  {{ formatLastSettlement(insurer.lastSettlement) }}
                </div>
              </div>
            </div>
            
            <!-- Status-Indikator -->
            <div class="ml-2 flex-shrink-0">
              <div v-if="insurer.settlementCompleted" class="w-3 h-3 bg-green-500 rounded-full"></div>
              <div v-else class="w-3 h-3 bg-gray-300 rounded-full"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  insurers: {
    type: Array,
    required: true,
    default: () => []
  },
  selectedInsurer: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['insurer-selected'])

const selectInsurer = (insurer) => {
  emit('insurer-selected', insurer)
}

// Formatierung des Datums für bessere Lesbarkeit
const formatLastSettlement = (dateString) => {
  if (!dateString) return ''
  
  try {
    const date = new Date(dateString.replace(/(\d{2})\.(\d{2})\.(\d{4}), (\d{2}):(\d{2})/, '$3-$2-$1T$4:$5'))
    const now = new Date()
    const diffTime = Math.abs(now - date)
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays === 1) {
      return 'vor 1 Tag'
    } else if (diffDays < 7) {
      return `vor ${diffDays} Tagen`
    } else {
      return `am ${dateString.split(',')[0]}`
    }
  } catch (error) {
    return dateString
  }
}
</script>