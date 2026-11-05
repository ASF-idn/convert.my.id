'use client';

import { useEffect } from 'react';

interface MonetagInPagePushProps {
  /**
   * Monetag In-Page Push Zone ID.
   */
  zoneId?: string;
  /**
   * Monetag In-Page Push script domain/URL.
   */
  scriptDomain?: string;
}

/**
 * Clean In-Page Push Banner Component for Monetag on convert.my.id.
 * Uses useEffect to inject the in-page push script safely on the client side only,
 * preventing hydration errors and duplicate executions.
 */
export default function MonetagBanner({
  zoneId = '12194738',
  scriptDomain = 'https://nap5k.com/tag.min.js',
}: MonetagInPagePushProps) {
  useEffect(() => {
    const resolvedZoneId =
      !zoneId || zoneId.trim() === '' || zoneId.trim() === 'ISI_ZONE_ID_NANTI'
        ? '12194738'
        : zoneId.trim();

    const timer = window.setTimeout(() => {
      if (!document.querySelector(`script[data-zone="${resolvedZoneId}"]`)) {
        (function (s) {
          s.dataset.zone = resolvedZoneId;
          s.src = scriptDomain;
        })(document.body.appendChild(document.createElement('script')));
      }

      if (!document.querySelector('script[data-zone="12126051"]')) {
        (function (s) {
          s.dataset.zone = '12126051';
          s.src = 'https://n6wxm.com/vignette.min.js';
        })(document.body.appendChild(document.createElement('script')));
      }
    }, 800);

    return () => window.clearTimeout(timer);
  }, [zoneId, scriptDomain]);

  return null;
}