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
    <!-- Linke Seite - Suchbereich und Details -->
    <div class="flex-1 flex justify-center items-center p-8">
      <div class="w-full max-w-2xl">
        <h1 class="text-center mb-6 font-bold text-2xl text-gray-800">
          Versicherer-Verwaltung
        </h1>
        
        <div class="bg-white p-6 rounded-lg shadow-lg">
          <h2 class="text-lg font-semibold mb-4 text-gray-800">
            Versicherer suchen
          </h2>
          
          <Autocomplete 
            :source="insurers" 
            v-model="insurer" 
            @selected="handleInsurerSelected"
            @text-deleted="handleTextDeleted"
          />
          
          <!-- Ausgewählter Versicherer -->
          <div v-if="selectedInsurer" class="mt-6 p-4 bg-blue-50 rounded-md border border-blue-200">
            <h3 class="text-lg font-semibold mb-2 text-blue-800">
              {{ selectedInsurer.name }}
            </h3>
          </div>
        </div>

        <!-- Detailinformationen -->
        <div v-if="selectedInsurer" class="mt-6 space-y-4">
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