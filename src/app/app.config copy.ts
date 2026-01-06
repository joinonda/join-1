import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideFirebaseApp(() =>
      initializeApp({
        apiKey: 'AIzaSyAzrPyjcz94elGLsYBYfo6VTnShqtT2_ec',
        authDomain: 'join-ce77f.firebaseapp.com',
        projectId: 'join-ce77f',
        storageBucket: 'join-ce77f.firebasestorage.app',
        messagingSenderId: '879322572144',
        appId: '1:879322572144:web:0a027cd2bbd4751c77dbb5',
      })
    ),
    provideFirestore(() => getFirestore()),
  ],
};
