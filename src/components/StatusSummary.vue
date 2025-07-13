<template>
  <div class="status-summary flex flex-col gap-4 md:flex-row md:gap-4">
    <div class="status-item yellow flex-1 min-w-[200px]">
      <span class="status-dot"></span>
      <span class="count">{{ statusCounts.yellow }}</span>
      <span class="label">1-5 Tage überfällig</span>
    </div>
    <div class="status-item red flex-1 min-w-[200px]">
      <span class="status-dot"></span>
      <span class="count">{{ statusCounts.red }}</span>
      <span class="label">&gt; 5 Tage überfällig</span>
    </div>
    <div class="status-item green flex-1 min-w-[200px]">
      <span class="status-dot"></span>
      <span class="count">{{ statusCounts.green }}</span>
      <span class="label">Keine fälligen Abrechnungen</span>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  statusCounts: {
    type: Object,
    required: true
  }
})
</script>
