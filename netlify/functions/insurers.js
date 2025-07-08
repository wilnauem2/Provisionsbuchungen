const fs = require('fs').promises
const path = require('path')
const { NetlifyStorage } = require('@netlify/storage')

// Initialize Netlify Storage
const storage = new NetlifyStorage()
const DATA_KEY = 'insurers_data'

exports.handler = async (event, context) => {
  try {
    console.log('Received request:', event.httpMethod)
    
    if (event.httpMethod === 'GET') {
      console.log('Reading data from storage...')
      const data = await storage.getItem(DATA_KEY)
      return {
        statusCode: 200,
        body: data || '[]',
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    } else if (event.httpMethod === 'PUT') {
      console.log('Updating data in storage...')
      const newData = JSON.stringify(JSON.parse(event.body), null, 2)
      await storage.setItem(DATA_KEY, newData)
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
