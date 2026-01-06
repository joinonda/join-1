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
        apiKey: 'AIzaSyAzrPyjcz94elGLsYBYfo6VTnShqtT2_ec',
        authDomain: 'join-ce77f.firebaseapp.com',
        projectId: 'join-ce77f',
        storageBucket: 'join-ce77f.firebasestorage.app',
        messagingSenderId: '879322572144',
        appId: '1:879322572144:web:0a027cd2bbd4751c77dbb5',
    },
};