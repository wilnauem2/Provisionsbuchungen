// Utility functions for reading/writing invoices from Firestore
import { db } from './firebase';
import { collection, doc, getDoc, setDoc } from 'firebase/firestore';

const COLLECTION_NAME = 'invoices';
const DOC_NAME = 'last_invoices'; // You can change this if you want multiple sets

// Fetch invoices JSON from Firestoreexport async function fetchInvoices() {
  const docRef = doc(collection(db, COLLECTION_NAME), DOC_NAME);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return docSnap.data();
  } else {
    return null; // No data found
  }
}

// Save invoices JSON to Firestore
export async function saveInvoices(data) {
  const docRef = doc(collection(db, COLLECTION_NAME), DOC_NAME);
  await setDoc(docRef, data);
}
