'use client';

import { useState, useMemo } from 'react';

interface UsePaginationProps<T> {
  data: T[];
  itemsPerPage?: number;
  initialPage?: number;
}

interface UsePaginationReturn<T> {
  currentPage: number;
  totalPages: number;
  currentItems: T[];
  totalItems: number;
  itemsPerPage: number;
  goToPage: (page: number) => void;
  goToNext: () => void;
  goToPrevious: () => void;
  canGoNext: boolean;
  canGoPrevious: boolean;
}

export function usePagination<T>({
  data,
  itemsPerPage = 10,
  initialPage = 1,
}: UsePaginationProps<T>): UsePaginationReturn<T> {
  const [currentPage, setCurrentPage] = useState(initialPage);

  const totalPages = Math.ceil(data.length / itemsPerPage);
  const totalItems = data.length;

  const currentItems = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    return data.slice(start, end);
  }, [data, currentPage, itemsPerPage]);

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const goToNext = () => {
    if (currentPage < totalPages) {
      setCurrentPage(prev => prev + 1);
    }
  };

  const goToPrevious = () => {
    if (currentPage > 1) {
      setCurrentPage(prev => prev - 1);
    }
  };

  const canGoNext = currentPage < totalPages;
  const canGoPrevious = currentPage > 1;

  // Reset to page 1 if current page exceeds total pages (e.g., after filtering)
  if (currentPage > totalPages && totalPages > 0) {
    setCurrentPage(1);
  }

  return {
    currentPage,
    totalPages,
    currentItems,
    totalItems,
    itemsPerPage,
    goToPage,
    goToNext,
    goToPrevious,
    canGoNext,
    canGoPrevious,
  };
}