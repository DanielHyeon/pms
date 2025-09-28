import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Alert, AlertDescription } from './ui/alert';
import { Progress } from './ui/progress';
import { AlertTriangle, TrendingDown, TrendingUp, RefreshCw } from 'lucide-react';
import { useRiskOverview } from '../hooks/useRiskOverview';

interface RiskDashboardPageProps {
  projectId: string;
}

export function RiskDashboardPage({ projectId }: RiskDashboardPageProps) {
  const { risk, isLoading, error, reanalyze } = useRiskOverview(projectId);

  if (isLoading) {
    return <p className="text-sm text-muted-foreground">리스크 데이터를 불러오는 중입니다...</p>;
  }

  if (error) {
    return <p className="text-sm text-destructive">리스크 데이터를 불러오는 중 오류가 발생했습니다.</p>;
  }

  if (!risk) {
    return <p className="text-sm text-muted-foreground">리스크 데이터가 없습니다.</p>;
  }

  const { snapshot, insights } = risk;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-medium">프로젝트 리스크 현황</h2>
          <p className="text-muted-foreground">현재 예측 리스크와 권장 조치를 확인하세요.</p>
        </div>
        <Button variant="outline" size="sm" onClick={reanalyze}>
          <RefreshCw className="w-4 h-4 mr-2" /> AI 재분석
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            전체 리스크 지수: {snapshot.overallRiskScore.toFixed(1)}
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge variant="outline">완료 확률</Badge>
              <span className="font-medium">{snapshot.completionProbability.toFixed(1)}%</span>
            </div>
            <Progress value={snapshot.completionProbability} />
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge variant="outline">예상 완료일</Badge>
              <span className="font-medium">{snapshot.predictedCompletionDate}</span>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-green-600" />
              <span>총 작업: {snapshot.totalTasks}</span>
            </div>
            <div className="flex items-center gap-2">
              <TrendingDown className="h-4 w-4 text-orange-600" />
              <span>위험 작업: {snapshot.highRiskTasks}</span>
            </div>
          </div>
          <div className="space-y-2">
            <p>팀 가용성: {snapshot.teamUtilization}%</p>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        {insights.map((insight) => (
          <Alert key={insight.id} variant={insight.type === 'critical' ? 'destructive' : 'default'}>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <p className="font-medium">{insight.title}</p>
              <p className="mt-1 text-sm text-muted-foreground">{insight.description}</p>
            </AlertDescription>
          </Alert>
        ))}
        {insights.length === 0 && (
          <p className="text-sm text-muted-foreground">추가 리스크 인사이트가 없습니다.</p>
        )}
      </div>
    </div>
  );
}
