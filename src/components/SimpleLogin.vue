<template>
  <div style="min-height: 100vh; display: flex; align-items: center; justify-content: center; background-color: #f0f0f0;">
    <div style="background: white; padding: 2rem; border-radius: 8px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); width: 100%; max-width: 400px;">
      <h2 style="text-align: center; margin-bottom: 1.5rem; color: #333;">Login</h2>
      
      <form @submit.prevent="handleSubmit" style="display: flex; flex-direction: column; gap: 1rem;">
        <div>
          <label style="display: block; margin-bottom: 0.5rem; font-weight: bold; color: #555;">Username</label>
          <input 
            v-model="username" 
            type="text" 
            required 
            style="width: 100%; padding: 0.75rem; border: 1px solid #ddd; border-radius: 4px; font-size: 1rem;"
            placeholder="Enter username"
          />
        </div>
        
        <div>
          <label style="display: block; margin-bottom: 0.5rem; font-weight: bold; color: #555;">Password</label>
          <input 
            v-model="password" 
            type="password" 
            required 
            style="width: 100%; padding: 0.75rem; border: 1px solid #ddd; border-radius: 4px; font-size: 1rem;"
            placeholder="Enter password"
          />
        </div>
        
        <button 
          type="submit" 
          style="width: 100%; padding: 0.75rem; background-color: #007bff; color: white; border: none; border-radius: 4px; font-size: 1rem; cursor: pointer; margin-top: 1rem;"
          :style="{ opacity: isLoading ? '0.6' : '1', cursor: isLoading ? 'not-allowed' : 'pointer' }"
          :disabled="isLoading"
        >
          {{ isLoading ? 'Logging in...' : 'Login' }}
        </button>
        
        <div v-if="errorMessage" style="color: #dc3545; text-align: center; margin-top: 1rem; padding: 0.5rem; background-color: #f8d7da; border-radius: 4px;">
          {{ errorMessage }}
        </div>
      </form>
      
      <div style="margin-top: 1.5rem; padding: 1rem; background-color: #e9ecef; border-radius: 4px; font-size: 0.875rem; color: #666;">
        <strong>Demo credentials:</strong><br>
        Username: admin<br>
        Password: admin
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const username = ref('')
const password = ref('')
const errorMessage = ref('')
const isLoading = ref(false)

const handleSubmit = async () => {
  errorMessage.value = ''
  isLoading.value = true
  
  try {
    // Simple authentication check
    if (username.value === 'admin' && password.value === 'admin') {
      // Store auth token
      localStorage.setItem('authToken', 'dummy-token-' + Date.now())
      
      // Redirect to main app
      router.push('/')
    } else {
      errorMessage.value = 'Invalid username or password'
    }
  } catch (error) {
    errorMessage.value = 'Login failed. Please try again.'
    console.error('Login error:', error)
  } finally {
    isLoading.value = false
  }
}
</script>
