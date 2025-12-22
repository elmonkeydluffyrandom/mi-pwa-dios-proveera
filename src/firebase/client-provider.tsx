'use client';
import { ReactNode, useEffect, useState } from 'react';
import { initializeApp, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore, enableIndexedDbPersistence, CACHE_SIZE_UNLIMITED } from 'firebase/firestore';
import { FirebaseProvider } from './provider';
import { firebaseConfig } from './config';

// We initialize Firebase here to make it available throughout the client side of the app.
// We use a simple memoization pattern to ensure that Firebase is initialized only once.
let firebaseApp: FirebaseApp | undefined;
let auth: Auth | undefined;
let firestore: Firestore | undefined;
let persistenceEnabled = false;

export function FirebaseClientProvider({ children }: { children: ReactNode }) {
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    // This effect will run only once on the client, after the initial render.
    if (!firebaseApp) {
      firebaseApp = initializeApp(firebaseConfig);
      auth = getAuth(firebaseApp);
      firestore = getFirestore(firebaseApp);

      if (firestore && !persistenceEnabled) {
        enableIndexedDbPersistence(firestore, {
          cacheSizeBytes: CACHE_SIZE_UNLIMITED
        })
        .then(() => {
          console.log("Firebase Offline persistence enabled");
          persistenceEnabled = true;
        })
        .catch((err) => {
          if (err.code === 'failed-precondition') {
            console.warn('Firebase persistence failed: Multiple tabs open or unsupported browser. Offline capabilities might be limited.');
          } else if (err.code === 'unimplemented') {
            console.warn('Firebase persistence failed: The current browser does not support all of the features required to enable persistence.');
          } else {
            console.error("Firebase persistence error:", err);
          }
        })
        .finally(() => {
          setInitialized(true);
        });
      } else {
        setInitialized(true);
      }
    } else {
      setInitialized(true);
    }
  }, []);

  if (!initialized) {
    // You can return a loading spinner or some placeholder here
    return null;
  }

  return (
    <FirebaseProvider app={firebaseApp} auth={auth} firestore={firestore}>
      {children}
    </FirebaseProvider>
  );
}