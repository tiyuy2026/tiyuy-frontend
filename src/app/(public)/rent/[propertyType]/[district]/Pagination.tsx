interface PaginationProps {
  pagination: {
    currentPage: number;
    totalPages: number;
    hasNext: boolean;
    hasPrevious: boolean;
  };
}

export function Pagination({ pagination }: PaginationProps) {
  return (
    <div className="flex items-center justify-center gap-2 mt-8">
      {pagination.hasPrevious && (
        <a
          href={`?page=${pagination.currentPage - 1}`}
          className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
        >
          ← Anterior
        </a>
      )}

      <span className="px-4 py-2 text-gray-700">
        Página {pagination.currentPage + 1} de {pagination.totalPages}
      </span>

      {pagination.hasNext && (
        <a
          href={`?page=${pagination.currentPage + 1}`}
          className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
        >
          Siguiente →
        </a>
      )}
    </div>
  );
}
