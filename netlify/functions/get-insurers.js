const fs = require('fs').promises
const path = require('path')

exports.handler = async (event, context) => {
  try {
    // Get the path to the insurers.json file
    const filePath = path.join(process.cwd(), 'src', 'data', 'insurers.json')
    
    // Read and parse the file
    const data = await fs.readFile(filePath, 'utf-8')
    const insurers = JSON.parse(data)
    
    return {
      statusCode: 200,
      body: JSON.stringify(insurers),
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET,PUT',
        'Access-Control-Allow-Headers': 'Content-Type'
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
        'Access-Control-Allow-Methods': 'GET,PUT',
        'Access-Control-Allow-Headers': 'Content-Type'
      },
    }
  }
}
