import { ref } from 'vue'

export const currentEnvironment = ref('production')

export const getInsurersData = async () => {
  try {
    const insurers = currentEnvironment.value === 'test' 
      ? await import('../data/environments/insurers.test.json')
      : await import('../data/insurers.json')
    const lastInvoices = currentEnvironment.value === 'test'
      ? await import('../data/environments/last_invoices.test.json')
      : await import('../data/last_invoices.json')

    const insurersData = insurers.default || []
    const lastInvoicesData = lastInvoices.default || {}

    // Merge last_invoice data into insurers
    return insurersData.map(insurer => ({
      ...insurer,
      last_invoice: lastInvoicesData[insurer.name] || ''
    }))
  } catch (error) {
    console.error('Error loading insurers data:', error)
    return []
  }
}

export const updateLastInvoice = async (insurerName, newDate) => {
  try {
    // Determine the correct file path based on environment
    const fileName = currentEnvironment.value === 'test' 
      ? '/data/environments/last_invoices.test.json'
      : '/data/last_invoices.json'
    
    // First, load the current data
    const response = await fetch(fileName)
    if (!response.ok) {
      console.error('Failed to load last invoices file:', response.statusText)
      return false
    }
    
    const lastInvoicesData = await response.json()
    
    // Update the specific insurer's last_invoice
    lastInvoicesData[insurerName] = newDate
    
    // Save the updated data back to the file
    const saveResponse = await fetch(fileName, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(lastInvoicesData, null, 2) // Pretty print JSON
    })
    
    if (!saveResponse.ok) {
      console.error('Failed to save last invoices file:', saveResponse.statusText)
      return false
    }
    
    console.log('Successfully updated last invoice for:', insurerName, 'to', newDate)
    return true
  } catch (error) {
    console.error('Error updating last invoice:', error)
    return false
  }
}
