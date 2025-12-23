import { getApp, getApps, initializeApp, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
// 1. AQUÍ AGREGUÉ LA IMPORTACIÓN NUEVA (enableIndexedDbPersistence)
import { getFirestore, type Firestore, enableIndexedDbPersistence } from 'firebase/firestore';

import { firebaseConfig } from './config';

export * from './client-provider';
export * from './provider';

let firebaseApp: FirebaseApp;
let auth: Auth;
let firestore: Firestore;

// Initialize Firebase
export function initializeFirebase() {
  if (getApps().length === 0) {
    firebaseApp = initializeApp(firebaseConfig);
    auth = getAuth(firebaseApp);
    firestore = getFirestore(firebaseApp);

    // 2. AQUÍ ESTÁ LA MAGIA: Activa el guardado offline si estamos en el navegador
    if (typeof window !== "undefined") {
      enableIndexedDbPersistence(firestore)
        .catch((err) => {
          if (err.code == 'failed-precondition') {
            console.log('Error: Tienes la app abierta en muchas pestañas.');
          } else if (err.code == 'unimplemented') {
            console.log('Error: Tu navegador no soporta modo offline.');
          }
        });
    }

  } else {
    firebaseApp = getApp();
    auth = getAuth(firebaseApp);
    firestore = getFirestore(firebaseApp);
  }
  return { firebaseApp, auth, firestore };
}