import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { ScrollTrigger } from '../../utils/gsapSetup';

interface SmoothScrollProviderProps {
  children: React.ReactNode;
}

/**
 * Scroll Provider
 * Maintains 100% native, instant, responsive scroll speed without artificial damping/inertia,
 * while ensuring ScrollTrigger refreshes and window resets to top on route changes.
 */
export default function SmoothScrollProvider({ children }: SmoothScrollProviderProps) {
  const location = useLocation();

  useEffect(() => {
    if (!window.location.hash) {
      window.scrollTo(0, 0);
    }
    const timeout = setTimeout(() => {
      ScrollTrigger.refresh();
    }, 100);

    return () => clearTimeout(timeout);
  }, [location.pathname]);

  return <>{children}</>;
}
