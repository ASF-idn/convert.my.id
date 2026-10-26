'use client';

import { useEffect } from 'react';

interface MonetagVignetteProps {
  /**
   * Monetag Vignette Zone ID.
   */
  zoneId?: string;
  /**
   * Monetag Vignette script domain/URL.
   */
  scriptDomain?: string;
}

/**
 * Clean Vignette Banner Component for Monetag on convert.my.id.
 * Uses useEffect to inject the vignette script safely on the client side only,
 * preventing hydration errors and duplicate executions.
 */
export default function MonetagVignette({
  zoneId = '12126051',
  scriptDomain = 'https://n6wxm.com/vignette.min.js',
}: MonetagVignetteProps) {
  useEffect(() => {
    // Pastikan tidak ada duplikat script dengan ID yang sama
    const scriptId = `monetag-vignette-${zoneId}`;
    if (document.getElementById(scriptId)) return;

    const script = document.createElement('script');
    script.id = scriptId;
    script.type = 'text/javascript';
    script.async = true;
    script.dataset.zone = zoneId.trim();
    script.src = scriptDomain;

    document.body.appendChild(script);

    return () => {
      const existingScript = document.getElementById(scriptId);
      if (existingScript) {
        existingScript.remove();
      }
    };
  }, [zoneId, scriptDomain]);

  return null; // Vignette banner bersifat overlay otomatis, tidak memerlukan kontainer HTML khusus
}