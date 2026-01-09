export interface Environment {
  firebaseConfig: {
    projectId: string;
    appId: string;
    storageBucket: string;
    apiKey: string;
    authDomain: string;
    messagingSenderId: string;
  };
}

export const environment: Environment = {
  firebaseConfig: {
      projectId: "pomagerroth-ee9e2", 
      appId: "1:465619273628:web:d9f908e5572ce87057aa59", 
      storageBucket: "pomagerroth-ee9e2.firebasestorage.app", 
      apiKey: "AIzaSyBV0g9dbhlhL_b_E3-EWYpnD_mh3YzMraA", 
      authDomain: "pomagerroth-ee9e2.firebaseapp.com", 
      messagingSenderId: "465619273628", 
  },
};

