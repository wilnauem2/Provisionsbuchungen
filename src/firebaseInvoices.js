// Utility functions for reading/writing invoices and insurers from Firestore
import { db } from './firebase';
import { collection, doc, getDoc, setDoc, onSnapshot, getDocs, updateDoc } from 'firebase/firestore';

function getFirestoreNames(environment = 'production') {
  const IS_TEST = environment === 'test';
  return {
    COLLECTION_NAME: IS_TEST ? 'invoices_test' : 'invoices',
    DOC_NAME: IS_TEST ? 'last_invoices_test' : 'last_invoices',
    INSURERS_COLLECTION: IS_TEST ? 'insurers_test' : 'insurers',
  };
}

// Fetch invoices JSON from Firestore
export async function fetchInvoices(environment = 'production') {
  const { COLLECTION_NAME, DOC_NAME } = getFirestoreNames(environment);
  const docRef = doc(collection(db, COLLECTION_NAME), DOC_NAME);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return docSnap.data();
  } else {
    return null; // No data found
  }
}

// Save invoices JSON to Firestore
export async function saveInvoices(data, environment = 'production') {
  const { COLLECTION_NAME, DOC_NAME } = getFirestoreNames(environment);
  const docRef = doc(collection(db, COLLECTION_NAME), DOC_NAME);
  console.log('[Firestore] Saving to', COLLECTION_NAME, DOC_NAME, data);
  await setDoc(docRef, data);
  console.log('[Firestore] Save complete');
}

// Subscribe to real-time updates for invoices
export function subscribeInvoices(callback, environment = 'production') {
  const { COLLECTION_NAME, DOC_NAME } = getFirestoreNames(environment);
  const docRef = doc(collection(db, COLLECTION_NAME), DOC_NAME);
  return onSnapshot(docRef, (docSnap) => {
    if (docSnap.exists()) {
      callback(docSnap.data());
    } else {
      callback({});
    }
  });
}

// Fetch all insurers from Firestore
export async function fetchInsurers(environment = 'production') {
  const { INSURERS_COLLECTION } = getFirestoreNames(environment);
  const insurersCol = collection(db, INSURERS_COLLECTION);
  const snapshot = await getDocs(insurersCol);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

// Save or update an insurer in Firestore (optional, for admin use)
export async function saveInsurer(insurer, environment = 'production') {
  if (!insurer || !insurer.name) throw new Error('Insurer must have a name');
  const { INSURERS_COLLECTION } = getFirestoreNames(environment);
  const insurerDoc = doc(collection(db, INSURERS_COLLECTION), insurer.name);
  await setDoc(insurerDoc, insurer);
}
