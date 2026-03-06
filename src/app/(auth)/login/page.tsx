import { Metadata } from 'next';
import { LoginForm } from '@/presentation/components/auth';

export const metadata: Metadata = {
  title: 'Iniciar Sesión - TIYUY | Bienes Raíces en Perú',
  description: 'Inicia sesión en tu cuenta TIYUY y accede a la mejor plataforma de bienes raíces en Perú. Encuentra tu hogar ideal.',
  keywords: ['iniciar sesión tiyuy', 'login bienes raíces perú', 'cuenta tiyuy', 'acceso tiyuy'],
  openGraph: {
    title: 'Iniciar Sesión - TIYUY | Bienes Raíces en Perú',
    description: 'Accede a tu cuenta TIYUY y descubre las mejores propiedades en Perú.',
    type: 'website',
    locale: 'es_PE',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Iniciar Sesión - TIYUY | Bienes Raíces en Perú',
    description: 'Accede a tu cuenta TIYUY y descubre las mejores propiedades en Perú.',
  },
  robots: { index: true, follow: true },
};

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex flex-col lg:flex-row min-h-screen">
        {/* Columna izquierda - Imagen/Visual */}
        <div className="lg:w-[45%] relative flex items-center justify-center p-8 lg:p-12">
          {/* Imagen de fondo */}
          <div 
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: "url('/assets/images/login/login1.jpg')" }}
          />
          
          {/* Contenido superpuesto */}
          <div className="relative z-10 text-center text-white max-w-md">
            <h1 className="text-4xl lg:text-5xl font-bold mb-6 drop-shadow-lg">Bienvenido a TIYUY</h1>
            <p className="text-xl mb-8 drop-shadow-lg">
              Inicia sesión y descubre las mejores propiedades en Perú
            </p>
            <div className="space-y-4 text-left">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" />
                  </svg>
                </div>
                <span className="text-lg drop-shadow-lg">Acceso personalizado</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="text-lg drop-shadow-lg">Propiedades exclusivas</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="text-lg drop-shadow-lg">Seguridad garantizada</span>
              </div>
            </div>
          </div>
        </div>

        {/* Columna derecha - Formulario */}
        <div className="lg:w-[55%] bg-gray-50 flex items-center justify-center p-6 lg:p-8">
          <div className="w-full max-w-lg">
            <LoginForm />
          </div>
        </div>
      </div>
    </div>
  );
}
