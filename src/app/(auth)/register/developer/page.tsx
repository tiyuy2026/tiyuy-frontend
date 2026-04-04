import { Metadata } from 'next';
import { RegisterDeveloperForm } from '@/presentation/components/auth/RegisterForm/RegisterDeveloperForm';

export const metadata: Metadata = {
  title: 'Publica tu Proyecto Gratis - TIYUY | Desarrolladores Inmobiliarios',
  description: 'Regístra tu empresa y publica tu primer proyecto inmobiliario gratis. 30 días de prueba + unidades ilimitadas (departamentos, casas, oficinas, lotes).',
  keywords: ['publicar proyecto gratis tiyuy', 'desarrollador inmobiliario', 'proyecto departamentos', 'inmobiliaria peru', 'tiyuy developer'],
  robots: { index: false, follow: false },
};

export default function RegisterDeveloperPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex flex-col lg:flex-row min-h-screen">
        {/* Columna izquierda - Imagen/Visual */}
        <div className="lg:w-[45%] relative flex items-center justify-center p-8 lg:p-12">
          {/* Imagen de fondo */}
          <div 
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: "url('/assets/images/registro/usuario.jpg')" }}
          />
          
          {/* Contenido superpuesto */}
          <div className="relative z-10 text-center text-white max-w-md">
            <div className="inline-flex items-center gap-2 bg-yellow-500/20 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-semibold text-white mb-6">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              30 días gratis - Trial Enterprise
            </div>
            <h1 className="text-4xl lg:text-5xl font-bold mb-6 drop-shadow-lg">Desarrollador TIYUY</h1>
            <p className="text-xl mb-8 drop-shadow-lg">
              Publica proyectos inmobiliarios y alcanza miles de compradores potenciales
            </p>
            <div className="space-y-4 text-left">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" />
                  </svg>
                </div>
                <span className="text-lg drop-shadow-lg">Perfil empresarial</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="text-lg drop-shadow-lg">Proyectos ilimitados</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="text-lg drop-shadow-lg">30 días gratis</span>
              </div>
            </div>
          </div>
        </div>

        {/* Columna derecha - Formulario */}
        <div className="lg:w-[55%] bg-gray-50 flex items-center justify-center p-6 lg:p-8">
          <div className="w-full max-w-lg">
            <RegisterDeveloperForm />
          </div>
        </div>
      </div>
    </div>
  );
}
