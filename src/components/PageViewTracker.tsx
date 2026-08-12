import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useLocation } from 'react-router-dom';

import { recordPageView, type Post } from '@/lib/api';

const TRACK_DELAY_MS = 750;

export default function PageViewTracker() {
  const location = useLocation();
  const queryClient = useQueryClient();
  const lastTrackedPath = useRef<string | null>(null);

  useEffect(() => {
    const path = location.pathname;
    if (lastTrackedPath.current === path) return;

    const timeoutId = window.setTimeout(() => {
      lastTrackedPath.current = path;
      void recordPageView(path)
        .then(() => {
          const postMatch = path.match(/^\/post\/(\d+)\/?$/);
          if (!postMatch) return;
          queryClient.setQueryData<Post | null>(['post', postMatch[1]], (current) => (
            current
              ? { ...current, views_this_month: (current.views_this_month ?? 0) + 1 }
              : current
          ));
        })
        .catch(() => {
          // Analytics must never interrupt navigation or show an error to visitors.
        });
    }, TRACK_DELAY_MS);

    return () => window.clearTimeout(timeoutId);
  }, [location.pathname, queryClient]);

  return null;
}
