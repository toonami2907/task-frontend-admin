import { useState, useEffect } from 'react';

export const useMediaQuery = (query) => {
  // Initialize with a default value based on the current window size
  const [matches, setMatches] = useState(
    () => window.matchMedia(query).matches
  );

  useEffect(() => {
    // Create a MediaQueryList object
    const mediaQuery = window.matchMedia(query);

    // Define the callback function
    const handleChange = (event) => {
      setMatches(event.matches);
    };

    // Add the listener
    mediaQuery.addEventListener('change', handleChange);

    // Set initial value
    setMatches(mediaQuery.matches);

    // Cleanup function
    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, [query]); // Only re-run if query changes

  return matches;
};

// Example breakpoint constants
export const breakpoints = {
  sm: '(min-width: 640px)',
  md: '(min-width: 768px)',
  lg: '(min-width: 1024px)',
  xl: '(min-width: 1280px)',
  '2xl': '(min-width: 1536px)',
  // Mobile first approach
  mobile: '(max-width: 767px)',
  tablet: '(min-width: 768px) and (max-width: 1023px)',
  desktop: '(min-width: 1024px)',
  // Custom queries
  dark: '(prefers-color-scheme: dark)',
  light: '(prefers-color-scheme: light)',
  portrait: '(orientation: portrait)',
  landscape: '(orientation: landscape)',
  retina: '(-webkit-min-device-pixel-ratio: 2), (min-resolution: 192dpi)',
};