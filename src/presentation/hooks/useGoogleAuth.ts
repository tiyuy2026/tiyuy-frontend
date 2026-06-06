import { useState } from 'react';
import { signInWithPopup, signOut as firebaseSignOut, User as FirebaseUser } from 'firebase/auth';
import { auth, googleProvider } from '@/config/firebase';
import { AuthRepository } from '@/infrastructure/repositories/AuthRepository';

export interface GoogleUserData {
  email: string;
  firstName: string;
  lastName: string;
  photoURL?: string;
  uid: string;
}

export interface GoogleAuthCompleteResult {
  exists: boolean;
  userData?: GoogleUserData;
  authResponse?: any;
  loginError?: string;
  verificationError?: string;
}

export const useGoogleAuth = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const authRepository = new AuthRepository();

  const signInWithGoogle = async (): Promise<GoogleUserData | null> => {
    setLoading(true);
    setError(null);

    try {
      // Verificar que auth esté disponible
      if (!auth) {
        throw new Error('Firebase Auth no está inicializado');
      }

      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      if (user) {
        // Extraer nombre completo
        const fullName = user.displayName || '';
        const nameParts = fullName.split(' ');
        const firstName = nameParts[0] || '';
        const lastName = nameParts.slice(1).join(' ') || '';

        console.log('Google Auth exitoso:', { 
          email: user.email, 
          firstName, 
          lastName,
          uid: user.uid 
        });

        return {
          email: user.email || '',
          firstName,
          lastName,
          photoURL: user.photoURL || undefined,
          uid: user.uid
        };
      }

      return null;
    } catch (error: any) {
      console.error('Error en Google Sign-In:', error);
      
      // Manejar errores específicos
      if (error.code === 'auth/popup-closed-by-user') {
        setError('El popup fue cerrado antes de completar el registro');
      } else if (error.code === 'auth/popup-blocked') {
        setError('El popup fue bloqueado. Por favor permite popups para este sitio');
      } else if (error.code === 'auth/cancelled-popup-request') {
        setError('Se canceló la solicitud de inicio de sesión');
      } else if (error.code === 'auth/configuration-not-found') {
        setError('Error de configuración de Firebase. Contacta al administrador');
      } else {
        setError(`Error al iniciar sesión con Google: ${error.message || 'Error desconocido'}`);
      }
      
      return null;
    } finally {
      setLoading(false);
    }
  };

  const signInWithGoogleComplete = async (): Promise<GoogleAuthCompleteResult> => {
    setLoading(true);
    setError(null);

    try {
      // Obtener datos de Google
      const googleUserData = await signInWithGoogle();
      
      if (!googleUserData) {
        return { exists: false };
      }

      // Normalizar el correo para evitar mayúsculas inconsistentes
      const normalizedEmail = googleUserData.email.toLowerCase();

      // Intentar login directo con Google en el backend
      try {
        const authResponse = await authRepository.loginWithGoogle(
          normalizedEmail,
          googleUserData.firstName,
          googleUserData.lastName,
          googleUserData.uid
        );

        return {
          exists: true,
          userData: googleUserData,
          authResponse,
        };
      } catch (loginError: any) {
        console.error('Error en login con Google:', loginError);

        const errorMessage = loginError?.message || 'No se pudo iniciar sesión con Google.';
        const isRegistrationError = /reg[ií]strate|no se pudo autenticar|no encontrado|not found|not registered|registrado/i.test(
          errorMessage
        );

        if (isRegistrationError) {
          return {
            exists: false,
            userData: googleUserData,
            loginError: errorMessage,
          };
        }

        setError(errorMessage);
        return {
          exists: false,
          userData: googleUserData,
          verificationError: errorMessage,
        };
      }
      
    } catch (error: any) {
      console.error('Error en autenticación completa con Google:', error);
      setError(error.message || 'Error al autenticar con Google');
      return { exists: false };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      if (auth) {
        await firebaseSignOut(auth);
      }
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  return {
    signInWithGoogle,
    signInWithGoogleComplete,
    signOut,
    loading,
    error
  };
};
