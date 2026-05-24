'use client';

import { useEffect } from 'react';

export default function ViewportFix() {
  useEffect(() => {
    const updateHeight = () => {
      // Set the actual height of the window to a CSS variable
      document.documentElement.style.setProperty('--app-height', `${window.innerHeight}px`);
    };

    // Initial set
    updateHeight();

    // Update on resize or orientation change
    window.addEventListener('resize', updateHeight);
    window.addEventListener('orientationchange', updateHeight);

    return () => {
      window.removeEventListener('resize', updateHeight);
      window.removeEventListener('orientationchange', updateHeight);
    };
  }, []);

  return null; // This component doesn't render anything
}
