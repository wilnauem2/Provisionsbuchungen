const fs = require('fs').promises
const path = require('path')

exports.handler = async (event, context) => {
  try {
    // Get the path to the insurers.json file
    // First try the deployed location
    const filePath = path.join(process.cwd(), 'src', 'data', 'insurers.json')
    
    // Read and parse the file
    const data = await fs.readFile(filePath, 'utf-8')
    const insurers = JSON.parse(data)
    
    // Validate the data
    if (!Array.isArray(insurers)) {
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
