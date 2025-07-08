import express from 'express'
import cors from 'cors'
import { readFile, writeFile } from 'fs/promises'
import { join } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = join(fileURLToPath(import.meta.url), '..')

const app = express()
app.use(cors())
app.use(express.json())

// Mock data storage
let mockData = null

// Load initial data
const loadMockData = async () => {
  try {
    // Try to load from mock-insurers.json first
    const mockPath = join(__dirname, 'src', 'data', 'mock-insurers.json')
    try {
      const data = await readFile(mockPath, 'utf-8')
      mockData = JSON.parse(data)
      console.log('Loaded data from mock-insurers.json')
    } catch (error) {
      console.log('No mock-insurers.json found, falling back to insurers.json')
      // If mock-insurers.json doesn't exist, fall back to insurers.json
      const insurersPath = join(__dirname, 'src', 'data', 'insurers.json')
      const data = await readFile(insurersPath, 'utf-8')
      mockData = JSON.parse(data)
      console.log('Loaded data from insurers.json')
    }
  } catch (error) {
    console.error('Error loading mock data:', error)
    mockData = []
  }
}

// Load initial data
loadMockData()

// Save data endpoint
app.post('/.netlify/functions/save-insurers', async (req, res) => {
  try {
    const newData = req.body
    
    // Validate data
    if (!Array.isArray(newData)) {
      throw new Error('Invalid data format - expected array')
    }

    mockData = newData
    
    // Save to mock-insurers.json
    const mockPath = join(__dirname, 'src', 'data', 'mock-insurers.json')
    await writeFile(mockPath, JSON.stringify(newData, null, 2))
    console.log('Saved data to mock-insurers.json')

    // Also update insurers.json with the new data
    const insurersPath = join(__dirname, 'src', 'data', 'insurers.json')
    await writeFile(insurersPath, JSON.stringify(newData, null, 2))
    console.log('Saved data to insurers.json')

    res.json({ message: 'Data saved successfully' })
  } catch (error) {
    console.error('Error saving data:', error)
    res.status(500).json({ 
      message: 'Failed to save data',
      error: error.message
    })
  }
})

// Get data endpoint
app.get('/.netlify/functions/get-insurers', async (req, res) => {
  try {
    if (!mockData) {
      await loadMockData()
    }
    console.log('Returning data:', mockData)
    res.json(mockData)
  } catch (error) {
    console.error('Error getting data:', error)
    res.status(500).json({ 
      message: 'Failed to get data',
      error: error.message
    })
  }
})

const PORT = 3001
app.listen(PORT, () => {
  console.log(`Mock server running on port ${PORT}`)
})
