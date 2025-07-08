const fs = require('fs').promises
const path = require('path')

// Use a static JSON file that's included in the build
const DATA_FILE = path.join(__dirname, 'data.json')

exports.handler = async (event, context) => {
  try {
    console.log('Received request:', event.httpMethod)
    
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
        console.error('Error reading data:', readError)
        throw readError
      }
    } else if (event.httpMethod === 'PUT') {
      console.log('Updating data...')
      try {
        const { insurerName, lastInvoiceDate } = JSON.parse(event.body)
        console.log('Updating last_invoice for:', insurerName)
        
        // Read existing data
        const data = await fs.readFile(DATA_FILE, 'utf-8')
        const insurers = JSON.parse(data)
        
        // Find and update the insurer
        const insurer = insurers.find(i => i.name === insurerName)
        if (insurer) {
          insurer.last_invoice = lastInvoiceDate
          
          // Save updated data
          await fs.writeFile(DATA_FILE, JSON.stringify(insurers, null, 2), 'utf-8')
          console.log('Data written successfully')
          
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
            statusCode: 404,
            body: JSON.stringify({ error: 'Insurer not found' }),
            headers: {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*',
            },
          }
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
