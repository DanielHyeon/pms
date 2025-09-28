import { useCallback, useEffect, useState } from 'react';
import { fetchQualityOverview } from '../api';
import type { QualityOverview } from '../api/types';
import { useAuth } from '../context/AuthContext';

interface UseQualityOverviewResult {
  quality: QualityOverview | null;
  isLoading: boolean;
  error: string | null;
  refresh: () => void;
}

export function useQualityOverview(projectId: string): UseQualityOverviewResult {
  const { token } = useAuth();
  const [quality, setQuality] = useState<QualityOverview | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadQuality = useCallback(() => {
    if (!token) {
      setQuality(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    fetchQualityOverview(projectId, token)
      .then((data) => setQuality(data))
      .catch((err) => {
        console.error('Failed to fetch quality overview', err);
        setError('품질 지표를 불러오는 중 문제가 발생했습니다.');
        setQuality(null);
      })
      .finally(() => setIsLoading(false));
  }, [projectId, token]);

  useEffect(() => {
    loadQuality();
  }, [loadQuality]);

  return {
    quality,
    isLoading,
    error,
    refresh: loadQuality,
  };
}
