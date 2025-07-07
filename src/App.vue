<script setup>
import { ref } from 'vue'
import Autocomplete from './components/Autocomplete.vue'
import InsurerList from './components/InsurerList.vue'
import insurers from './data/insurers.json'

const insurer = ref('')
const selectedInsurer = ref(null)

// Handler für die Auswahl eines Versicherers über die Autocomplete
const handleInsurerSelected = (insurerName) => {
  selectedInsurer.value = insurers.find(item => item.name === insurerName)
}

// Handler für die Auswahl eines Versicherers über die Liste
const handleInsurerSelectedFromList = (insurerData) => {
  selectedInsurer.value = insurerData
  insurer.value = insurerData.name
}

// Handler für das Löschen von Text - blendet Instructions aus
const handleTextDeleted = () => {
  selectedInsurer.value = null
}
</script>

<template>
  <div class="w-screen h-screen bg-gray-200 flex">
    <!-- Linke Seite - Detailbereich und Suchbereich -->
    <div class="flex-1 flex flex-col">
      <!-- Header -->
      <div class="p-8 pb-4">
        <h1 class="text-center font-bold text-2xl text-gray-800">
          Versicherer-Verwaltung
        </h1>
      </div>

      <!-- Scrollbarer Detailbereich -->
      <div class="flex-1 overflow-y-auto px-8">
        <!-- Ausgewählter Versicherer -->
        <div v-if="selectedInsurer" class="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 class="text-xl font-semibold mb-2 text-blue-800">
            {{ selectedInsurer.name }}
          </h3>
        </div>

        <!-- Detailinformationen -->
        <div v-if="selectedInsurer" class="space-y-4 mb-6">
          <div v-if="selectedInsurer.turnus" class="bg-cyan-50 p-4 rounded-lg border border-cyan-200">
            <h3 class="text-lg font-semibold mb-2 text-cyan-800">Turnus:</h3>
            <div class="text-gray-700">
              {{ selectedInsurer.turnus }}
            </div>
          </div>

          <div v-if="selectedInsurer.dokumentenart" class="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
            <h3 class="text-lg font-semibold mb-2 text-yellow-800">Dokumentenart:</h3>
            <div class="text-gray-700">
              {{ selectedInsurer.dokumentenart }}
            </div>
          </div>

          <div v-if="selectedInsurer.bezugsweg" class="bg-teal-50 p-4 rounded-lg border border-teal-200">
            <h3 class="text-lg font-semibold mb-2 text-teal-800">Bezugsweg:</h3>
            <div class="text-gray-700">
              {{ selectedInsurer.bezugsweg }}
            </div>
          </div>

          <div v-if="selectedInsurer.kontakt" class="bg-red-50 p-4 rounded-lg border border-red-200">
            <h3 class="text-lg font-semibold mb-2 text-red-800">Kontakt:</h3>
            <div class="text-gray-700">
              {{ selectedInsurer.kontakt }}
            </div>
          </div>

          <div v-if="selectedInsurer.login" class="bg-orange-50 p-4 rounded-lg border border-orange-200">
            <h3 class="text-lg font-semibold mb-2 text-orange-800">Login:</h3>
            <div class="text-gray-700">
              {{ selectedInsurer.login }}
            </div>
          </div>
        </div>

        <!-- Platzhalter wenn kein Versicherer ausgewählt -->
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

      <!-- Fixierte Suchleiste am unteren Rand -->
      <div class="border-t border-gray-300 bg-white p-6">
        <div class="max-w-2xl mx-auto">
          <h2 class="text-lg font-semibold mb-4 text-gray-800">
            Versicherer suchen
          </h2>
          
          <Autocomplete 
            :source="insurers" 
            v-model="insurer" 
            @selected="handleInsurerSelected"
            @text-deleted="handleTextDeleted"
          />
        </div>
      </div>
    </div>

    <!-- Rechte Seite - Versicherungsliste -->
    <div class="w-96 bg-white border-l border-gray-300 p-4">
      <InsurerList 
        :insurers="insurers"
        :selectedInsurer="selectedInsurer"
        @insurer-selected="handleInsurerSelectedFromList"
      />
    </div>
  </div>
</template>