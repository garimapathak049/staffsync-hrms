import { useEffect, useState } from 'react';
import api, { errMsg } from '../services/api';
import { toast } from './toast';
export function useFetch(url, params) {
  const [data, setData] = useState(null), [loading, setLoading] = useState(true), [error, setError] = useState(null), [n, setN] = useState(0);
  useEffect(() => {
    let on = true; setLoading(true); setError(null);
    api.get(url, { params }).then((r) => on && setData(r.data)).catch((e) => on && setError(errMsg(e))).finally(() => on && setLoading(false));
    return () => { on = false; };
  }, [url, JSON.stringify(params), n]);
  return { data, loading, error, reload: () => setN((x) => x + 1) };
}
// Run an API action; toast result; call reload on success. Never fakes success.
export const act = async (promise, ok, after) => { try { await promise; if (ok) toast(ok); after?.(); return true; } catch (e) { toast(errMsg(e), 'danger'); return false; } };
export const fmt = (d) => (d ? new Date(d).toLocaleDateString() : '—');
export const fmtT = (d) => (d ? new Date(d).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—');
