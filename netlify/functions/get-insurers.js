const fs = require('fs').promises
const path = require('path')

exports.handler = async (event, context) => {
  try {
    // Get the path to the insurers.json file
    const filePath = path.join(__dirname, '..', '..', 'src', 'data', 'insurers.json')
    
    // Read the file
    const data = await fs.readFile(filePath, 'utf-8')
    
    return {
      statusCode: 200,
      body: data,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    }
  } catch (error) {
    console.error('Error reading insurers.json:', error)
    return {
      statusCode: 500,
      body: JSON.stringify({ 
        error: 'Internal server error',
        details: error.message
      }),
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    }
  }
}
