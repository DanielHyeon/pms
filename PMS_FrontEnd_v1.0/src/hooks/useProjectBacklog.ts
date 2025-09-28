import { useCallback, useEffect, useState } from 'react';
import { createBacklogItem, fetchBacklogItems } from '../api';
import type { BacklogItem, BacklogItemCreatePayload } from '../api/types';
import { useAuth } from '../context/AuthContext';

interface UseProjectBacklogResult {
  backlogItems: BacklogItem[];
  isLoading: boolean;
  error: string | null;
  refresh: () => void;
  createBacklogItem: (payload: BacklogItemCreatePayload) => Promise<BacklogItem | null>;
}

export function useProjectBacklog(projectId: string): UseProjectBacklogResult {
  const { token } = useAuth();
  const [backlogItems, setBacklogItems] = useState<BacklogItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadItems = useCallback(() => {
    if (!token) {
      setBacklogItems([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    fetchBacklogItems(projectId, token)
      .then((data) => setBacklogItems(data))
      .catch((err) => {
        console.error('Failed to fetch backlog items', err);
        setError('백로그 항목을 불러오는 중 문제가 발생했습니다.');
        setBacklogItems([]);
      })
      .finally(() => setIsLoading(false));
  }, [projectId, token]);

  useEffect(() => {
    loadItems();
  }, [loadItems]);

  const handleCreate = useCallback(
    async (payload: BacklogItemCreatePayload) => {
      if (!token) {
        return null;
      }
      try {
        const created = await createBacklogItem(projectId, payload, token);
        setBacklogItems((prev) => [...prev, created]);
        return created;
      } catch (err) {
        console.error('Failed to create backlog item', err);
        setError('백로그 항목 생성 중 문제가 발생했습니다.');
        return null;
      }
    },
    [projectId, token],
  );

  return {
    backlogItems,
    isLoading,
    error,
    refresh: loadItems,
    createBacklogItem: handleCreate,
  };
}
