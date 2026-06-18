import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="text-center px-4">
        <h1 className="text-8xl font-bold text-gray-200 mb-4">404</h1>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Página no encontrada</h2>
        <p className="text-gray-500 mb-8 max-w-md mx-auto">
          La página que buscas no está disponible o ha sido eliminada.
        </p>
        <Link
          href="/"
          className="inline-flex items-center px-6 py-3 bg-[#00a63e] text-white font-semibold rounded-lg hover:bg-[#009135] transition-colors"
        >
          Volver al inicio
        </Link>
      </div>
    </div>
  );
}
