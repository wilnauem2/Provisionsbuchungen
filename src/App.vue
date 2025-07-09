<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { currentEnvironment, getInsurersData, updateLastInvoice } from './config/environment'
import InsurerDetail from './components/InsurerDetail.vue'
import { calculateDaysOverdue, isOverdue, getStatusColor, getStatusText, formatLastInvoiceDate } from './utils/insurerUtils'
import { format } from 'date-fns'
import { de } from 'date-fns/locale'
import TestDateSimulator from './components/TestDateSimulator.vue'

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

<template>
  <div class="app-container">
  <TestDateSimulator v-model="testDate" v-if="currentEnvironment === 'test'" @update:modelValue="handleDateUpdate" />
    <div class="header">
      <h1>Provisionenbuchungen</h1>
      <div class="environment-switch">
        <select v-model="currentEnvironment">
          <option value="production">Produktion</option>
          <option value="test">Test</option>
        </select>
      </div>
    </div>

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
               <div class="flex items-center justify-between">
                 <h3>{{ insurer.name }}</h3>
                 <div class="flex gap-2">
                   <span v-if="insurer.bezugsweg?.split(',').some(v => v.trim().toLowerCase() === 'bi-pro' || v.trim().toLowerCase() === 'bipro')" class="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                     BiPRO
                   </span>
                   <span v-if="insurer.dokumentenart?.split(',').some(v => v.trim().toLowerCase() === 'pdf')" class="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                     PDF
                   </span>
                   <span v-if="insurer.dokumentenart?.split(',').some(v => v.trim().toLowerCase() === 'csv')" class="bg-purple-100 text-purple-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                     CSV
                   </span>
                   <!-- Turnus tags -->
                   <span v-if="insurer.turnus?.match(/7-tägig/)" class="bg-yellow-100 text-yellow-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                     7
                   </span>
                   <span v-else-if="insurer.turnus?.match(/14-tägig/)" class="bg-orange-100 text-orange-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                     14
                   </span>
                   <span v-else-if="insurer.turnus?.match(/31-tägig/)" class="bg-red-100 text-red-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                     31
                   </span>
                   <!-- Checkmark for complete insurers -->
                   <span v-if="insurer.complete" class="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                     ✓
                   </span>
                 </div>
               </div>
              <p class="status" :class="getStatusColor(insurer, getCurrentDate())">
                {{ getStatusText(insurer, getCurrentDate()) }}
              </p>
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
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  background-color: var(--info-color);
  color: white;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.search-bar button:hover {
  background-color: #2980b9;
}

.search-bar button:active {
  transform: scale(0.98);
}

/* Sort Options */
.sort-options {
  background: white;
  padding: 20px;
  border-radius: 12px;
  box-shadow: var(--card-shadow);
  margin-bottom: 20px;
}

.sort-options select {
  padding: 12px 20px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  font-size: 1em;
  background-color: white;
  cursor: pointer;
  transition: border-color 0.2s ease;
}

.sort-options select:focus {
  border-color: var(--info-color);
  outline: none;
  box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.2);
}

/* Insurer Grid */
.insurer-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 20px;
}

.insurer-card {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: var(--card-shadow);
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  position: relative;
}

.insurer-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
}

.insurer-card.selected {
  border: 2px solid var(--info-color);
  background: rgba(52, 152, 219, 0.05);
}

.insurer-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  border-radius: 12px;
  opacity: 0;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.2));
  transition: opacity 0.2s ease;
}

.insurer-card:hover::before {
  opacity: 1;
}

.insurer-info {
  margin-bottom: 18px;
}

.insurer-info h3 {
  margin: 0 0 12px 0;
  font-size: 1.4em;
  color: var(--primary-color);
  font-weight: 600;
}

.status {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  border-radius: 10px;
  font-size: 0.9em;
  font-weight: 500;
  transition: transform 0.2s ease;
}

.status::before {
  content: '';
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.status.gray {
  background-color: #f8f9fa;
  color: var(--gray-color);
}

.status.gray::before {
  background-color: var(--gray-color);
}

.status.yellow {
  background-color: #fff9c0;
  color: var(--warning-color);
}

.status.yellow::before {
  background-color: var(--warning-color);
}

.status.red {
  background-color: #ffebee;
  color: var(--danger-color);
}

.status.red::before {
  background-color: var(--danger-color);
}

.status.green {
  background-color: #e8f5e9;
  color: var(--success-color);
}

.status.green::before {
  background-color: var(--success-color);
}

.insurer-details {
  display: flex;
  flex-direction: column;
  gap: 12px;
  font-size: 0.95em;
  color: var(--gray-color);
}

.insurer-details p {
  display: flex;
  align-items: center;
  gap: 8px;
}

.insurer-details p::before {
  content: '';
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background-color: var(--gray-color);
}

/* Insurer Detail Modal */
.insurer-detail {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  backdrop-filter: blur(4px);
}

.insurer-detail .modal-content {
  background: white;
  border-radius: 16px;
  padding: 30px;
  max-width: 800px;
  width: 90%;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
}

.insurer-detail h2 {
  margin: 0 0 20px 0;
  font-size: 1.8em;
  color: var(--primary-color);
  font-weight: 600;
}

/* Loading States */
.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  backdrop-filter: blur(4px);
}

.loading-spinner {
  border: 4px solid rgba(255, 255, 255, 0.1);
  border-top: 4px solid var(--info-color);
  border-radius: 50%;
  width: 60px;
  height: 60px;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Animations */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.insurer-card {
  animation: fadeIn 0.3s ease-out;
}

.insurer-card:nth-child(odd) {
  animation-delay: 0.1s;
}

.insurer-card:nth-child(even) {
  animation-delay: 0.2s;
}

/* Responsive Design */
@media (max-width: 768px) {
  .app-container {
    padding: 10px;
  }

  .header h1 {
    font-size: 2em;
  }

  .search-bar {
    flex-direction: column;
  }

  .search-bar input {
    width: 100%;
  }

  .insurer-grid {
    grid-template-columns: 1fr;
  }
}
</style>
