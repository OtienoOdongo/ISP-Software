
// Custom hook for pagination
import { useState, useCallback, useMemo } from 'react';
import { PAGINATION } from '../constants'

export const usePagination = (initialPage = 1, initialPageSize = PAGINATION.DEFAULT_PAGE_SIZE) => {
  const [page, setPage] = useState(initialPage);
  const [pageSize, setPageSize] = useState(initialPageSize);
  const [total, setTotal] = useState(0);

  const totalPages = useMemo(() => Math.ceil(total / pageSize), [total, pageSize]);

  const nextPage = useCallback(() => {
    setPage(prev => Math.min(prev + 1, totalPages));
  }, [totalPages]);

  const prevPage = useCallback(() => {
    setPage(prev => Math.max(prev - 1, 1));
  }, []);

  const goToPage = useCallback((newPage) => {
    setPage(Math.min(Math.max(newPage, 1), totalPages));
  }, [totalPages]);

  const changePageSize = useCallback((newSize) => {
    setPageSize(newSize);
    setPage(1); // Reset to first page when changing page size
  }, []);

  return {
    page,
    pageSize,
    total,
    totalPages,
    setTotal,
    nextPage,
    prevPage,
    goToPage,
    changePageSize,
  };
};