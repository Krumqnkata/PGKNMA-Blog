import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

import { recordPageView } from '@/lib/api';

const TRACK_DELAY_MS = 750;

export default function PageViewTracker() {
  const location = useLocation();
  const lastTrackedPath = useRef<string | null>(null);

  useEffect(() => {
    const path = location.pathname;
    if (lastTrackedPath.current === path) return;

    const timeoutId = window.setTimeout(() => {
      lastTrackedPath.current = path;
      void recordPageView(path).catch(() => {
        // Analytics must never interrupt navigation or show an error to visitors.
      });
    }, TRACK_DELAY_MS);

    return () => window.clearTimeout(timeoutId);
  }, [location.pathname]);

  return null;
}
