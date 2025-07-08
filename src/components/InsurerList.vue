<template>
  <div class="h-full">
    <div class="px-4 py-3 border-b border-gray-200">
      <h2 class="text-lg font-semibold text-gray-800">
        Versicherer ({{ props.insurers.length }})
      </h2>
    </div>
    
    <div class="flex-1 overflow-y-auto">
      <div class="space-y-2">
        <div
          v-for="insurer in props.insurers"
          :key="insurer.name"
          :class="[
            'p-4 rounded-lg cursor-pointer transition-all duration-200',
            props.selectedInsurer?.name === insurer.name
              ? 'bg-blue-50 border-blue-200 shadow-sm'
              : 'bg-white border-gray-200 hover:bg-gray-50'
          ]"
          @click="selectInsurer(insurer)"
          class="border"
        >
          <div class="flex flex-col gap-3">
            <div class="flex items-center justify-between">
              <h3 class="font-medium text-gray-900 truncate">
                {{ insurer.name }}
              </h3>
              
              <!-- Status-Indikator -->
              <div class="flex items-center gap-2">
                <div class="w-3 h-3 rounded-full" :class="{
                  'bg-yellow-500': calculateDaysOverdue(insurer) > 0 && calculateDaysOverdue(insurer) <= 3,
                  'bg-red-500': calculateDaysOverdue(insurer) > 3,
                  'bg-green-500': insurer.settlementCompleted,
                  'bg-gray-300': !isOverdue(insurer)
                }"></div>
                <span class="text-xs" :class="{
                  'text-yellow-600': calculateDaysOverdue(insurer) > 0 && calculateDaysOverdue(insurer) <= 3,
                  'text-red-600': calculateDaysOverdue(insurer) > 3,
                  'text-green-600': insurer.settlementCompleted,
                  'text-gray-500': !isOverdue(insurer)
                }">
                  {{ getStatusText(insurer) }}
                </span>
              </div>
            </div>

            <!-- Zusätzliche Informationen -->
            <div class="space-y-2 text-sm">
              <div v-if="insurer.turnus" class="flex items-center gap-2">
                <svg class="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                <span class="text-gray-600">{{ insurer.turnus }}</span>
              </div>
              
              <div v-if="insurer.last_invoice" class="flex items-center gap-2">
                <svg v-if="isOverdue(insurer)" class="w-4 h-4" :class="calculateDaysOverdue(insurer) > 0 && calculateDaysOverdue(insurer) <= 3 ? 'text-yellow-500' : 'text-red-500'" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                <svg v-else class="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                <span class="text-gray-600">{{ formatLastSettlement(insurer.last_invoice) }}</span>
              </div>

              <!-- Aktionen -->
              <div class="flex items-center gap-2">
                <button 
                  @click.stop="handleSettlementCompleted(insurer)"
                  :class="`px-3 py-1 rounded-md text-sm font-medium ${
                    isOverdue(insurer) ? 'bg-red-500 text-white' : 
                    insurer.settlementCompleted ? 'bg-green-500 text-white' : 
                    'bg-gray-300 text-gray-700'
                  }`"
                >
                  <svg class="w-4 h-4 inline-block mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  Abrechnung
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue'

// Formatierung des Datums für bessere Lesbarkeit
const formatLastSettlement = (dateString) => {
  if (!dateString) return ''
  
  try {
    const date = new Date(dateString)
    if (isNaN(date.getTime())) return ''
    
    return date.toLocaleDateString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  } catch (error) {
    console.error('Error formatting date:', error)
    return ''
  }
}

// Prüft ob der Versicherer überfällig ist
const calculateDaysOverdue = (insurer) => {
  if (!insurer?.last_invoice || !insurer?.turnus) return 0
  
  try {
    const dateStr = insurer.last_invoice.split(',')[0]
    const invoiceDate = new Date(dateStr.replace(/(\d{2})\.(\d{2})\.(\d{4})/, '$3-$2-$1'))
    const now = new Date('2025-07-08')
    const turnusMatch = insurer.turnus.match(/(\d+)-tägig/)
    
    if (!turnusMatch) return 0
    const turnusDays = parseInt(turnusMatch[1])
    const dueDate = new Date(invoiceDate)
    dueDate.setDate(dueDate.getDate() + turnusDays)
    
    const diffTime = now - dueDate
    const daysOverdue = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    return Math.max(0, daysOverdue)
  } catch (error) {
    console.error('Error calculating days overdue:', error)
    return 0
  }
}

const isOverdue = (insurer) => {
  const daysOverdue = calculateDaysOverdue(insurer)
  return daysOverdue > 0
}
}

const props = defineProps({
  insurers: {
    type: Array,
    required: true
  },
  selectedInsurer: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['select', 'settlement-completed'])

const selectInsurer = (insurer) => {
  emit('select', insurer)
}

const handleSettlementCompleted = (insurer) => {
  emit('settlement-completed', insurer)
}

const getStatusText = (insurer) => {
  if (insurer.settlementCompleted) return 'Abgerechnet'
  
  const daysOverdue = calculateDaysOverdue(insurer)
  
  if (daysOverdue > 0 && daysOverdue <= 3) return 'Überfällig (1-3 Tage)'
  if (daysOverdue > 3) return `Überfällig (${daysOverdue} Tage)`
  
  return 'Aktuell'
}
</script>