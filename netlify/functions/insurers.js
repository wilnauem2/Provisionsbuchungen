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
        // If file doesn't exist, return empty array
        if (readError.code === 'ENOENT') {
          return {
            statusCode: 200,
            body: '[]',
            headers: {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*',
            },
          }
        }
        throw readError
      }
    } else if (event.httpMethod === 'PUT') {
      console.log('Updating data...')
      try {
        const newData = JSON.stringify(JSON.parse(event.body), null, 2)
        console.log('New data:', newData)
        await fs.writeFile(DATA_FILE, newData, 'utf-8')
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
