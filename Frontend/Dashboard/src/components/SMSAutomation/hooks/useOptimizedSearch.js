import { useState, useEffect, useMemo, useCallback } from 'react';
import { debounce } from '../utils/algorithms'                   
import { Trie } from '../utils/dataStructures';

export const useOptimizedSearch = (data, searchFields = ['name'], options = {}) => {
  const {
    debounceMs = 300,
    minSearchLength = 1,
    caseSensitive = false,
    enableTrie = true,
    enableBloomFilter = true
  } = options;

  const [searchTerm, setSearchTerm] = useState('');
  const [filteredData, setFilteredData] = useState(data);
  const [loading, setLoading] = useState(false);

  // Initialize data structures
  const { trie, bloomFilter } = useMemo(() => {
    const trie = enableTrie ? new Trie() : null;
    const bloomFilter = enableBloomFilter ? new BloomFilter() : null;
    
    if (data && data.length > 0) {
      data.forEach((item, index) => {
        searchFields.forEach(field => {
          const value = item[field];
          if (value) {
            const searchable = caseSensitive ? value : value.toLowerCase();
            
            if (trie) {
              trie.insert(searchable, index);
            }
            
            if (bloomFilter) {
              bloomFilter.add(searchable);
            }
          }
        });
      });
    }
    
    return { trie, bloomFilter };
  }, [data, searchFields, caseSensitive, enableTrie, enableBloomFilter]);

  // Search function using multiple algorithms
  const searchData = useCallback((term) => {
    if (!term.trim() || term.length < minSearchLength) {
      setFilteredData(data);
      return;
    }

    setLoading(true);
    
    const searchTerm = caseSensitive ? term : term.toLowerCase();
    
    // Performance measurement
    const startTime = performance.now();
    
    let results;
    
    if (trie && searchTerm.length >= 2) {
      // Use Trie for prefix search (fastest for short prefixes)
      const prefixResults = trie.startsWith(searchTerm);
      const indices = new Set(prefixResults.map(r => r.data));
      results = data.filter((_, index) => indices.has(index));
    } else {
      // Fallback to linear search with Bloom filter optimization
      if (bloomFilter) {
        // Quick check with Bloom filter
        const mightExist = bloomFilter.mightContain(searchTerm);
        if (!mightExist) {
          results = [];
        } else {
          // Linear search with early exit
          results = data.filter(item => {
            for (const field of searchFields) {
              const value = item[field];
              if (value) {
                const fieldValue = caseSensitive ? value : value.toLowerCase();
                if (fieldValue.includes(searchTerm)) {
                  return true;
                }
              }
            }
            return false;
          });
        }
      } else {
        // Standard linear search
        results = data.filter(item => {
          for (const field of searchFields) {
            const value = item[field];
            if (value) {
              const fieldValue = caseSensitive ? value : value.toLowerCase();
              if (fieldValue.includes(searchTerm)) {
                return true;
              }
            }
          }
          return false;
        });
      }
    }
    
    const endTime = performance.now();
    console.log(`Search completed in ${endTime - startTime}ms`);
    
    setFilteredData(results);
    setLoading(false);
  }, [data, searchFields, caseSensitive, minSearchLength, trie, bloomFilter]);

  // Debounced search
  const debouncedSearch = useMemo(
    () => debounce(searchData, debounceMs),
    [searchData, debounceMs]
  );

  // Handle search term changes
  useEffect(() => {
    debouncedSearch(searchTerm);
  }, [searchTerm, debouncedSearch]);

  // Update filtered data when source data changes
  useEffect(() => {
    if (!searchTerm.trim() || searchTerm.length < minSearchLength) {
      setFilteredData(data);
    }
  }, [data, searchTerm, minSearchLength]);

  // Advanced search functions
  const advancedSearch = useCallback((criteria) => {
    setLoading(true);
    
    const startTime = performance.now();
    
    const results = data.filter(item => {
      for (const [field, condition] of Object.entries(criteria)) {
        const itemValue = item[field];
        const conditionValue = condition.value;
        const operator = condition.operator || 'equals';
        
        if (itemValue === undefined || itemValue === null) {
          return false;
        }
        
        let matches = false;
        
        switch (operator) {
          case 'equals':
            matches = String(itemValue) === String(conditionValue);
            break;
          
          case 'contains':
            matches = String(itemValue).toLowerCase().includes(
              String(conditionValue).toLowerCase()
            );
            break;
          
          case 'startsWith':
            matches = String(itemValue).toLowerCase().startsWith(
              String(conditionValue).toLowerCase()
            );
            break;
          
          case 'endsWith':
            matches = String(itemValue).toLowerCase().endsWith(
              String(conditionValue).toLowerCase()
            );
            break;
          
          case 'greaterThan':
            matches = Number(itemValue) > Number(conditionValue);
            break;
          
          case 'lessThan':
            matches = Number(itemValue) < Number(conditionValue);
            break;
          
          case 'between':
            matches = Number(itemValue) >= Number(conditionValue[0]) &&
                     Number(itemValue) <= Number(conditionValue[1]);
            break;
          
          case 'in':
            matches = Array.isArray(conditionValue) &&
                      conditionValue.includes(itemValue);
            break;
          
          default:
            matches = true;
        }
        
        if (!matches) return false;
      }
      
      return true;
    });
    
    const endTime = performance.now();
    console.log(`Advanced search completed in ${endTime - startTime}ms`);
    
    setFilteredData(results);
    setLoading(false);
    
    return results;
  }, [data]);

  // Search by multiple terms with weights
  const weightedSearch = useCallback((terms) => {
    setLoading(true);
    
    const startTime = performance.now();
    
    const scoredResults = data.map(item => {
      let score = 0;
      
      terms.forEach(({ term, weight = 1, fields = searchFields }) => {
        fields.forEach(field => {
          const itemValue = item[field];
          if (itemValue) {
            const normalizedValue = caseSensitive ? 
              itemValue : itemValue.toLowerCase();
            const normalizedTerm = caseSensitive ? 
              term : term.toLowerCase();
            
            if (normalizedValue === normalizedTerm) {
              score += weight * 10; // Exact match
            } else if (normalizedValue.includes(normalizedTerm)) {
              score += weight * 5; // Partial match
            } else if (normalizedTerm.includes(normalizedValue)) {
              score += weight * 2; // Reverse partial match
            }
          }
        });
      });
      
      return { item, score };
    });
    
    // Sort by score descending
    scoredResults.sort((a, b) => b.score - a.score);
    
    // Filter out zero-score results
    const results = scoredResults
      .filter(({ score }) => score > 0)
      .map(({ item }) => item);
    
    const endTime = performance.now();
    console.log(`Weighted search completed in ${endTime - startTime}ms`);
    
    setFilteredData(results);
    setLoading(false);
    
    return { results, scores: scoredResults };
  }, [data, searchFields, caseSensitive]);

  return {
    searchTerm,
    setSearchTerm,
    filteredData,
    loading,
    searchData,
    advancedSearch,
    weightedSearch,
    resetSearch: () => {
      setSearchTerm('');
      setFilteredData(data);
    }
  };
};