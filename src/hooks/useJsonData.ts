import { useEffect, useState } from "react";

interface FetchState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

/** Fetches a static JSON / GeoJSON file from /public/data once and caches it in memory. */
const cache = new Map<string, unknown>();

export function useJsonData<T>(url: string): FetchState<T> {
  const [state, setState] = useState<FetchState<T>>(() => {
    if (cache.has(url)) {
      return { data: cache.get(url) as T, loading: false, error: null };
    }
    return { data: null, loading: true, error: null };
  });

  useEffect(() => {
    if (cache.has(url)) {
      setState({ data: cache.get(url) as T, loading: false, error: null });
      return;
    }
    let cancelled = false;
    setState({ data: null, loading: true, error: null });
    fetch(url)
      .then((res) => {
        if (!res.ok) throw new Error(`Failed to load ${url}: ${res.status}`);
        return res.json();
      })
      .then((json) => {
        if (cancelled) return;
        cache.set(url, json);
        setState({ data: json as T, loading: false, error: null });
      })
      .catch((err: Error) => {
        if (cancelled) return;
        setState({ data: null, loading: false, error: err.message });
      });
    return () => {
      cancelled = true;
    };
  }, [url]);

  return state;
}
