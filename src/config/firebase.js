import { initializeApp } from 'firebase/app';
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ─────────────────────────────────────────────────────────────────────────────
// 🔥 Firebase project config
// ─────────────────────────────────────────────────────────────────────────────
const firebaseConfig = {
  apiKey: "AIzaSyCszed2fFL7PFidtmmD-YqgTAxRplX2m-Q",
  authDomain: "chatappsiddhi.firebaseapp.com",
  projectId: "chatappsiddhi",
  storageBucket: "chatappsiddhi.firebasestorage.app",
  messagingSenderId: "772015671352",
  appId: "1:772015671352:web:866bac7c9c49ebcbcf7ecd",
  measurementId: "G-GRDN9G8LPJ"
};

const app = initializeApp(firebaseConfig);

// Note: firebase/analytics is explicitly excluded because it crashes React Native apps.

export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});

export const db = getFirestore(app);
