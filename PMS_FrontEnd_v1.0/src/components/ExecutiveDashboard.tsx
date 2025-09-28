import React, { useState, useEffect } from 'react';
import { ArrowLeft, TrendingUp, TrendingDown, DollarSign, Users, CheckCircle, AlertTriangle, BarChart3, PieChart, Settings, Plus } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart as RechartsPieChart, Cell, BarChart, Bar } from 'recharts';
import { DashboardBuilder } from './DashboardBuilder';

interface User {
  id: string;
  name: string;
  role: string;
}

interface ExecutiveDashboardProps {
  user: User;
  onBack: () => void;
  onLogout: () => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
}

// 경영진 KPI 데이터 타입
interface KPIData {
  id: string;
  title: string;
  value: number;
  target: number;
  unit: string;
  trend: 'up' | 'down' | 'stable';
  trendValue: number;
  description: string;
  category: 'financial' | 'operational' | 'quality' | 'strategic';
}

// 프로젝트 포트폴리오 데이터
interface PortfolioData {
  projectId: string;
  projectName: string;
  department: string;
  budget: number;
  spent: number;
  completion: number;
  status: 'on_track' | 'at_risk' | 'delayed';
  roi: number;
  startDate: string;
  endDate: string;
}

export function ExecutiveDashboard({ user, onBack, onLogout, isDarkMode }: ExecutiveDashboardProps) {
  const [activeTab, setActiveTab] = useState('overview');
  const [customDashboardMode, setCustomDashboardMode] = useState(false);
  const [kpiData, setKpiData] = useState<KPIData[]>([]);
  const [portfolioData, setPortfolioData] = useState<PortfolioData[]>([]);
  const [trendData, setTrendData] = useState<any[]>([]);

  // Mock 데이터 초기화
  useEffect(() => {
    // KPI 데이터 생성
    const mockKPIs: KPIData[] = [
      {
        id: 'delivery_rate',
        title: '정시 배포율',
        value: 92,
        target: 90,
        unit: '%',
        trend: 'up',
        trendValue: 2,
        description: '계획된 일정 내 프로젝트 배포 성공률',
        category: 'operational'
      },
      {
        id: 'budget_efficiency',
        title: '예산 효율성',
        value: 87,
        target: 85,
        unit: '%',
        trend: 'up',
        trendValue: 5,
        description: '예산 대비 실제 지출 효율성',
        category: 'financial'
      },
      {
        id: 'roi',
        title: '평균 ROI',
        value: 145,
        target: 120,
        unit: '%',
        trend: 'up',
        trendValue: 15,
        description: '프로젝트 투자 대비 수익률',
        category: 'financial'
      },
      {
        id: 'quality_score',
        title: '품질 점수',
        value: 4.2,
        target: 4.0,
        unit: '/5.0',
        trend: 'up',
        trendValue: 0.3,
        description: '프로젝트 품질 종합 점수',
        category: 'quality'
      },
      {
        id: 'team_productivity',
        title: '팀 생산성',
        value: 78,
        target: 75,
        unit: 'pts/sprint',
        trend: 'up',
        trendValue: 8,
        description: '스프린트당 평균 완료 스토리 포인트',
        category: 'operational'
      },
      {
        id: 'risk_mitigation',
        title: '리스크 완화율',
        value: 85,
        target: 80,
        unit: '%',
        trend: 'stable',
        trendValue: 0,
        description: '식별된 리스크 중 완화된 비율',
        category: 'strategic'
      }
    ];

    // 포트폴리오 데이터 생성
    const mockPortfolio: PortfolioData[] = [
      {
        projectId: '1',
        projectName: 'AI 챗봇 플랫폼',
        department: '개발팀',
        budget: 500000,
        spent: 420000,
        completion: 85,
        status: 'on_track',
        roi: 165,
        startDate: '2024-01-15',
        endDate: '2024-03-30'
      },
      {
        projectId: '2',
        projectName: '모바일 앱 리뉴얼',
        department: 'UX팀',
        budget: 300000,
        spent: 280000,
        completion: 75,
        status: 'at_risk',
        roi: 120,
        startDate: '2024-02-01',
        endDate: '2024-04-15'
      },
      {
        projectId: '3',
        projectName: '데이터 분석 시스템',
        department: '데이터팀',
        budget: 800000,
        spent: 650000,
        completion: 60,
        status: 'delayed',
        roi: 200,
        startDate: '2024-01-01',
        endDate: '2024-05-31'
      }
    ];

    // 트렌드 데이터 생성
    const mockTrend = [
      { month: '1월', revenue: 1200000, cost: 800000, projects: 8, completion: 85 },
      { month: '2월', revenue: 1350000, cost: 850000, projects: 10, completion: 88 },
      { month: '3월', revenue: 1180000, cost: 900000, projects: 12, completion: 82 },
      { month: '4월', revenue: 1480000, cost: 950000, projects: 14, completion: 90 },
      { month: '5월', revenue: 1620000, cost: 1000000, projects: 16, completion: 92 },
      { month: '6월', revenue: 1750000, cost: 1100000, projects: 18, completion: 87 }
    ];

    setKpiData(mockKPIs);
    setPortfolioData(mockPortfolio);
    setTrendData(mockTrend);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'on_track': return 'bg-green-500';
      case 'at_risk': return 'bg-yellow-500';
      case 'delayed': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'on_track': return '정상 진행';
      case 'at_risk': return '위험';
      case 'delayed': return '지연';
      default: return '알 수 없음';
    }
  };

  const getTrendIcon = (trend: string, trendValue: number) => {
    if (trend === 'up') return <TrendingUp className="w-4 h-4 text-green-500" />;
    if (trend === 'down') return <TrendingDown className="w-4 h-4 text-red-500" />;
    return <div className="w-4 h-4 bg-gray-400 rounded-full"></div>;
  };

  const COLORS = ['#6366f1', '#06b6d4', '#10b981', '#f59e0b', '#ef4444'];

  if (customDashboardMode) {
    return (
      <DashboardBuilder
        user={user}
        onBack={() => setCustomDashboardMode(false)}
        onLogout={onLogout}
        isDarkMode={isDarkMode}
      />
    );
  }

  return (
    <div className="min-h-screen p-6 space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={onBack} className="p-2">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">경영진 대시보드</h1>
            <p className="text-muted-foreground">전사 프로젝트 현황 및 핵심 지표</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button 
            variant="outline" 
            onClick={() => setCustomDashboardMode(true)}
            className="flex items-center space-x-2"
          >
            <Settings className="w-4 h-4" />
            <span>대시보드 커스터마이징</span>
          </Button>
          <Button variant="outline" onClick={onLogout}>
            로그아웃
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">전체 현황</TabsTrigger>
          <TabsTrigger value="financial">재무 분석</TabsTrigger>
          <TabsTrigger value="portfolio">프로젝트 포트폴리오</TabsTrigger>
          <TabsTrigger value="strategic">전략적 지표</TabsTrigger>
        </TabsList>

        {/* 전체 현황 탭 */}
        <TabsContent value="overview" className="space-y-6">
          {/* KPI 카드들 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {kpiData.map(kpi => (
              <Card key={kpi.id} className="glass-card">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="widget-title">{kpi.title}</CardTitle>
                  {getTrendIcon(kpi.trend, kpi.trendValue)}
                </CardHeader>
                <CardContent>
                  <div className="kpi-value">
                    {kpi.value}{kpi.unit}
                  </div>
                  <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                    <span>목표: {kpi.target}{kpi.unit}</span>
                    {kpi.trendValue !== 0 && (
                      <Badge variant={kpi.trend === 'up' ? 'default' : 'destructive'} className="text-xs">
                        {kpi.trend === 'up' ? '+' : ''}{kpi.trendValue}{kpi.unit}
                      </Badge>
                    )}
                  </div>
                  <Progress 
                    value={(kpi.value / kpi.target) * 100} 
                    className="mt-2" 
                  />
                  <p className="text-xs text-muted-foreground mt-2">{kpi.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* 월별 트렌드 차트 */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle>월별 성과 트렌드</CardTitle>
              <CardDescription>매출, 비용, 프로젝트 완료율 추이</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <AreaChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Area 
                    type="monotone" 
                    dataKey="revenue" 
                    stackId="1" 
                    stroke="var(--chart-1)" 
                    fill="var(--chart-1)" 
                    fillOpacity={0.6}
                    name="매출"
                  />
                  <Area 
                    type="monotone" 
                    dataKey="cost" 
                    stackId="2" 
                    stroke="var(--chart-2)" 
                    fill="var(--chart-2)" 
                    fillOpacity={0.6}
                    name="비용"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 재무 분석 탭 */}
        <TabsContent value="financial" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 예산 vs 실적 */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle>예산 대비 실적</CardTitle>
                <CardDescription>부서별 예산 소진 현황</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={portfolioData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="department" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="budget" fill="var(--chart-1)" name="예산" />
                    <Bar dataKey="spent" fill="var(--chart-2)" name="지출" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* ROI 분포 */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle>프로젝트 ROI 분포</CardTitle>
                <CardDescription>투자 대비 수익률 현황</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RechartsPieChart>
                    <RechartsPieChart
                      data={portfolioData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="roi"
                    >
                      {portfolioData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </RechartsPieChart>
                    <Tooltip />
                    <Legend />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* 프로젝트 포트폴리오 탭 */}
        <TabsContent value="portfolio" className="space-y-6">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle>프로젝트 포트폴리오 현황</CardTitle>
              <CardDescription>전체 프로젝트의 진행 상황 및 성과</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {portfolioData.map(project => (
                  <div key={project.projectId} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold">{project.projectName}</h3>
                        <p className="text-sm text-muted-foreground">{project.department}</p>
                      </div>
                      <Badge className={getStatusColor(project.status)}>
                        {getStatusText(project.status)}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">예산:</span>
                        <div className="font-medium">
                          ₩{project.budget.toLocaleString()}
                        </div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">지출:</span>
                        <div className="font-medium">
                          ₩{project.spent.toLocaleString()}
                        </div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">완료율:</span>
                        <div className="font-medium">{project.completion}%</div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">ROI:</span>
                        <div className="font-medium text-green-600">{project.roi}%</div>
                      </div>
                    </div>
                    
                    <Progress value={project.completion} className="h-2" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 전략적 지표 탭 */}
        <TabsContent value="strategic" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BarChart3 className="w-5 h-5" />
                  <span>핵심 성과 지표</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {kpiData.filter(kpi => kpi.category === 'strategic').map(kpi => (
                  <div key={kpi.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <div className="font-medium">{kpi.title}</div>
                      <div className="text-sm text-muted-foreground">{kpi.description}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold">{kpi.value}{kpi.unit}</div>
                      <div className="text-sm text-muted-foreground">목표: {kpi.target}{kpi.unit}</div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <AlertTriangle className="w-5 h-5" />
                  <span>위험 요소 분석</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                    <div>
                      <div className="font-medium text-red-700 dark:text-red-300">예산 초과 위험</div>
                      <div className="text-sm text-red-600 dark:text-red-400">2개 프로젝트</div>
                    </div>
                    <Badge variant="destructive">높음</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                    <div>
                      <div className="font-medium text-yellow-700 dark:text-yellow-300">일정 지연 위험</div>
                      <div className="text-sm text-yellow-600 dark:text-yellow-400">1개 프로젝트</div>
                    </div>
                    <Badge variant="secondary">중간</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <div>
                      <div className="font-medium text-green-700 dark:text-green-300">품질 기준 충족</div>
                      <div className="text-sm text-green-600 dark:text-green-400">5개 프로젝트</div>
                    </div>
                    <Badge className="bg-green-500">정상</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}