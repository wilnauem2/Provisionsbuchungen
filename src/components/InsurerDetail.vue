<script setup>
import { ref, computed } from 'vue'
import { calculateDaysOverdue, getStatusColor, getStatusText } from '../utils/insurerUtils'

const props = defineProps({
  insurer: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['close', 'settlement-completed'])

const isUpdatingInvoice = ref(false)

const handleSettlementCompleted = () => {
  emit('settlement-completed')
}

const handleUpdateLastInvoice = (newDate) => {
  emit('update-last-invoice', { insurerName: props.insurer.name, lastInvoice: newDate })
}

const formattedLastInvoice = computed(() => {
  if (!props.insurer.last_invoice) return ''
  return props.insurer.last_invoice.split(',')[0]
})

const formattedTurnus = computed(() => {
  if (!props.insurer.turnus) return ''
  return props.insurer.turnus.replace(/-/g, '-')
})
</script>

<template>
  <div class="max-w-2xl w-full bg-white rounded-lg shadow-xl transform transition-all duration-300">
    <div class="p-6">
      <!-- Header -->
      <div class="flex items-center justify-between mb-6">
        <h2 class="text-2xl font-bold text-gray-900">
          {{ insurer.name }}
        </h2>
        <button 
          @click="$emit('close')"
          class="text-gray-400 hover:text-gray-500"
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <!-- Status -->
      <div class="mb-6">
        <div class="flex items-center gap-3">
          <div class="w-3 h-3 rounded-full" :class="{
            'bg-red-500': getStatusColor(insurer) === 'red',
            'bg-yellow-500': getStatusColor(insurer) === 'yellow',
            'bg-green-500': getStatusColor(insurer) === 'green',
            'bg-gray-300': getStatusColor(insurer) === 'gray'
          }"></div>
          <span class="text-sm font-medium" :class="{
            'text-red-600': getStatusColor(insurer) === 'red',
            'text-yellow-600': getStatusColor(insurer) === 'yellow',
            'text-green-600': getStatusColor(insurer) === 'green',
            'text-gray-500': getStatusColor(insurer) === 'gray'
          }">
            {{ getStatusText(insurer) }}
          </span>
        </div>
      </div>

      <!-- Abrechnung -->
      <div class="mb-6">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">Abrechnung</h3>
        <div class="space-y-4">
          <div v-if="insurer.turnus" class="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div class="flex items-center mb-2">
              <svg class="w-5 h-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span class="font-medium text-blue-800">Turnus</span>
            </div>
            <p class="text-gray-600">{{ formattedTurnus }}</p>
          </div>

          <div v-if="insurer.bezugsweg" class="p-4 bg-teal-50 rounded-lg border border-teal-200">
            <div class="flex items-center mb-2">
              <svg class="w-5 h-5 text-teal-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span class="font-medium text-teal-800">Bezugsweg</span>
            </div>
            <p class="text-gray-600">{{ insurer.bezugsweg }}</p>
          </div>

          <div v-if="insurer.dokumentenart" class="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
            <div class="flex items-center mb-2">
              <svg class="w-5 h-5 text-yellow-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              <span class="font-medium text-yellow-800">Dokumentenart</span>
            </div>
            <p class="text-gray-600">{{ insurer.dokumentenart }}</p>
          </div>

          <div v-if="insurer.kontakt" class="p-4 bg-red-50 rounded-lg border border-red-200">
            <div class="flex items-center mb-2">
              <svg class="w-5 h-5 text-red-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              <span class="font-medium text-red-800">Kontakt</span>
            </div>
            <p class="text-gray-600">{{ insurer.kontakt }}</p>
          </div>

          <div v-if="insurer.login" class="p-4 bg-orange-50 rounded-lg border border-orange-200">
            <div class="flex items-center mb-2">
              <svg class="w-5 h-5 text-orange-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
              </svg>
              <span class="font-medium text-orange-800">Login</span>
            </div>
            <p class="text-gray-600">{{ insurer.login }}</p>
          </div>
        </div>
      </div>

      <!-- Letzte Abrechnung -->
      <div v-if="insurer.last_invoice" class="mb-6">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">Letzte Abrechnung</h3>
        <div class="p-4 bg-green-50 rounded-lg border border-green-200">
          <div class="flex items-center mb-2">
            <svg class="w-5 h-5 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <span class="font-medium text-green-800">Datum</span>
          </div>
          <p class="text-gray-600">{{ formattedLastInvoice }}</p>
        </div>
      </div>

      <!-- Anweisungen -->
      <div v-if="insurer.instructions" class="mb-6">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">Anweisungen</h3>
        <div class="p-4 bg-purple-50 rounded-lg border border-purple-200">
          <div class="flex items-center mb-2">
            <svg class="w-5 h-5 text-purple-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span class="font-medium text-purple-800">Anweisungen</span>
          </div>
          <p class="text-gray-600 whitespace-pre-line">{{ insurer.instructions }}</p>
        </div>
      </div>

      <!-- Abrechnung Button -->
      <div class="mt-6">
        <button
          @click="handleSettlementCompleted"
          class="w-full px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          Abrechnung soeben erfolgt
        </button>
      </div>
    </div>
  </div>
</template>
