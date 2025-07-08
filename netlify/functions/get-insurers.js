const fs = require('fs').promises
const path = require('path')

exports.handler = async (event, context) => {
  try {
    // Get the path to the insurers.json file
    // Try different paths to handle both local and deployed environments
    const possiblePaths = [
      path.join(process.cwd(), 'src', 'data', 'insurers.json'),
      path.join(process.cwd(), 'data', 'insurers.json'),
      path.join(process.cwd(), 'insurers.json')
    ]

    for (const filePath of possiblePaths) {
      try {
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
      } catch (err) {
        console.log(`Failed to read ${filePath}:`, err.message)
      }
    }

    // If we get here, none of the paths worked
    throw new Error('Could not find insurers.json file at any of the expected locations')
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
