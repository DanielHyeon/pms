import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { useProjectSprints } from '../hooks/useProjectSprints';
import type { User } from '../api/types';

interface ScrumMetricsPageProps {
  projectId: string;
  user: User;
}

export function ScrumMetricsPage({ projectId }: ScrumMetricsPageProps) {
  const { sprints, isLoading, error } = useProjectSprints(projectId);

  const metrics = useMemo(() => {
    if (sprints.length === 0) {
      return {
        averageCapacity: 0,
        averageVelocity: 0,
        completedSprints: 0,
      };
    }

    const completed = sprints.filter((sprint) => sprint.status === 'completed');
    const averageCapacity = completed.reduce((sum, sprint) => sum + (sprint.capacity ?? 0), 0) /
      (completed.length || 1);
    const averageVelocity = completed.reduce((sum, sprint) => sum + (sprint.completed ?? 0), 0) /
      (completed.length || 1);

    return {
      averageCapacity: Math.round(averageCapacity),
      averageVelocity: Math.round(averageVelocity),
      completedSprints: completed.length,
    };
  }, [sprints]);

  if (isLoading) {
    return <p className="text-sm text-muted-foreground">스크럼 메트릭을 불러오는 중입니다...</p>;
  }

  if (error) {
    return <p className="text-sm text-destructive">스크럼 메트릭을 불러오는 중 오류가 발생했습니다.</p>;
  }

  if (sprints.length === 0) {
    return <p className="text-sm text-muted-foreground">분석할 스프린트 데이터가 없습니다.</p>;
  }

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card>
        <CardHeader>
          <CardTitle>완료 스프린트</CardTitle>
        </CardHeader>
        <CardContent className="text-3xl font-semibold">
          {metrics.completedSprints}
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>평균 용량</CardTitle>
        </CardHeader>
        <CardContent className="text-3xl font-semibold">
          {metrics.averageCapacity}
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>평균 속도</CardTitle>
        </CardHeader>
        <CardContent className="text-3xl font-semibold">
          {metrics.averageVelocity}
        </CardContent>
      </Card>
    </div>
  );
}
