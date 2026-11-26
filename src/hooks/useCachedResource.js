import { useEffect, useSyncExternalStore } from 'react';
import {
  getResourceSnapshot,
  loadResource,
  subscribeToResource,
} from '../utils/resourceCache';

const DEFAULT_STALE_TIME = 60_000;

export function useCachedResource(
  key,
  fetcher,
  staleTime = DEFAULT_STALE_TIME,
) {
  const snapshot = useSyncExternalStore(
    (listener) => subscribeToResource(key, listener),
    () => getResourceSnapshot(key),
    () => getResourceSnapshot(key),
  );

  useEffect(() => {
    loadResource(key, fetcher, staleTime).catch(() => {
      // The error is exposed through the resource snapshot.
    });

    function refreshResource() {
      loadResource(key, fetcher, staleTime).catch(() => {
        // The error is exposed through the resource snapshot.
      });
    }

    window.addEventListener('focus', refreshResource);
    document.addEventListener('visibilitychange', refreshResource);

    return () => {
      window.removeEventListener('focus', refreshResource);
      document.removeEventListener('visibilitychange', refreshResource);
    };
  }, [fetcher, key, snapshot.updatedAt, staleTime]);

  return snapshot;
}
