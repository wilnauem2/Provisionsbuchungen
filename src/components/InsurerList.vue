<template>
  <div class="h-full bg-white rounded-lg shadow-lg overflow-hidden">
    <div class="bg-gray-50 px-6 py-4 border-b border-gray-200">
      <h2 class="text-xl font-bold text-gray-800">Alle Versicherungen</h2>
      <p class="text-sm text-gray-600 mt-1">
        Überfällige Abrechnungen sind rot markiert
      </p>
    </div>
    
    <div class="overflow-y-auto h-full">
      <ul class="divide-y divide-gray-200">
        <li 
          v-for="insurer in insurersWithStatus" 
          :key="insurer.name"
          :class="[
            'px-6 py-4 cursor-pointer transition-colors duration-200',
            insurer.isOverdue ? 'bg-red-100 hover:bg-red-200' : 'hover:bg-gray-50',
            selectedInsurer?.name === insurer.name ? 'bg-blue-100' : ''
          ]"
          @click="selectInsurer(insurer)"
        >
          <div class="flex items-center justify-between">
            <div class="flex-1 min-w-0">
              <h3 class="text-lg font-medium text-gray-900 truncate">
                {{ insurer.name }}
              </h3>
              <div class="mt-1 text-sm text-gray-600">
                <div v-if="insurer.turnus">
                  <span class="font-medium">Turnus:</span> {{ insurer.turnus }}
                </div>
                <div v-if="insurer.lastBilling" class="mt-1">
                  <span class="font-medium">Letzte Abrechnung:</span> 
                  {{ formatDate(insurer.lastBilling) }}
                </div>
                <div v-if="insurer.nextDue" class="mt-1">
                  <span class="font-medium">Nächste Abrechnung:</span> 
                  {{ formatDate(insurer.nextDue) }}
                </div>
              </div>
            </div>
            
            <div class="flex items-center ml-4">
              <div 
                v-if="insurer.isOverdue"
                class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-200 text-red-800"
              >
                <svg class="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
                </svg>
                Überfällig
              </div>
              <div 
                v-else-if="insurer.nextDue"
                class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-200 text-green-800"
              >
                <svg class="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                </svg>
                Aktuell
              </div>
            </div>
          </div>
        </li>
      </ul>
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

const emit = defineEmits(['insurer-selected'])

// Hilfsfunktion zum Parsen des Turnus und Berechnen der nächsten Fälligkeit
const parseTurnus = (turnus) => {
  if (!turnus) return null
  
  const turnusLower = turnus.toLowerCase()
  
  // Verschiedene Turnus-Formate erkennen
  if (turnusLower.includes('monatlich') || turnusLower.includes('jeden monat')) {
    return { type: 'monthly', interval: 1 }
  } else if (turnusLower.includes('vierteljährlich') || turnusLower.includes('quartalsweise')) {
    return { type: 'quarterly', interval: 3 }
  } else if (turnusLower.includes('halbjährlich') || turnusLower.includes('alle 6 monate')) {
    return { type: 'halfyearly', interval: 6 }
  } else if (turnusLower.includes('jährlich') || turnusLower.includes('einmal im jahr')) {
    return { type: 'yearly', interval: 12 }
  } else if (turnusLower.includes('alle 2 monate')) {
    return { type: 'bimonthly', interval: 2 }
  } else if (turnusLower.includes('alle 3 monate')) {
    return { type: 'quarterly', interval: 3 }
  }
  
  return null
}

// Berechnet die nächste Fälligkeit basierend auf dem Turnus
const calculateNextDue = (lastBilling, turnus) => {
  if (!lastBilling || !turnus) return null
  
  const parsedTurnus = parseTurnus(turnus)
  if (!parsedTurnus) return null
  
  const lastDate = new Date(lastBilling)
  const nextDate = new Date(lastDate)
  nextDate.setMonth(nextDate.getMonth() + parsedTurnus.interval)
  
  return nextDate
}

// Erweiterte Versicherungsliste mit Status-Informationen
const insurersWithStatus = computed(() => {
  const today = new Date()
  
  return props.insurers.map(insurer => {
    // Simuliere letzte Abrechnung (normalerweise würde dies aus einer Datenbank kommen)
    const lastBilling = getLastBillingDate(insurer.name)
    const nextDue = calculateNextDue(lastBilling, insurer.turnus)
    
    // Prüfe ob überfällig (7 Tage Toleranz)
    const isOverdue = nextDue && nextDue < new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
    
    return {
      ...insurer,
      lastBilling,
      nextDue,
      isOverdue
    }
  })
})

// Simuliert letzte Abrechnungsdaten (in einer echten App würde dies aus einer API/Datenbank kommen)
const getLastBillingDate = (insurerName) => {
  // Simuliere verschiedene Abrechnungszyklen
  const today = new Date()
  const baseDate = new Date(today.getFullYear(), today.getMonth() - 1, 1)
  
  // Simuliere unterschiedliche Abrechnungsstände
  const hash = insurerName.split('').reduce((a, b) => a + b.charCodeAt(0), 0)
  const daysAgo = (hash % 90) + 10 // 10-100 Tage rückwirkend
  
  const lastBilling = new Date(today.getTime() - daysAgo * 24 * 60 * 60 * 1000)
  return lastBilling
}

// Formatiert ein Datum für die Anzeige
const formatDate = (date) => {
  if (!date) return 'Unbekannt'
  
  return new Intl.DateTimeFormat('de-DE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).format(date)
}

// Versicherer auswählen
const selectInsurer = (insurer) => {
  emit('insurer-selected', insurer)
}
</script>