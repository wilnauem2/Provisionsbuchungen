import { ref } from 'vue'

export const currentEnvironment = ref('production')

import { fetchInvoices } from '../firebaseInvoices';

export const getInsurersData = async () => {
  try {
    // Only load insurers from static JSON, but get last_invoices from Firestore
    const insurers = currentEnvironment.value === 'test' 
      ? await import('../data/environments/insurers.test.json')
      : await import('../data/insurers.json');
    const insurersData = insurers.default || [];
    let lastInvoicesData = {};
    try {
      lastInvoicesData = await fetchInvoices() || {};
    } catch (e) {
      console.error('Error loading last_invoices from Firestore:', e);
      lastInvoicesData = {};
    }
    // Merge last_invoice data into insurers
    return insurersData.map(insurer => ({
      ...insurer,
      last_invoice: lastInvoicesData[insurer.name] || ''
    }));
  } catch (error) {
    console.error('Error loading insurers data:', error);
    return [];
  }
};

// This function is deprecated. Use saveInvoices from firebaseInvoices.js instead.
export const updateLastInvoice = async (insurerName, newDate) => {
  console.error('updateLastInvoice: This function is deprecated. Use saveInvoices from firebaseInvoices.js instead.');
  return false;
};
