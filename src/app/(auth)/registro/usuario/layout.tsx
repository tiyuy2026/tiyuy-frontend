export default function RegistroUsuarioLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header con cintas horizontales */}
      <div className="w-full">
        {/* Cinta verde */}
        <div className="h-2 bg-green-500"></div>
        {/* Cinta amarilla */}
        <div className="h-2 bg-yellow-500"></div>
        {/* Cinta naranja */}
        <div className="h-2 bg-orange-500"></div>
      </div>

      {/* Contenido principal con tres columnas */}
      <div className="flex-1 flex">
        {/* Barra lateral izquierda */}
        <div className="w-20 lg:w-32 bg-gradient-to-b from-blue-50 to-blue-100 flex items-center justify-center">
          <div className="text-center px-2">
            <h2 
              className="text-sm lg:text-lg font-bold text-blue-600"
              style={{ writingMode: 'vertical-rl', textOrientation: 'mixed' }}
            >
              Bienvenido a Tiyuy
            </h2>
          </div>
        </div>

        {/* Contenido central (formulario) */}
        <div className="flex-1 flex items-center justify-center p-4 md:p-8">
          {children}
        </div>

        {/* Barra lateral derecha */}
        <div className="w-20 lg:w-32 bg-gradient-to-b from-blue-50 to-blue-100 flex items-center justify-center">
          <div className="text-center px-2">
            <h2 
              className="text-sm lg:text-lg font-bold text-blue-600"
              style={{ writingMode: 'vertical-rl', textOrientation: 'mixed' }}
            >
              Bienvenido a Tiyuy
            </h2>
          </div>
        </div>
      </div>
    </div>
  );
}
