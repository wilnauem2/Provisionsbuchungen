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
    
    // Write to data.json in the functions directory
    await fs.writeFile(
      path.join(__dirname, 'data.json'),
      JSON.stringify(data, null, 2)
    )

    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Data saved successfully' })
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
