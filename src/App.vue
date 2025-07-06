<script setup>
import { ref } from 'vue'  // Add this import
import Autocomplete from './components/Autocomplete.vue';
import insurers from './data/insurers.json'

const insurer =  ref('')
</script>


<template>

  <div class="w-screen h-screen bg-gray-200 flex justify-center items-center flex-col">
    <div  class="w-1/3">
    <h1 class="text-center mb3 font-bold">
      Ausgewählter Versicherer: {{ insurer }}
    </h1>
    <Autocomplete :source="insurers" v-model="insurer"/>
  </div>
  </div>
</template>