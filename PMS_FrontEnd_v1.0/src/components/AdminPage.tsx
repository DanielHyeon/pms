import React, { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { 
  ArrowLeft, 
  LogOut, 
  Users, 
  Shield, 
  Briefcase, 
  Settings, 
  BarChart3,
  UserPlus,
  Edit,
  Trash2,
  Search
} from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

export type UserRole = 'system_admin' | 'project_manager' | 'part_leader' | 'user';

interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  department?: string;
  projects?: string[];
}

interface Project {
  id: string;
  name: string;
  description: string;
  ownerId: string;
  managerId: string;
  teamMembers: string[];
  department: string;
  status: 'planning' | 'active' | 'on_hold' | 'completed';
  priority: 'low' | 'medium' | 'high' | 'critical';
  createdAt: string;
  deadline?: string;
  taskCount: number;
}

interface AdminPageProps {
  user: User;
  onBack: () => void;
  onLogout: () => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
}

const mockUsers: User[] = [
  {
    id: '1',
    email: 'admin@ai-project.com',
    name: '시스템 관리자',
    role: 'system_admin',
    department: 'IT'
  },
  {
    id: '2',
    email: 'pm@ai-project.com',
    name: '김프로젝트',
    role: 'project_manager',
    department: '개발팀',
    projects: ['1', '2']
  },
  {
    id: '3',
    email: 'pl@ai-project.com',
    name: '이파트장',
    role: 'part_leader',
    department: '프론트엔드팀',
    projects: ['1']
  },
  {
    id: '4',
    email: 'user@ai-project.com',
    name: '박개발자',
    role: 'user',
    department: '개발팀',
    projects: ['1', '2']
  }
];

const mockProjects: Project[] = [
  {
    id: '1',
    name: 'AI 챗봇 개발',
    description: '고객 서비스를 위한 AI 챗봇 시스템 구축',
    ownerId: '1',
    managerId: '2',
    teamMembers: ['3', '4'],
    department: '개발팀',
    status: 'active',
    priority: 'high',
    createdAt: '2024-01-15',
    deadline: '2024-06-30',
    taskCount: 12
  },
  {
    id: '2',
    name: '모바일 앱 리뉴얼',
    description: '기존 모바일 앱의 UI/UX 개선 및 성능 최적화',
    ownerId: '1',
    managerId: '2',
    teamMembers: ['4'],
    department: '개발팀',
    status: 'planning',
    priority: 'medium',
    createdAt: '2024-02-01',
    deadline: '2024-08-15',
    taskCount: 8
  }
];

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

const getStatusBadgeVariant = (status: string) => {
  const variantMap = {
    planning: 'outline',
    active: 'default',
    on_hold: 'secondary',
    completed: 'destructive'
  };
  return variantMap[status] as any;
};

const getPriorityBadgeVariant = (priority: string) => {
  const variantMap = {
    low: 'outline',
    medium: 'secondary',
    high: 'default',
    critical: 'destructive'
  };
  return variantMap[priority] as any;
};

export function AdminPage({ user, onBack, onLogout, isDarkMode, onToggleDarkMode }: AdminPageProps) {
  const [activeTab, setActiveTab] = useState('users');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredUsers = mockUsers.filter(u => 
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.department?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredProjects = mockProjects.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const isSystemAdmin = user.role === 'system_admin';

  if (!isSystemAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle>접근 권한 없음</CardTitle>
            <CardDescription>
              시스템 관리자만 접근할 수 있습니다.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={onBack} className="w-full">
              돌아가기
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" onClick={onBack}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                대시보드로
              </Button>
              <div>
                <h1 className="text-xl">시스템 관리</h1>
                <p className="text-sm text-muted-foreground">사용자 및 프로젝트 관리</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <ThemeToggle 
                isDarkMode={isDarkMode} 
                onToggle={onToggleDarkMode} 
                variant="compact"
              />
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
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full max-w-2xl grid-cols-4">
            <TabsTrigger value="users" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              사용자 관리
            </TabsTrigger>
            <TabsTrigger value="projects" className="flex items-center gap-2">
              <Briefcase className="w-4 h-4" />
              프로젝트 관리
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              분석
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              시스템 설정
            </TabsTrigger>
          </TabsList>

          {/* 사용자 관리 */}
          <TabsContent value="users" className="mt-6">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-lg">사용자 관리</h2>
                <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                  <UserPlus className="w-4 h-4 mr-2" />
                  새 사용자 추가
                </Button>
              </div>

              <div className="flex items-center gap-4">
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input 
                    placeholder="사용자 검색..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="역할 필터" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">모든 역할</SelectItem>
                    <SelectItem value="system_admin">시스템 관리자</SelectItem>
                    <SelectItem value="project_manager">프로젝트 관리자</SelectItem>
                    <SelectItem value="part_leader">파트장</SelectItem>
                    <SelectItem value="user">사용자</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-4">
                {filteredUsers.map((user) => (
                  <Card key={user.id} className="glass-card">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <Avatar>
                            <AvatarImage src="" />
                            <AvatarFallback>
                              {user.name.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <h3 className="font-medium">{user.name}</h3>
                            <p className="text-sm text-muted-foreground">{user.email}</p>
                            <div className="flex items-center gap-2 mt-1">
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
                          <Button variant="outline" size="sm">
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="outline" size="sm">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* 프로젝트 관리 */}
          <TabsContent value="projects" className="mt-6">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-lg">프로젝트 관리</h2>
                <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                  <Briefcase className="w-4 h-4 mr-2" />
                  새 프로젝트 생성
                </Button>
              </div>

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
                <Select>
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

              <div className="grid gap-4">
                {filteredProjects.map((project) => (
                  <Card key={project.id} className="glass-card">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-medium">{project.name}</h3>
                            <Badge variant={getStatusBadgeVariant(project.status)}>
                              {project.status === 'planning' && '기획중'}
                              {project.status === 'active' && '진행중'}
                              {project.status === 'on_hold' && '보류'}
                              {project.status === 'completed' && '완료'}
                            </Badge>
                            <Badge variant={getPriorityBadgeVariant(project.priority)}>
                              {project.priority === 'low' && '낮음'}
                              {project.priority === 'medium' && '보통'}
                              {project.priority === 'high' && '높음'}
                              {project.priority === 'critical' && '긴급'}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-3">{project.description}</p>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span>부서: {project.department}</span>
                            <span>태스크: {project.taskCount}개</span>
                            <span>팀원: {project.teamMembers.length}명</span>
                            {project.deadline && (
                              <span>마감: {new Date(project.deadline).toLocaleDateString()}</span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="sm">
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="outline" size="sm">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* 분석 */}
          <TabsContent value="analytics" className="mt-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle>전체 사용자</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-medium">{mockUsers.length}</div>
                  <p className="text-sm text-muted-foreground">등록된 사용자 수</p>
                </CardContent>
              </Card>
              
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle>활성 프로젝트</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-medium">
                    {mockProjects.filter(p => p.status === 'active').length}
                  </div>
                  <p className="text-sm text-muted-foreground">진행중인 프로젝트</p>
                </CardContent>
              </Card>
              
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle>전체 태스크</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-medium">
                    {mockProjects.reduce((acc, p) => acc + p.taskCount, 0)}
                  </div>
                  <p className="text-sm text-muted-foreground">생성된 태스크 수</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* 시스템 설정 */}
          <TabsContent value="settings" className="mt-6">
            <div className="space-y-6">
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle>시스템 설정</CardTitle>
                  <CardDescription>
                    전체 시스템 설정을 관리합니다.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <Button variant="outline" className="justify-start">
                      <Shield className="w-4 h-4 mr-2" />
                      보안 설정
                    </Button>
                    <Button variant="outline" className="justify-start">
                      <Settings className="w-4 h-4 mr-2" />
                      일반 설정
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}