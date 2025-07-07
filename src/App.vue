<script setup>
import { ref } from 'vue'
import Autocomplete from './components/Autocomplete.vue';
import insurers from './data/insurers.json'

const insurer = ref('')
const selectedInsurer = ref(null)

// Handler für die Auswahl eines Versicherers
const handleInsurerSelected = (insurerName) => {
  selectedInsurer.value = insurers.find(item => item.name === insurerName)
}

// Handler für das Löschen von Text - blendet Instructions aus
const handleTextDeleted = () => {
  selectedInsurer.value = null
}
</script>

<template>
  <div class="w-screen h-screen bg-gray-200 flex justify-center items-center flex-col">
    <div class="w-1/3">
      <h1 class="text-center mb-3 font-bold">
        Ausgewählter Versicherer: {{ selectedInsurer?.name || 'Keine Auswahl' }}
      </h1>
      <Autocomplete 
        :source="insurers" 
        v-model="insurer" 
        @selected="handleInsurerSelected"
        @text-deleted="handleTextDeleted"
      />
      
      <!-- Anweisungen anzeigen, wenn ein Versicherer ausgewählt wurde -->
      <div v-if="selectedInsurer && selectedInsurer.instructions" class="mt-6 p-4 bg-cyan-100 rounded-md border border-gray-300">
        <h2 class="text-lg font-semibold mb-3 text-gray-800">Anweisungen für {{ selectedInsurer.name }}:</h2>
        <div class="text-gray-700 leading-relaxed">
          {{ selectedInsurer.instructions }}
        </div>
      </div>

      <div v-if="selectedInsurer && selectedInsurer.instructions2" class="mt-6 p-4 bg-lime-100 rounded-md border border-gray-300">
        <h2 class="text-lg font-semibold mb-3 text-gray-800">Provision eintragen:</h2>
        <div class="text-gray-700 leading-relaxed">
          {{ selectedInsurer.instructions2 }} 
        </div>
      </div>
    </div>
  </div>
</template>