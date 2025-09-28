import React, { useEffect, useMemo, useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Plus, LogOut, Calendar, Users, Settings, Shield, Briefcase, Search, BarChart3, DollarSign, Link } from 'lucide-react';
import { ProjectCard } from './ProjectCard';
import { CreateProjectModal } from './CreateProjectModal';
import { ThemeToggle } from './ThemeToggle';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { fetchProjects } from '../api';
import type { Project, User, UserRole } from '../api/types';
import { useAuth } from '../context/AuthContext';

interface DashboardPageProps {
  user: User;
  onLogout: () => void;
  onProjectSelect: (project: Project) => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  onAdminAccess?: () => void;
  onExecutiveAccess?: () => void;
  onBudgetAccess?: () => void;
  onIntegrationsAccess?: () => void;
}

const getRoleLabel = (role: UserRole): string => {
  const roleMap = {
    system_admin: '시스템 관리자',
    project_manager: '프로젝트 관리자',
    part_leader: '파트장',
    user: '사용자'
  };
  return roleMap[role];
};

const getRoleBadgeVariant = (role: UserRole) => {
  const variantMap = {
    system_admin: 'destructive',
    project_manager: 'default',
    part_leader: 'secondary',
    user: 'outline'
  };
  return variantMap[role] as any;
};

export function DashboardPage({ 
  user, 
  onLogout, 
  onProjectSelect, 
  isDarkMode, 
  onToggleDarkMode, 
  onAdminAccess,
  onExecutiveAccess,
  onBudgetAccess,
  onIntegrationsAccess
}: DashboardPageProps) {
  const { token } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setProjects([]);
      return;
    }

    let isCancelled = false;
    setIsLoading(true);
    setError(null);

    fetchProjects(token)
      .then((data) => {
        if (!isCancelled) {
          setProjects(data);
        }
      })
      .catch((err) => {
        console.error('Failed to load projects', err);
        if (!isCancelled) {
          setError('프로젝트 목록을 불러오는 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
          setProjects([]);
        }
      })
      .finally(() => {
        if (!isCancelled) {
          setIsLoading(false);
        }
      });

    return () => {
      isCancelled = true;
    };
  }, [token]);

  const filteredProjects = useMemo(() => {
    let filtered = [...projects];

    // 역할별 접근 권한 필터링
    switch (user.role) {
      case 'system_admin':
        // 모든 프로젝트 접근 가능
        break;
      case 'project_manager':
        // 자신이 관리하는 프로젝트만
        filtered = filtered.filter(p => p.managerId === user.id || user.projects?.includes(p.id));
        break;
      case 'part_leader':
        // 팀원으로 참여하는 프로젝트만
        filtered = filtered.filter(p => 
          p.teamMembers.includes(user.id) || user.projects?.includes(p.id)
        );
        break;
      case 'user':
        // 팀원으로 참여하는 프로젝트만
        filtered = filtered.filter(p => 
          p.teamMembers.includes(user.id) || user.projects?.includes(p.id)
        );
        break;
    }

    // 검색 필터링
    if (searchTerm) {
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // 상태 필터링
    if (statusFilter !== 'all') {
      filtered = filtered.filter(p => p.status === statusFilter);
    }

    return filtered;
  }, [projects, searchTerm, statusFilter, user.id, user.projects, user.role]);

  const projectsWithKpis = useMemo(
    () => filteredProjects.filter(project => project.kpis),
    [filteredProjects],
  );

  const averageBudgetAdherence = useMemo(() => {
    if (projectsWithKpis.length === 0) {
      return null;
    }
    const total = projectsWithKpis.reduce((sum, project) => sum + (project.kpis?.budgetAdherence || 0), 0);
    return Math.round(total / projectsWithKpis.length);
  }, [projectsWithKpis]);

  const averageQualityScore = useMemo(() => {
    if (projectsWithKpis.length === 0) {
      return null;
    }
    const total = projectsWithKpis.reduce((sum, project) => sum + (project.kpis?.qualityScore || 0), 0);
    return Math.round(total / projectsWithKpis.length);
  }, [projectsWithKpis]);

  const canCreateProject = user.role === 'system_admin' || user.role === 'project_manager';
  const canAccessAdmin = user.role === 'system_admin';
  const canAccessExecutive = user.role === 'system_admin' || user.role === 'project_manager';
  const canAccessBudget = user.role === 'system_admin' || user.role === 'project_manager';
  const canAccessIntegrations = user.role === 'system_admin' || user.role === 'project_manager';

  const handleCreateProject = (projectData: any) => {
    // 프로젝트 생성 로직
    console.log('Creating project:', projectData);
    setIsCreateModalOpen(false);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div>
                <h1 className="text-xl">프로젝트 대시보드</h1>
                <div className="flex items-center gap-2">
                  <p className="text-sm text-muted-foreground">안녕하세요, {user.name}님</p>
                  <Badge variant={getRoleBadgeVariant(user.role)}>
                    {getRoleLabel(user.role)}
                  </Badge>
                  {user.department && (
                    <Badge variant="outline">{user.department}</Badge>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <ThemeToggle 
                isDarkMode={isDarkMode} 
                onToggle={onToggleDarkMode} 
                variant="compact"
              />
              
              {/* Phase 4: Executive Dashboard Access */}
              {canAccessExecutive && onExecutiveAccess && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={onExecutiveAccess}
                  className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white border-none"
                >
                  <BarChart3 className="w-4 h-4 mr-2" />
                  경영 대시보드
                </Button>
              )}

              {/* Phase 4: Budget Management Access */}
              {canAccessBudget && onBudgetAccess && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={onBudgetAccess}
                  className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white border-none"
                >
                  <DollarSign className="w-4 h-4 mr-2" />
                  예산 관리
                </Button>
              )}

              {/* Phase 4: Integrations Access */}
              {canAccessIntegrations && onIntegrationsAccess && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={onIntegrationsAccess}
                  className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white border-none"
                >
                  <Link className="w-4 h-4 mr-2" />
                  연동 설정
                </Button>
              )}

              {canAccessAdmin && onAdminAccess && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={onAdminAccess}
                  className="bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white border-none"
                >
                  <Shield className="w-4 h-4 mr-2" />
                  시스템 관리
                </Button>
              )}
              <Button variant="outline" size="sm" onClick={onLogout}>
                <LogOut className="w-4 h-4 mr-2" />
                로그아웃
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        {isLoading && (
          <div className="mb-4 rounded-md border border-border bg-card/60 p-4 text-sm text-muted-foreground">
            프로젝트 데이터를 불러오는 중입니다...
          </div>
        )}

        {error && (
          <div className="mb-4 rounded-md border border-destructive bg-destructive/10 p-4 text-sm text-destructive">
            {error}
          </div>
        )}

        {/* 통계 카드들 */}
        <div className={`grid gap-4 mb-8 ${(canAccessBudget || canAccessExecutive) ? 'md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6' : 'md:grid-cols-2 lg:grid-cols-4'}`}>
          <Card className="glass-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">전체 프로젝트</CardTitle>
              <Briefcase className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-medium">{filteredProjects.length}</div>
              <p className="text-xs text-muted-foreground">
                접근 가능한 프로젝트
              </p>
            </CardContent>
          </Card>
          
          <Card className="glass-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">활성 프로젝트</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-medium">
                {filteredProjects.filter(p => p.status === 'active').length}
              </div>
              <p className="text-xs text-muted-foreground">
                현재 진행중
              </p>
            </CardContent>
          </Card>
          
          <Card className="glass-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">팀 프로젝트</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-medium">
                {filteredProjects.filter(p => p.teamMembers.includes(user.id)).length}
              </div>
              <p className="text-xs text-muted-foreground">
                참여중인 프로젝트
              </p>
            </CardContent>
          </Card>
          
          <Card className="glass-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">총 태스크</CardTitle>
              <Settings className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-medium">
                {filteredProjects.reduce((acc, p) => acc + p.taskCount, 0)}
              </div>
              <p className="text-xs text-muted-foreground">
                생성된 태스크
              </p>
            </CardContent>
          </Card>

          {/* Phase 4: 예산 성과 카드 */}
          {canAccessBudget && (
            <Card className="glass-card">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">예산 준수율</CardTitle>
                <DollarSign className="w-4 h-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-medium">
                  {averageBudgetAdherence !== null ? `${averageBudgetAdherence}%` : '-'}
                </div>
                <p className="text-xs text-muted-foreground">
                  평균 예산 준수율
                </p>
              </CardContent>
            </Card>
          )}

          {/* Phase 4: 품질 점수 카드 */}
          {canAccessExecutive && (
            <Card className="glass-card">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">품질 점수</CardTitle>
                <BarChart3 className="w-4 h-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-medium">
                  {averageQualityScore !== null ? averageQualityScore : '-'}
                </div>
                <p className="text-xs text-muted-foreground">
                  평균 품질 점수
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Phase 4: 고급 기능 빠른 접근 */}
        {(canAccessExecutive || canAccessBudget || canAccessIntegrations) && (
          <div className="space-y-4">
            <h2 className="text-lg font-medium">고급 관리 기능</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {canAccessExecutive && onExecutiveAccess && (
                <Card 
                  className="glass-card cursor-pointer hover:shadow-lg transition-all duration-300"
                  onClick={onExecutiveAccess}
                >
                  <CardHeader className="flex flex-row items-center space-y-0 pb-2">
                    <BarChart3 className="h-5 w-5 text-purple-600 mr-3" />
                    <div>
                      <CardTitle className="text-sm font-medium">경영진 대시보드</CardTitle>
                      <CardDescription className="text-xs">
                        전사 KPI 및 성과 분석
                      </CardDescription>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-2">
                    <p className="text-xs text-muted-foreground">
                      커스텀 대시보드와 고급 리포팅 기능을 활용해 데이터 기반 의사결정을 지원합니다.
                    </p>
                  </CardContent>
                </Card>
              )}

              {canAccessBudget && onBudgetAccess && (
                <Card 
                  className="glass-card cursor-pointer hover:shadow-lg transition-all duration-300"
                  onClick={onBudgetAccess}
                >
                  <CardHeader className="flex flex-row items-center space-y-0 pb-2">
                    <DollarSign className="h-5 w-5 text-green-600 mr-3" />
                    <div>
                      <CardTitle className="text-sm font-medium">예산 관리</CardTitle>
                      <CardDescription className="text-xs">
                        프로젝트 예산 및 리소스
                      </CardDescription>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-2">
                    <p className="text-xs text-muted-foreground">
                      인력 비용, 예산 대비 실적 분석을 통해 프로젝트 재무를 체계적으로 관리합니다.
                    </p>
                  </CardContent>
                </Card>
              )}

              {canAccessIntegrations && onIntegrationsAccess && (
                <Card 
                  className="glass-card cursor-pointer hover:shadow-lg transition-all duration-300"
                  onClick={onIntegrationsAccess}
                >
                  <CardHeader className="flex flex-row items-center space-y-0 pb-2">
                    <Link className="h-5 w-5 text-orange-600 mr-3" />
                    <div>
                      <CardTitle className="text-sm font-medium">통합 연동</CardTitle>
                      <CardDescription className="text-xs">
                        외부 도구 연동 설정
                      </CardDescription>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-2">
                    <p className="text-xs text-muted-foreground">
                      Slack, Confluence, Git 등 외부 도구와 연동하여 통합 업무 환경을 구축합니다.
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        )}

        {/* 프로젝트 관리 섹션 */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg">내 프로젝트</h2>
              <p className="text-sm text-muted-foreground">
                {user.role === 'system_admin' && '모든 프로젝트를 관리할 수 있습니다.'}
                {user.role === 'project_manager' && '관리중인 프로젝트를 확인하세요.'}
                {user.role === 'part_leader' && '참여중인 프로젝트의 파트 관리를 담당합니다.'}
                {user.role === 'user' && '할당된 태스크를 확인하고 관리하세요.'}
              </p>
            </div>
            {canCreateProject && (
              <Button 
                onClick={() => setIsCreateModalOpen(true)}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                새 프로젝트
              </Button>
            )}
          </div>

          {/* 검색 및 필터 */}
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input 
                placeholder="프로젝트 검색..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="상태 필터" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">모든 상태</SelectItem>
                <SelectItem value="planning">기획중</SelectItem>
                <SelectItem value="active">진행중</SelectItem>
                <SelectItem value="on_hold">보류</SelectItem>
                <SelectItem value="completed">완료</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* 프로젝트 그리드 */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredProjects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                onSelect={() => onProjectSelect(project)}
                userRole={user.role}
              />
            ))}
          </div>

          {filteredProjects.length === 0 && !isLoading && !error && (
            <div className="text-center py-12">
              <Briefcase className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">프로젝트가 없습니다</h3>
              <p className="text-sm text-muted-foreground mb-4">
                {canCreateProject 
                  ? '새 프로젝트를 생성하거나 기존 프로젝트에 참여하세요.'
                  : '프로젝트 관리자에게 프로젝트 참여를 요청하세요.'
                }
              </p>
              {canCreateProject && (
                <Button 
                  onClick={() => setIsCreateModalOpen(true)}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  첫 번째 프로젝트 만들기
                </Button>
              )}
            </div>
          )}
        </div>
      </main>

      <CreateProjectModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateProject}
      />
    </div>
  );
}
