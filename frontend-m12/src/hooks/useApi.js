import { useState, useEffect, useCallback } from 'react';

// Hook fetch data tự động
export function useApi(apiFn, deps = []) {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');

  const fetch = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await apiFn();
      setData(res.data);
    } catch (e) {
      setError(e.response?.data?.message || 'Có lỗi xảy ra');
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => { fetch(); }, [fetch]);

  return { data, loading, error, refetch: fetch };
}

// Hook action (POST/PUT/DELETE)
export function useAction() {
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  const [success, setSuccess] = useState('');

  const run = async (apiFn, successMsg = 'Thành công!') => {
    setLoading(true); setError(''); setSuccess('');
    try {
      const res = await apiFn();
      setSuccess(successMsg);
      setTimeout(() => setSuccess(''), 3000);
      return { ok: true, data: res.data };
    } catch (e) {
      const msg = e.response?.data?.message
        || e.response?.data?.errors?.[0]
        || 'Có lỗi xảy ra!';
      setError(msg);
      setTimeout(() => setError(''), 4000);
      return { ok: false };
    } finally {
      setLoading(false);
    }
  };

  return { loading, error, success, run };
}
