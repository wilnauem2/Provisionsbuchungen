<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { currentEnvironment, getInsurersData } from './config/environment'
import InsurerDetail from './components/InsurerDetail.vue'
import { calculateDaysOverdue, isOverdue, getStatusColor, getStatusText, formatLastInvoiceDate } from './utils/insurerUtils'

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
        const statusA = getStatusColor(a)
        const statusB = getStatusColor(b)
        return statusA.localeCompare(statusB)
      })
      break
    case 'last_invoice':
      filtered.sort((a, b) => {
        if (!a.last_invoice) return 1
        if (!b.last_invoice) return -1
        return new Date(b.last_invoice) - new Date(a.last_invoice)
      })
      break
  }

  return filtered
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

// Make functions globally available
window.calculateDaysOverdue = calculateDaysOverdue
window.getStatusColor = getStatusColor
window.getStatusText = getStatusText
window.formatLastInvoiceDate = formatLastInvoiceDate
</script>

<template>
  <div class="app-container">
    <div class="header">
      <h1>Provisionenbuchungen</h1>
      <div class="environment-switch">
        <select v-model="currentEnvironment">
          <option value="production">Produktion</option>
          <option value="test">Test</option>
        </select>
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
              <h3>{{ insurer.name }}</h3>
              <p class="status" :class="getStatusColor(insurer)">
                {{ getStatusText(insurer) }}
              </p>
            </div>
            <div class="insurer-details">
              <p v-if="insurer.turnus">Turnus: {{ insurer.turnus }}</p>
              <p v-if="insurer.last_invoice">Letzte Abrechnung: {{ formatLastInvoiceDate(insurer.last_invoice) }}</p>
            </div>
          </div>
        </div>
      </div>

      <div class="insurer-detail" v-if="selectedInsurer">
        <InsurerDetail :insurer="selectedInsurer" @close="selectedInsurer = null" />
      </div>
    </div>
  </div>
</template>

<style>
.app-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.environment-switch {
  margin-left: 20px;
}

.content {
  display: flex;
  gap: 20px;
}

.insurer-list {
  width: 100%;
}

.search-bar {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}

input {
  flex: 1;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

button {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  background-color: #007bff;
  color: white;
  cursor: pointer;
}

.sort-options {
  margin-bottom: 20px;
}

select {
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.insurer-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.insurer-card {
  background: white;
  border-radius: 8px;
  padding: 16px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  cursor: pointer;
  transition: transform 0.2s;
}

.insurer-card:hover {
  transform: translateY(-2px);
}

.insurer-card.selected {
  background: #e3f2fd;
}

.insurer-info {
  margin-bottom: 12px;
}

h3 {
  margin: 0 0 8px 0;
  font-size: 1.2em;
}

.status {
  display: inline-block;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 0.9em;
}

.status.gray {
  background-color: #f5f5f5;
  color: #666;
}

.status.yellow {
  background-color: #fff3cd;
  color: #856404;
}

.status.red {
  background-color: #f8d7da;
  color: #721c24;
}

.status.green {
  background-color: #d4edda;
  color: #155724;
}

.insurer-details p {
  margin: 4px 0;
  color: #666;
}

.insurer-detail {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0,0,0,0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0,0,0,0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.loading-spinner {
  border: 4px solid #f3f3f3;
  border-top: 4px solid #3498db;
  border-radius: 50%;
  width: 50px;
  height: 50px;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>
