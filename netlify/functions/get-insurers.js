const fs = require('fs').promises
const path = require('path')

exports.handler = async (event, context) => {
  try {
    console.log('Starting get-insurers function')
    console.log('Current working directory:', process.cwd())
    
    // Get the path to the insurers.json file
    const filePath = path.join(process.cwd(), 'src', 'data', 'insurers.json')
    console.log('Attempting to read file at:', filePath)
    
    // Check if file exists
    try {
      await fs.access(filePath)
      console.log('File exists, attempting to read')
    } catch (err) {
      console.error('File does not exist:', err)
      throw new Error(`File not found at ${filePath}`)
    }
    
    // Read and parse the file
    const data = await fs.readFile(filePath, 'utf-8')
    console.log('File read successfully, size:', data.length, 'bytes')
    
    try {
      const insurers = JSON.parse(data)
      console.log('Data parsed successfully')
      
      // Validate the data
      if (!Array.isArray(insurers)) {
        console.error('Invalid data format:', data)
        throw new Error('Invalid data format - expected array')
      }
      
      // Add default values if missing
      const normalizedInsurers = insurers.map(insurer => ({
        ...insurer,
        turnus: insurer.turnus || '',
        dokumentenart: insurer.dokumentenart || '',
        bezugsweg: insurer.bezugsweg || '',
        last_invoice: insurer.last_invoice || '',
        instructions: insurer.instructions || 'Noch keine Anweisungen hinterlegt',
        settlementCompleted: insurer.settlementCompleted || false
      }))
      
      console.log('Returning response with', normalizedInsurers.length, 'insurers')
      return {
        statusCode: 200,
        body: JSON.stringify(normalizedInsurers),
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET,PUT',
          'Access-Control-Allow-Headers': 'Content-Type'
        },
      }
    } catch (parseError) {
      console.error('Error parsing JSON:', parseError)
      throw new Error('Invalid JSON format')
    }
  } catch (error) {
    console.error('Error in get-insurers function:', error)
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
        'Access-Control-Allow-Methods': 'GET,PUT',
        'Access-Control-Allow-Headers': 'Content-Type'
      },
    }
  }
}
