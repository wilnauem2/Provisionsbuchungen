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
    // Get the correct file paths based on environment
    const lastInvoicesFile = currentEnvironment.value === 'test'
      ? '../data/environments/last_invoices.test.json'
      : '../data/last_invoices.json'

    // Load existing last_invoices
    const lastInvoices = currentEnvironment.value === 'test'
      ? await import('../data/environments/last_invoices.test.json')
      : await import('../data/last_invoices.json')
    const lastInvoicesData = lastInvoices.default || {}

    // Update the specific insurer's last_invoice
    lastInvoicesData[insurerName] = newDate

    // Save the updated data
    await fetch(lastInvoicesFile, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(lastInvoicesData)
    })

    return true
  } catch (error) {
    console.error('Error updating last invoice:', error)
    return false
  }
}
