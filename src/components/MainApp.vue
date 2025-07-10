<template>
  <div class="app-container">
    <TestDateSimulator v-model="testDate" v-if="currentEnvironment === 'test'" @update:modelValue="handleDateUpdate" />
    <header class="bg-white shadow-sm">
      <div class="container mx-auto px-4 py-4">
        <div class="flex justify-between items-center">
          <div class="flex items-center gap-4">
            <h1 class="text-2xl font-bold text-gray-900">Provisionenbuchungen</h1>
            <div class="environment-switch">
              <select v-model="currentEnvironment" 
                      class="px-3 py-2 border border-gray-300 rounded-md text-sm bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                <option value="production" class="text-gray-700">Produktion</option>
                <option value="test" class="text-gray-700">Test</option>
              </select>
            </div>
          </div>
          <div class="flex items-center gap-4">
            <span class="text-sm text-gray-600">Angemeldet als: {{ username }}</span>
            <button 
              @click="logout"
              class="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors duration-200"
            >
              Abmelden
            </button>
          </div>
        </div>
      </div>
    </header>

    <div class="status-summary">
      <div class="status-item yellow">
        <span class="status-dot"></span>
        <span class="count">{{ statusCounts.yellow }}</span>
        <span class="label">1-5 Tage überfällig</span>
      </div>
      <div class="status-item red">
        <span class="status-dot"></span>
        <span class="count">{{ statusCounts.red }}</span>
        <span class="label">> 5 Tage überfällig</span>
      </div>
      <div class="status-total">
        <span class="label">Gesamt überfällig:</span>
        <span class="count">{{ statusCounts.total }}</span>
      </div>
    </div>

    <div class="content">
      <div class="insurer-list">
        <div class="search-bar">
          <input v-model="searchFilter" type="text" placeholder="Suche nach Versicherung..." />
          <button @click="clearSearch">🔍</button>
        </div>

        <div class="sort-options">
          <select v-model="sortOption">
            <option value="name">Name</option>
            <option value="last_invoice">Letzte Abrechnung</option>
            <option value="status">Status</option>
          </select>
        </div>

        <div class="insurer-grid">
          <div
            v-for="insurer in filteredInsurers"
            :key="insurer.name"
            class="insurer-card"
            :class="{ selected: selectedInsurer === insurer }"
            @click="handleInsurerSelect(insurer)"
          >
            <div class="insurer-info">
               <div class="flex flex-col justify-between">
                 <div>
                   <h3>{{ insurer.name }}</h3>
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
                         class="bg-red-100 text-red-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
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
              <p v-if="insurer.last_invoice">Letzte Abrechnung: {{ formatLastInvoiceDate(insurer.last_invoice) }}</p>
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
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
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
const selectedInsurer = ref(null)
const insurersData = ref([])
const isLoading = ref(true)
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

// Watch for changes in insurersData and searchFilter
watch([insurersData, searchFilter], () => {
  // Force re-render of insurer cards
  const insurerCards = document.querySelectorAll('.insurer-card')
  insurerCards.forEach(card => {
    card.style.display = 'none'
    setTimeout(() => {
      card.style.display = 'block'
    }, 10)
  })
}, { deep: true })

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

/* Status Summary */
.status-summary {
  display: flex;
  gap: 20px;
  padding: 20px;
  background: white;
  border-radius: 12px;
  box-shadow: var(--card-shadow);
  margin-bottom: 20px;
}

.status-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px;
  border-radius: 10px;
  flex: 1;
}

.status-item.yellow {
  background: #fff9c0;
  color: var(--warning-color);
}

.status-item.red {
  background: #ffebee;
  color: var(--danger-color);
}

.status-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background-color: currentColor;
}

.status-item .count {
  font-size: 1.2em;
  font-weight: 600;
}

.status-item .label {
  font-size: 0.9em;
}

.status-total {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px;
  border-radius: 10px;
  background: #f8f9fa;
  color: var(--primary-color);
  font-weight: 500;
}

.status-total .count {
  font-size: 1.2em;
  font-weight: 600;
}

.status-total .label {
  font-size: 0.9em;
}

.content {
  display: grid;
  grid-template-columns: 1fr;
  gap: 20px;
}

/* Search Bar */
.search-bar {
  background: white;
  padding: 20px;
  border-radius: 12px;
  box-shadow: var(--card-shadow);
  display: flex;
  gap: 15px;
  margin-bottom: 20px;
}

.search-bar input {
  flex: 1;
  padding: 12px 20px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  font-size: 1em;
  transition: border-color 0.2s ease;
}

.search-bar input:focus {
  border-color: var(--info-color);
  outline: none;
  box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.2);
}

.search-bar button {
  padding: 12px 20px;
  border: none;
  border-radius: 8px;
  background-color: var(--info-color);
  color: white;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.search-bar button:hover {
  background-color: #2980b9;
}

.sort-options {
  background: white;
  padding: 20px;
  border-radius: 12px;
  box-shadow: var(--card-shadow);
  margin-bottom: 20px;
}

.sort-options select {
  padding: 12px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  font-size: 1em;
  cursor: pointer;
}

.insurer-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.insurer-card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: var(--card-shadow);
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.insurer-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
}

.insurer-card.selected {
  border: 2px solid var(--info-color);
}

.insurer-info {
  margin-bottom: 15px;
}

.insurer-info h3 {
  font-size: 1.2em;
  margin-bottom: 8px;
  color: var(--primary-color);
}

.insurer-info .status {
  font-size: 0.9em;
  padding: 8px 12px;
  border-radius: 20px;
  display: inline-block;
}

.insurer-info .status.yellow {
  background-color: #fff9c0;
  color: var(--warning-color);
}

.insurer-info .status.red {
  background-color: #ffebee;
  color: var(--danger-color);
}

.insurer-details {
  font-size: 0.9em;
  color: var(--gray-color);
}

/* Status badges */
.status-badge {
  display: inline-block;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 0.8em;
  font-weight: 500;
  margin-right: 8px;
}

.status-badge.green {
  background-color: #d4edda;
  color: #155724;
}

.status-badge.yellow {
  background-color: #fff3cd;
  color: #856404;
}

.status-badge.red {
  background-color: #f8d7da;
  color: #721c24;
}

/* Insurer detail panel */
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
