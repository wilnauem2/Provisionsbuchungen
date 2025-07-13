<template>
  <div class="app-container">
    <Tabs :activeTab="activeTab" @update:activeTab="activeTab = $event" />
    <div v-if="activeTab === 'main'" class="content">
      <HeaderSection />
  <div class="flex flex-col gap-2 px-4 py-3">
    <EnvironmentUserInfo
      :currentEnvironment="currentEnvironment"
      :username="username"
      @update:currentEnvironment="val => currentEnvironment = val"
      @logout="logout"
    />
    <StatusSummary :statusCounts="statusCounts" />
  </div>
  <TestDateSimulator v-model="testDate" v-if="currentEnvironment === 'test' && activeTab === 'main'" @update:modelValue="handleDateUpdate" class="mt-4" />
  <div class="insurer-list">
    <SearchBar :searchFilter="searchFilter" @update:searchFilter="searchFilter = $event" />
    <template v-if="filteredInsurers.length > 0">
      <InsurerList
        :insurers="filteredInsurers"
        :selectedInsurer="selectedInsurer"
        @selectInsurer="insurer => selectedInsurer = insurer"
      />
    </template>
    <template v-else>
      <div class="text-center py-12 text-gray-500 text-lg">
        Keine Versicherer gefunden.
      </div>
    </template>
    <!-- Backdrop overlay with fade transition -->
    <transition name="fade">
      <div v-if="selectedInsurer" class="overlay-backdrop" @click="selectedInsurer = null"></div>
    </transition>
    
    <!-- Detail panel with slide transition -->
    <transition name="slide-in-right">
      <div v-if="selectedInsurer" class="insurer-detail">
        <div class="insurer-detail-header">
          <h2>{{ selectedInsurer.name }}</h2>
          <button class="close-button" @click="selectedInsurer = null" aria-label="Details schließen">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>
        <div class="insurer-detail-content">
          <InsurerDetail 
            :insurer="selectedInsurer" 
            @close="() => selectedInsurer = null" 
            @settlement-completed="handleSettlementCompleted"
          />
        </div>
      </div>
    </transition>
  </div>
    </div>
    <!-- Abrechnungen History View -->
    <div v-if="activeTab === 'history'" class="content p-4">
      <AbrechnungenHistory :abrechnungen="formattedAbrechnungen" />
    </div>
  </div>
  <!-- Debug output for selectedInsurer.value -->
<div style="margin-top: 1rem; background: #fffbe6; border: 1px solid #facc15; border-radius: 8px; padding: 0.5rem; font-size: 0.95em; color: #92400e;">
  <strong>[Debug] selectedInsurer:</strong>
  <pre style="white-space: pre-wrap; word-break: break-all; background: #fef9c3; padding: 0.5em; border-radius: 4px;">
  {{ typeof selectedInsurer !== 'undefined' ? selectedInsurer : 'selectedInsurer is undefined' }}
</pre>
</div>
<!-- Debug output for Firestore data -->
  <div style="margin-top: 3rem; background: #f9fafb; border: 1px solid #d1d5db; border-radius: 8px; padding: 1rem; font-size: 0.95em; color: #111;">
    <h3 style="font-weight: bold; margin-bottom: 0.5em;">[Debug] Firestore lastInvoices</h3>
    <pre style="white-space: pre-wrap; word-break: break-all; background: #f3f4f6; padding: 0.5em; border-radius: 4px;">{{ lastInvoices }}</pre>
    <h3 style="font-weight: bold; margin-top: 1.5em; margin-bottom: 0.5em;">[Debug] insurersData (merged)</h3>
    <pre style="white-space: pre-wrap; word-break: break-all; background: #f3f4f6; padding: 0.5em; border-radius: 4px;">{{ insurersData }}</pre>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import AbrechnungenHistory from './AbrechnungenHistory.vue'
import Tabs from './Tabs.vue'
import HeaderSection from './HeaderSection.vue'
import EnvironmentUserInfo from './EnvironmentUserInfo.vue'
import StatusSummary from './StatusSummary.vue'
import SearchBar from './SearchBar.vue'
import InsurerList from './InsurerList.vue'
import { useRouter, useRoute } from 'vue-router'
import { currentEnvironment, getInsurersData } from '../config/environment'
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

}, { deep: true })

// Load insurers data based on environment
const loadInsurersData = async () => {
  try {
    const data = await getInsurersData()
    // Make sure we have proper date handling
    const processedData = JSON.parse(JSON.stringify(data), (key, value) => {
      // If this is a date string in the expected format, convert it to a Date object
      if (typeof value === 'string' && /^\d{2}\.\d{2}\.\d{4}, \d{2}:\d{2}$/.test(value)) {
        const [datePart, timePart] = value.split(', ');
        const [day, month, year] = datePart.split('.').map(Number);
        const [hours, minutes] = timePart.split(':').map(Number);
        const date = new Date(year, month - 1, day, hours, minutes);
        
        // Return an object with both the display string and timestamp
        return {
          display: value,
          timestamp: date.getTime(),
          toJSON: () => value // Ensure proper serialization
        };
      }
      return value;
    });
    
    insurersData.value = processedData;
    console.log('[DEBUG] Loaded insurersData:', insurersData.value);
  } catch (error) {
    console.error('Error loading insurers data:', error)
  }
}

// Load last invoices from Firestore via Firebase
import { fetchInvoices, saveInvoices, subscribeInvoices } from '../firebaseInvoices'

// Set up real-time listener for last_invoices
let unsubscribeInvoices = null;
const loadLastInvoices = () => {
  if (unsubscribeInvoices) unsubscribeInvoices();
  unsubscribeInvoices = subscribeInvoices((data) => {
    lastInvoices.value = data || {};
  }, currentEnvironment.value);
};

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

// Initial load and subscribe to real-time updates
import { onUnmounted } from 'vue'
onMounted(() => {
  loadData()
  loadLastInvoices()
})
onUnmounted(() => {
  if (unsubscribeInvoices) unsubscribeInvoices();
})

// Watch for real-time updates to lastInvoices and update insurersData accordingly
watch(lastInvoices, (newVal) => {
  if (!insurersData.value || !newVal) return;
  
  // Always replace the array for Vue reactivity
  insurersData.value = insurersData.value.map(insurer => {
    const invoiceHistory = newVal[insurer.name] || [];
    
    // Handle both array and non-array formats for backward compatibility
    const invoiceData = Array.isArray(invoiceHistory)
      ? invoiceHistory
      : invoiceHistory ? [invoiceHistory] : [];
    
    return {
      ...insurer,
      // Store the full invoice history
      invoice_history: invoiceData,
      // Keep last_invoice as the most recent one for backward compatibility
      last_invoice: invoiceData.length > 0 ? invoiceData[0] : ''
    };
  });
  console.log('Updated insurersData with history:', insurersData.value);
});

const filteredInsurers = computed(() => {
  // Clone the data to avoid mutations
  let filtered = [...insurersData.value]
  
  // Apply search filter
  if (searchFilter.value) {
    const searchLower = searchFilter.value.toLowerCase()
    filtered = filtered.filter(insurer => {
      const nameMatch = insurer.name?.toLowerCase().includes(searchLower) || false;
      const turnusMatch = insurer.turnus?.toLowerCase().includes(searchLower) || false;
      const lastInvoiceStr = insurer.last_invoice ? String(insurer.last_invoice) : '';
      const lastInvoiceMatch = lastInvoiceStr.toLowerCase().includes(searchLower);
      
      return nameMatch || turnusMatch || lastInvoiceMatch;
    })
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
        const getDate = (item) => {
          if (!item.last_invoice) return new Date(0); // Very old date for null/undefined
          
          // Handle the new object format
          if (typeof item.last_invoice === 'object' && item.last_invoice !== null) {
            if (item.last_invoice.timestamp) {
              return new Date(item.last_invoice.timestamp);
            }
            if (item.last_invoice.display) {
              return new Date(item.last_invoice.display.split(', ').reverse().join('T'));
            }
            return new Date(0);
          }
          
          // Handle the old string format
          if (typeof item.last_invoice === 'string') {
            return new Date(item.last_invoice.split(', ').reverse().join('T'));
          }
          
          return new Date(0);
        };
        
        const dateA = getDate(a);
        const dateB = getDate(b);
        return dateB.getTime() - dateA.getTime();
      })
      break
  }

  return filtered
})

// Format last invoices for the history view
const formattedAbrechnungen = computed(() => {
  const entries = [];
  
  // Process insurers data for history
  insurersData.value.forEach(insurer => {
    if (!insurer || !insurer.name) return;
    
    // Handle last_invoice whether it's an object or string
    if (insurer.last_invoice) {
      let dateString = insurer.last_invoice;
      let timestamp;
      
      // Handle different date formats
      if (typeof insurer.last_invoice === 'object' && insurer.last_invoice !== null) {
        // Use display format if available, otherwise use raw date
        dateString = insurer.last_invoice.display || insurer.last_invoice.raw || '';
        
        // Get timestamp from the object if available
        if (insurer.last_invoice.timestamp) {
          timestamp = new Date(insurer.last_invoice.timestamp);
        }
      }
      
      // If we don't have a timestamp yet, try to parse the date string
      if (!timestamp && dateString) {
        try {
          // Try different date formats
          if (dateString.includes(',')) {
            // Format: "13.07.2025, 09:10"
            timestamp = new Date(dateString.split(', ').reverse().join('T'));
          } else if (dateString.includes('-')) {
            // Format: "2025-07-13T09:10:00.000Z"
            timestamp = new Date(dateString);
          } else {
            // Try to parse as is
            timestamp = new Date(dateString);
          }
        } catch (e) {
          console.warn('Could not parse date:', dateString, 'for insurer:', insurer.name);
          timestamp = new Date(0); // Use epoch as fallback
        }
      }
      
      // Only add if we have a valid date
      if (timestamp && !isNaN(timestamp.getTime())) {
        entries.push({
          insurer: insurer.name,
          date: dateString,
          timestamp: timestamp
        });
      }
    }
  });
  
  console.log('History entries:', entries); // Debug log
  
  // Sort by timestamp (newest first)
  return entries.sort((a, b) => b.timestamp - a.timestamp);
});

// Watch for environment changes
watch(currentEnvironment, async () => {
  await loadData()
})
// (Removed forced re-render watcher. Vue will now handle updates reactively.)

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

const saveToJson = async (showSuccessAlert = true) => {
  try {
    if (!selectedInsurer.value) {
      throw new Error('Kein Versicherer ausgewählt')
    }

    // Update local state
    const insurerIndex = insurersData.value.findIndex(i => i.name === selectedInsurer.value.name)
    if (insurerIndex !== -1) {
      insurersData.value[insurerIndex] = { ...selectedInsurer.value }
    }

    // Save last_invoices data to Firebase (with environment)
    const lastInvoicesObj = insurersData.value.reduce((acc, insurer) => {
      if (insurer.last_invoice) {
        // Handle different formats of last_invoice
        if (typeof insurer.last_invoice === 'object' && insurer.last_invoice !== null) {
          // If it's an object, use the display string if available
          if (insurer.last_invoice.display) {
            acc[insurer.name] = insurer.last_invoice.display;
          } else if (typeof insurer.last_invoice.toJSON === 'function') {
            // If it has a toJSON method, call it
            acc[insurer.name] = insurer.last_invoice.toJSON();
          } else {
            // Otherwise, convert to string
            acc[insurer.name] = String(insurer.last_invoice);
          }
        } else {
          // It's a string or other primitive
          acc[insurer.name] = insurer.last_invoice;
        }
      }
      return acc;
    }, {});
    
    await saveInvoices(lastInvoicesObj, currentEnvironment.value)
    console.log('[Save] Wrote lastInvoices:', lastInvoicesObj, 'to environment:', currentEnvironment.value);
    
    if (showSuccessAlert) {
      alert('Daten erfolgreich gespeichert!')
    }
    
    return true;
  } catch (error) {
    console.error('Error saving data:', error)
    if (showSuccessAlert) {
      alert(`Fehler beim Speichern der Daten:\n${error.message}`)
    }
    return false;
  }
}

const handleSettlementCompleted = async ({ insurer, newDate, displayDate }) => {
  if (!insurer || !selectedInsurer.value || insurer.name !== selectedInsurer.value.name) return
  
  console.log('Settlement completed with date:', newDate, 'Display date:', displayDate)
  
  try {
    // Create a properly formatted date object for storage
    const formattedDate = {
      timestamp: newDate.getTime(),
      display: displayDate || format(newDate, 'dd.MM.yyyy, HH:mm'),
      raw: newDate.toISOString()
    }
    
    // Update local state with the formatted date
    const insurerIndex = insurersData.value.findIndex(i => i.name === insurer.name)
    if (insurerIndex !== -1) {
      const updatedInsurer = { 
        ...insurer,
        last_invoice: formattedDate,
        last_invoice_timestamp: newDate.getTime()
      }
      
      // Update both the insurers array and selectedInsurer
      insurersData.value[insurerIndex] = updatedInsurer
      selectedInsurer.value = updatedInsurer
      
      // Save to Firestore without showing the success alert (we'll show it here)
      const success = await saveToJson(false)
      
      if (success) {
        // Show success message only once
        alert('Abrechnung erfolgreich gespeichert')
      } else {
        throw new Error('Fehler beim Speichern der Abrechnung')
      }
    }
  } catch (error) {
    console.error('Error saving settlement:', error)
    alert('Fehler beim Speichern der Abrechnung: ' + (error.message || 'Unbekannter Fehler'))
  }
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

/* Transition animations */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.slide-in-right-enter-active,
.slide-in-right-leave-active {
  transition: transform 0.35s ease, opacity 0.25s ease;
}

.slide-in-right-enter-from,
.slide-in-right-leave-to {
  transform: translateX(100%);
  opacity: 0;
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

/* Overlay backdrop */
.overlay-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(2px);
  z-index: 9;
  cursor: pointer;
}

/* Detail panel */
.insurer-detail {
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  width: 450px;
  background: white;
  box-shadow: -4px 0 20px rgba(0, 0, 0, 0.15);
  z-index: 10;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.insurer-detail-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #e5e7eb;
  background-color: #f9fafb;
}

.insurer-detail-header h2 {
  font-size: 1.5rem;
  font-weight: 600;
  color: #111827;
  margin: 0;
}

.insurer-detail-content {
  flex: 1;
  padding: 24px;
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
