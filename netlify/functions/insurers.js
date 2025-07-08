const fs = require('fs').promises
const path = require('path')

const DATA_FILE = path.join(__dirname, '../../src/data/insurers.json')

exports.handler = async (event, context) => {
  try {
    console.log('Received request:', event.httpMethod)
    console.log('Data file path:', DATA_FILE)
    
    if (event.httpMethod === 'GET') {
      console.log('Reading data file...')
      const data = await fs.readFile(DATA_FILE, 'utf-8')
      return {
        statusCode: 200,
        body: data,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    } else if (event.httpMethod === 'PUT') {
      console.log('Updating data file...')
      const newData = JSON.stringify(JSON.parse(event.body), null, 2)
      await fs.writeFile(DATA_FILE, newData, 'utf-8')
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
