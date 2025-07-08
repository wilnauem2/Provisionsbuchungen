const { kv } = require('@netlify/kv')

const DATA_KEY = 'insurers_data'

exports.handler = async (event, context) => {
  try {
    console.log('Received request:', event.httpMethod)
    
    if (event.httpMethod === 'GET') {
      console.log('Reading data...')
      try {
        const data = await kv.get(DATA_KEY)
        console.log('Data read successfully:', data)
        return {
          statusCode: 200,
          body: data || '[]',
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        }
      } catch (readError) {
        console.error('Error reading data:', readError)
        throw readError
      }
    } else if (event.httpMethod === 'PUT') {
      console.log('Updating data...')
      try {
        const newData = event.body
        console.log('New data:', newData)
        await kv.put(DATA_KEY, newData)
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
        console.error('Error writing data:', writeError)
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
