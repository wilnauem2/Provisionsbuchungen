<template>
  <div class="app-container">
    <div class="tabs mb-4">
      <button 
        @click="activeTab = 'main'" 
        :class="{ 'border-b-2 border-blue-500 text-blue-600': activeTab === 'main' }"
        class="px-4 py-2 font-medium text-gray-700 hover:text-blue-600 focus:outline-none"
      >
        Übersicht
      </button>
      <button 
        @click="activeTab = 'history'" 
        :class="{ 'border-b-2 border-blue-500 text-blue-600': activeTab === 'history' }"
        class="px-4 py-2 font-medium text-gray-700 hover:text-blue-600 focus:outline-none"
      >
        Abrechnungsverlauf
      </button>
    </div>
    <div v-if="activeTab === 'main'" class="content">
      <div class="header-container sticky-header">
      <div class="w-full bg-white shadow-sm">
        <!-- Title Section - Always at the very top -->
        <div class="w-full text-center py-3 border-b border-gray-200">
          <h1 class="text-2xl font-bold text-gray-900">Provisionenbuchungen</h1>
        </div>
        
        <!-- Content below title -->
        <div class="flex flex-col gap-2 px-4 py-3">
          
          <!-- Environment and User Info Section -->
          <div class="flex flex-col items-center gap-3 mt-1">
            <div class="environment-switch">
              <select v-model="currentEnvironment" 
                      class="px-3 py-2 border border-gray-300 rounded-md text-sm bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                <option value="production" class="text-gray-700">Produktion</option>
                <option value="test" class="text-gray-700">Test</option>
              </select>
            </div>
            
            <div class="flex items-center gap-3 flex-wrap justify-center">
              <span class="text-sm text-gray-600 whitespace-nowrap">Angemeldet als: {{ username }}</span>
              <button 
                @click="logout"
                class="px-3 py-1.5 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors duration-200 text-sm flex items-center"
                aria-label="Abmelden"
              >
                <svg class="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
                </svg>
                Abmelden
              </button>
            </div>
          </div>
          <div class="status-summary flex flex-col gap-4 md:flex-row md:gap-4">
            <div class="status-item yellow flex-1 min-w-[200px]">
              <span class="status-dot"></span>
              <span class="count">{{ statusCounts.yellow }}</span>
              <span class="label">1-5 Tage überfällig</span>
            </div>
            <div class="status-item red flex-1 min-w-[200px]">
              <span class="status-dot"></span>
              <span class="count">{{ statusCounts.red }}</span>
              <span class="label">> 5 Tage überfällig</span>
            </div>
            <div class="status-total flex-1 min-w-[200px]">
              <span class="label">Gesamt überfällig:</span>
              <span class="count">{{ statusCounts.total }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
    <TestDateSimulator v-model="testDate" v-if="currentEnvironment === 'test' && activeTab === 'main'" @update:modelValue="handleDateUpdate" class="mt-4" />
    <div class="content">
      <div class="insurer-list">
        <div class="search-bar">
          <div class="relative">
            <input 
              v-model="searchFilter" 
              type="text" 
              placeholder="Suche nach Versicherung..." 
              class="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Suche nach Versicherung"
              :aria-invalid="searchError"
              @input="validateSearch"
            />
            <button 
              @click="clearSearch" 
              :disabled="!searchFilter"
              class="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-full bg-white hover:bg-gray-100 disabled:opacity-50"
              aria-label="Suche löschen"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
              </svg>
            </button>
          </div>
        </div>

        <div class="sort-options">
          <div class="relative">
            <select v-model="sortOption" class="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="name">Name</option>
              <option value="last_invoice">Letzte Abrechnung</option>
              <option value="status">Status</option>
            </select>
            <svg class="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
            </svg>
          </div>
        </div>

        <div class="insurer-grid">
          <div
            v-for="insurer in filteredInsurers"
            :key="insurer.name"
            class="insurer-card"
            :class="{ selected: selectedInsurer === insurer, complete: insurer.complete, incomplete: !insurer.complete }"
            @click="handleInsurerClick(insurer)"
            :aria-selected="selectedInsurer === insurer"
            :aria-label="`Versicherung ${insurer.name} anzeigen`"
          >
            <div class="insurer-info">
               <div class="flex flex-col justify-between">
                 <div>
                   <h3 class="text-xl font-semibold mb-1">{{ insurer.name }}</h3>
                   <p class="status" :class="getStatusColor(insurer, getCurrentDate())">
                     {{ getStatusText(insurer, getCurrentDate()) }}
                   </p>
                 </div>
                 <div class="flex gap-2 justify-end">
                   <span v-if="insurer.bezugsweg?.split(',').some(v => v.trim().toLowerCase() === 'bi-pro' || v.trim().toLowerCase() === 'bipro')" 
                         class="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                     BiPRO
                   </span>
                   <span v-if="insurer.dokumentenart?.split(',').some(v => v.trim().toLowerCase() === 'pdf')" 
                         class="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                     PDF
                   </span>
                   <span v-if="insurer.dokumentenart?.split(',').some(v => v.trim().toLowerCase() === 'csv')" 
                         class="bg-purple-100 text-purple-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                     CSV
                   </span>
                   <!-- Turnus tags -->
                   <span v-if="insurer.turnus?.match(/7-tägig/i)"
                         class="bg-yellow-100 text-yellow-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                     7
                   </span>
                   <span v-else-if="insurer.turnus?.match(/14-tägig/i)"
                         class="bg-orange-100 text-orange-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                     14
                   </span>
                   <span v-else-if="insurer.turnus?.match(/31-tägig/i)"
                         class="bg-pink-100 text-pink-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                     31
                   </span>
                   <!-- Checkmark for complete insurers -->
                   <span v-if="insurer.complete" 
                         class="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                     ✓
                   </span>
                   <!-- Kommentar tag -->
                   <span v-if="insurer.kommentar" 
                         class="bg-gray-100 text-gray-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                     K
                   </span>
                 </div>
               </div>

            </div>
            <div class="insurer-details">
              <p v-if="insurer.last_invoice" class="text-sm">
                <span class="font-medium text-gray-600">Letzte Abrechnung:</span> {{ formatLastInvoiceDate(insurer.last_invoice) }}
              </p>
              <p class="text-sm">
                <span class="font-medium text-gray-600">Bezugsweg:</span> {{ insurer.bezugsweg || 'Keine Angabe' }}
              </p>
              <p class="text-sm">
                <span class="font-medium text-gray-600">Dokumentenart:</span> {{ insurer.dokumentenart || 'Keine Angabe' }}
              </p>
              <p class="text-sm">
                <span class="font-medium text-gray-600">Turnus:</span> {{ insurer.turnus || 'Keine Angabe' }}
              </p>
              <p class="text-sm">
                <span class="font-medium text-gray-600">Kommentar:</span> {{ insurer.kommentar || 'Keine Angabe' }}
              </p>
            </div>
            
            <!-- Loading state -->
            <div v-if="isLoading" class="absolute inset-0 bg-white/80 flex items-center justify-center">
              <svg class="animate-spin h-8 w-8 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
          </div>
        </div>
      </div>

      <div class="insurer-detail" v-if="selectedInsurer">
        <InsurerDetail 
          :insurer="selectedInsurer" 
          @close="selectedInsurer = null"
          @settlement-completed="handleSettlementCompleted"
        />
      </div>
      </div>
    </div>
    
    <!-- Abrechnungen History View -->
    <div v-if="activeTab === 'history'" class="content">
      <AbrechnungenHistory :abrechnungen="formattedAbrechnungen" />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import AbrechnungenHistory from './AbrechnungenHistory.vue'
import { useRouter, useRoute } from 'vue-router'
import { currentEnvironment, getInsurersData, updateLastInvoice } from '../config/environment'
import InsurerDetail from './InsurerDetail.vue'
import { calculateDaysOverdue, isOverdue, getStatusColor, getStatusText, formatLastInvoiceDate } from '../utils/insurerUtils'
import { format } from 'date-fns'
import { de } from 'date-fns/locale'
import TestDateSimulator from './TestDateSimulator.vue'

const router = useRouter()
const route = useRoute()

// Authentication state
const isAuthenticated = computed(() => {
  return localStorage.getItem('authToken') !== null
})

// User info
const username = ref(localStorage.getItem('username') || '')

const logout = () => {
  localStorage.removeItem('authToken')
  localStorage.removeItem('username')
  router.push('/login')
}

const searchFilter = ref('')
const activeTab = ref('main');
const selectedInsurer = ref(null);
const insurersData = ref([]);
const isLoading = ref(true);
const lastInvoices = ref({});
const sortOption = ref('name')

// Status counts
const statusCounts = computed(() => {
  const now = getCurrentDate()
  const counts = {
    yellow: 0,
    red: 0,
    total: 0
  }
  
  filteredInsurers.value.forEach(insurer => {
    const daysOverdue = calculateDaysOverdue(insurer, now)
    if (daysOverdue > 0) {
      counts.total++
      if (daysOverdue <= 5) {
        counts.yellow++
      } else {
        counts.red++
      }
    }
  })
  
  return counts
})

// Test date simulation
const testDate = ref(new Date())

// Custom date function that uses test date in test mode
const getCurrentDate = () => {
  // Always return a fresh Date object
  const now = currentEnvironment.value === 'test' ? new Date(testDate.value.getTime()) : new Date()
  console.log('Current date:', now)
  return now
}

const handleDateUpdate = (newDate) => {
  console.log('Date updated to:', newDate)
  testDate.value = new Date(newDate)
}

// Initialize with current date
watch(testDate, (newDate) => {
  console.log('Test date changed to:', newDate)
  // Update the filtered insurers to trigger re-render
  filteredInsurers.value = [...filteredInsurers.value]
})

// Watch for environment changes
watch(currentEnvironment, () => {
  console.log('Environment changed to:', currentEnvironment.value)
  // Reset test date when switching to production
  if (currentEnvironment.value !== 'test') {
    testDate.value = new Date()
  }
})

// Watch for changes in insurersData, searchFilter, and testDate
watch([insurersData, searchFilter, testDate], () => {
  // Update the filtered insurers to trigger re-render
  filteredInsurers.value = [...filteredInsurers.value]
}, { deep: true })

// Load insurers data based on environment
const loadInsurersData = async () => {
  try {
    const data = await getInsurersData()
    insurersData.value = JSON.parse(JSON.stringify(data))
  } catch (error) {
    console.error('Error loading insurers data:', error)
  }
}

// Load last invoices based on current environment
const loadLastInvoices = async () => {
  try {
    const invoicesResponse = await fetch(
      `/src/data/${currentEnvironment.value === 'test' ? 'environments/last_invoices.test.json' : 'last_invoices.json'}`
    )
    lastInvoices.value = await invoicesResponse.json()
  } catch (e) {
    console.warn('Could not load last invoices, using empty object', e)
    lastInvoices.value = {}
  }
}

// Load all data based on current environment
const loadData = async () => {
  isLoading.value = true
  try {
    await Promise.all([loadInsurersData(), loadLastInvoices()])
  } catch (error) {
    console.error('Error loading data:', error)
  } finally {
    isLoading.value = false
  }
}

// Initial load
onMounted(() => {
  loadData()
})

const filteredInsurers = computed(() => {
  // Clone the data to avoid mutations
  let filtered = [...insurersData.value]
  
  // Apply search filter
  if (searchFilter.value) {
    const searchLower = searchFilter.value.toLowerCase()
    filtered = filtered.filter(insurer => 
      insurer.name.toLowerCase().includes(searchLower) ||
      (insurer.turnus && insurer.turnus.toLowerCase().includes(searchLower)) ||
      (insurer.last_invoice && insurer.last_invoice.toLowerCase().includes(searchLower))
    )
  }
  
  // Sort by selected option
  switch (sortOption.value) {
    case 'name':
      filtered.sort((a, b) => a.name.localeCompare(b.name))
      break
    case 'status':
      filtered.sort((a, b) => {
        const statusA = getStatusColor(a, getCurrentDate())
        const statusB = getStatusColor(b, getCurrentDate())
        return statusA.localeCompare(statusB)
      })
      break
    case 'last_invoice':
      filtered.sort((a, b) => {
        if (!a.last_invoice) return 1
        if (!b.last_invoice) return -1
        const dateA = new Date(a.last_invoice)
        const dateB = new Date(b.last_invoice)
        return dateB.getTime() - dateA.getTime()
      })
      break
  }

  return filtered
})

// Format last invoices for the history view
const formattedAbrechnungen = computed(() => {
  return Object.entries(lastInvoices.value).map(([insurer, dateString]) => ({
    insurer,
    date: dateString,
    timestamp: new Date(dateString.split(', ').reverse().join('T'))
  }));
});

// Watch for environment changes
watch(currentEnvironment, async () => {
  await loadData()
})
// Watch for changes in insurersData and searchFilter
watch([insurersData, searchFilter], () => {
  // Force re-render of insurer cards
  filteredInsurers.value = [...filteredInsurers.value]
  const insurerCards = document.querySelectorAll('.insurer-card')
  insurerCards.forEach(card => {
    card.style.display = 'none'
    setTimeout(() => {
      card.style.display = 'block'
    }, 10)
  })
}, { deep: true })

const handleInsurerClick = (insurer) => {
  if (selectedInsurer.value === insurer) {
    selectedInsurer.value = null
  } else {
    selectedInsurer.value = insurer
  }
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

    // Save to both files
    const insurersFile = currentEnvironment.value === 'test' 
      ? '../data/environments/insurers.test.json'
      : '../data/insurers.json'
    const lastInvoicesFile = currentEnvironment.value === 'test'
      ? '../data/environments/last_invoices.test.json'
      : '../data/last_invoices.json'

    // Save insurers data (without last_invoice)
    const insurersDataWithoutLastInvoice = insurersData.value.map(insurer => {
      const { last_invoice, ...rest } = insurer
      return rest
    })
    await fetch(insurersFile, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(insurersDataWithoutLastInvoice)
    })

    // Save last_invoices data
    const lastInvoices = insurersData.value.reduce((acc, insurer) => {
      if (insurer.last_invoice) {
        acc[insurer.name] = insurer.last_invoice
      }
      return acc
    }, {})
    await fetch(lastInvoicesFile, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(lastInvoices)
    })

    alert('Daten erfolgreich gespeichert!')
    
    // Reload data after successful save to ensure consistency
    await loadInsurersData()
  } catch (error) {
    console.error('Error saving data:', error)
    alert(`Fehler beim Speichern der Daten:\n${error.message}\nDetails:\n${error.stack}`)
  }
}

const handleSettlementCompleted = ({ insurer, newDate }) => {
  if (!insurer || !selectedInsurer.value || insurer.name !== selectedInsurer.value.name) return
  
  // Update local state
  const insurerIndex = insurersData.value.findIndex(i => i.name === insurer.name)
  if (insurerIndex !== -1) {
    insurersData.value[insurerIndex] = { 
      ...insurer,
      last_invoice: newDate
    }
    selectedInsurer.value = { ...selectedInsurer.value, last_invoice: newDate }
  }
  
  // Update the last_invoice in the separate file
  updateLastInvoice(insurer.name, newDate)
  
  // Reload data to ensure consistency
  loadInsurersData()
}

const handleUpdateLastInvoice = ({ insurerName, lastInvoice }) => {
  const insurer = insurersData.value.find(i => i.name === insurerName)
  if (insurer) {
    insurer.last_invoice = lastInvoice
    saveToJson()
  }
}

// Make functions globally available
window.calculateDaysOverdue = calculateDaysOverdue
window.getStatusColor = getStatusColor
window.getStatusText = getStatusText
window.formatLastInvoiceDate = formatLastInvoiceDate
</script>

<style>
:root {
  --primary-color: #2c3e50;
  --primary-light: #34495e;
  --success-color: #2ecc71;
  --warning-color: #f1c40f;
  --danger-color: #e74c3c;
  --info-color: #3498db;
  --gray-color: #95a5a6;
  --bg-color: #ecf0f1;
  --card-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

body {
  background-color: var(--bg-color);
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  color: #2c3e50;
}

.app-container {
  max-width: 1400px;
  margin: 20px auto;
  padding: 20px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  padding: 20px;
  background: white;
  border-radius: 12px;
  box-shadow: var(--card-shadow);
}

.header h1 {
  font-size: 2.5em;
  color: var(--primary-color);
  font-weight: 700;
}

.environment-switch {
  display: flex;
  gap: 10px;
  align-items: center;
}

.environment-switch label {
  color: var(--gray-color);
  font-weight: 500;
}

.status-summary {
  display: flex;
  gap: 1.5rem;
  padding: 1.25rem 0;
  margin-top: 1.5rem;
  flex-wrap: wrap;
}

/* Mobile stacking */
@media (max-width: 768px) {
  .header-container {
    padding: 1.5rem 0;
  }

  .header-container .flex {
    flex-direction: column;
    gap: 1.5rem;
  }

  .header-container .flex:first-child {
    flex-direction: column;
    align-items: center;
  }

  .header-container .flex:last-child {
    flex-direction: row;
    justify-content: flex-end;
    align-items: center;
  }

  .status-summary {
    flex-direction: column;
    gap: 1.25rem;
    padding: 1rem 0;
  }

  .status-item,
  .status-total {
    flex: 1 0 100%;
    min-width: 100%;
    max-width: 100%;
    padding: 1rem;
  }

  .status-item .count,
  .status-total .count {
    font-size: 1.1rem;
  }
}

.status-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.25rem;
  border-radius: 0.875rem;
  background: #f8fafc;
  transition: all 0.2s ease;
  cursor: pointer;
  flex: 1 1 200px;
  min-width: 200px;
  max-width: 350px;
}

.status-total {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.25rem;
  border-radius: 0.875rem;
  background: #f8fafc;
  font-weight: 600;
  flex: 1 1 200px;
  min-width: 200px;
  max-width: 350px;
}

.status {
  font-weight: 500;
  padding: 0.5rem 1rem;
  border-radius: 0.75rem;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  min-width: 120px;
  justify-content: center;
  text-align: center;
  font-size: 0.875rem;
}

.status::before {
  content: '';
  display: inline-block;
  width: 0.75rem;
  height: 0.75rem;
  border-radius: 50%;
  margin-right: 0.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.status-dot {
  width: 1rem;
  height: 1rem;
  border-radius: 50%;
  transition: all 0.2s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.status-dot:hover {
  transform: scale(1.1);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.status-item.yellow .status-dot {
  background-color: #fbbf24;
  box-shadow: 0 2px 4px rgba(251, 191, 36, 0.3);
}

.status-item.red .status-dot {
  background-color: #ef4444;
  box-shadow: 0 2px 4px rgba(239, 68, 68, 0.3);
}

.status-item.green .status-dot {
  background-color: #10b981;
  box-shadow: 0 2px 4px rgba(16, 185, 129, 0.3);
}

.status-total {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.25rem;
  border-radius: 0.875rem;
  background: #f8fafc;
  font-weight: 600;
  flex: 1 1 200px;
  min-width: 200px;
  max-width: 350px;
}

.status-total .count {
  font-size: 1.25rem;
  color: #1f2937;
}

.content {
  padding: 2.5rem;
  max-width: 1200px;
  margin: 0 auto;
}

.search-bar {
  margin-bottom: 2.5rem;
  position: relative;
}

.search-bar input {
  width: 100%;
  padding: 1rem 1.25rem;
  border: 1px solid #e5e5e5;
  border-radius: 0.875rem;
  background-color: white;
  transition: all 0.2s ease;
  font-size: 1rem;
}

.search-bar input:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  outline: none;
}

.search-bar input:invalid {
  border-color: #ef4444;
  box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
}

.sort-options {
  margin-bottom: 2.5rem;
  position: relative;
}

.sort-options select {
  width: 100%;
  padding: 1rem 3rem 1rem 1.25rem;
  border: 1px solid #e5e5e5;
  border-radius: 0.875rem;
  background-color: white;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 1rem;
  appearance: none;
}

.sort-options select:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  outline: none;
}

.sort-options select::-ms-expand {
  display: none;
}

.sort-options::after {
  content: '';
  position: absolute;
  right: 1rem;
  top: 50%;
  transform: translateY(-50%);
  width: 0;
  height: 0;
  border-left: 5px solid transparent;
  border-right: 5px solid transparent;
  border-top: 5px solid #6b7280;
  pointer-events: none;
}

.insurer-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 2rem;
  padding: 1rem;
}

.insurer-card {
  background: white;
  border-radius: 1.25rem;
  padding: 1.75rem;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border: 1px solid #e5e5e5;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  position: relative;
  overflow: hidden;
}

.insurer-card.incomplete {
  opacity: 0.5;
  filter: saturate(0.7);
}

.insurer-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
}

.insurer-card.selected {
  background: #f3f4f6;
  border-color: #3b82f6;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
  opacity: 1 !important;
}

.insurer-card.complete {
  border-left: 4px solid #10b981;
  opacity: 1 !important;
}

.insurer-info h3 {
  font-size: 1.375rem;
  font-weight: 600;
  margin-bottom: 0.75rem;
  color: #1f2937;
  line-height: 1.2;
}

.status {
  font-weight: 500;
  padding: 0.5rem 1rem;
  border-radius: 0.75rem;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  min-width: 120px;
  justify-content: center;
  text-align: center;
  font-size: 0.875rem;
}

.status::before {
  content: '';
  display: inline-block;
  width: 0.75rem;
  height: 0.75rem;
  border-radius: 50%;
  margin-right: 0.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.status.yellow {
  background-color: #fef9c3;
  color: #713f12;
}

.status.yellow::before {
  background-color: #fbbf24;
  box-shadow: 0 2px 4px rgba(251, 191, 36, 0.3);
}

.status.red {
  background-color: #fee2e2;
  color: #991b1b;
}

.status.red::before {
  background-color: #ef4444;
  box-shadow: 0 2px 4px rgba(239, 68, 68, 0.3);
}

.status.green {
  background-color: #dcfce7;
  color: #059669;
}

.status.green::before {
  background-color: #10b981;
  box-shadow: 0 2px 4px rgba(16, 185, 129, 0.3);
}

.insurer-details {
  font-size: 0.875rem;
  color: #4b5563;
  margin-top: 1.5rem;
  line-height: 1.5;
}

.insurer-details p {
  margin: 0.75rem 0;
  display: flex;
  gap: 0.75rem;
  align-items: center;
}

.insurer-details .font-medium {
  color: #6b7280;
  min-width: 120px;
}

/* Loading state */
.insurer-card.loading {
  opacity: 0.7;
  pointer-events: none;
}

.insurer-card.loading::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 2rem;
  height: 2rem;
  border: 3px solid #e5e5e5;
  border-top-color: #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: translate(-50%, -50%) rotate(360deg);
  }
}

/* Mobile responsiveness */
@media (max-width: 768px) {
  .status-summary {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
  
  .content {
    padding: 1.5rem;
  }
  
  .insurer-grid {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
  
  .insurer-card {
    padding: 1.25rem;
  }
  
  .insurer-info h3 {
    font-size: 1.25rem;
  }
  
  .status {
    padding: 0.375rem 0.75rem;
    font-size: 0.875rem;
  }
}

/* Animations */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.insurer-card {
  animation: fadeIn 0.3s ease-out;
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
  .app-container {
    background-color: #1f2937;
    color: #f3f4f6;
  }

  .insurer-card {
    background: #111827;
    border-color: #374151;
  }

  .status-item,
  .status-total {
    background: #1f2937;
  }

  .status-dot {
    filter: brightness(0.9);
  }

  .status {
    color: #f3f4f6;
  }

  .status::before {
    box-shadow: none;
  }

  .insurer-card:hover {
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
  }
}

/* Focus states */
:focus-visible {
  outline: none;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.5);
}

/* High contrast mode */
@media (forced-colors: active) {
  .status-dot {
    forced-color-adjust: none;
  }

  .status {
    background: Highlight;
    color: HighlightText;
  }
}

.header-container {
  position: sticky;
  top: 0;
  z-index: 10;
  left: 0;
  right: 0;
  width: 100%;
  background-color: white;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
}

.sticky-header {
  position: sticky;
  top: 0;
  z-index: 10;
  left: 0;
  right: 0;
  width: 100%;
  background-color: white;
}

.content {
  padding-top: 1rem;
}

.insurer-detail {
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  width: 400px;
  background: white;
  box-shadow: -4px 0 12px rgba(0, 0, 0, 0.1);
  z-index: 10;
  padding: 20px;
  overflow-y: auto;
}

.insurer-detail h2 {
  font-size: 1.5em;
  margin-bottom: 20px;
  color: var(--primary-color);
}

.insurer-detail .close-button {
  position: absolute;
  top: 20px;
  right: 20px;
  background: none;
  border: none;
  font-size: 1.5em;
  cursor: pointer;
  color: var(--gray-color);
}

.insurer-detail .close-button:hover {
  color: var(--primary-color);
}

.insurer-detail .section {
  margin-bottom: 20px;
}

.insurer-detail .section h3 {
  font-size: 1.2em;
  margin-bottom: 10px;
  color: var(--primary-color);
}

.insurer-detail .form-group {
  margin-bottom: 15px;
}

.insurer-detail label {
  display: block;
  margin-bottom: 5px;
  font-weight: 500;
  color: var(--primary-color);
}

.insurer-detail input,
.insurer-detail select,
.insurer-detail textarea {
  width: 100%;
  padding: 10px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  font-size: 1em;
}

.insurer-detail textarea {
  height: 100px;
  resize: vertical;
}

.insurer-detail button {
  padding: 10px 20px;
  border: none;
  border-radius: 8px;
  background-color: var(--info-color);
  color: white;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.insurer-detail button:hover {
  background-color: #2980b9;
}

@media (max-width: 1024px) {
  .insurer-detail {
    width: 100%;
    position: absolute;
    top: 0;
    left: 0;
    height: 100vh;
  }
}
</style>
