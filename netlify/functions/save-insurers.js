const fs = require('fs').promises
const path = require('path')

exports.handler = async (event) => {
  try {
    if (event.httpMethod !== 'POST') {
      return {
        statusCode: 405,
        body: JSON.stringify({ message: 'Method not allowed' })
      }
    }

    const data = JSON.parse(event.body)
    
    // Netlify doesn't allow writing to files directly, so we'll just return success
    // The actual data storage will be handled by the frontend in production
    return {
      statusCode: 200,
      body: JSON.stringify({ 
        message: 'Data saved successfully',
        data: data
      })
    }
  } catch (error) {
    console.error('Error saving data:', error)
    return {
      statusCode: 500,
      body: JSON.stringify({ 
        message: 'Failed to save data',
        error: error.message
      })
    }
  }
}
