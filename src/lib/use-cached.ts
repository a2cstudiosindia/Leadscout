"use client";

import { useEffect, useState } from "react";

// Stale-while-revalidate for server actions. Server actions run one at a time,
// so repeated calls stack up; this shows cached data instantly and dedupes
// concurrent calls with the same key.
const inflight = new Map<string, Promise<unknown>>();
// JSON turns Infinity into null; keep plan limits intact.
const enc = (_: string, v: unknown) => (v === Infinity ? "__inf__" : v);
const dec = (_: string, v: unknown) => (v === "__inf__" ? Infinity : v);

function readStorage<T>(key: string): T | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(key);
    return raw ? (JSON.parse(raw, dec) as T) : null;
  } catch {
    return null;
  }
}

export function useCached<T>(key: string, fetcher: () => Promise<T>) {
  const [data, setData] = useState<T | null>(() => readStorage<T>(key));
  const [loading, setLoading] = useState<boolean>(() => !readStorage<T>(key));

  useEffect(() => {
    let live = true;
    const cached = readStorage<T>(key);
    if (cached && !data) {
      setData(cached);
      setLoading(false);
    }

    let p = inflight.get(key) as Promise<T> | undefined;
    if (!p) {
      p = fetcher().finally(() => inflight.delete(key));
      inflight.set(key, p);
    }
    p.then((v) => {
      if (!live) return;
      setData(v);
      setLoading(false);
      try {
        sessionStorage.setItem(key, JSON.stringify(v, enc));
      } catch {}
    }).catch(() => {
      if (live) setLoading(false);
    });

    return () => {
      live = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  return { data, loading };
}
