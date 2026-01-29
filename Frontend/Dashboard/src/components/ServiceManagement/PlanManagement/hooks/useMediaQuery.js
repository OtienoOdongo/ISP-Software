// import { useState, useEffect, useCallback } from 'react';

// // Common breakpoints for responsive design
// export const BREAKPOINTS = {
//   xs: '(max-width: 480px)',
//   sm: '(min-width: 481px) and (max-width: 768px)',
//   md: '(min-width: 769px) and (max-width: 1024px)',
//   lg: '(min-width: 1025px) and (max-width: 1440px)',
//   xl: '(min-width: 1441px)',
//   mobile: '(max-width: 768px)',
//   tablet: '(min-width: 769px) and (max-width: 1024px)',
//   desktop: '(min-width: 1025px)',
//   portrait: '(orientation: portrait)',
//   landscape: '(orientation: landscape)',
//   dark: '(prefers-color-scheme: dark)',
//   light: '(prefers-color-scheme: light)',
//   reducedMotion: '(prefers-reduced-motion: reduce)',
//   hover: '(hover: hover) and (pointer: fine)',
//   touch: '(hover: none) and (pointer: coarse)'
// };

// /**
//  * Custom hook for responsive media queries
//  * @param {string|keyof BREAKPOINTS} query - CSS media query string or breakpoint key
//  * @returns {boolean} - Whether the media query matches
//  */
// const useMediaQuery = (query) => {
//   // Resolve breakpoint key to actual query if needed
//   const mediaQuery = BREAKPOINTS[query] || query;
  
//   // Check if window is defined (for SSR compatibility)
//   const canUseDOM = typeof window !== 'undefined';
  
//   // Get the initial value
//   const getMatches = useCallback(() => {
//     if (!canUseDOM) return false;
    
//     try {
//       return window.matchMedia(mediaQuery).matches;
//     } catch (error) {
//       console.error('Error evaluating media query:', error, 'Query:', mediaQuery);
//       return false;
//     }
//   }, [mediaQuery, canUseDOM]);

//   const [matches, setMatches] = useState(getMatches);

//   useEffect(() => {
//     if (!canUseDOM) return;

//     let mediaQueryList;
//     try {
//       mediaQueryList = window.matchMedia(mediaQuery);
//     } catch (error) {
//       console.error('Error creating media query:', error, 'Query:', mediaQuery);
//       return;
//     }
    
//     // Update state initially
//     setMatches(mediaQueryList.matches);
    
//     // Handler for media query changes
//     const handleChange = (event) => {
//       setMatches(event.matches);
//     };

//     try {
//       // Modern browsers support addEventListener
//       if (mediaQueryList.addEventListener) {
//         mediaQueryList.addEventListener('change', handleChange);
//       } else {
//         // Fallback for older browsers
//         mediaQueryList.addListener(handleChange);
//       }
//     } catch (error) {
//       console.error('Error attaching media query listener:', error);
//     }

//     // Cleanup function
//     return () => {
//       if (!canUseDOM || !mediaQueryList) return;

//       try {
//         if (mediaQueryList.removeEventListener) {
//           mediaQueryList.removeEventListener('change', handleChange);
//         } else {
//           // Fallback for older browsers
//           mediaQueryList.removeListener(handleChange);
//         }
//       } catch (error) {
//         console.error('Error removing media query listener:', error);
//       }
//     };
//   }, [mediaQuery, canUseDOM]);

//   return matches;
// };

// // Convenience hooks for common breakpoints
// export const useIsMobile = () => useMediaQuery('mobile');
// export const useIsTablet = () => useMediaQuery('tablet');
// export const useIsDesktop = () => useMediaQuery('desktop');
// export const useIsSmallScreen = () => useMediaQuery('(max-width: 1024px)');
// export const useIsLargeScreen = () => useMediaQuery('(min-width: 1025px)');
// export const useIsDarkMode = () => useMediaQuery('dark');
// export const useIsReducedMotion = () => useMediaQuery('reducedMotion');
// export const useHasHover = () => useMediaQuery('hover');
// export const useIsTouch = () => useMediaQuery('touch');

// export default useMediaQuery;









import { useState, useEffect, useCallback, useRef } from 'react';

// Common breakpoints for responsive design - optimized for PlanManagement
export const BREAKPOINTS = {
  // Standard breakpoints
  xs: '(max-width: 480px)',
  sm: '(min-width: 481px) and (max-width: 640px)',
  md: '(min-width: 641px) and (max-width: 768px)',
  lg: '(min-width: 769px) and (max-width: 1024px)',
  xl: '(min-width: 1025px) and (max-width: 1280px)',
  '2xl': '(min-width: 1281px)',
  
  // Device categories (preferred for PlanManagement)
  mobile: '(max-width: 768px)',
  tablet: '(min-width: 769px) and (max-width: 1024px)',
  desktop: '(min-width: 1025px)',
  
  // PlanManagement specific breakpoints
  smallMobile: '(max-width: 375px)',
  largeMobile: '(min-width: 376px) and (max-width: 768px)',
  smallTablet: '(min-width: 769px) and (max-width: 896px)',
  largeTablet: '(min-width: 897px) and (max-width: 1024px)',
  smallDesktop: '(min-width: 1025px) and (max-width: 1440px)',
  largeDesktop: '(min-width: 1441px)',
  
  // Orientation and features
  portrait: '(orientation: portrait)',
  landscape: '(orientation: landscape)',
  dark: '(prefers-color-scheme: dark)',
  light: '(prefers-color-scheme: light)',
  reducedMotion: '(prefers-reduced-motion: reduce)',
  hover: '(hover: hover) and (pointer: fine)',
  touch: '(hover: none) and (pointer: coarse)',
  highContrast: '(prefers-contrast: high)',
  lowData: '(prefers-reduced-data: reduce)'
};

// Cache for media queries to improve performance
const mediaQueryCache = new Map();

/**
 * Safely creates and caches a MediaQueryList
 * @param {string} query - CSS media query
 * @returns {MediaQueryList|null} - MediaQueryList or null if unsupported
 */
const getMediaQueryList = (query) => {
  if (!mediaQueryCache.has(query)) {
    try {
      if (typeof window === 'undefined' || !window.matchMedia) {
        return null;
      }
      
      const mediaQueryList = window.matchMedia(query);
      mediaQueryCache.set(query, mediaQueryList);
      return mediaQueryList;
    } catch (error) {
      console.error(`Failed to create media query for: ${query}`, error);
      mediaQueryCache.set(query, null);
      return null;
    }
  }
  
  return mediaQueryCache.get(query);
};

/**
 * Custom hook for responsive media queries with enhanced features
 * @param {string|keyof BREAKPOINTS} query - CSS media query string or breakpoint key
 * @param {Object} options - Additional options
 * @param {boolean} options.defaultValue - Default value for SSR (default: false)
 * @param {boolean} options.debug - Enable debug logging (default: false)
 * @returns {boolean} - Whether the media query matches
 */
const useMediaQuery = (query, options = {}) => {
  const { defaultValue = false, debug = false } = options;
  
  // Resolve breakpoint key to actual query if needed
  const mediaQuery = BREAKPOINTS[query] || query;
  
  // Check if we can use the DOM (for SSR compatibility)
  const canUseDOM = typeof window !== 'undefined';
  
  // Get the initial value with SSR support
  const getInitialMatches = useCallback(() => {
    if (!canUseDOM) return defaultValue;
    
    const mediaQueryList = getMediaQueryList(mediaQuery);
    if (!mediaQueryList) return defaultValue;
    
    try {
      const matches = mediaQueryList.matches;
      if (debug) {
        console.log(`[useMediaQuery] Initial matches for "${mediaQuery}":`, matches);
      }
      return matches;
    } catch (error) {
      console.error(`[useMediaQuery] Error getting initial matches for "${mediaQuery}":`, error);
      return defaultValue;
    }
  }, [mediaQuery, defaultValue, canUseDOM, debug]);

  const [matches, setMatches] = useState(getInitialMatches);
  const mountedRef = useRef(false);
  const mediaQueryListRef = useRef(null);

  useEffect(() => {
    if (!canUseDOM) return;

    mountedRef.current = true;
    
    const mediaQueryList = getMediaQueryList(mediaQuery);
    if (!mediaQueryList) {
      if (debug) {
        console.warn(`[useMediaQuery] Media query not supported: ${mediaQuery}`);
      }
      return;
    }
    
    mediaQueryListRef.current = mediaQueryList;
    
    // Update state initially
    const initialMatches = mediaQueryList.matches;
    if (mountedRef.current) {
      setMatches(initialMatches);
    }
    
    if (debug) {
      console.log(`[useMediaQuery] Initial state for "${mediaQuery}":`, initialMatches);
    }
    
    // Handler for media query changes
    const handleChange = (event) => {
      if (!mountedRef.current) return;
      
      if (debug) {
        console.log(`[useMediaQuery] Change detected for "${mediaQuery}":`, event.matches);
      }
      
      setMatches(event.matches);
    };

    try {
      // Modern browsers support addEventListener
      if (mediaQueryList.addEventListener) {
        mediaQueryList.addEventListener('change', handleChange);
      } else {
        // Fallback for older browsers (Safari <14, IE)
        mediaQueryList.addListener(handleChange);
      }
    } catch (error) {
      console.error(`[useMediaQuery] Failed to attach listener for "${mediaQuery}":`, error);
    }

    // Cleanup function
    return () => {
      mountedRef.current = false;
      
      if (!mediaQueryList) return;

      try {
        if (mediaQueryList.removeEventListener) {
          mediaQueryList.removeEventListener('change', handleChange);
        } else if (mediaQueryList.removeListener) {
          // Fallback for older browsers
          mediaQueryList.removeListener(handleChange);
        }
      } catch (error) {
        console.error(`[useMediaQuery] Failed to remove listener for "${mediaQuery}":`, error);
      }
      
      mediaQueryListRef.current = null;
    };
  }, [mediaQuery, canUseDOM, debug]);

  // Clean up cache on unmount (optional - can be commented out for better performance)
  useEffect(() => {
    return () => {
      // Optionally clean up cache entries that are no longer needed
      // This is useful if you have many dynamic media queries
      // mediaQueryCache.clear(); // Use with caution
    };
  }, []);

  return matches;
};

// Convenience hooks for common breakpoints - optimized for PlanManagement
export const useIsMobile = (options) => useMediaQuery('mobile', options);
export const useIsTablet = (options) => useMediaQuery('tablet', options);
export const useIsDesktop = (options) => useMediaQuery('desktop', options);
export const useIsSmallScreen = (options) => useMediaQuery('(max-width: 1024px)', options);
export const useIsLargeScreen = (options) => useMediaQuery('(min-width: 1025px)', options);
export const useIsDarkMode = (options) => useMediaQuery('dark', options);
export const useIsReducedMotion = (options) => useMediaQuery('reducedMotion', options);
export const useHasHover = (options) => useMediaQuery('hover', options);
export const useIsTouch = (options) => useMediaQuery('touch', options);
export const useIsHighContrast = (options) => useMediaQuery('highContrast', options);
export const useIsLowData = (options) => useMediaQuery('lowData', options);

// PlanManagement specific convenience hooks
export const useIsSmallMobile = (options) => useMediaQuery('smallMobile', options);
export const useIsLargeMobile = (options) => useMediaQuery('largeMobile', options);
export const useIsSmallTablet = (options) => useMediaQuery('smallTablet', options);
export const useIsLargeTablet = (options) => useMediaQuery('largeTablet', options);
export const useIsSmallDesktop = (options) => useMediaQuery('smallDesktop', options);
export const useIsLargeDesktop = (options) => useMediaQuery('largeDesktop', options);

// Orientation hooks
export const useIsPortrait = (options) => useMediaQuery('portrait', options);
export const useIsLandscape = (options) => useMediaQuery('landscape', options);

/**
 * Hook to get multiple media query matches at once (useful for PlanManagement)
 * @param {Array<string|keyof BREAKPOINTS>} queries - Array of media queries
 * @returns {Object} - Object with query keys and match status
 */
export const useMediaQueries = (queries) => {
  const results = {};
  
  queries.forEach((query, index) => {
    // Create a unique key for each query
    const key = typeof query === 'string' && query in BREAKPOINTS ? query : `query_${index}`;
    results[key] = useMediaQuery(query);
  });
  
  return results;
};

/**
 * Hook to get current device category for PlanManagement
 * Returns: 'mobile' | 'tablet' | 'desktop' | 'largeDesktop'
 */
export const useDeviceCategory = () => {
  const isMobile = useIsMobile();
  const isTablet = useIsTablet();
  const isDesktop = useIsDesktop();
  const isLargeDesktop = useIsLargeDesktop();
  
  if (isMobile) return 'mobile';
  if (isTablet) return 'tablet';
  if (isLargeDesktop) return 'largeDesktop';
  if (isDesktop) return 'desktop';
  
  return 'desktop'; // Default fallback
};

/**
 * Hook to get screen size information for responsive layouts in PlanManagement
 * Returns object with breakpoint info and dimensions
 */
export const useScreenInfo = () => {
  const isXS = useMediaQuery('xs');
  const isSM = useMediaQuery('sm');
  const isMD = useMediaQuery('md');
  const isLG = useMediaQuery('lg');
  const isXL = useMediaQuery('xl');
  const is2XL = useMediaQuery('2xl');
  
  const deviceCategory = useDeviceCategory();
  
  return {
    breakpoint: isXS ? 'xs' : isSM ? 'sm' : isMD ? 'md' : isLG ? 'lg' : isXL ? 'xl' : '2xl',
    deviceCategory,
    isMobile: deviceCategory === 'mobile',
    isTablet: deviceCategory === 'tablet',
    isDesktop: deviceCategory === 'desktop',
    isLargeDesktop: deviceCategory === 'largeDesktop',
    isPortrait: useIsPortrait(),
    isLandscape: useIsLandscape(),
    hasHover: useHasHover(),
    isTouch: useIsTouch(),
    isDarkMode: useIsDarkMode(),
    isReducedMotion: useIsReducedMotion()
  };
};

/**
 * Hook for conditional rendering based on screen size
 * Useful for showing/hiding elements in PlanManagement
 * @param {Object} config - Configuration object
 * @param {boolean|function} config.mobile - Render on mobile
 * @param {boolean|function} config.tablet - Render on tablet
 * @param {boolean|function} config.desktop - Render on desktop
 * @returns {boolean} - Whether to render
 */
export const useResponsiveRender = (config) => {
  const deviceCategory = useDeviceCategory();
  
  if (typeof config === 'boolean') {
    return config;
  }
  
  if (typeof config === 'function') {
    const screenInfo = useScreenInfo();
    return config(screenInfo);
  }
  
  if (typeof config === 'object') {
    const rule = config[deviceCategory];
    
    if (typeof rule === 'boolean') {
      return rule;
    }
    
    if (typeof rule === 'function') {
      const screenInfo = useScreenInfo();
      return rule(screenInfo);
    }
    
    // Default to true if no rule specified for current device
    return true;
  }
  
  return true;
};

/**
 * Debug hook to log media query changes (for development only)
 */
export const useMediaQueryDebug = (query) => {
  const matches = useMediaQuery(query, { debug: true });
  
  useEffect(() => {
    console.log(`[useMediaQueryDebug] "${query}": ${matches}`);
  }, [matches, query]);
  
  return matches;
};

export default useMediaQuery;