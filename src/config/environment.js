import { ref } from 'vue'

export const currentEnvironment = ref('production')

export const getInsurersData = async () => {
  try {
    const data = currentEnvironment.value === 'test' 
      ? await import('../data/environments/insurers.test.json')
      : await import('../data/insurers.json')
    return data.default || []
  } catch (error) {
    console.error('Error loading insurers data:', error)
    return []
  }
}
