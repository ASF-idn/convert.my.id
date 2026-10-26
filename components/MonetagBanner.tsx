'use client';

import { useEffect, useRef } from 'react';

interface MonetagBannerProps {
  /**
   * Monetag Native Banner Zone ID.
   * Replace "ISI_ZONE_ID_NANTI" with your actual numeric Zone ID from the Monetag dashboard.
   */
  zoneId: string;
  /**
   * Optional custom Monetag script domain/URL if provided in your Monetag dashboard.
   */
  scriptDomain?: string;
  className?: string;
}

/**
 * Clean Native Banner Component for Monetag on convert.my.id.
 * Uses useRef + useEffect to dynamically inject the ad <script> on the client only,
 * preventing React 18 Hydration mismatches and Strict Mode duplicate script execution.
 */
export default function MonetagBanner({
  zoneId,
  scriptDomain = 'https://al5sm.com/tag.min.js',
  className = '',
}: MonetagBannerProps) {
  const adContainerRef = useRef<HTMLDivElement>(null);
  const injectedZoneRef = useRef<string | null>(null);

  useEffect(() => {
    const container = adContainerRef.current;
    if (!container) return;

    // Prevent duplicate injection in React 18 Strict Mode for the same zoneId
    if (injectedZoneRef.current === zoneId) return;

    // Clear previous children before injecting
    container.innerHTML = '';

    // Do not request remote ad script while placeholder ID is still active
    const isPlaceholder =
      !zoneId ||
      zoneId.trim() === '' ||
      zoneId.trim() === 'ISI_ZONE_ID_NANTI';

    if (isPlaceholder) {
      injectedZoneRef.current = zoneId;
      return;
    }

    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.async = true;
    script.setAttribute('data-cfasync', 'false');
    script.dataset.zone = zoneId.trim();
    script.src = scriptDomain;

    container.appendChild(script);
    injectedZoneRef.current = zoneId;

    return () => {
      if (container) {
        container.innerHTML = '';
      }
      injectedZoneRef.current = null;
    };
  }, [zoneId, scriptDomain]);

  return (
    <div className={`my-6 w-full overflow-hidden ${className}`}>
      <div
        id={`monetag-native-banner-${zoneId}`}
        ref={adContainerRef}
        className="flex w-full items-center justify-center overflow-hidden"
      />
    </div>
  );
}
