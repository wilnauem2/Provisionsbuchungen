<template>
  <div class="test-date-simulator" v-if="currentEnvironment === 'test'">
    <div class="date-controls">
      <button @click="decreaseDate" :disabled="!canDecrease">
        ⏪
      </button>
      <span class="current-date">{{ formatDate(testDate) }}</span>
      <button @click="increaseDate" :disabled="!canIncrease">
        ⏩
      </button>
    </div>
    <div class="reset-controls">
      <button @click="resetDate">Reset to Today</button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { currentEnvironment } from '../config/environment'
import { format } from 'date-fns'
import { de } from 'date-fns/locale'

const props = defineProps({
  modelValue: {
    type: Date,
    default: () => new Date()
  }
})

const emit = defineEmits(['update:modelValue'])

const testDate = ref(props.modelValue)

const canDecrease = computed(() => testDate.value > new Date('2023-01-01'))
const canIncrease = computed(() => testDate.value < new Date('2025-12-31'))

const formatDate = (date) => {
  const formatted = format(date, 'dd.MM.yyyy, HH:mm', { locale: de })
  console.log('Formatted date:', formatted)
  return formatted
}

const decreaseDate = () => {
  if (canDecrease.value) {
    const newDate = new Date(testDate.value.getTime() - 24 * 60 * 60 * 1000)
    console.log('Decreasing date to:', newDate)
    testDate.value = newDate
    emit('update:modelValue', newDate)
    
    // Force re-render
    setTimeout(() => {
      testDate.value = newDate
      emit('update:modelValue', newDate)
    }, 0)
  }
}

const increaseDate = () => {
  if (canIncrease.value) {
    const newDate = new Date(testDate.value.getTime() + 24 * 60 * 60 * 1000)
    console.log('Increasing date to:', newDate)
    testDate.value = newDate
    emit('update:modelValue', newDate)
    
    // Force re-render
    setTimeout(() => {
      testDate.value = newDate
      emit('update:modelValue', newDate)
    }, 0)
  }
}

const resetDate = () => {
  // Get the current date from the browser
  const now = new Date()
  console.log('Resetting to:', now)
  
  // Update the date immediately
  testDate.value = now
  emit('update:modelValue', now)
  
  // Force a re-render
  setTimeout(() => {
    testDate.value = now
    emit('update:modelValue', now)
  }, 0)
}

watch(() => props.modelValue, (newDate) => {
  console.log('Model value changed to:', newDate)
  testDate.value = new Date(newDate.getTime())
})
</script>

<style scoped>
.test-date-simulator {
  position: fixed;
  top: 20px;
  right: 20px;
  background: white;
  padding: 15px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  z-index: 1000;
}

.date-controls {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
}

button {
  padding: 8px 12px;
  border: none;
  border-radius: 4px;
  background: var(--primary-color);
  color: white;
  cursor: pointer;
  font-size: 16px;
}

button:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.current-date {
  font-size: 14px;
  color: var(--gray-color);
}

.reset-controls {
  display: flex;
  gap: 10px;
}
</style>
