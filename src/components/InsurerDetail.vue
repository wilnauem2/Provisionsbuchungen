<template>
  <div v-if="insurer" class="bg-white shadow-lg rounded-lg p-6" :key="insurer.name + insurer.last_invoice">
    <div class="flex items-center justify-between mb-6">
      <h2 class="text-xl font-semibold text-gray-900">
        {{ insurer.name }}
      </h2>

      <button 
        @click="$emit('close')"
        class="text-gray-400 hover:text-gray-600"
      >
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>

    <div class="space-y-6">
      <!-- Status -->
      <div class="space-y-2">
        <h3 class="text-sm font-medium text-gray-900">Status</h3>
        <div class="flex items-center gap-4">
          <div class="flex items-center gap-2">
            <div class="w-4 h-4 rounded-full" :class="{
              'bg-yellow-500': calculateDaysOverdue(insurer) > 0 && calculateDaysOverdue(insurer) <= 3,
              'bg-red-500': calculateDaysOverdue(insurer) > 3,
              'bg-green-500': insurer.settlementCompleted,
              'bg-gray-300': !isOverdue(insurer)
            }"></div>
            <span class="text-sm" :class="{
              'text-yellow-600': calculateDaysOverdue(insurer) > 0 && calculateDaysOverdue(insurer) <= 3,
              'text-red-600': calculateDaysOverdue(insurer) > 3,
              'text-green-600': insurer.settlementCompleted,
              'text-gray-600': !isOverdue(insurer)
            }">
              {{ getStatusText(insurer) }}
            </span>
          </div>
          <button 
            @click="handleSettlementCompleted"
            :class="`px-4 py-2 rounded-md text-sm font-medium ${
              isOverdue(insurer) ? 'bg-red-500 text-white' : 
              insurer.settlementCompleted ? 'bg-green-500 text-white' : 
              'bg-gray-300 text-gray-700'
            } flex items-center justify-center transition-all duration-200 hover:scale-105`"
          >
            <svg class="w-4 h-4 inline-block mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
            </svg>
            <span class="font-medium">Abrechnung</span>
          </button>
        </div>
      </div>

      <!-- Turnus -->
      <div v-if="insurer.turnus" class="space-y-2">
        <h3 class="text-sm font-medium text-gray-900">Turnus</h3>
        <div class="flex items-center gap-2">
          <div class="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center">
            <svg class="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
          </div>
          <span class="text-sm text-gray-600">{{ insurer.turnus }}</span>
        </div>
      </div>

      <!-- Letzte Abrechnung -->
      <div v-if="insurer.last_invoice" class="space-y-2">
        <h3 class="text-sm font-medium text-gray-900">Letzte Abrechnung</h3>
        <div class="flex items-center gap-2">
          <div class="w-10 h-10 rounded-full flex items-center justify-center" :class="{
            'bg-yellow-50': calculateDaysOverdue(insurer) > 0 && calculateDaysOverdue(insurer) <= 3,
            'bg-red-50': calculateDaysOverdue(insurer) > 3,
            'bg-green-50': !isOverdue(insurer)
          }">
            <svg v-if="isOverdue(insurer)" class="w-5 h-5" :class="calculateDaysOverdue(insurer) > 0 && calculateDaysOverdue(insurer) <= 3 ? 'text-yellow-600' : calculateDaysOverdue(insurer) > 3 ? 'text-red-600' : 'text-green-600'" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <svg v-else class="w-5 h-5" :class="calculateDaysOverdue(insurer) > 0 && calculateDaysOverdue(insurer) <= 3 ? 'text-yellow-600' : calculateDaysOverdue(insurer) > 3 ? 'text-red-600' : 'text-green-600'" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
          </div>
          <span class="text-sm text-gray-600">{{ formatLastSettlement(insurer.last_invoice) }}</span>
        </div>
      </div>

      <!-- Login -->
      <div v-if="insurer.login" class="space-y-2">
        <h3 class="text-sm font-medium text-gray-900">Login</h3>
        <div class="flex items-center gap-2">
          <div class="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center">
            <svg class="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
            </svg>
          </div>
          <span class="text-sm text-gray-600">{{ insurer.login }}</span>
        </div>
      </div>

      <!-- Anweisungen -->
      <div v-if="insurer.instructions" class="space-y-2">
        <h3 class="text-sm font-medium text-gray-900">Anweisungen</h3>
        <div class="flex items-center gap-2">
          <div class="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center">
            <svg class="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <span class="text-sm text-gray-600 whitespace-pre-line">{{ insurer.instructions }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue'

const props = defineProps({
  insurer: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['close', 'settlement-completed'])

const isOverdue = (insurer) => {
  if (!insurer?.last_invoice || !insurer?.turnus) return false
  
  try {
    // Handle dates without time
    const dateParts = insurer.last_invoice.split(', ')
    const dateStr = dateParts[0]
    const timeStr = dateParts.length > 1 ? dateParts[1] : '00:00'
    const invoiceDate = new Date(dateStr.replace(/(\d{2})\.(\d{2})\.(\d{4})/, '$3-$2-$1') + 'T' + timeStr)
    
    const now = new Date()
    const turnusMatch = insurer.turnus.match(/(\d+)-tägig/)
    
    if (!turnusMatch) return false
    const turnusDays = parseInt(turnusMatch[1])
    
    // Calculate expected date based on turnus
    const expectedDate = new Date(now)
    expectedDate.setDate(expectedDate.getDate() - turnusDays)
    
    return invoiceDate < expectedDate
  } catch (error) {
    console.error('Error checking overdue status:', error)
    return false
  }
}

const getStatusText = (insurer) => {
  if (!insurer?.last_invoice || !insurer?.turnus) return 'Keine Abrechnung'
  
  const daysOverdue = calculateDaysOverdue(insurer)
  
  if (insurer.settlementCompleted) {
    return 'Abgerechnet'
  }
  
  // For 1-3 days overdue
  if (daysOverdue > 0 && daysOverdue <= 3) {
    return 'Überfällig (1-3 Tage)'
  }
  
  // For more than 3 days overdue
  if (daysOverdue > 3) {
    return `Überfällig (${daysOverdue} Tage)`
  }
  
  return 'Aktuell'
}



const calculateDaysOverdue = (insurer) => {
  if (!insurer?.last_invoice || !insurer?.turnus) return 0
  
  try {
    // Parse date string
    const dateStr = insurer.last_invoice.split(',')[0]
    const invoiceDate = new Date(dateStr.replace(/(\d{2})\.(\d{2})\.(\d{4})/, '$3-$2-$1'))
    
    // Force specific date for testing
    const now = new Date('2025-07-08')
    const turnusMatch = insurer.turnus.match(/(\d+)-tägig/)
    
    if (!turnusMatch) return 0
    const turnusDays = parseInt(turnusMatch[1])
    
    // Calculate due date
    const dueDate = new Date(invoiceDate)
    dueDate.setDate(dueDate.getDate() + turnusDays)
    
    // Calculate days overdue
    const daysOverdue = Math.ceil((now - dueDate) / (1000 * 60 * 60 * 24))
    
    // Debug logging
    console.log('Calculating for:', insurer.name)
    console.log('Invoice date:', invoiceDate)
    console.log('Due date:', dueDate)
    console.log('Now:', now)
    console.log('Turnus days:', turnusDays)
    console.log('Days overdue:', daysOverdue)
    
    // Only consider it overdue if current date is after due date
    if (now <= dueDate) {
      console.log('Not overdue')
      return 0
    }
    
    // Ensure we don't show negative days
    return Math.max(0, daysOverdue)
  } catch (error) {
    console.error('Error calculating days overdue:', error)
    return 0
  }
}

const formatLastSettlement = (dateString) => {
  if (!dateString) return ''
  
  try {
    // Entferne die Uhrzeit aus dem String
    const datePart = dateString.split(',')[0]
    
    // Deutsche Datumsnotation behalten (TT.MM.JJJJ)
    return datePart
  } catch (error) {
    console.error('Error formatting date:', error)
    return ''
  }
}

const handleSettlementCompleted = () => {
  emit('settlement-completed', props.insurer)
}
</script>
