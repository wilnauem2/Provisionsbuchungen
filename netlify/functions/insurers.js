const { NetlifyForm } = require('@netlify/form-handling')

exports.handler = async (event, context) => {
  try {
    console.log('Received request:', event.httpMethod)
    
    if (event.httpMethod === 'GET') {
      console.log('Reading data...')
      try {
        // Get the latest form submission
        const form = new NetlifyForm()
        const submissions = await form.listSubmissions()
        
        // Get the latest data from the submissions
        const latestSubmission = submissions[0]
        if (!latestSubmission) {
          return {
            statusCode: 200,
            body: '[]',
            headers: {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*',
            },
          }
        }
        
        const data = latestSubmission.data
        console.log('Data read successfully:', data)
        return {
          statusCode: 200,
          body: JSON.stringify(data),
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
        
        // Create a new form submission
        const form = new NetlifyForm()
        await form.submit({
          data: JSON.parse(newData)
        })
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
