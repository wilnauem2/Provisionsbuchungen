<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { currentEnvironment, getInsurersData } from './config/environment'
import InsurerDetail from './components/InsurerDetail.vue'
import { calculateDaysOverdue, isOverdue, getStatusColor, getStatusText } from './utils/insurerUtils'

const searchFilter = ref('')
const selectedInsurer = ref(null)
const insurersData = ref([])
const isLoading = ref(true)
const sortOption = ref('name')

// Load insurers data based on environment
const loadInsurersData = async () => {
  try {
    const data = await getInsurersData()
    insurersData.value = JSON.parse(JSON.stringify(data))
  } catch (error) {
    console.error('Error loading insurers data:', error)
  } finally {
    isLoading.value = false
  }
}

// Initial load
onMounted(() => {
  loadInsurersData()
})

// Watch for environment changes
watch(currentEnvironment, () => {
  loadInsurersData()
})

const filteredInsurers = computed(() => {
  let sortedInsurers = [...insurersData.value]
  
  // Sort by selected option
  switch (sortOption.value) {
    case 'name':
      sortedInsurers.sort((a, b) => a.name.localeCompare(b.name))
      break
    case 'status':
      sortedInsurers.sort((a, b) => {
        const statusA = getStatusColor(a)
        const statusB = getStatusColor(b)
        return statusA.localeCompare(statusB)
      })
      break
    case 'last_invoice':
      sortedInsurers.sort((a, b) => {
        if (!a.last_invoice) return 1
        if (!b.last_invoice) return -1
        return new Date(b.last_invoice) - new Date(a.last_invoice)
      })
      break
  }

  return sortedInsurers
})

const handleInsurerSelect = (insurer) => {
  selectedInsurer.value = insurer
}

const handleSearchInput = (event) => {
  searchFilter.value = event.target.value
}

const clearSearch = () => {
  searchFilter.value = ''
}

const saveToJson = async () => {
  try {
    if (!selectedInsurer.value) {
      throw new Error('Kein Versicherer ausgewählt')
    }
    
    // Update local state
    const insurerIndex = insurersData.value.findIndex(i => i.name === selectedInsurer.value.name)
    if (insurerIndex !== -1) {
      insurersData.value[insurerIndex] = { ...selectedInsurer.value }
    }
    
    alert('Daten erfolgreich gespeichert!')
    
    // Reload data after successful save to ensure consistency
    await loadInsurersData()
  } catch (error) {
    console.error('Error saving data:', error)
    alert(`Fehler beim Speichern der Daten:\n${error.message}\nDetails:\n${error.stack}`)
  }
}

const handleSettlementCompleted = (insurer) => {
  if (!insurer || !selectedInsurer.value || insurer.name !== selectedInsurer.value.name) return

  selectedInsurer.value.settlementCompleted = true
  // Formatiere das Datum im deutschen Format TT.MM.JJJJ
  const now = new Date()
  selectedInsurer.value.last_invoice = now.toLocaleDateString('de-DE')
  saveToJson()
}

const handleUpdateLastInvoice = ({ insurerName, lastInvoice }) => {
  const insurer = insurersData.value.find(i => i.name === insurerName)
  if (insurer) {
    insurer.last_invoice = lastInvoice
    saveToJson()
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

// Make functions globally available
window.calculateDaysOverdue = calculateDaysOverdue
window.getStatusColor = getStatusColor
window.getStatusText = getStatusText
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
    <!-- Loading State -->
    <div v-if="isLoading" class="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center z-50">
      <div class="text-center">
        <svg class="animate-spin -ml-1 mr-3 h-12 w-12 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <p class="mt-2 text-gray-600">Lade Daten...</p>
      </div>
    </div>

    <!-- Main Content -->
    <div v-if="!isLoading" class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="py-6">
        <h1 class="text-3xl font-bold text-gray-900 mb-4">
          <span class="text-indigo-600">Versicherer</span>-Übersicht
        </h1>
        <div class="flex items-center gap-4 mb-6">
          <!-- Environment Switcher -->
          <div class="flex items-center gap-2">
            <span class="text-sm text-gray-600">Umgebung:</span>
            <select v-model="currentEnvironment"
                    @change="loadInsurersData"
                    class="px-3 py-2 border border-gray-300 rounded-lg text-sm">
              <option value="production">Produktion</option>
              <option value="test">Test</option>
            </select>
          </div>
          <div class="flex-1 relative">
            <div class="relative rounded-lg overflow-hidden">
              <input
                v-model="searchFilter"
                type="text"
                placeholder="Versicherer suchen..."
                class="w-full px-6 py-3 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
              />
              <button 
                v-if="searchFilter"
                @click="clearSearch"
                class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              <div v-if="searchFilter" class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
          </div>
          <button
            @click="handleNewInsurer"
            class="px-6 py-3 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-lg shadow-sm hover:shadow-md transition-all duration-200 transform hover:-translate-y-0.5"
          >
            <svg class="w-5 h-5 inline-block mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
            </svg>
            <span class="font-medium">Neuer Versicherer</span>
          </button>
        </div>

        <!-- Versichererliste -->
        <div class="bg-white shadow-lg rounded-2xl">
          <div class="px-6 py-4 border-b border-gray-100">
            <h2 class="text-xl font-semibold text-gray-900 flex items-center justify-between">
              <span>
                <span class="text-indigo-600">Versicherer</span> ({{ filteredInsurers.length }})
              </span>
              <div class="flex items-center gap-2">
                <span class="text-sm text-gray-600">Sortieren nach:</span>
                <select
                  v-model="sortOption"
                  class="px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="name">Name</option>
                  <option value="status">Status</option>
                  <option value="last_invoice">Letzte Abrechnung</option>
                </select>
              </div>
            </h2>
          </div>
          <div class="overflow-y-auto max-h-[calc(100vh-250px)]">
            <div class="space-y-4 p-4">
              <div
                v-for="insurer in filteredInsurers"
                :key="insurer.name"
                :class="[
                  'p-4 rounded-2xl cursor-pointer transition-all duration-300',
                  selectedInsurer?.name === insurer.name
                    ? 'bg-indigo-50 border-indigo-200 shadow-md'
                    : 'bg-white border-gray-100 hover:bg-gray-50 hover:shadow-sm',
                  'border'
                ]"
                @click="handleInsurerSelect(insurer)"
              >
                <div class="flex items-center justify-between relative">
                  <!-- Name mit Initial -->
                  <div class="flex items-center gap-3">
                    <div class="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center">
                      <span class="text-indigo-700 font-semibold text-lg">{{ insurer.name.charAt(0) }}</span>
                    </div>
                    <h3 class="font-medium text-gray-900 truncate">
                      {{ insurer.name }}
                    </h3>
                  </div>

                  <!-- Status -->
                  <div class="absolute right-0 top-1/2 -translate-y-1/2 flex items-center gap-2 text-left">
                    <div class="w-3 h-3 rounded-full" :class="{
                      'bg-red-500': getStatusColor(insurer) === 'red',
                      'bg-yellow-500': getStatusColor(insurer) === 'yellow',
                      'bg-green-500': getStatusColor(insurer) === 'green',
                      'bg-gray-300': getStatusColor(insurer) === 'gray'
                    }"></div>
                    <span class="text-sm" :class="{
                      'text-red-600': getStatusColor(insurer) === 'red',
                      'text-yellow-600': getStatusColor(insurer) === 'yellow',
                      'text-green-600': getStatusColor(insurer) === 'green',
                      'text-gray-500': getStatusColor(insurer) === 'gray'
                    }">
                      {{ getStatusText(insurer) }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div v-if="searchFilter" class="mt-2 text-sm text-gray-600">
            {{ filteredInsurers.length }} Versicherer gefunden
          </div>
        </div>
      </div>
    </div>

    <!-- Detailansicht -->
    <div v-if="selectedInsurer && !isLoading" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <InsurerDetail
        :insurer="selectedInsurer"
        @close="selectedInsurer = null"
        @settlement-completed="handleSettlementCompleted"
      />
    </div>

    <!-- Sidebar -->
    <div class="w-96 bg-white border-l border-gray-300 p-4">
      <InsurerList 
        :insurers="filteredInsurers"
        :selected-insurer="selectedInsurer"
        @insurer-selected="handleInsurerSelect"
        @update-last-invoice="handleUpdateLastInvoice"
      />
    </div>
  </div>
</template>
