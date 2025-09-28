import { useCallback, useEffect, useState } from 'react';
import { createSprint, fetchSprints } from '../api';
import type { Sprint, SprintCreatePayload } from '../api/types';
import { useAuth } from '../context/AuthContext';

interface UseProjectSprintsResult {
  sprints: Sprint[];
  isLoading: boolean;
  error: string | null;
  refresh: () => void;
  createSprint: (payload: SprintCreatePayload) => Promise<Sprint | null>;
}

export function useProjectSprints(projectId: string): UseProjectSprintsResult {
  const { token } = useAuth();
  const [sprints, setSprints] = useState<Sprint[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadSprints = useCallback(() => {
    if (!token) {
      setSprints([]);
      return;
    }
    setIsLoading(true);
    setError(null);

    fetchSprints(projectId, token)
      .then((data) => setSprints(data))
      .catch((err) => {
        console.error('Failed to fetch sprints', err);
        setError('스프린트 정보를 불러오는 중 문제가 발생했습니다.');
        setSprints([]);
      })
      .finally(() => setIsLoading(false));
  }, [projectId, token]);

  useEffect(() => {
    loadSprints();
  }, [loadSprints]);

  const handleCreate = useCallback(
    async (payload: SprintCreatePayload) => {
      if (!token) {
        return null;
      }
      try {
        const created = await createSprint(projectId, payload, token);
        setSprints((prev) => [...prev, created]);
        return created;
      } catch (err) {
        console.error('Failed to create sprint', err);
        setError('스프린트 생성 중 문제가 발생했습니다.');
        return null;
      }
    },
    [projectId, token],
  );

  return {
    sprints,
    isLoading,
    error,
    refresh: loadSprints,
    createSprint: handleCreate,
  };
}
