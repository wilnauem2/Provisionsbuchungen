const fs = require('fs').promises
const path = require('path')

exports.handler = async (event, context) => {
  try {
    if (event.httpMethod === 'PUT') {
      const data = JSON.parse(event.body)
      
      // Get the path to the insurers.json file
      const filePath = path.join(__dirname, '..', '..', '..', 'src', 'data', 'insurers.json')
      
      // Write the data to the file
      await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8')
      
      return {
        statusCode: 200,
        body: JSON.stringify({ success: true }),
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    } else {
      return {
        statusCode: 405,
        body: JSON.stringify({ error: 'Method not allowed' }),
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    }
  } catch (error) {
    console.error('Error updating insurers.json:', error)
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
