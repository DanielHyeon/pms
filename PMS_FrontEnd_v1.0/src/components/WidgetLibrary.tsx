import React, { useState } from 'react';
import { BarChart3, PieChart, TrendingUp, DollarSign, Users, Target, Calendar, AlertTriangle, CheckCircle, Clock, Database, Globe, Zap } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Textarea } from './ui/textarea';

interface WidgetLibraryProps {
  onAddWidget: (type: any, config: any) => void;
}

// 위젯 템플릿 정의
interface WidgetTemplate {
  id: string;
  type: 'kpi' | 'chart' | 'table' | 'metric';
  name: string;
  description: string;
  icon: React.ReactNode;
  category: 'kpi' | 'charts' | 'tables' | 'analytics';
  defaultConfig: any;
  previewData?: any;
}

const widgetTemplates: WidgetTemplate[] = [
  // KPI 위젯들
  {
    id: 'total-projects',
    type: 'kpi',
    name: '전체 프로젝트 수',
    description: '현재 진행 중인 전체 프로젝트 개수',
    icon: <Target className="w-5 h-5" />,
    category: 'kpi',
    defaultConfig: {
      title: '전체 프로젝트 수',
      value: 24,
      target: 20,
      unit: '개',
      trend: 'up',
      trendValue: 4,
      color: 'blue'
    }
  },
  {
    id: 'budget-efficiency',
    type: 'kpi',
    name: '예산 효율성',
    description: '계획 대비 예산 사용 효율성',
    icon: <DollarSign className="w-5 h-5" />,
    category: 'kpi',
    defaultConfig: {
      title: '예산 효율성',
      value: 87,
      target: 85,
      unit: '%',
      trend: 'up',
      trendValue: 5,
      color: 'green'
    }
  },
  {
    id: 'team-productivity',
    type: 'kpi',
    name: '팀 생산성',
    description: '스프린트당 평균 완료 스토리 포인트',
    icon: <Users className="w-5 h-5" />,
    category: 'kpi',
    defaultConfig: {
      title: '팀 생산성',
      value: 78,
      target: 75,
      unit: 'pts',
      trend: 'up',
      trendValue: 8,
      color: 'purple'
    }
  },
  {
    id: 'delivery-rate',
    type: 'kpi',
    name: '정시 배포율',
    description: '계획된 일정 내 배포 성공률',
    icon: <CheckCircle className="w-5 h-5" />,
    category: 'kpi',
    defaultConfig: {
      title: '정시 배포율',
      value: 92,
      target: 90,
      unit: '%',
      trend: 'up',
      trendValue: 2,
      color: 'green'
    }
  },

  // 차트 위젯들
  {
    id: 'monthly-trend',
    type: 'chart',
    name: '월별 성과 추이',
    description: '월별 프로젝트 성과 및 완료율 추이',
    icon: <TrendingUp className="w-5 h-5" />,
    category: 'charts',
    defaultConfig: {
      title: '월별 성과 추이',
      chartType: 'line',
      xAxis: 'month',
      yAxis: 'value',
      color: '#6366f1'
    },
    previewData: [
      { month: '1월', value: 85 },
      { month: '2월', value: 88 },
      { month: '3월', value: 82 },
      { month: '4월', value: 90 },
      { month: '5월', value: 92 },
      { month: '6월', value: 87 }
    ]
  },
  {
    id: 'budget-distribution',
    type: 'chart',
    name: '예산 분배 현황',
    description: '부서별 예산 분배 및 사용 현황',
    icon: <PieChart className="w-5 h-5" />,
    category: 'charts',
    defaultConfig: {
      title: '예산 분배 현황',
      chartType: 'pie',
      dataKey: 'value',
      nameKey: 'department',
      colors: ['#6366f1', '#06b6d4', '#10b981', '#f59e0b']
    },
    previewData: [
      { department: '개발팀', value: 45 },
      { department: 'UX팀', value: 25 },
      { department: '데이터팀', value: 20 },
      { department: '기타', value: 10 }
    ]
  },
  {
    id: 'project-status',
    type: 'chart',
    name: '프로젝트 상태 분포',
    description: '전체 프로젝트의 상태별 분포',
    icon: <BarChart3 className="w-5 h-5" />,
    category: 'charts',
    defaultConfig: {
      title: '프로젝트 상태 분포',
      chartType: 'bar',
      xAxis: 'status',
      yAxis: 'count',
      color: '#8b5cf6'
    },
    previewData: [
      { status: '계획', count: 5 },
      { status: '진행중', count: 12 },
      { status: '대기', count: 3 },
      { status: '완료', count: 8 }
    ]
  },

  // 테이블 위젯들
  {
    id: 'project-list',
    type: 'table',
    name: '프로젝트 목록',
    description: '현재 진행 중인 프로젝트 목록',
    icon: <Database className="w-5 h-5" />,
    category: 'tables',
    defaultConfig: {
      title: '프로젝트 목록',
      columns: ['이름', '상태', '진행률', '담당자'],
      sortable: true,
      pagination: true
    },
    previewData: [
      { name: 'AI 챗봇', status: '진행중', progress: 85, assignee: '김개발' },
      { name: '모바일 앱', status: '계획', progress: 15, assignee: '이기획' },
      { name: '데이터 분석', status: '완료', progress: 100, assignee: '박분석' }
    ]
  },
  {
    id: 'risk-analysis',
    type: 'table',
    name: '위험 요소 분석',
    description: '식별된 프로젝트 위험 요소 목록',
    icon: <AlertTriangle className="w-5 h-5" />,
    category: 'analytics',
    defaultConfig: {
      title: '위험 요소 분석',
      columns: ['위험 요소', '심각도', '발생 확률', '영향도'],
      sortable: true,
      highlighting: true
    },
    previewData: [
      { risk: '예산 초과', severity: '높음', probability: 70, impact: 85 },
      { risk: '일정 지연', severity: '중간', probability: 50, impact: 60 },
      { risk: '리소스 부족', severity: '낮음', probability: 30, impact: 40 }
    ]
  }
];

export function WidgetLibrary({ onAddWidget }: WidgetLibraryProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<WidgetTemplate | null>(null);
  const [showConfigDialog, setShowConfigDialog] = useState(false);
  const [widgetConfig, setWidgetConfig] = useState<any>({});

  const handleSelectTemplate = (template: WidgetTemplate) => {
    setSelectedTemplate(template);
    setWidgetConfig({ ...template.defaultConfig });
    setShowConfigDialog(true);
  };

  const handleAddWidget = () => {
    if (selectedTemplate) {
      onAddWidget(selectedTemplate.type, widgetConfig);
      setShowConfigDialog(false);
      setSelectedTemplate(null);
    }
  };

  const renderTemplateCard = (template: WidgetTemplate) => (
    <Card 
      key={template.id} 
      className="cursor-pointer hover:shadow-lg transition-all duration-200 glass-card group"
      onClick={() => handleSelectTemplate(template)}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
            {template.icon}
          </div>
          <div className="flex-1">
            <CardTitle className="text-sm font-medium">{template.name}</CardTitle>
            <CardDescription className="text-xs">{template.description}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex items-center justify-between">
          <Badge variant="outline" className="text-xs">
            {template.type.toUpperCase()}
          </Badge>
          <Button size="sm" variant="ghost" className="text-xs opacity-0 group-hover:opacity-100 transition-opacity">
            추가
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  const renderConfigForm = () => {
    if (!selectedTemplate) return null;

    switch (selectedTemplate.type) {
      case 'kpi':
        return (
          <div className="space-y-4">
            <div>
              <Label>위젯 제목</Label>
              <Input
                value={widgetConfig.title || ''}
                onChange={(e) => setWidgetConfig(prev => ({ ...prev, title: e.target.value }))}
                placeholder="KPI 위젯 제목"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>현재 값</Label>
                <Input
                  type="number"
                  value={widgetConfig.value || 0}
                  onChange={(e) => setWidgetConfig(prev => ({ ...prev, value: parseInt(e.target.value) }))}
                />
              </div>
              <div>
                <Label>목표 값</Label>
                <Input
                  type="number"
                  value={widgetConfig.target || 0}
                  onChange={(e) => setWidgetConfig(prev => ({ ...prev, target: parseInt(e.target.value) }))}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>단위</Label>
                <Input
                  value={widgetConfig.unit || ''}
                  onChange={(e) => setWidgetConfig(prev => ({ ...prev, unit: e.target.value }))}
                  placeholder="%, 개, 점수 등"
                />
              </div>
              <div>
                <Label>트렌드</Label>
                <Select 
                  value={widgetConfig.trend || ''}
                  onValueChange={(value) => setWidgetConfig(prev => ({ ...prev, trend: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="트렌드 선택" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="up">상승</SelectItem>
                    <SelectItem value="down">하락</SelectItem>
                    <SelectItem value="stable">안정</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        );

      case 'chart':
        return (
          <div className="space-y-4">
            <div>
              <Label>차트 제목</Label>
              <Input
                value={widgetConfig.title || ''}
                onChange={(e) => setWidgetConfig(prev => ({ ...prev, title: e.target.value }))}
                placeholder="차트 제목"
              />
            </div>
            <div>
              <Label>차트 타입</Label>
              <Select 
                value={widgetConfig.chartType || ''}
                onValueChange={(value) => setWidgetConfig(prev => ({ ...prev, chartType: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="차트 타입 선택" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="line">선 차트</SelectItem>
                  <SelectItem value="bar">막대 차트</SelectItem>
                  <SelectItem value="pie">파이 차트</SelectItem>
                  <SelectItem value="area">영역 차트</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>X축 데이터</Label>
                <Input
                  value={widgetConfig.xAxis || ''}
                  onChange={(e) => setWidgetConfig(prev => ({ ...prev, xAxis: e.target.value }))}
                  placeholder="x축 필드명"
                />
              </div>
              <div>
                <Label>Y축 데이터</Label>
                <Input
                  value={widgetConfig.yAxis || ''}
                  onChange={(e) => setWidgetConfig(prev => ({ ...prev, yAxis: e.target.value }))}
                  placeholder="y축 필드명"
                />
              </div>
            </div>
          </div>
        );

      case 'table':
        return (
          <div className="space-y-4">
            <div>
              <Label>테이블 제목</Label>
              <Input
                value={widgetConfig.title || ''}
                onChange={(e) => setWidgetConfig(prev => ({ ...prev, title: e.target.value }))}
                placeholder="테이블 제목"
              />
            </div>
            <div>
              <Label>컬럼 설정</Label>
              <Textarea
                value={widgetConfig.columns?.join(', ') || ''}
                onChange={(e) => setWidgetConfig(prev => ({ 
                  ...prev, 
                  columns: e.target.value.split(',').map(col => col.trim()) 
                }))}
                placeholder="컬럼명을 쉼표로 구분하여 입력 (예: 이름, 상태, 진행률)"
                rows={3}
              />
            </div>
          </div>
        );

      default:
        return (
          <div className="space-y-4">
            <div>
              <Label>위젯 제목</Label>
              <Input
                value={widgetConfig.title || ''}
                onChange={(e) => setWidgetConfig(prev => ({ ...prev, title: e.target.value }))}
                placeholder="위젯 제목"
              />
            </div>
          </div>
        );
    }
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="all">전체</TabsTrigger>
          <TabsTrigger value="kpi">KPI</TabsTrigger>
          <TabsTrigger value="charts">차트</TabsTrigger>
          <TabsTrigger value="tables">테이블</TabsTrigger>
          <TabsTrigger value="analytics">분석</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {widgetTemplates.map(renderTemplateCard)}
          </div>
        </TabsContent>

        <TabsContent value="kpi" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {widgetTemplates.filter(t => t.category === 'kpi').map(renderTemplateCard)}
          </div>
        </TabsContent>

        <TabsContent value="charts" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {widgetTemplates.filter(t => t.category === 'charts').map(renderTemplateCard)}
          </div>
        </TabsContent>

        <TabsContent value="tables" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {widgetTemplates.filter(t => t.category === 'tables').map(renderTemplateCard)}
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {widgetTemplates.filter(t => t.category === 'analytics').map(renderTemplateCard)}
          </div>
        </TabsContent>
      </Tabs>

      {/* 위젯 설정 모달 */}
      <Dialog open={showConfigDialog} onOpenChange={setShowConfigDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>위젯 설정</DialogTitle>
            <DialogDescription>
              {selectedTemplate?.name} 위젯의 설정을 구성하세요
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6">
            {renderConfigForm()}
            
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowConfigDialog(false)}>
                취소
              </Button>
              <Button onClick={handleAddWidget}>
                위젯 추가
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}