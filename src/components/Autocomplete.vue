<template>
  <div class="h-full flex flex-col">
    <h2 class="text-lg font-semibold mb-4 text-gray-800">
      Versicherer ({{ insurers.length }})
    </h2>
   
    <div class="flex-1 overflow-y-auto">
      <div class="space-y-2">
        <div
          v-for="insurer in insurers"
          :key="insurer.name"
          :class="[
            'p-3 rounded-lg cursor-pointer transition-all duration-200 border',
            selectedInsurer?.name === insurer.name
              ? 'bg-blue-100 border-blue-300 shadow-md'
              : 'bg-gray-50 border-gray-200 hover:bg-gray-100 hover:border-gray-300'
          ]"
          @click="selectInsurer(insurer)"
        >
          <div class="flex items-center justify-between">
            <div class="flex-1 min-w-0">
              <h3 class="font-medium text-gray-900 truncate text-sm">
                {{ insurer.name }}
              </h3>
             
              <!-- Zusätzliche Informationen -->
              <div class="mt-1 space-y-1">
                <div v-if="insurer.turnus" class="text-xs text-gray-600">
                  {{ insurer.turnus }}
                </div>
               
                <div v-if="insurer.last_invoice" class="text-xs text-green-600 flex items-center">
                  <svg class="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                  </svg>
                  {{ formatLastSettlement(insurer.last_invoice) }}
                </div>
              </div>
            </div>
           
            <!-- Status-Indikator mit Bearbeitungsbutton -->
            <div class="ml-2 flex-shrink-0 flex items-center space-x-2">
              <!-- Schnell-Datum-Button -->
              <button
                @click.stop="markAsSettledToday(insurer)"
                class="text-xs px-2 py-1 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
                title="Als heute abgerechnet markieren"
              >
                Heute
              </button>
              
              <!-- Datum-Eingabe -->
              <input
                type="date"
                :value="getDateValue(insurer.last_invoice)"
                @change="updateLastInvoice(insurer, $event.target.value)"
                @click.stop
                class="text-xs border rounded px-1 py-1 w-24"
                title="Provisionsabrechnungsdatum setzen"
              />
              
              <!-- Status-Indikator -->
              <div class="w-3 h-3 bg-green-500 rounded-full"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  insurers: {
    type: Array,
    required: true,
    default: () => []
  },
  selectedInsurer: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['insurer-selected', 'update-last-invoice'])

const selectInsurer = (insurer) => {
  emit('insurer-selected', insurer)
}

// Datum für heute setzen
const markAsSettledToday = (insurer) => {
  const today = new Date()
  const formattedDate = formatDateForStorage(today)
  updateInsurerData(insurer, formattedDate)
}

// Datum aktualisieren
const updateLastInvoice = (insurer, dateValue) => {
  if (!dateValue) return
  
  const date = new Date(dateValue)
  const formattedDate = formatDateForStorage(date)
  updateInsurerData(insurer, formattedDate)
}

// Datum für Speicherung formatieren (DD.MM.YYYY, HH:MM)
const formatDateForStorage = (date) => {
  const day = String(date.getDate()).padStart(2, '0')
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const year = date.getFullYear()
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  
  return `${day}.${month}.${year}, ${hours}:${minutes}`
}

// Datum für HTML-Input formatieren (YYYY-MM-DD)
const getDateValue = (dateString) => {
  if (!dateString) return ''
  
  try {
    // Annahme: dateString ist im Format "DD.MM.YYYY, HH:MM"
    const datePart = dateString.split(',')[0] // "DD.MM.YYYY"
    const [day, month, year] = datePart.split('.')
    return `${year}-${month}-${day}`
  } catch (error) {
    return ''
  }
}

// Versichererdaten aktualisieren und speichern
const updateInsurerData = async (insurer, newDate) => {
  try {
    // Lokale Aktualisierung
    insurer.last_invoice = newDate
    
    // Event an Parent-Komponente senden
    emit('update-last-invoice', {
      insurerName: insurer.name,
      lastInvoice: newDate
    })
    
    // Direkte Speicherung in JSON-Datei
    await saveInsurerData(insurer.name, newDate)
    
  } catch (error) {
    console.error('Fehler beim Aktualisieren der Versichererdaten:', error)
  }
}

// Speichern in insurer.json
const saveInsurerData = async (insurerName, lastInvoice) => {
  try {
    // Aktuelle Daten laden
    const response = await fetch('/api/insurers')
    const insurersData = await response.json()
    
    // Versicherer finden und aktualisieren
    const insurerIndex = insurersData.findIndex(ins => ins.name === insurerName)
    if (insurerIndex !== -1) {
      insurersData[insurerIndex].last_invoice = lastInvoice
      
      // Zurück in die JSON-Datei speichern
      await fetch('/api/insurers', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(insurersData)
      })
    }
  } catch (error) {
    console.error('Fehler beim Speichern der Versichererdaten:', error)
    throw error
  }
}

// Formatierung des Datums für bessere Lesbarkeit
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