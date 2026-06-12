'use client';

import { useState, useRef, useCallback, useEffect } from 'react';

interface UseVirtualListOptions {
  itemHeight: number;
  overscan?: number;
  containerHeight?: number;
}

/**
 * Hook para virtualización de listas largas.
 * Solo renderiza los items visibles + overscan, mejorando performance
 * en grids con muchas propiedades/proyectos.
 */
export function useVirtualList<T>(
  items: T[],
  options: UseVirtualListOptions
) {
  const { itemHeight, overscan = 3, containerHeight: initialContainerHeight = 800 } = options;
  const [scrollTop, setScrollTop] = useState(0);
  const [containerHeight, setContainerHeight] = useState(initialContainerHeight);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      setContainerHeight(containerRef.current.clientHeight || initialContainerHeight);
    }
  }, [initialContainerHeight]);

  const totalHeight = items.length * itemHeight;
  const visibleStartIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
  const visibleEndIndex = Math.min(
    items.length,
    Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan
  );

  const visibleItems = items.slice(visibleStartIndex, visibleEndIndex);

  const onScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  }, []);

  const getItemStyle = useCallback(
    (index: number): React.CSSProperties => ({
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      transform: `translateY(${index * itemHeight}px)`,
    }),
    [itemHeight]
  );

  return {
    containerRef,
    visibleItems,
    visibleStartIndex,
    totalHeight,
    onScroll,
    getItemStyle,
    containerHeight,
  };
}
