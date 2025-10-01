import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, collection, addDoc, getDocs, query, orderBy, limit } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);

export { db };

// Firestore Service
export const firestoreService = {
  // Form submission kaydet
  async saveSubmission(data: any) {
    try {
      const docRef = await addDoc(collection(db, 'submissions'), {
        ...data,
        submittedAt: new Date(),
      });
      return { success: true, id: docRef.id };
    } catch (error) {
      console.error('Error saving submission:', error);
      return { success: false, error: error };
    }
  },

  // Tüm submissions'ları getir
  async getAllSubmissions() {
    try {
      const submissionsRef = collection(db, 'submissions');
      const q = query(submissionsRef, orderBy('submittedAt', 'desc'));
      const querySnapshot = await getDocs(q);
      
      const submissions = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      return { success: true, data: submissions };
    } catch (error) {
      console.error('Error fetching submissions:', error);
      return { success: false, error: error, data: [] };
    }
  }
};