<template>
  <div class="w-full relative">
    <input 
      type="text" 
      :value="modelValue" 
      @input="handleInput" 
      class="px-5 py-3 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
      placeholder="Versicherer suchen..."
    >
    <ul class="mt-1 w-full max-h-60 border border-gray-300 rounded-md bg-white absolute overflow-y-auto z-10" v-show="searchResults.length && isOpen">
      <li 
        class="px-4 py-3 border-b border-gray-200 text-stone-600 cursor-pointer hover:bg-gray-100 transition-colors"
        v-for="result in searchResults" 
        :key="result.name"
        @click="setSelected(result.name)"
      >
        {{ result.name }}
      </li>
    </ul>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'

const props = defineProps({
  source: {
    type: Array,
    required: true,
    default: () => []
  },
  modelValue: String
})

const emit = defineEmits(['update:modelValue', 'selected'])

const search = ref('')
const searchResults = computed(() => {
  if (search.value === '') {
    return []
  }

  return props.source.filter(item => {
    return item.name.toLowerCase().includes(search.value.toLowerCase())
  })
})

const isOpen = ref(false)

const setSelected = item => {
  isOpen.value = false
  search.value = item
  emit('update:modelValue', search.value)
  emit('selected', item) // Neues Event für die Auswahl
}

const handleInput = event => {
  isOpen.value = true
  search.value = event.target.value
  emit('update:modelValue', search.value)
}
</script>