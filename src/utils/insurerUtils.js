const parseInvoiceDate = (invoice) => {
  if (!invoice) return null;
  
  // Handle the new format where last_invoice is an object with display and timestamp
  if (typeof invoice === 'object' && invoice !== null) {
    // If we have a timestamp, use it directly
    if (invoice.timestamp) {
      return new Date(invoice.timestamp);
    }
    // Otherwise try to parse the display string
    if (invoice.display) {
      return parseDateString(invoice.display);
    }
    return null;
  }
  
  // Handle the old string format (backward compatibility)
  if (typeof invoice === 'string') {
    return parseDateString(invoice);
  }
  
  return null;
};

const parseDateString = (dateStr) => {
  try {
    // Handle format: "DD.MM.YYYY, HH:MM" or just "DD.MM.YYYY"
    const [datePart, timePart] = dateStr.split(',').map(s => s.trim());
    const [day, month, year] = datePart.split('.').map(Number);
    
    // If we have time, parse it, otherwise use start of day
    if (timePart) {
      const [hours, minutes] = timePart.split(':').map(Number);
      return new Date(year, month - 1, day, hours, minutes);
    }
    
    return new Date(year, month - 1, day);
  } catch (error) {
    console.error('Error parsing date string:', dateStr, error);
    return null;
  }
};

export const calculateDaysOverdue = (insurer, currentDate = null) => {
  if (!insurer?.last_invoice || !insurer?.turnus) return 0;
  
  try {
    const invoiceDate = parseInvoiceDate(insurer.last_invoice);
    if (!invoiceDate) return 0;
    
    const now = currentDate || new Date();
    const turnusMatch = insurer.turnus.match(/(\d+)-tägig/);
    
    if (!turnusMatch) return 0;
    
    const turnusDays = parseInt(turnusMatch[1]);
    const dueDate = new Date(invoiceDate);
    dueDate.setDate(dueDate.getDate() + turnusDays);
    
    // If we're still within the turnus period
    if (now <= dueDate) {
      return 0;
    }
    
    // Calculate days overdue
    const daysOverdue = Math.floor((now - dueDate) / (1000 * 60 * 60 * 24));
    return Math.max(1, daysOverdue);
  } catch (error) {
    console.error('Error calculating days overdue:', error);
    return 0;
  }
};

export const isOverdue = (insurer, currentDate = null) => {
  if (!insurer?.last_invoice || !insurer?.turnus) return false;
  
  try {
    const invoiceDate = parseInvoiceDate(insurer.last_invoice);
    if (!invoiceDate) return false;
    
    const now = currentDate || new Date();
    const turnusMatch = insurer.turnus.match(/(\d+)-tägig/);
    
    if (!turnusMatch) return false;
    
    const turnusDays = parseInt(turnusMatch[1]);
    const dueDate = new Date(invoiceDate);
    dueDate.setDate(dueDate.getDate() + turnusDays);
    
    return now > dueDate;
  } catch (error) {
    console.error('Error checking overdue status:', error);
    return false;
  }
};

export const isWithinTurnus = (insurer, currentDate = null) => {
  if (!insurer?.last_invoice || !insurer?.turnus) return false
  
  try {
    const invoiceDate = parseInvoiceDate(insurer.last_invoice);
    if (!invoiceDate) return false;
    
    const now = currentDate || new Date();
    const turnusMatch = insurer.turnus.match(/(\d+)-tägig/);
    
    if (!turnusMatch) return false;
    
    const turnusDays = parseInt(turnusMatch[1]);
    const dueDate = new Date(invoiceDate);
    dueDate.setDate(dueDate.getDate() + turnusDays);
    
    // Add a 2-day buffer for processing time
    const bufferDays = 2;
    const bufferDate = new Date(dueDate);
    bufferDate.setDate(bufferDate.getDate() + bufferDays);
    
    return now <= bufferDate;
  } catch (error) {
    console.error('Error checking turnus status:', error);
    return false;
  }
};

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
};

export const formatLastInvoiceDate = (dateValue) => {
  if (!dateValue) return 'Keine Abrechnung';
  
  // Handle the new object format
  if (typeof dateValue === 'object' && dateValue !== null) {
    if (dateValue.display) {
      return dateValue.display.split(',')[0]; // Just return the date part
    }
    return 'Ungültiges Datum';
  }
  
  // Handle the old string format (backward compatibility)
  if (typeof dateValue === 'string') {
    return dateValue.split(',')[0];
  }
  
  return 'Ungültiges Datum';
};

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
