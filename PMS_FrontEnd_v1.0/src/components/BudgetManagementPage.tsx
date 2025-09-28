import React, { useState, useEffect } from 'react';
import { ArrowLeft, DollarSign, TrendingUp, TrendingDown, Plus, Edit3, Trash2, Download, Upload, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Textarea } from './ui/textarea';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';

interface User {
  id: string;
  name: string;
  role: string;
}

interface BudgetManagementPageProps {
  user: User;
  onBack: () => void;
  onLogout: () => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
}

// 예산 항목 타입
interface BudgetItem {
  id: string;
  projectId: string;
  projectName: string;
  department: string;
  category: 'development' | 'design' | 'marketing' | 'infrastructure' | 'other';
  plannedAmount: number;
  actualAmount: number;
  approvedAmount: number;
  remainingAmount: number;
  startDate: string;
  endDate: string;
  status: 'planned' | 'approved' | 'in_progress' | 'completed' | 'over_budget';
  description: string;
  manMonths: number; // 인력 투입 개월수
  hourlyRate: number; // 시간당 비용
  actualHours: number; // 실제 투입 시간
}

// 예산 요약 타입
interface BudgetSummary {
  totalPlanned: number;
  totalActual: number;
  totalApproved: number;
  totalRemaining: number;
  utilizationRate: number;
  variancePercentage: number;
  projectCount: number;
}

export function BudgetManagementPage({ user, onBack, onLogout }: BudgetManagementPageProps) {
  const [budgetItems, setBudgetItems] = useState<BudgetItem[]>([]);
  const [budgetSummary, setBudgetSummary] = useState<BudgetSummary | null>(null);
  const [selectedItem, setSelectedItem] = useState<BudgetItem | null>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [trendData, setTrendData] = useState<any[]>([]);

  // Mock 데이터 초기화
  useEffect(() => {
    const mockBudgetItems: BudgetItem[] = [
      {
        id: '1',
        projectId: 'proj-1',
        projectName: 'AI 챗봇 플랫폼',
        department: '개발팀',
        category: 'development',
        plannedAmount: 50000000,
        actualAmount: 42000000,
        approvedAmount: 50000000,
        remainingAmount: 8000000,
        startDate: '2024-01-15',
        endDate: '2024-03-30',
        status: 'in_progress',
        description: '고객 서비스용 AI 챗봇 시스템 개발',
        manMonths: 12,
        hourlyRate: 50000,
        actualHours: 840
      },
      {
        id: '2',
        projectId: 'proj-2',
        projectName: '모바일 앱 리뉴얼',
        department: 'UX팀',
        category: 'design',
        plannedAmount: 30000000,
        actualAmount: 28000000,
        approvedAmount: 30000000,
        remainingAmount: 2000000,
        startDate: '2024-02-01',
        endDate: '2024-04-15',
        status: 'in_progress',
        description: '기존 모바일 앱의 UI/UX 개선',
        manMonths: 8,
        hourlyRate: 45000,
        actualHours: 622
      },
      {
        id: '3',
        projectId: 'proj-3',
        projectName: '데이터 분석 시스템',
        department: '데이터팀',
        category: 'infrastructure',
        plannedAmount: 80000000,
        actualAmount: 95000000,
        approvedAmount: 80000000,
        remainingAmount: -15000000,
        startDate: '2024-01-01',
        endDate: '2024-05-31',
        status: 'over_budget',
        description: '빅데이터 분석을 위한 시스템 구축',
        manMonths: 20,
        hourlyRate: 55000,
        actualHours: 1727
      },
      {
        id: '4',
        projectId: 'proj-4',
        projectName: '마케팅 캠페인',
        department: '마케팅팀',
        category: 'marketing',
        plannedAmount: 25000000,
        actualAmount: 25000000,
        approvedAmount: 25000000,
        remainingAmount: 0,
        startDate: '2024-03-01',
        endDate: '2024-03-31',
        status: 'completed',
        description: '신제품 런칭 마케팅 캠페인',
        manMonths: 3,
        hourlyRate: 40000,
        actualHours: 625
      }
    ];

    // 예산 요약 계산
    const summary: BudgetSummary = {
      totalPlanned: mockBudgetItems.reduce((sum, item) => sum + item.plannedAmount, 0),
      totalActual: mockBudgetItems.reduce((sum, item) => sum + item.actualAmount, 0),
      totalApproved: mockBudgetItems.reduce((sum, item) => sum + item.approvedAmount, 0),
      totalRemaining: mockBudgetItems.reduce((sum, item) => sum + item.remainingAmount, 0),
      utilizationRate: 0,
      variancePercentage: 0,
      projectCount: mockBudgetItems.length
    };

    summary.utilizationRate = (summary.totalActual / summary.totalApproved) * 100;
    summary.variancePercentage = ((summary.totalActual - summary.totalPlanned) / summary.totalPlanned) * 100;

    // 월별 예산 사용 트렌드
    const mockTrendData = [
      { month: '1월', planned: 15000000, actual: 12000000, approved: 15000000 },
      { month: '2월', planned: 25000000, actual: 22000000, approved: 25000000 },
      { month: '3월', planned: 35000000, actual: 38000000, approved: 35000000 },
      { month: '4월', planned: 45000000, actual: 48000000, approved: 45000000 },
      { month: '5월', planned: 55000000, actual: 58000000, approved: 55000000 },
      { month: '6월', planned: 65000000, actual: 62000000, approved: 65000000 }
    ];

    setBudgetItems(mockBudgetItems);
    setBudgetSummary(summary);
    setTrendData(mockTrendData);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'planned': return 'bg-gray-500';
      case 'approved': return 'bg-blue-500';
      case 'in_progress': return 'bg-green-500';
      case 'completed': return 'bg-green-600';
      case 'over_budget': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'planned': return '계획';
      case 'approved': return '승인';
      case 'in_progress': return '진행중';
      case 'completed': return '완료';
      case 'over_budget': return '예산 초과';
      default: return '알 수 없음';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'development': return '#6366f1';
      case 'design': return '#06b6d4';
      case 'marketing': return '#10b981';
      case 'infrastructure': return '#f59e0b';
      case 'other': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getCategoryText = (category: string) => {
    switch (category) {
      case 'development': return '개발';
      case 'design': return '디자인';
      case 'marketing': return '마케팅';
      case 'infrastructure': return '인프라';
      case 'other': return '기타';
      default: return category;
    }
  };

  const formatCurrency = (amount: number) => {
    return `₩${Math.abs(amount).toLocaleString()}`;
  };

  const calculateEfficiency = (item: BudgetItem) => {
    if (item.actualHours === 0) return 0;
    return (item.actualAmount / item.actualHours).toFixed(0);
  };

  const CHART_COLORS = ['#6366f1', '#06b6d4', '#10b981', '#f59e0b', '#ef4444'];

  return (
    <div className="min-h-screen p-6 space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={onBack} className="p-2">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">예산 관리</h1>
            <p className="text-muted-foreground">프로젝트 예산 계획, 실행 및 분석</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" className="flex items-center space-x-2">
            <Download className="w-4 h-4" />
            <span>보고서 내보내기</span>
          </Button>
          <Button variant="outline" className="flex items-center space-x-2">
            <Upload className="w-4 h-4" />
            <span>데이터 가져오기</span>
          </Button>
          <Button 
            onClick={() => setShowCreateDialog(true)}
            className="flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>새 예산 항목</span>
          </Button>
          <Button variant="outline" onClick={onLogout}>
            로그아웃
          </Button>
        </div>
      </div>

      {/* 예산 요약 카드들 */}
      {budgetSummary && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="glass-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="widget-title">총 승인 예산</CardTitle>
              <DollarSign className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="kpi-value">{formatCurrency(budgetSummary.totalApproved)}</div>
              <p className="text-xs text-muted-foreground">
                {budgetSummary.projectCount}개 프로젝트
              </p>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="widget-title">실제 지출</CardTitle>
              <TrendingUp className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="kpi-value">{formatCurrency(budgetSummary.totalActual)}</div>
              <div className="flex items-center space-x-2 text-xs">
                <span className="text-muted-foreground">예산 사용률:</span>
                <Badge variant={budgetSummary.utilizationRate > 100 ? 'destructive' : 'default'}>
                  {budgetSummary.utilizationRate.toFixed(1)}%
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="widget-title">잔여 예산</CardTitle>
              {budgetSummary.totalRemaining >= 0 ? (
                <CheckCircle className="w-4 h-4 text-green-500" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-red-500" />
              )}
            </CardHeader>
            <CardContent>
              <div className={`kpi-value ${budgetSummary.totalRemaining >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(budgetSummary.totalRemaining)}
              </div>
              <p className="text-xs text-muted-foreground">
                {budgetSummary.totalRemaining >= 0 ? '예산 범위 내' : '예산 초과'}
              </p>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="widget-title">예산 편차</CardTitle>
              {budgetSummary.variancePercentage >= 0 ? (
                <TrendingUp className="w-4 h-4 text-red-500" />
              ) : (
                <TrendingDown className="w-4 h-4 text-green-500" />
              )}
            </CardHeader>
            <CardContent>
              <div className={`kpi-value ${budgetSummary.variancePercentage >= 0 ? 'text-red-600' : 'text-green-600'}`}>
                {budgetSummary.variancePercentage >= 0 ? '+' : ''}{budgetSummary.variancePercentage.toFixed(1)}%
              </div>
              <p className="text-xs text-muted-foreground">
                계획 대비 {budgetSummary.variancePercentage >= 0 ? '초과' : '절약'}
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">전체 현황</TabsTrigger>
          <TabsTrigger value="projects">프로젝트별</TabsTrigger>
          <TabsTrigger value="analysis">예산 분석</TabsTrigger>
          <TabsTrigger value="forecast">예측 및 계획</TabsTrigger>
        </TabsList>

        {/* 전체 현황 탭 */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 월별 예산 추이 */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle>월별 예산 사용 추이</CardTitle>
                <CardDescription>계획 vs 실제 예산 사용량</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={trendData}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                    <XAxis dataKey="month" />
                    <YAxis tickFormatter={(value) => `₩${(value / 1000000).toFixed(0)}M`} />
                    <Tooltip formatter={(value: number) => [`₩${value.toLocaleString()}`, '']} />
                    <Legend />
                    <Area 
                      type="monotone" 
                      dataKey="planned" 
                      stackId="1" 
                      stroke="var(--chart-1)" 
                      fill="var(--chart-1)" 
                      fillOpacity={0.4}
                      name="계획 예산"
                    />
                    <Area 
                      type="monotone" 
                      dataKey="actual" 
                      stackId="2" 
                      stroke="var(--chart-2)" 
                      fill="var(--chart-2)" 
                      fillOpacity={0.6}
                      name="실제 지출"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* 카테고리별 예산 분배 */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle>카테고리별 예산 분배</CardTitle>
                <CardDescription>부서/카테고리별 예산 사용 현황</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={budgetItems.map(item => ({
                        name: getCategoryText(item.category),
                        value: item.actualAmount,
                        category: item.category
                      }))}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(1)}%`}
                    >
                      {budgetItems.map((item, index) => (
                        <Cell key={`cell-${index}`} fill={getCategoryColor(item.category)} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: number) => [`₩${value.toLocaleString()}`, '']} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* 프로젝트별 탭 */}
        <TabsContent value="projects" className="space-y-6">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle>프로젝트별 예산 현황</CardTitle>
              <CardDescription>개별 프로젝트의 예산 계획 및 실행 상황</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {budgetItems.map(item => (
                  <div key={item.id} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold">{item.projectName}</h3>
                        <p className="text-sm text-muted-foreground">{item.department} • {getCategoryText(item.category)}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge className={getStatusColor(item.status)}>
                          {getStatusText(item.status)}
                        </Badge>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedItem(item);
                            setShowEditDialog(true);
                          }}
                        >
                          <Edit3 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">승인 예산:</span>
                        <div className="font-medium">{formatCurrency(item.approvedAmount)}</div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">실제 지출:</span>
                        <div className="font-medium">{formatCurrency(item.actualAmount)}</div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">잔여 예산:</span>
                        <div className={`font-medium ${item.remainingAmount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {formatCurrency(item.remainingAmount)}
                        </div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">투입 시간:</span>
                        <div className="font-medium">{item.actualHours}시간</div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">시간당 비용:</span>
                        <div className="font-medium">₩{calculateEfficiency(item)}</div>
                      </div>
                    </div>
                    
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>예산 사용률</span>
                        <span>{((item.actualAmount / item.approvedAmount) * 100).toFixed(1)}%</span>
                      </div>
                      <Progress 
                        value={(item.actualAmount / item.approvedAmount) * 100} 
                        className="h-2" 
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 예산 분석 탭 */}
        <TabsContent value="analysis" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="glass-card">
              <CardHeader>
                <CardTitle>부서별 예산 대비 실적</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={budgetItems}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="department" />
                    <YAxis tickFormatter={(value) => `₩${(value / 1000000).toFixed(0)}M`} />
                    <Tooltip formatter={(value: number) => [`₩${value.toLocaleString()}`, '']} />
                    <Legend />
                    <Bar dataKey="plannedAmount" fill="var(--chart-1)" name="계획 예산" />
                    <Bar dataKey="actualAmount" fill="var(--chart-2)" name="실제 지출" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="glass-card">
              <CardHeader>
                <CardTitle>예산 효율성 분석</CardTitle>
                <CardDescription>투입 시간 대비 비용 효율성</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {budgetItems.map(item => (
                  <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <div className="font-medium">{item.projectName}</div>
                      <div className="text-sm text-muted-foreground">
                        {item.actualHours}시간 투입
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold">₩{calculateEfficiency(item)}/시간</div>
                      <div className="text-sm text-muted-foreground">
                        총 {formatCurrency(item.actualAmount)}
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* 예측 및 계획 탭 */}
        <TabsContent value="forecast" className="space-y-6">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle>예산 예측 및 권고사항</CardTitle>
              <CardDescription>AI 기반 예산 분석 및 향후 전망</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <TrendingUp className="w-5 h-5 text-blue-600" />
                    <h4 className="font-semibold text-blue-800 dark:text-blue-200">예산 전망</h4>
                  </div>
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    현재 추세로 볼 때, 연말까지 전체 예산의 105% 사용이 예상됩니다. 
                    데이터팀 프로젝트의 예산 조정이 필요합니다.
                  </p>
                </div>

                <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <h4 className="font-semibold text-green-800 dark:text-green-200">효율성 분석</h4>
                  </div>
                  <p className="text-sm text-green-700 dark:text-green-300">
                    UX팀이 가장 높은 비용 효율성을 보이고 있습니다. 
                    모바일 앱 프로젝트의 방법론을 다른 팀에 적용하는 것을 권장합니다.
                  </p>
                </div>

                <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <AlertTriangle className="w-5 h-5 text-yellow-600" />
                    <h4 className="font-semibold text-yellow-800 dark:text-yellow-200">위험 요소</h4>
                  </div>
                  <p className="text-sm text-yellow-700 dark:text-yellow-300">
                    데이터 분석 시스템 프로젝트가 예산을 18.8% 초과했습니다. 
                    즉시 비용 통제 계획이 필요합니다.
                  </p>
                </div>

                <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <Clock className="w-5 h-5 text-purple-600" />
                    <h4 className="font-semibold text-purple-800 dark:text-purple-200">최적화 제안</h4>
                  </div>
                  <p className="text-sm text-purple-700 dark:text-purple-300">
                    프로젝트 간 인력 재배치를 통해 전체 비용을 12% 절약할 수 있습니다. 
                    세부 계획을 수립해 드릴까요?
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* 새 예산 항목 생성 모달 */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>새 예산 항목 생성</DialogTitle>
            <DialogDescription>
              새로운 프로젝트의 예산 계획을 등록하세요
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>프로젝트 이름</Label>
              <Input placeholder="프로젝트 이름을 입력하세요" />
            </div>
            <div>
              <Label>부서</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="부서 선택" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="development">개발팀</SelectItem>
                  <SelectItem value="design">UX팀</SelectItem>
                  <SelectItem value="marketing">마케팅팀</SelectItem>
                  <SelectItem value="data">데이터팀</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>예산 금액</Label>
              <Input type="number" placeholder="0" />
            </div>
            <div>
              <Label>프로젝트 설명</Label>
              <Textarea placeholder="프로젝트에 대한 간단한 설명을 입력하세요" rows={3} />
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                취소
              </Button>
              <Button onClick={() => setShowCreateDialog(false)}>
                생성
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* 예산 항목 편집 모달 */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>예산 항목 편집</DialogTitle>
            <DialogDescription>
              {selectedItem?.projectName} 프로젝트의 예산 정보를 수정하세요
            </DialogDescription>
          </DialogHeader>
          {selectedItem && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>승인 예산</Label>
                <Input type="number" defaultValue={selectedItem.approvedAmount} />
              </div>
              <div>
                <Label>실제 지출</Label>
                <Input type="number" defaultValue={selectedItem.actualAmount} />
              </div>
              <div>
                <Label>시간당 비용</Label>
                <Input type="number" defaultValue={selectedItem.hourlyRate} />
              </div>
              <div>
                <Label>투입 시간</Label>
                <Input type="number" defaultValue={selectedItem.actualHours} />
              </div>
              <div className="col-span-2">
                <Label>상태</Label>
                <Select defaultValue={selectedItem.status}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="planned">계획</SelectItem>
                    <SelectItem value="approved">승인</SelectItem>
                    <SelectItem value="in_progress">진행중</SelectItem>
                    <SelectItem value="completed">완료</SelectItem>
                    <SelectItem value="over_budget">예산 초과</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="col-span-2 flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setShowEditDialog(false)}>
                  취소
                </Button>
                <Button onClick={() => setShowEditDialog(false)}>
                  저장
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}