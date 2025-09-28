import { useCallback, useEffect, useState } from 'react';
import { createRequirement, fetchRequirements, updateRequirement } from '../api';
import type {
  Requirement,
  RequirementCreatePayload,
  RequirementUpdatePayload,
} from '../api/types';
import { useAuth } from '../context/AuthContext';

interface UseProjectRequirementsResult {
  requirements: Requirement[];
  isLoading: boolean;
  error: string | null;
  refresh: () => void;
  createRequirement: (payload: RequirementCreatePayload) => Promise<Requirement | null>;
  updateRequirement: (
    requirementId: string,
    payload: RequirementUpdatePayload,
  ) => Promise<Requirement | null>;
}

export function useProjectRequirements(projectId: string): UseProjectRequirementsResult {
  const { token } = useAuth();
  const [requirements, setRequirements] = useState<Requirement[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadRequirements = useCallback(() => {
    if (!token) {
      setRequirements([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    fetchRequirements(projectId, token)
      .then((data) => setRequirements(data))
      .catch((err) => {
        console.error('Failed to fetch requirements', err);
        setError('요구사항을 불러오는 중 문제가 발생했습니다.');
        setRequirements([]);
      })
      .finally(() => setIsLoading(false));
  }, [projectId, token]);

  useEffect(() => {
    loadRequirements();
  }, [loadRequirements]);

  const handleCreate = useCallback(
    async (payload: RequirementCreatePayload) => {
      if (!token) {
        return null;
      }
      try {
        const created = await createRequirement(projectId, payload, token);
        setRequirements((prev) => [...prev, created]);
        return created;
      } catch (err) {
        console.error('Failed to create requirement', err);
        setError('요구사항 생성 중 문제가 발생했습니다.');
        return null;
      }
    },
    [projectId, token],
  );

  const handleUpdate = useCallback(
    async (requirementId: string, payload: RequirementUpdatePayload) => {
      if (!token) {
        return null;
      }
      try {
        const updated = await updateRequirement(projectId, requirementId, payload, token);
        setRequirements((prev) => prev.map((req) => (req.id === requirementId ? updated : req)));
        return updated;
      } catch (err) {
        console.error('Failed to update requirement', err);
        setError('요구사항 수정 중 문제가 발생했습니다.');
        return null;
      }
    },
    [projectId, token],
  );

  return {
    requirements,
    isLoading,
    error,
    refresh: loadRequirements,
    createRequirement: handleCreate,
    updateRequirement: handleUpdate,
  };
}
