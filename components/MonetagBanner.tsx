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
    const resolvedZoneId =
      !zoneId || zoneId.trim() === '' || zoneId.trim() === 'ISI_ZONE_ID_NANTI'
        ? '12126051'
        : zoneId.trim();

    // Pastikan tidak ada duplikat script dengan Zone ID yang sama
    if (document.querySelector(`script[data-zone="${resolvedZoneId}"]`)) {
      return;
    }

    (function (s) {
      s.dataset.zone = resolvedZoneId;
      s.src = scriptDomain;
    })(
      [document.documentElement, document.body]
        .filter(Boolean)
        .pop()!
        .appendChild(document.createElement('script'))
    );
  }, [zoneId, scriptDomain]);

  return null; // Vignette banner bersifat overlay otomatis, tidak memerlukan kontainer HTML khusus
}