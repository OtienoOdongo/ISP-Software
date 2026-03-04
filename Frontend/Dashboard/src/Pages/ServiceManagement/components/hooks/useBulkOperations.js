
// Custom hook for bulk operations
import { useState, useCallback } from 'react';
import api from '../../../../api'

export const useBulkOperations = (onSuccess) => {
  const [selected, setSelected] = useState(new Set());
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);

  const toggleSelect = useCallback((id) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const toggleSelectAll = useCallback((items) => {
    if (selected.size === items.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(items.map(item => item.id)));
    }
  }, [selected.size]);

  const clearSelection = useCallback(() => {
    setSelected(new Set());
  }, []);

  const executeBulkAction = useCallback(async (endpoint, action, payload = {}) => {
    if (selected.size === 0) {
      return { success: false, error: 'No items selected' };
    }

    setLoading(true);
    setResults(null);

    try {
      const response = await api.post(endpoint, {
        ids: Array.from(selected),
        action,
        ...payload,
      });

      const result = {
        success: true,
        data: response.data,
        total: selected.size,
        successful: response.data.successful || 0,
        failed: response.data.failed || 0,
        errors: response.data.errors || [],
      };

      setResults(result);
      if (onSuccess) onSuccess(result);
      
      // Clear selection on success
      if (result.failed === 0) {
        setSelected(new Set());
      }

      return result;
    } catch (err) {
      const error = err.response?.data?.error || err.message || 'Bulk action failed';
      const result = { success: false, error };
      setResults(result);
      return result;
    } finally {
      setLoading(false);
    }
  }, [selected, onSuccess]);

  return {
    selected,
    loading,
    results,
    toggleSelect,
    toggleSelectAll,
    clearSelection,
    executeBulkAction,
  };
};