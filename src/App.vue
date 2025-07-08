<script setup>
import { ref, computed, onMounted } from 'vue'
import InsurerList from './components/InsurerList.vue'

const searchFilter = ref('')
const selectedInsurer = ref(null)
const insurersData = ref([])

const loadFromJson = async () => {
  try {
    // Use absolute path for Netlify deployment
    const response = await fetch(`${window.location.origin}/.netlify/functions/get-insurers`)
    if (!response.ok) {
      throw new Error('Failed to load insurers.json')
    }
    const data = await response.json()
    
    if (!Array.isArray(data)) {
      throw new Error('Invalid data format - expected array')
    }
    
    insurersData.value = data
    console.log('Loaded data:', data)
  } catch (error) {
    console.error('Error loading data:', error)
    alert(`Fehler beim Laden der Daten:\n${error.message}\nDetails:\n${error.stack}`)
    
    // Fallback to empty array if loading fails
    insurersData.value = []
  }
}

onMounted(async () => {
  try {
    await loadFromJson()
    console.log('Insurers data loaded:', insurersData.value)
  } catch (error) {
    console.error('Error in onMounted:', error)
  }
})

const filteredInsurers = computed(() => {
  if (!insurersData.value || !Array.isArray(insurersData.value)) {
    console.error('Invalid insurers data:', insurersData.value)
    return []
  }

  return insurersData.value.filter(insurer => 
    insurer.name.toLowerCase().includes(searchFilter.value.toLowerCase())
  )
})

const handleInsurerSelectedFromList = (insurerData) => {
  selectedInsurer.value = insurerData
}

const handleSearchInput = (event) => {
  searchFilter.value = event.target.value
  if (!searchFilter.value.trim()) {
    selectedInsurer.value = null
  }
}

const clearSearch = () => {
  searchFilter.value = ''
  selectedInsurer.value = null
}

const saveToJson = async () => {
  try {
    if (!selectedInsurer.value) {
      throw new Error('Kein Versicherer ausgewählt')
    }

    const currentDate = new Date()
    const dateString = currentDate.toLocaleDateString('de-DE', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })

    // Update local state
    const index = insurersData.value.findIndex(ins => ins.name === selectedInsurer.value.name)
    if (index !== -1) {
      insurersData.value[index] = {
        ...insurersData.value[index],
        last_invoice: dateString
      }
      selectedInsurer.value = {
        ...selectedInsurer.value,
        last_invoice: dateString
      }
    }

    // Save to insurers.json through Netlify function
    const response = await fetch('/functions/update-insurers', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(insurersData.value)
    })

    if (!response.ok) {
      throw new Error('Failed to save to insurers.json')
    }
    
    alert('Daten erfolgreich gespeichert!')
  } catch (error) {
    console.error('Error saving data:', error)
    alert(`Fehler beim Speichern der Daten:\n${error.message}\nDetails:\n${error.stack}`)
  }
}

const handleSettlementCompleted = () => {
  if (selectedInsurer.value) {
    const currentDate = new Date()
    const dateString = currentDate.toLocaleDateString('de-DE', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })

    const index = insurersData.value.findIndex(ins => ins.name === selectedInsurer.value.name)

    if (index !== -1) {
      insurersData.value[index] = {
        ...insurersData.value[index],
        last_invoice: dateString,
        settlementCompleted: true
      }

      selectedInsurer.value = {
        ...selectedInsurer.value,
        last_invoice: dateString,
        settlementCompleted: true
      }

      saveToJson()
    }
  }
}

const handleUpdateLastInvoice = ({ insurerName, lastInvoice }) => {
  const index = insurersData.value.findIndex(ins => ins.name === insurerName)
  if (index !== -1) {
    insurersData.value[index].last_invoice = lastInvoice
    insurersData.value[index].settlementCompleted = true

    if (selectedInsurer.value?.name === insurerName) {
      selectedInsurer.value = {
        ...selectedInsurer.value,
        last_invoice: lastInvoice,
        settlementCompleted: true
      }
    }
    saveToJson()
  }
}

const formatLastSettlement = (dateString) => {
  if (!dateString) return ''
  try {
    const date = new Date(dateString.replace(/(\d{2})\.(\d{2})\.(\d{4}), (\d{2}):(\d{2})/, '$3-$2-$1T$4:$5'))
    const now = new Date()
    const diffTime = Math.abs(now - date)
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays === 0) {
      return 'heute'
    } else if (diffDays === 1) {
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

<template>
  <div class="w-screen h-screen bg-gray-200 flex">
    <div class="flex-1 flex flex-col">
      <div class="p-8 pb-4">
        <h1 class="text-center font-bold text-2xl text-gray-800">
          Provisionsabrechnungshilfe
        </h1>
      </div>

      <div class="flex-1 overflow-y-auto px-8">
        <div v-if="selectedInsurer" class="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <div class="flex justify-between items-start">
            <div class="flex-1">
              <h3 class="text-xl font-semibold mb-2 text-blue-800">
                {{ selectedInsurer.name }}
              </h3>
              <div v-if="selectedInsurer.last_invoice" class="text-sm text-green-600 mb-2">
                ✓ Letzte Abrechnung: {{ formatLastSettlement(selectedInsurer.last_invoice) }}
              </div>
            </div>
            <button 
              @click="handleSettlementCompleted"
              class="ml-4 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors text-sm font-medium"
            >
              Abrechnung soeben erfolgt
            </button>
          </div>
        </div>

        <div v-if="selectedInsurer" class="mb-6">
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div v-if="selectedInsurer.turnus" class="bg-cyan-50 p-4 rounded-lg border border-cyan-200 hover:shadow-md transition-shadow">
              <div class="flex items-center mb-2">
                <svg class="w-5 h-5 text-cyan-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h3 class="font-semibold text-cyan-800">Turnus</h3>
              </div>
              <div class="text-gray-700 text-sm">
                {{ selectedInsurer.turnus }}
              </div>
            </div>

            <div v-if="selectedInsurer.dokumentenart" class="bg-yellow-50 p-4 rounded-lg border border-yellow-200 hover:shadow-md transition-shadow">
              <div class="flex items-center mb-2">
                <svg class="w-5 h-5 text-yellow-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <h3 class="font-semibold text-yellow-800">Dokumentenart</h3>
              </div>
              <div class="text-gray-700 text-sm">
                {{ selectedInsurer.dokumentenart }}
              </div>
            </div>

            <div v-if="selectedInsurer.bezugsweg" class="bg-teal-50 p-4 rounded-lg border border-teal-200 hover:shadow-md transition-shadow">
              <div class="flex items-center mb-2">
                <svg class="w-5 h-5 text-teal-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                </svg>
                <h3 class="font-semibold text-teal-800">Bezugsweg</h3>
              </div>
              <div class="text-gray-700 text-sm">
                {{ selectedInsurer.bezugsweg }}
              </div>
            </div>

            <div v-if="selectedInsurer.kontakt" class="bg-red-50 p-4 rounded-lg border border-red-200 hover:shadow-md transition-shadow">
              <div class="flex items-center mb-2">
                <svg class="w-5 h-5 text-red-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <h3 class="font-semibold text-red-800">Kontakt</h3>
              </div>
              <div class="text-gray-700 text-sm">
                {{ selectedInsurer.kontakt }}
              </div>
            </div>

            <div v-if="selectedInsurer.login" class="bg-orange-50 p-4 rounded-lg border border-orange-200 hover:shadow-md transition-shadow">
              <div class="flex items-center mb-2">
                <svg class="w-5 h-5 text-orange-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                </svg>
                <h3 class="font-semibold text-orange-800">Login</h3>
              </div>
              <div class="text-gray-700 text-sm">
                {{ selectedInsurer.login }}
              </div>
            </div>
          </div>
        </div>

        <div v-if="selectedInsurer && selectedInsurer.instructions" class="mb-6">
          <div class="bg-purple-50 p-4 rounded-lg border border-purple-200">
            <div class="flex items-center mb-2">
              <svg class="w-5 h-5 text-purple-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 class="font-semibold text-purple-800">Anweisungen</h3>
            </div>
            <div class="text-gray-700 text-sm whitespace-pre-line">
              {{ selectedInsurer.instructions }}
            </div>
          </div>
        </div>

        <div v-if="!selectedInsurer" class="flex items-center justify-center h-64">
          <div class="text-center text-gray-500">
            <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 class="mt-2 text-sm font-medium text-gray-900">Kein Versicherer ausgewählt</h3>
            <p class="mt-1 text-sm text-gray-500">Wählen Sie einen Versicherer aus der Liste oder suchen Sie unten.</p>
          </div>
        </div>
      </div>

      <div class="border-t border-gray-300 bg-white p-6">
        <div class="max-w-2xl mx-auto">
          <h2 class="text-lg font-semibold mb-4 text-gray-800">Versicherer filtern</h2>
          <div class="relative">
            <input 
              type="text" 
              :value="searchFilter" 
              @input="handleSearchInput"
              class="px-5 py-3 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10"
              placeholder="Versicherer suchen..."
            >
            <button 
              v-if="searchFilter"
              @click="clearSearch"
              class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div v-if="searchFilter" class="mt-2 text-sm text-gray-600">
            {{ filteredInsurers.length }} Versicherer gefunden
          </div>
        </div>
      </div>
    </div>

    <div class="w-96 bg-white border-l border-gray-300 p-4">
      <InsurerList 
        :insurers="filteredInsurers"
        :selectedInsurer="selectedInsurer"
        @insurer-selected="handleInsurerSelectedFromList"
        @update-last-invoice="handleUpdateLastInvoice"
      />
    </div>
  </div>
</template>
