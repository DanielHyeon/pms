import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { useQualityOverview } from '../hooks/useQualityOverview';

interface QualityDashboardPageProps {
  projectId: string;
}

export function QualityDashboardPage({ projectId }: QualityDashboardPageProps) {
  const { quality, isLoading, error } = useQualityOverview(projectId);

  if (isLoading) {
    return <p className="text-sm text-muted-foreground">품질 지표를 불러오는 중입니다...</p>;
  }

  if (error) {
    return <p className="text-sm text-destructive">품질 데이터를 불러오는 중 오류가 발생했습니다.</p>;
  }

  if (!quality) {
    return <p className="text-sm text-muted-foreground">품질 지표가 등록되지 않았습니다.</p>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-medium">품질 대시보드</h2>
        <p className="text-muted-foreground">코드 품질과 분석 결과를 확인하세요.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>핵심 지표</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <div>
            <p className="text-sm text-muted-foreground">코드 복잡도</p>
            <p className="text-2xl font-semibold">{quality.metrics.codeComplexity.toFixed(1)}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">테스트 커버리지</p>
            <div className="flex items-center gap-2">
              <p className="text-2xl font-semibold">{quality.metrics.testCoverage}%</p>
              <Progress value={quality.metrics.testCoverage} className="h-2" />
            </div>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">버그 밀도</p>
            <p className="text-2xl font-semibold">{quality.metrics.bugDensity.toFixed(2)}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">중복 코드</p>
            <p className="text-2xl font-semibold">{quality.metrics.duplicateCodeRate.toFixed(2)}%</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">기술 부채</p>
            <p className="text-2xl font-semibold">{quality.metrics.technicalDebt.toFixed(1)}일</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">유지보수 지수</p>
            <p className="text-2xl font-semibold">{quality.metrics.maintainabilityIndex.toFixed(1)}</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>최근 추세</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          {quality.trend.map((point) => (
            <div key={point.date} className="flex items-center justify-between rounded-md border p-3">
              <span className="font-medium text-foreground">{point.date}</span>
              <div className="flex gap-6">
                <span>복잡도 {point.complexity.toFixed(1)}</span>
                <span>커버리지 {point.coverage.toFixed(1)}%</span>
                <span>버그 {point.bugs.toFixed(1)}</span>
                <span>성능 {point.performance.toFixed(1)}</span>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>파일별 품질</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {quality.files.map((file) => (
            <div key={file.file} className="rounded-md border p-3">
              <div className="flex items-center justify-between">
                <span className="font-medium">{file.file}</span>
                <Badge variant="outline">위험도: {file.risk}</Badge>
              </div>
              <div className="mt-2 grid gap-2 text-xs text-muted-foreground md:grid-cols-4">
                <span>복잡도 {file.complexity.toFixed(1)}</span>
                <span>커버리지 {file.coverage.toFixed(1)}%</span>
                <span>이슈 {file.issues}</span>
                <span>라인 수 {file.size}</span>
              </div>
            </div>
          ))}
          {quality.files.length === 0 && <p className="text-sm text-muted-foreground">분석된 파일이 없습니다.</p>}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>코드 분석 요약</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-2 text-sm text-muted-foreground md:grid-cols-2">
          <span>총 라인 수: {quality.analysis.totalLines}</span>
          <span>프로덕션 라인: {quality.analysis.productionLines}</span>
          <span>테스트 라인: {quality.analysis.testLines}</span>
          <span>주석 라인: {quality.analysis.commentLines}</span>
          <span>분석 파일: {quality.analysis.filesAnalyzed}</span>
          <span>마지막 분석: {new Date(quality.analysis.lastAnalysis).toLocaleString('ko-KR')}</span>
        </CardContent>
      </Card>
    </div>
  );
}
