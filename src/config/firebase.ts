import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Configuración de Firebase - exactamente como en Firebase Console
const firebaseConfig = {
  apiKey: "AIzaSyDAfA0WB7NtVUoIo3wWGFpZtdIvnkULTj0",
  authDomain: "tiyuy-d2a4e.firebaseapp.com",
  projectId: "tiyuy-d2a4e",
  storageBucket: "tiyuy-d2a4e.firebasestorage.app",
  messagingSenderId: "907364290763",
  appId: "1:907364290763:web:103457f440790689b44b4e",
  measurementId: "G-TKQGDQ8WZF"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);

// Inicializar Auth con configuración específica para desarrollo
export const auth = getAuth(app);
auth.useDeviceLanguage(); // Usar idioma del dispositivo

export const db = getFirestore(app);

// Configurar proveedor de Google con parámetros correctos
export const googleProvider = new GoogleAuthProvider();
googleProvider.addScope('email');
googleProvider.addScope('profile');
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

export default app;
