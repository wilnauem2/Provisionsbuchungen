<template>
  <div class="abrechnungen-history">
    <h2 class="text-xl font-semibold mb-4">Vergangene Abrechnungen</h2>
    
    <div class="mb-4 flex justify-between items-center">
      <div class="relative">
        <select 
          v-model="sortField" 
          class="px-3 py-2 border border-gray-300 rounded-md text-sm bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="date">Nach Datum sortieren</option>
          <option value="insurer">Nach Versicherung sortieren</option>
        </select>
      </div>
      
      <div class="flex items-center">
        <button 
          @click="sortAscending = !sortAscending"
          class="p-2 text-gray-600 hover:text-gray-900 focus:outline-none"
          :title="sortAscending ? 'Aufsteigend' : 'Absteigend'"
        >
          <svg 
            class="w-5 h-5" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
            :class="{ 'transform rotate-180': !sortAscending }"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
          </svg>
        </button>
      </div>
    </div>
    
    <div class="overflow-x-auto">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th 
              scope="col" 
              class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
              @click="setSort('date')"
            >
              <div class="flex items-center">
                Datum
                <SortIndicator :active="sortField === 'date'" :ascending="sortAscending" />
              </div>
            </th>
            <th 
              scope="col" 
              class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
              @click="setSort('insurer')"
            >
              <div class="flex items-center">
                Versicherung
                <SortIndicator :active="sortField === 'insurer'" :ascending="sortAscending" />
              </div>
            </th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr v-for="(abrechnung, index) in sortedAbrechnungen" :key="index" class="hover:bg-gray-50">
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
              {{ formatDate(abrechnung.date) }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
              {{ abrechnung.insurer }}
            </td>
          </tr>
          <tr v-if="abrechnungen.length === 0">
            <td colspan="2" class="px-6 py-4 text-center text-sm text-gray-500">
              Keine vergangenen Abrechnungen gefunden.
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';

const props = defineProps({
  abrechnungen: {
    type: Array,
    required: true,
    default: () => []
  }
});

const sortField = ref('date');
const sortAscending = ref(false);

const setSort = (field) => {
  if (sortField.value === field) {
    sortAscending.value = !sortAscending.value;
  } else {
    sortField.value = field;
    sortAscending.value = true;
  }
};

const sortedAbrechnungen = computed(() => {
  return [...props.abrechnungen].sort((a, b) => {
    let comparison = 0;
    
    if (sortField.value === 'date') {
      comparison = new Date(a.date) - new Date(b.date);
    } else {
      comparison = a.insurer.localeCompare(b.insurer);
    }
    
    return sortAscending.value ? comparison : -comparison;
  });
});

const parseGermanDate = (dateString) => {
  // Handle German date format: DD.MM.YYYY, HH:mm
  const [datePart] = dateString.split(','); // Only take the date part
  const [day, month, year] = datePart.split('.').map(Number);
  
  // Note: Month is 0-indexed in JavaScript Date
  return new Date(year, month - 1, day);
};

const formatDate = (dateString) => {
  try {
    // First try to parse as German format
    if (dateString.match(/^\d{2}\.\d{2}\.\d{4}(, \d{2}:\d{2})?$/)) {
      const date = parseGermanDate(dateString);
      return format(date, 'dd.MM.yyyy');
    }
    
    // Fallback to default parsing
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      throw new Error('Invalid date');
    }
    return format(date, 'dd.MM.yyyy');
  } catch (e) {
    console.warn('Failed to format date:', dateString, e);
    return dateString;
  }
};
</script>

<style scoped>
.sort-arrow {
  transition: transform 0.2s ease-in-out;
}
.sort-arrow.asc {
  transform: rotate(180deg);
}
</style>
