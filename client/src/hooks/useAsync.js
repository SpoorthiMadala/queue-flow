import { useCallback, useEffect, useState } from 'react';
import { errMsg } from '../services/api.js';

// Loads data on mount; exposes reload for refreshing after actions.
export default function useAsync(fn, deps = []) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const load = useCallback(async () => {
    try { setError(''); setData(await fn()); } catch (e) { setError(errMsg(e)); } finally { setLoading(false); }
  }, deps);
  useEffect(() => { load(); }, [load]);
  return { data, setData, loading, error, reload: load };
}
