'use client';

import { useEffect } from 'react';

export default function ViewportFix() {
  useEffect(() => {
    const updateHeight = () => {
      // Use window.innerHeight as it is the most reliable measure on iOS
      const actualHeight = window.innerHeight;
      document.documentElement.style.setProperty('--app-height', `${actualHeight}px`);
    };

    // Initial set
    updateHeight();

    // Re-check after a short delay because iOS often reports wrong height on first load
    const timer = setTimeout(updateHeight, 500);

    // Update on resize or orientation change
    window.addEventListener('resize', updateHeight);
    window.addEventListener('orientationchange', updateHeight);

    // Also update on scroll just in case the browser UI bars move
    window.addEventListener('scroll', updateHeight);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', updateHeight);
      window.removeEventListener('orientationchange', updateHeight);
      window.removeEventListener('scroll', updateHeight);
    };
  }, []);

  return null;
}
