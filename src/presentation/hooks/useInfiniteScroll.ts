'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

interface UseInfiniteScrollOptions<T> {
  /** Función que recibe page y size, retorna los datos paginados */
  fetchFn: (page: number, size: number) => Promise<{
    content: T[];
    totalElements: number;
    totalPages: number;
    page: number;
    size: number;
    last?: boolean;
  }>;
  /** Cantidad de items por página */
  pageSize?: number;
  /** Distancia en px desde el final para gatillar la carga */
  threshold?: number;
  /** Dependencias para reiniciar la paginación (ej: filtros) */
  deps?: any[];
  /** 
   * Si el total de páginas es MAYOR a este número, se muestra paginación numérica.
   * Si es menor o igual, solo infinite scroll.
   * Ej: 4 páginas = 24 items. Si hay 5+ páginas, aparece paginación numérica.
   */
  maxInfinitePages?: number;
}

export function useInfiniteScroll<T>({
  fetchFn,
  pageSize = 6,
  threshold = 400,
  deps = [],
  maxInfinitePages = 4,
}: UseInfiniteScrollOptions<T>) {
  const [items, setItems] = useState<T[]>([]);
  const [page, setPage] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [showPagination, setShowPagination] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const isFetchingRef = useRef(false);
  const initialLoadDoneRef = useRef(false);
  const mountedRef = useRef(false);

  // Cargar página (append=true: acumula, append=false: reemplaza)
  const loadPage = useCallback(async (pageNum: number, append: boolean = true) => {
    if (isFetchingRef.current) return;
    isFetchingRef.current = true;

    try {
      if (pageNum === 0) {
        // Resetear todo al cargar página 0
        setItems([]);
        setPage(0);
        setTotalElements(0);
        setTotalPages(0);
        setHasMore(true);
        setShowPagination(false);
        setError(null);
        setIsLoading(true);
      } else {
        setIsLoadingMore(true);
      }

      const result = await fetchFn(pageNum, pageSize);

      // Solo actualizar si el componente sigue montado
      if (!mountedRef.current) return;

      if (pageNum === 0) {
        setItems(result.content);
      } else if (append) {
        setItems(prev => [...prev, ...result.content]);
      } else {
        setItems(result.content);
      }
      setTotalElements(result.totalElements);
      setTotalPages(result.totalPages);
      setPage(pageNum);
      setHasMore(pageNum < result.totalPages - 1);

      // Mostrar paginación numérica SOLO si hay más páginas que maxInfinitePages
      if (result.totalPages > maxInfinitePages) {
        setShowPagination(true);
      }
    } catch (err) {
      if (mountedRef.current) {
        setError(err instanceof Error ? err.message : 'Error al cargar datos');
      }
    } finally {
      if (mountedRef.current) {
        setIsLoading(false);
        setIsLoadingMore(false);
      }
      isFetchingRef.current = false;
    }
  }, [fetchFn, pageSize, maxInfinitePages]);

  // Efecto principal: carga inicial y cuando cambian deps
  useEffect(() => {
    mountedRef.current = true;
    initialLoadDoneRef.current = false;

    // Pequeño delay para evitar doble ejecución en desarrollo con StrictMode
    const timer = setTimeout(() => {
      if (mountedRef.current && !initialLoadDoneRef.current) {
        initialLoadDoneRef.current = true;
        loadPage(0);
      }
    }, 0);

    return () => {
      mountedRef.current = false;
      clearTimeout(timer);
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, deps); // Solo se reinicia cuando cambian las dependencias reales

  // Ir a una página específica (paginación numérica)
  const goToPage = useCallback(async (pageNum: number) => {
    if (pageNum < 0 || pageNum >= totalPages) return;
    if (isFetchingRef.current) return;

    setIsLoadingMore(true);
    isFetchingRef.current = true;

    try {
      setError(null);
      const result = await fetchFn(pageNum, pageSize);
      
      if (!mountedRef.current) return;
      
      setItems(result.content);
      setPage(pageNum);
      setHasMore(pageNum < result.totalPages - 1);
      if (result.totalPages > maxInfinitePages) {
        setShowPagination(true);
      }
    } catch (err) {
      if (mountedRef.current) {
        setError(err instanceof Error ? err.message : 'Error al cargar datos');
      }
    } finally {
      if (mountedRef.current) {
        setIsLoadingMore(false);
      }
      isFetchingRef.current = false;
    }
  }, [fetchFn, pageSize, totalPages, maxInfinitePages]);

  // Intersection Observer para infinite scroll
  const lastItemRef = useCallback((node: HTMLDivElement | null) => {
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    if (!node || !hasMore) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isFetchingRef.current) {
          loadPage(page + 1);
        }
      },
      { rootMargin: `${threshold}px` }
    );

    observerRef.current.observe(node);
    sentinelRef.current = node;
  }, [hasMore, page, loadPage, threshold]);

  // Generar array de páginas para mostrar (ej: [1, 2, 3, ..., 8, 9, 10])
  const getPageNumbers = useCallback((): (number | 'ellipsis')[] => {
    const pages: (number | 'ellipsis')[] = [];
    const total = totalPages;
    const current = page;
    const maxVisible = 7;

    if (total <= maxVisible) {
      for (let i = 0; i < total; i++) pages.push(i);
    } else {
      pages.push(0);

      let start = Math.max(1, current - 2);
      let end = Math.min(total - 2, current + 2);

      if (current < 3) {
        start = 1;
        end = Math.min(maxVisible - 2, total - 2);
      }
      if (current > total - 4) {
        start = Math.max(1, total - maxVisible + 1);
        end = total - 2;
      }

      if (start > 1) pages.push('ellipsis');
      for (let i = start; i <= end; i++) pages.push(i);
      if (end < total - 2) pages.push('ellipsis');

      pages.push(total - 1);
    }

    return pages;
  }, [page, totalPages]);

  return {
    items,
    isLoading,
    isLoadingMore,
    error,
    hasMore,
    totalElements,
    totalPages,
    page,
    showPagination,
    lastItemRef,
    sentinelRef,
    reload: () => loadPage(0),
    goToPage,
    getPageNumbers,
  };
}
