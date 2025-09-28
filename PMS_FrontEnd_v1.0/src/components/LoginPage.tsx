import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { ThemeToggle } from './ThemeToggle';
import { Shield, Briefcase, Users, User as UserIcon } from 'lucide-react';
import { login } from '../api';
import type { User, UserRole } from '../api/types';

interface LoginPageProps {
  onLogin: (user: User, token: string) => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
}

const demoAccounts = [
  {
    email: 'admin@ai-project.com',
    password: 'admin123',
    user: {
      id: '1',
      email: 'admin@ai-project.com',
      name: '시스템 관리자',
      role: 'system_admin' as UserRole,
      department: 'IT'
    },
    icon: Shield,
    description: '모든 시스템 관리 권한'
  },
  {
    email: 'pm@ai-project.com',
    password: 'pm123',
    user: {
      id: '2',
      email: 'pm@ai-project.com',
      name: '김프로젝트',
      role: 'project_manager' as UserRole,
      department: '개발팀',
      projects: ['1', '2']
    },
    icon: Briefcase,
    description: '프로젝트 전체 관리'
  },
  {
    email: 'pl@ai-project.com',
    password: 'pl123',
    user: {
      id: '3',
      email: 'pl@ai-project.com',
      name: '이파트장',
      role: 'part_leader' as UserRole,
      department: '프론트엔드팀',
      projects: ['1']
    },
    icon: Users,
    description: '파트 태스크 관리'
  },
  {
    email: 'user@ai-project.com',
    password: 'user123',
    user: {
      id: '4',
      email: 'user@ai-project.com',
      name: '박개발자',
      role: 'user' as UserRole,
      department: '개발팀',
      projects: ['1', '2']
    },
    icon: UserIcon,
    description: '개인 태스크 관리'
  }
];

export function LoginPage({ onLogin, isDarkMode, onToggleDarkMode }: LoginPageProps) {
  const [email, setEmail] = useState('admin@ai-project.com');
  const [password, setPassword] = useState('admin123');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await login(email, password);
      onLogin(response.user, response.token.accessToken);
    } catch (err) {
      console.error('Login failed', err);
      setError('로그인에 실패했습니다. 이메일과 비밀번호를 확인하세요.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = (account: typeof demoAccounts[0]) => {
    setEmail(account.email);
    setPassword(account.password);
  };

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

  return (
    <div className="min-h-screen flex items-center justify-center relative" style={{ background: 'var(--background)' }}>
      <div className="absolute top-6 right-6">
        <ThemeToggle 
          isDarkMode={isDarkMode} 
          onToggle={onToggleDarkMode} 
          variant="compact"
        />
      </div>
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">AI 프로젝트 관리 시스템</CardTitle>
          <CardDescription>
            AI 기반 프로젝트 관리 시스템에 로그인하세요
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">이메일</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@ai-project.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">비밀번호</Label>
              <Input
                id="password"
                type="password"
                placeholder="admin123"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <div className="space-y-3">
              <Button 
                type="submit" 
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                disabled={isLoading}
              >
                {isLoading ? '로그인 중...' : '로그인'}
              </Button>
              
              {error && (
                <p className="text-sm text-red-500 text-center" role="alert">
                  {error}
                </p>
              )}

              <Button 
                type="button"
                variant="outline" 
                className="w-full"
                onClick={() => handleDemoLogin(demoAccounts[0])}
                disabled={isLoading}
              >
                관리자 계정으로 자동 입력
              </Button>
            </div>
          </form>
          
          <div className="mt-6 space-y-4">
            <div className="text-center text-sm text-muted-foreground">
              <p><strong>역할별 데모 계정:</strong></p>
            </div>
            
            <div className="grid grid-cols-1 gap-2">
              {demoAccounts.map((account, index) => {
                const Icon = account.icon;
                return (
                  <button
                    key={index}
                    onClick={() => handleDemoLogin(account)}
                    className="w-full p-3 text-left border border-border rounded-lg hover:bg-accent/50 transition-colors"
                    disabled={isLoading}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="w-4 h-4 text-muted-foreground" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">{account.user.name}</span>
                          <Badge variant={getRoleBadgeVariant(account.user.role)} className="text-xs">
                            {getRoleLabel(account.user.role)}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">{account.description}</p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
            
            <div className="text-center text-xs text-muted-foreground bg-muted/50 p-3 rounded-lg">
              💡 <strong>팁:</strong> 계정 버튼을 클릭하면 자동으로 로그인 정보가 입력됩니다
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
