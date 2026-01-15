import { useState, useEffect, useCallback } from 'react';

// Common breakpoints for responsive design
export const BREAKPOINTS = {
  xs: '(max-width: 480px)',
  sm: '(min-width: 481px) and (max-width: 768px)',
  md: '(min-width: 769px) and (max-width: 1024px)',
  lg: '(min-width: 1025px) and (max-width: 1440px)',
  xl: '(min-width: 1441px)',
  mobile: '(max-width: 768px)',
  tablet: '(min-width: 769px) and (max-width: 1024px)',
  desktop: '(min-width: 1025px)',
  portrait: '(orientation: portrait)',
  landscape: '(orientation: landscape)',
  dark: '(prefers-color-scheme: dark)',
  light: '(prefers-color-scheme: light)',
  reducedMotion: '(prefers-reduced-motion: reduce)',
  hover: '(hover: hover) and (pointer: fine)',
  touch: '(hover: none) and (pointer: coarse)'
};

/**
 * Custom hook for responsive media queries
 * @param {string|keyof BREAKPOINTS} query - CSS media query string or breakpoint key
 * @returns {boolean} - Whether the media query matches
 */
const useMediaQuery = (query) => {
  // Resolve breakpoint key to actual query if needed
  const mediaQuery = BREAKPOINTS[query] || query;
  
  // Check if window is defined (for SSR compatibility)
  const canUseDOM = typeof window !== 'undefined';
  
  // Get the initial value
  const getMatches = useCallback(() => {
    if (!canUseDOM) return false;
    
    try {
      return window.matchMedia(mediaQuery).matches;
    } catch (error) {
      console.error('Error evaluating media query:', error, 'Query:', mediaQuery);
      return false;
    }
  }, [mediaQuery, canUseDOM]);

  const [matches, setMatches] = useState(getMatches);

  useEffect(() => {
    if (!canUseDOM) return;

    let mediaQueryList;
    try {
      mediaQueryList = window.matchMedia(mediaQuery);
    } catch (error) {
      console.error('Error creating media query:', error, 'Query:', mediaQuery);
      return;
    }
    
    // Update state initially
    setMatches(mediaQueryList.matches);
    
    // Handler for media query changes
    const handleChange = (event) => {
      setMatches(event.matches);
    };

    try {
      // Modern browsers support addEventListener
      if (mediaQueryList.addEventListener) {
        mediaQueryList.addEventListener('change', handleChange);
      } else {
        // Fallback for older browsers
        mediaQueryList.addListener(handleChange);
      }
    } catch (error) {
      console.error('Error attaching media query listener:', error);
    }

    // Cleanup function
    return () => {
      if (!canUseDOM || !mediaQueryList) return;

      try {
        if (mediaQueryList.removeEventListener) {
          mediaQueryList.removeEventListener('change', handleChange);
        } else {
          // Fallback for older browsers
          mediaQueryList.removeListener(handleChange);
        }
      } catch (error) {
        console.error('Error removing media query listener:', error);
      }
    };
  }, [mediaQuery, canUseDOM]);

  return matches;
};

// Convenience hooks for common breakpoints
export const useIsMobile = () => useMediaQuery('mobile');
export const useIsTablet = () => useMediaQuery('tablet');
export const useIsDesktop = () => useMediaQuery('desktop');
export const useIsSmallScreen = () => useMediaQuery('(max-width: 1024px)');
export const useIsLargeScreen = () => useMediaQuery('(min-width: 1025px)');
export const useIsDarkMode = () => useMediaQuery('dark');
export const useIsReducedMotion = () => useMediaQuery('reducedMotion');
export const useHasHover = () => useMediaQuery('hover');
export const useIsTouch = () => useMediaQuery('touch');

export default useMediaQuery;