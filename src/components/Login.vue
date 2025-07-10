<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50">
    <div class="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow-md">
      <div class="text-center">
        <h2 class="mt-6 text-3xl font-extrabold text-gray-900">
          Anmelden
        </h2>
      </div>
      <form class="mt-8 space-y-6" @submit.prevent="handleLogin">
        <div class="rounded-md shadow-sm -space-y-px">
          <div>
            <label for="username" class="sr-only">Benutzername</label>
            <input
              id="username"
              name="username"
              type="text"
              required
              v-model="username"
              class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
              placeholder="Benutzername"
            />
          </div>
          <div>
            <label for="password" class="sr-only">Passwort</label>
            <input
              id="password"
              name="password"
              type="password"
              required
              v-model="password"
              class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
              placeholder="Passwort"
            />
          </div>
        </div>

        <div>
          <button
            type="submit"
            :disabled="isLoading"
            class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <span v-if="!isLoading">Anmelden</span>
            <span v-else class="animate-spin -ml-1 mr-3 h-5 w-5 text-white">Loading...</span>
          </button>
        </div>

        <div v-if="error" class="text-red-500 text-sm text-center">
          {{ error }}
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const username = ref('')
const password = ref('')
const error = ref('')
const isLoading = ref(false)

const handleLogin = async () => {
  if (isLoading.value) return

  isLoading.value = true
  error.value = ''

  try {
    // Simulate API call with dummy credentials
    const validCredentials = {
      username: 'admin',
      password: 'password123'
    }

    if (username.value === validCredentials.username && password.value === validCredentials.password) {
      // Store dummy token
      localStorage.setItem('authToken', 'dummy-token')
      localStorage.setItem('username', username.value)
      
      // Redirect to main app
      router.push('/')
    } else {
      error.value = 'Ungültige Anmeldeinformationen'
    }
  } catch (err) {
    error.value = 'Fehler beim Anmelden'
    console.error('Login error:', err)
  } finally {
    isLoading.value = false
  }
}
</script>
