import { useCallback, useEffect, useState } from 'react';
import { fetchRiskOverview, refreshRiskOverview } from '../api';
import type { RiskOverview } from '../api/types';
import { useAuth } from '../context/AuthContext';

interface UseRiskOverviewResult {
  risk: RiskOverview | null;
  isLoading: boolean;
  error: string | null;
  refresh: () => void;
  reanalyze: () => Promise<void>;
}

export function useRiskOverview(projectId: string): UseRiskOverviewResult {
  const { token } = useAuth();
  const [risk, setRisk] = useState<RiskOverview | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadRisk = useCallback(() => {
    if (!token) {
      setRisk(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    fetchRiskOverview(projectId, token)
      .then((data) => setRisk(data))
      .catch((err) => {
        console.error('Failed to fetch risk overview', err);
        setError('리스크 정보를 불러오는 중 문제가 발생했습니다.');
        setRisk(null);
      })
      .finally(() => setIsLoading(false));
  }, [projectId, token]);

  useEffect(() => {
    loadRisk();
  }, [loadRisk]);

  const handleReanalyze = useCallback(async () => {
    if (!token) {
      return;
    }
    try {
      const updated = await refreshRiskOverview(projectId, token);
      setRisk(updated);
    } catch (err) {
      console.error('Failed to refresh risk overview', err);
      setError('리스크 재분석 중 문제가 발생했습니다.');
    }
  }, [projectId, token]);

  return {
    risk,
    isLoading,
    error,
    refresh: loadRisk,
    reanalyze: handleReanalyze,
  };
}
