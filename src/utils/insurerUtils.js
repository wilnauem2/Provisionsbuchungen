export const calculateDaysOverdue = (insurer) => {
  if (!insurer?.last_invoice || !insurer?.turnus) return 0
  
  try {
    const dateStr = insurer.last_invoice.split(',')[0]
    const invoiceDate = new Date(dateStr.replace(/(\d{2})\.(\d{2})\. (\d{4})/, '$3-$2-$1'))
    const now = new Date()
    const turnusMatch = insurer.turnus.match(/(\d+)-tägig/)
    
    if (!turnusMatch) return 0
    const turnusDays = parseInt(turnusMatch[1])
    const dueDate = new Date(invoiceDate)
    dueDate.setDate(dueDate.getDate() + turnusDays)
    
    // Calculate days overdue
    const daysOverdue = Math.floor((now - dueDate) / (1000 * 60 * 60 * 24))
    
    // Only consider it overdue if current date is after due date
    if (now <= dueDate) {
      return 0
    }
    
    return Math.max(1, daysOverdue)
  } catch (error) {
    console.error('Error calculating days overdue:', error)
    return 0
  }
}

export const isOverdue = (insurer) => {
  const daysOverdue = calculateDaysOverdue(insurer)
  return daysOverdue > 0
}

export const isWithinTurnus = (insurer) => {
  if (!insurer?.last_invoice || !insurer?.turnus) return false
  
  try {
    const dateStr = insurer.last_invoice.split(',')[0]
    const invoiceDate = new Date(dateStr.replace(/(\d{2})\.(\d{2})\. (\d{4})/, '$3-$2-$1'))
    const now = new Date()
    const turnusMatch = insurer.turnus.match(/(\d+)-tägig/)
    
    if (!turnusMatch) return false
    const turnusDays = parseInt(turnusMatch[1])
    const dueDate = new Date(invoiceDate)
    dueDate.setDate(dueDate.getDate() + turnusDays)
    
    return now <= dueDate
  } catch (error) {
    console.error('Error checking turnus:', error)
    return false
  }
}

export const getStatusColor = (insurer) => {
  if (insurer.settlementCompleted) return 'green'
  
  if (isWithinTurnus(insurer)) return 'green'
  
  const daysOverdue = calculateDaysOverdue(insurer)
  if (daysOverdue > 0 && daysOverdue <= 3) return 'yellow'
  if (daysOverdue > 3) return 'red'
  
  return 'gray'
}

export const formatLastInvoiceDate = (dateStr) => {
  if (!dateStr) return ''
  const date = dateStr.split(',')[0]
  return date
}

export const getStatusText = (insurer) => {
  if (!insurer?.last_invoice) return 'Keine Abrechnung'
  
  if (!insurer?.turnus) {
    return 'Aktuell'
  }
  
  if (isWithinTurnus(insurer)) return 'Abrechnung OK'
  
  const daysOverdue = calculateDaysOverdue(insurer)
  
  // For 1-3 days overdue
  if (daysOverdue > 0 && daysOverdue <= 3) {
    return `Überfällig (${daysOverdue} Tage)`
  }
  
  // For more than 3 days overdue
  if (daysOverdue > 3) {
    return `Überfällig (${daysOverdue} Tage)`
  }
  
  return 'Aktuell'
}
