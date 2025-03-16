import { useState, useCallback } from 'react';

interface ApiOptions<T> {
  endpoint: string;
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  body?: any;
  headers?: Record<string, string>;
  onSuccess?: (data: T) => void;
  onError?: (error: Error) => void;
}

interface ApiState<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
}

export function useApi<T>() {
  const [state, setState] = useState<ApiState<T>>({
    data: null,
    loading: false,
    error: null,
  });

  const fetchData = useCallback(
    async ({ endpoint, method = 'GET', body, headers, onSuccess, onError }: ApiOptions<T>) => {
      setState((prev) => ({ ...prev, loading: true, error: null }));

      try {
        const response = await fetch(endpoint, {
          method,
          headers: {
            'Content-Type': 'application/json',
            ...headers,
          },
          body: body ? JSON.stringify(body) : undefined,
        });

        if (!response.ok) {
          throw new Error(`API 请求失败: ${response.status} ${response.statusText}`);
        }

        const responseData = await response.json();
        const typedData = responseData as T;
        setState({ data: typedData, loading: false, error: null });
        onSuccess?.(typedData);
        return typedData;
      } catch (error) {
        const errorObj = error instanceof Error ? error : new Error(String(error));
        setState((prev) => ({ ...prev, loading: false, error: errorObj }));
        onError?.(errorObj);
        throw errorObj;
      }
    },
    []
  );

  return {
    ...state,
    fetchData,
    reset: useCallback(() => {
      setState({ data: null, loading: false, error: null });
    }, []),
  };
}
