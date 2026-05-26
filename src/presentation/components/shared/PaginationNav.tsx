'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationNavProps {
  currentPage: number;
  totalPages: number;
  totalElements: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  getPageNumbers: () => (number | 'ellipsis')[];
}

export default function PaginationNav({
  currentPage,
  totalPages,
  totalElements,
  pageSize,
  onPageChange,
  getPageNumbers,
}: PaginationNavProps) {
  if (totalPages <= 1) return null;

  const pageNumbers = getPageNumbers();
  const startItem = currentPage * pageSize + 1;
  const endItem = Math.min((currentPage + 1) * pageSize, totalElements);

  return (
    <div className="mt-10">
      {/* Contador de resultados */}
      <p className="text-center text-sm text-gray-400 mb-4">
        Mostrando {startItem}-{endItem} de {totalElements} resultados
      </p>

      {/* Navegación numérica */}
      <nav className="flex items-center justify-center gap-1.5" aria-label="Paginación">
        {/* Botón Anterior */}
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 0}
          className={`flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium transition ${
            currentPage === 0
              ? 'text-gray-300 cursor-not-allowed'
              : 'text-gray-600 hover:bg-gray-100 hover:text-gray-800'
          }`}
        >
          <ChevronLeft className="w-4 h-4" />
          <span className="hidden sm:inline">Anterior</span>
        </button>

        {/* Números de página */}
        <div className="flex items-center gap-1">
          {pageNumbers.map((pageNum, idx) =>
            pageNum === 'ellipsis' ? (
              <span key={`ellipsis-${idx}`} className="px-2 py-2 text-sm text-gray-400">
                ...
              </span>
            ) : (
              <button
                key={pageNum}
                onClick={() => onPageChange(pageNum)}
                className={`min-w-[36px] h-9 rounded-lg text-sm font-semibold transition ${
                  pageNum === currentPage
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-800'
                }`}
              >
                {pageNum + 1}
              </button>
            )
          )}
        </div>

        {/* Botón Siguiente */}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages - 1}
          className={`flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium transition ${
            currentPage >= totalPages - 1
              ? 'text-gray-300 cursor-not-allowed'
              : 'text-gray-600 hover:bg-gray-100 hover:text-gray-800'
          }`}
        >
          <span className="hidden sm:inline">Siguiente</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </nav>
    </div>
  );
}
