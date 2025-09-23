'use client';

import * as React from "react";

const MOBILE_BREAKPOINT = 768;

export function useIsMobile() {
  // Initialize with false for SSR consistency
  const [isMobile, setIsMobile] = React.useState<boolean>(false);

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
    const onChange = (e: MediaQueryListEvent) => {
      // Use MediaQueryList's matches for consistency
      setIsMobile(e.matches);
    };
    
    // Set initial value using MediaQueryList's matches
    setIsMobile(mql.matches);
    mql.addEventListener("change", onChange);
    
    return () => mql.removeEventListener("change", onChange);
  }, []);

  return isMobile;
}
