import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';
import { getAuth, provideAuth } from '@angular/fire/auth';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideFirebaseApp(() => initializeApp({ 
      projectId: "pomagerroth-ee9e2", 
      appId: "1:465619273628:web:d9f908e5572ce87057aa59", 
      storageBucket: "pomagerroth-ee9e2.firebasestorage.app", 
      apiKey: "AIzaSyBV0g9dbhlhL_b_E3-EWYpnD_mh3YzMraA", 
      authDomain: "pomagerroth-ee9e2.firebaseapp.com", 
      messagingSenderId: "465619273628", 
     })), provideAuth(() => getAuth()), provideFirestore(() => getFirestore()),
  ],
};
