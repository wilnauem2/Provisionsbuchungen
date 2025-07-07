<template>
  <div class="w-full relative">
    <input 
      ref="inputRef"
      type="text" 
      :value="modelValue" 
      @input="handleInput" 
      @keydown="handleKeydown"
      @focus="handleFocus"
      @blur="handleBlur"
      class="px-5 py-3 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
      placeholder="Versicherer suchen..."
    >
    <ul 
      class="mt-1 w-full max-h-60 border border-gray-300 rounded-md bg-white absolute overflow-y-auto z-10" 
      v-show="searchResults.length && isOpen"
    >
      <li 
        :class="[
          'px-4 py-3 border-b border-gray-200 text-stone-600 cursor-pointer transition-colors',
          index === selectedIndex ? 'bg-blue-100' : 'hover:bg-gray-100'
        ]"
        v-for="(result, index) in searchResults" 
        :key="result.name"
        @click="setSelected(result.name)"
        @mouseenter="selectedIndex = index"
      >
        {{ result.name }}
      </li>
    </ul>
  </div>
</template>

<script setup>
import { computed, ref, nextTick, watch } from 'vue'

const props = defineProps({
  source: {
    type: Array,
    required: true,
    default: () => []
  },
  modelValue: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['update:modelValue', 'selected', 'text-deleted'])

const search = ref(props.modelValue || '')
const previousSearchLength = ref(search.value.length)
const isOpen = ref(false)
const selectedIndex = ref(-1)
const inputRef = ref(null)

// Watch for external changes to modelValue
watch(() => props.modelValue, (newValue) => {
  search.value = newValue || ''
  previousSearchLength.value = search.value.length
})

const searchResults = computed(() => {
  const searchTerm = search.value.trim()
  if (searchTerm === '') {
    return []
  }

  return props.source.filter(item => {
    return item.name.toLowerCase().includes(searchTerm.toLowerCase())
  })
})

const setSelected = item => {
  isOpen.value = false
  search.value = item
  previousSearchLength.value = item.length
  selectedIndex.value = -1
  emit('update:modelValue', item)
  emit('selected', item)
}

const handleInput = event => {
  const currentValue = event.target.value
  const currentLength = currentValue.length
  
  // Check if user is deleting characters (backspace/delete)
  if (currentLength < previousSearchLength.value) {
    isOpen.value = false
    selectedIndex.value = -1
    // Emit event to hide instructions when text is deleted
    emit('text-deleted')
  } else {
    // User is typing new characters
    if (currentValue.trim() !== '') {
      isOpen.value = true
    }
    selectedIndex.value = -1
  }
  
  search.value = currentValue
  previousSearchLength.value = currentLength
  emit('update:modelValue', currentValue)
}

const handleFocus = () => {
  if (search.value.trim() !== '' && searchResults.value.length > 0) {
    isOpen.value = true
  }
}

const handleBlur = () => {
  // Delay closing to allow click events on list items
  setTimeout(() => {
    isOpen.value = false
    selectedIndex.value = -1
  }, 150)
}

const handleKeydown = (event) => {
  switch (event.key) {
    case 'ArrowDown':
      event.preventDefault()
      if (searchResults.value.length > 0) {
        if (!isOpen.value) {
          isOpen.value = true
        }
        selectedIndex.value = selectedIndex.value < searchResults.value.length - 1 
          ? selectedIndex.value + 1 
          : 0
        scrollToSelected()
      }
      break
    
    case 'ArrowUp':
      event.preventDefault()
      if (searchResults.value.length > 0) {
        if (!isOpen.value) {
          isOpen.value = true
        }
        selectedIndex.value = selectedIndex.value > 0 
          ? selectedIndex.value - 1 
          : searchResults.value.length - 1
        scrollToSelected()
      }
      break
    
    case 'Enter':
      event.preventDefault()
      if (isOpen.value && selectedIndex.value >= 0 && selectedIndex.value < searchResults.value.length) {
        setSelected(searchResults.value[selectedIndex.value].name)
      }
      break
    
    case 'Escape':
      event.preventDefault()
      isOpen.value = false
      selectedIndex.value = -1
      inputRef.value?.blur()
      break
  }
}

const scrollToSelected = () => {
  nextTick(() => {
    const listElement = document.querySelector('.w-full.relative ul')
    const selectedElement = listElement?.children[selectedIndex.value]
    
    if (selectedElement && listElement) {
      const listRect = listElement.getBoundingClientRect()
      const selectedRect = selectedElement.getBoundingClientRect()
      
      if (selectedRect.bottom > listRect.bottom) {
        selectedElement.scrollIntoView({ block: 'end', behavior: 'smooth' })
      } else if (selectedRect.top < listRect.top) {
        selectedElement.scrollIntoView({ block: 'start', behavior: 'smooth' })
      }
    }
  })
}
</script>