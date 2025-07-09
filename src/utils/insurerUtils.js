export const calculateDaysOverdue = (insurer, currentDate = null) => {
  if (!insurer?.last_invoice || !insurer?.turnus) return 0
  
  try {
    // Parse German date format (DD.MM.YYYY)
    const dateStr = insurer.last_invoice.split(',')[0]
    const [day, month, year] = dateStr.split('.').map(Number)
    const invoiceDate = new Date(year, month - 1, day)
    
    const now = currentDate || new Date()
    const turnusMatch = insurer.turnus.match(/(\d+)-tägig/)
    
    if (!turnusMatch) return 0
    const turnusDays = parseInt(turnusMatch[1])
    const dueDate = new Date(invoiceDate)
    dueDate.setDate(dueDate.getDate() + turnusDays)
    
    // If we're still within the turnus period
    if (now <= dueDate) {
      return 0
    }
    
    // Calculate days overdue
    const daysOverdue = Math.floor((now - dueDate) / (1000 * 60 * 60 * 24))
    return Math.max(1, daysOverdue)
  } catch (error) {
    console.error('Error calculating days overdue:', error)
    return 0
  }
}

export const isOverdue = (insurer, currentDate = null) => {
  if (!insurer?.last_invoice || !insurer?.turnus) return false
  
  try {
    const dateStr = insurer.last_invoice.split(',')[0]
    const [day, month, year] = dateStr.split('.').map(Number)
    const invoiceDate = new Date(year, month - 1, day)
    const now = currentDate || new Date()
    const turnusMatch = insurer.turnus.match(/(\d+)-tägig/)
    
    if (!turnusMatch) return false
    const turnusDays = parseInt(turnusMatch[1])
    const dueDate = new Date(invoiceDate)
    dueDate.setDate(dueDate.getDate() + turnusDays)
    
    return now > dueDate
  } catch (error) {
    console.error('Error checking overdue status:', error)
    return false
  }
}

export const isWithinTurnus = (insurer, currentDate = null) => {
  if (!insurer?.last_invoice || !insurer?.turnus) return false
  
  try {
    // Parse German date format (DD.MM.YYYY)
    const dateStr = insurer.last_invoice.split(',')[0]
    const [day, month, year] = dateStr.split('.').map(Number)
    const invoiceDate = new Date(year, month - 1, day)
    const now = currentDate || new Date()
    const turnusMatch = insurer.turnus.match(/(\d+)-tägig/)
    
    if (!turnusMatch) return false
    const turnusDays = parseInt(turnusMatch[1])
    const dueDate = new Date(invoiceDate)
    dueDate.setDate(dueDate.getDate() + turnusDays)
    
    // If current date is on or before due date
    return now <= dueDate
  } catch (error) {
    console.error('Error checking turnus:', error)
    return false
  }
}

export const getStatusColor = (insurer, currentDate = null) => {
  if (!insurer?.turnus || !insurer?.last_invoice) return ''
  
  const daysOverdue = calculateDaysOverdue(insurer, currentDate)
  
  // If within turnus period or no overdue days
  if (daysOverdue === 0) return 'green'
  
  // For 1-5 days overdue
  if (daysOverdue > 0 && daysOverdue <= 5) return 'yellow'
  
  // For more than 5 days overdue
  if (daysOverdue > 5) return 'red'
  
  return ''
}

export const formatLastInvoiceDate = (dateStr) => {
  if (!dateStr) return ''
  const date = dateStr.split(',')[0]
  return date
}

export const getStatusText = (insurer, currentDate = null) => {
  if (!insurer?.turnus || !insurer?.last_invoice) return ''
  
  const daysOverdue = calculateDaysOverdue(insurer, currentDate)
  
  // Still within turnus period
  if (daysOverdue === 0) {
    return 'Abrechnung OK'
  }
  
  // For 1-5 days overdue
  if (daysOverdue > 0 && daysOverdue <= 5) {
    return `Überfällig (${daysOverdue} Tage)`
  }
  
  // For more than 5 days overdue
  if (daysOverdue > 5) {
    return `Überfällig (>5 Tage)`
  }
  
  return ''
}
