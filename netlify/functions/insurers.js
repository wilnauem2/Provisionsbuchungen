const fs = require('fs').promises
const path = require('path')

// Use a more reliable storage solution - we'll use a JSON file in the functions directory
const DATA_FILE = path.join(__dirname, 'data.json')

exports.handler = async (event, context) => {
  try {
    console.log('Received request:', event.httpMethod)
    console.log('Data file path:', DATA_FILE)
    console.log('Request body:', event.body)
    
    if (event.httpMethod === 'GET') {
      console.log('Reading data...')
      try {
        // Check if file exists
        const fileExists = await fs.access(DATA_FILE).then(() => true).catch(() => false)
        console.log('File exists:', fileExists)
        
        if (!fileExists) {
          // Create file with empty array if it doesn't exist
          await fs.writeFile(DATA_FILE, '[]', 'utf-8')
          console.log('Created new file with empty array')
        }
        
        const data = await fs.readFile(DATA_FILE, 'utf-8')
        console.log('Data read successfully:', data)
        return {
          statusCode: 200,
          body: data,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        }
      } catch (readError) {
        console.error('Error reading file:', readError)
        const errorDetails = {
          message: readError.message,
          code: readError.code,
          stack: readError.stack
        }
        console.error('Detailed error:', errorDetails)
        throw readError
      }
    } else if (event.httpMethod === 'PUT') {
      console.log('Updating data...')
      try {
        // First read existing data
        const existingData = await fs.readFile(DATA_FILE, 'utf-8')
        console.log('Existing data:', existingData)
        
        // Parse and validate new data
        const newData = JSON.parse(event.body)
        console.log('Parsed new data:', newData)
        
        // Write new data
        await fs.writeFile(DATA_FILE, JSON.stringify(newData, null, 2), 'utf-8')
        console.log('Data written successfully')
        
        return {
          statusCode: 200,
          body: JSON.stringify({ success: true }),
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        }
      } catch (writeError) {
        console.error('Error writing file:', writeError)
        const errorDetails = {
          message: writeError.message,
          code: writeError.code,
          stack: writeError.stack
        }
        console.error('Detailed error:', errorDetails)
        throw writeError
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
    console.error('Error in handler:', error)
    const errorDetails = {
      message: error.message,
      code: error.code,
      stack: error.stack
    }
    console.error('Detailed error:', errorDetails)
    return {
      statusCode: 500,
      body: JSON.stringify({ 
        error: 'Internal server error',
        details: error.message,
        stack: error.stack
      }),
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    }
  }
}
  } catch (error) {
    console.error('Error:', error)
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal server error' }),
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    }
  }
}
