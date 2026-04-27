import { useCallback, useEffect, useState } from "react";
import api from "../services/api";

export default function useFetch(endpoint, { immediate = true, method = "get", body } = {}) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(immediate);
  const [error, setError] = useState(null);

  const execute = useCallback(
    async (overrideBody) => {
      setLoading(true);
      setError(null);
      try {
        const result = method === "get" || method === "delete"
          ? await api[method](endpoint)
          : await api[method](endpoint, overrideBody ?? body);
        setData(result);
        return result;
      } catch (err) {
        setError(err.message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [body, endpoint, method]
  );

  useEffect(() => {
    if (immediate && endpoint) execute();
  }, [execute, endpoint, immediate]);

  return { data, loading, error, refetch: execute };
}
