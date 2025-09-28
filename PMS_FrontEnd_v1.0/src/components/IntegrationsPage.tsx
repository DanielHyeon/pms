import React, { useState, useEffect } from 'react';
import { ArrowLeft, Plus, Settings, Check, X, RefreshCw, AlertTriangle, Link, Unlink, Zap, MessageSquare, FileText, Github, Gitlab, Code, Slack } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Switch } from './ui/switch';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Separator } from './ui/separator';

interface User {
  id: string;
  name: string;
  role: string;
}

interface IntegrationsPageProps {
  user: User;
  onBack: () => void;
  onLogout: () => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
}

// 통합 서비스 타입
interface Integration {
  id: string;
  name: string;
  description: string;
  category: 'communication' | 'development' | 'documentation' | 'analytics' | 'automation';
  icon: React.ReactNode;
  status: 'connected' | 'disconnected' | 'error' | 'pending';
  isEnabled: boolean;
  lastSync?: string;
  config?: any;
  features: string[];
  webhookUrl?: string;
  apiKey?: string;
}

// 통합 이벤트 로그
interface IntegrationLog {
  id: string;
  integrationId: string;
  type: 'sync' | 'webhook' | 'api_call' | 'error';
  message: string;
  timestamp: string;
  status: 'success' | 'error' | 'warning';
  details?: any;
}

export function IntegrationsPage({ user, onBack, onLogout }: IntegrationsPageProps) {
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [integrationLogs, setIntegrationLogs] = useState<IntegrationLog[]>([]);
  const [selectedIntegration, setSelectedIntegration] = useState<Integration | null>(null);
  const [showConfigDialog, setShowConfigDialog] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  // Mock 데이터 초기화
  useEffect(() => {
    const mockIntegrations: Integration[] = [
      {
        id: 'slack',
        name: 'Slack',
        description: '팀 커뮤니케이션 및 알림 연동',
        category: 'communication',
        icon: <MessageSquare className="w-6 h-6" />,
        status: 'connected',
        isEnabled: true,
        lastSync: '2024-12-27 14:30:00',
        features: ['실시간 알림', '작업 생성', '상태 업데이트', '보고서 공유'],
        webhookUrl: 'https://hooks.slack.com/services/T00000000/B00000000/XXXXXXXXXXXXXXXXXXXXXXX',
        config: {
          channel: '#project-updates',
          botToken: 'xoxb-xxxxxxxxxxxx-xxxxxxxxxxxx-xxxxxxxxxxxxxxxx',
          enableMentions: true,
          notificationTypes: ['task_created', 'task_completed', 'risk_detected']
        }
      },
      {
        id: 'teams',
        name: 'Microsoft Teams',
        description: 'Microsoft Teams 채널 연동',
        category: 'communication',
        icon: <MessageSquare className="w-6 h-6" />,
        status: 'disconnected',
        isEnabled: false,
        features: ['채널 알림', '회의 일정 연동', '파일 공유'],
        config: {}
      },
      {
        id: 'github',
        name: 'GitHub',
        description: 'GitHub 리포지토리 및 커밋 추적',
        category: 'development',
        icon: <Github className="w-6 h-6" />,
        status: 'connected',
        isEnabled: true,
        lastSync: '2024-12-27 15:00:00',
        features: ['커밋 추적', '이슈 연동', 'PR 관리', '코드 품질 분석'],
        config: {
          repositories: ['myorg/project-a', 'myorg/project-b'],
          accessToken: 'ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxx',
          trackBranches: ['main', 'develop'],
          enableWebhooks: true
        }
      },
      {
        id: 'gitlab',
        name: 'GitLab',
        description: 'GitLab 프로젝트 연동',
        category: 'development',
        icon: <Gitlab className="w-6 h-6" />,
        status: 'error',
        isEnabled: false,
        features: ['소스 코드 관리', '파이프라인 추적', '이슈 관리'],
        config: {}
      },
      {
        id: 'bitbucket',
        name: 'Bitbucket',
        description: 'Bitbucket 리포지토리 연동',
        category: 'development',
        icon: <Code className="w-6 h-6" />,
        status: 'disconnected',
        isEnabled: false,
        features: ['리포지토리 동기화', 'PR 추적', '브랜치 관리'],
        config: {}
      },
      {
        id: 'confluence',
        name: 'Confluence',
        description: '문서 협업 및 지식 관리',
        category: 'documentation',
        icon: <FileText className="w-6 h-6" />,
        status: 'connected',
        isEnabled: true,
        lastSync: '2024-12-27 13:45:00',
        features: ['문서 검색', '요구사항 연동', 'AI 지식 베이스', '자동 문서화'],
        config: {
          spaceKey: 'PROJ',
          baseUrl: 'https://company.atlassian.net/wiki',
          apiToken: 'ATATT3xFfGF0T...',
          enableSearch: true,
          syncPages: ['requirements', 'specifications', 'meeting-notes']
        }
      },
      {
        id: 'notion',
        name: 'Notion',
        description: 'Notion 워크스페이스 연동',
        category: 'documentation',
        icon: <FileText className="w-6 h-6" />,
        status: 'pending',
        isEnabled: false,
        features: ['페이지 동기화', '데이터베이스 연동', '템플릿 관리'],
        config: {}
      },
      {
        id: 'jira',
        name: 'Jira',
        description: 'Jira 이슈 및 프로젝트 동기화',
        category: 'development',
        icon: <Settings className="w-6 h-6" />,
        status: 'disconnected',
        isEnabled: false,
        features: ['이슈 가져오기', '스프린트 동기화', '백로그 관리'],
        config: {}
      }
    ];

    const mockLogs: IntegrationLog[] = [
      {
        id: 'log-1',
        integrationId: 'slack',
        type: 'webhook',
        message: 'AI 챗봇 프로젝트 작업 완료 알림 전송',
        timestamp: '2024-12-27 14:30:25',
        status: 'success'
      },
      {
        id: 'log-2',
        integrationId: 'github',
        type: 'sync',
        message: '커밋 데이터 동기화 완료 (15개 커밋)',
        timestamp: '2024-12-27 15:00:12',
        status: 'success'
      },
      {
        id: 'log-3',
        integrationId: 'confluence',
        type: 'api_call',
        message: 'AI 어시스턴트 지식 베이스 업데이트',
        timestamp: '2024-12-27 13:45:33',
        status: 'success'
      },
      {
        id: 'log-4',
        integrationId: 'gitlab',
        type: 'error',
        message: 'API 인증 실패 - 토큰 만료',
        timestamp: '2024-12-27 12:15:44',
        status: 'error',
        details: { error_code: 401, message: 'Unauthorized access' }
      },
      {
        id: 'log-5',
        integrationId: 'slack',
        type: 'webhook',
        message: '위험 작업 감지 알림 전송',
        timestamp: '2024-12-27 11:20:18',
        status: 'warning'
      }
    ];

    setIntegrations(mockIntegrations);
    setIntegrationLogs(mockLogs);
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected':
        return <Check className="w-4 h-4 text-green-500" />;
      case 'disconnected':
        return <X className="w-4 h-4 text-gray-500" />;
      case 'error':
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
      case 'pending':
        return <RefreshCw className="w-4 h-4 text-yellow-500 animate-spin" />;
      default:
        return <X className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'connected': return '연결됨';
      case 'disconnected': return '연결 안됨';
      case 'error': return '오류';
      case 'pending': return '연결 중';
      default: return '알 수 없음';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected': return 'bg-green-500';
      case 'disconnected': return 'bg-gray-500';
      case 'error': return 'bg-red-500';
      case 'pending': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'communication': return <MessageSquare className="w-5 h-5" />;
      case 'development': return <Code className="w-5 h-5" />;
      case 'documentation': return <FileText className="w-5 h-5" />;
      case 'analytics': return <Settings className="w-5 h-5" />;
      case 'automation': return <Zap className="w-5 h-5" />;
      default: return <Settings className="w-5 h-5" />;
    }
  };

  const getCategoryText = (category: string) => {
    switch (category) {
      case 'communication': return '커뮤니케이션';
      case 'development': return '개발 도구';
      case 'documentation': return '문서 관리';
      case 'analytics': return '분석 도구';
      case 'automation': return '자동화';
      default: return '기타';
    }
  };

  const handleToggleIntegration = (integrationId: string, enabled: boolean) => {
    setIntegrations(prev => prev.map(integration => 
      integration.id === integrationId 
        ? { ...integration, isEnabled: enabled }
        : integration
    ));
  };

  const handleConnectIntegration = (integration: Integration) => {
    setSelectedIntegration(integration);
    setShowConfigDialog(true);
  };

  const handleSaveConfig = () => {
    if (selectedIntegration) {
      setIntegrations(prev => prev.map(integration => 
        integration.id === selectedIntegration.id 
          ? { ...integration, status: 'connected', isEnabled: true }
          : integration
      ));
    }
    setShowConfigDialog(false);
    setSelectedIntegration(null);
  };

  const renderConfigForm = () => {
    if (!selectedIntegration) return null;

    switch (selectedIntegration.id) {
      case 'slack':
        return (
          <div className="space-y-4">
            <div>
              <Label>Webhook URL</Label>
              <Input 
                placeholder="https://hooks.slack.com/services/..." 
                defaultValue={selectedIntegration.webhookUrl}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Slack 앱에서 Incoming Webhook URL을 복사해 붙여넣으세요
              </p>
            </div>
            <div>
              <Label>알림 채널</Label>
              <Input 
                placeholder="#project-updates" 
                defaultValue={selectedIntegration.config?.channel}
              />
            </div>
            <div>
              <Label>Bot Token</Label>
              <Input 
                type="password"
                placeholder="xoxb-..." 
                defaultValue={selectedIntegration.config?.botToken}
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch 
                id="mentions" 
                defaultChecked={selectedIntegration.config?.enableMentions}
              />
              <Label htmlFor="mentions">@멘션 기능 활성화</Label>
            </div>
          </div>
        );

      case 'github':
        return (
          <div className="space-y-4">
            <div>
              <Label>Personal Access Token</Label>
              <Input 
                type="password"
                placeholder="ghp_..." 
                defaultValue={selectedIntegration.config?.accessToken}
              />
              <p className="text-xs text-muted-foreground mt-1">
                GitHub 설정에서 Personal Access Token을 생성하세요
              </p>
            </div>
            <div>
              <Label>리포지토리 목록</Label>
              <Textarea 
                placeholder="owner/repo1&#10;owner/repo2"
                rows={3}
                defaultValue={selectedIntegration.config?.repositories?.join('\n')}
              />
              <p className="text-xs text-muted-foreground mt-1">
                한 줄에 하나씩 owner/repository 형식으로 입력
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <Switch 
                id="webhooks" 
                defaultChecked={selectedIntegration.config?.enableWebhooks}
              />
              <Label htmlFor="webhooks">Webhook 자동 설정</Label>
            </div>
          </div>
        );

      case 'confluence':
        return (
          <div className="space-y-4">
            <div>
              <Label>Confluence URL</Label>
              <Input 
                placeholder="https://company.atlassian.net/wiki" 
                defaultValue={selectedIntegration.config?.baseUrl}
              />
            </div>
            <div>
              <Label>API Token</Label>
              <Input 
                type="password"
                placeholder="ATATT3xFfGF0T..." 
                defaultValue={selectedIntegration.config?.apiToken}
              />
            </div>
            <div>
              <Label>Space Key</Label>
              <Input 
                placeholder="PROJ" 
                defaultValue={selectedIntegration.config?.spaceKey}
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch 
                id="search" 
                defaultChecked={selectedIntegration.config?.enableSearch}
              />
              <Label htmlFor="search">AI 검색 기능 활성화</Label>
            </div>
          </div>
        );

      default:
        return (
          <div className="space-y-4">
            <div>
              <Label>API URL</Label>
              <Input placeholder="https://api.example.com" />
            </div>
            <div>
              <Label>API 키</Label>
              <Input type="password" placeholder="API 키를 입력하세요" />
            </div>
            <div>
              <Label>설정 메모</Label>
              <Textarea placeholder="추가 설정 정보를 입력하세요" rows={3} />
            </div>
          </div>
        );
    }
  };

  const getLogStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'text-green-600';
      case 'error': return 'text-red-600';
      case 'warning': return 'text-yellow-600';
      default: return 'text-gray-600';
    }
  };

  const connectedIntegrations = integrations.filter(i => i.status === 'connected').length;
  const errorIntegrations = integrations.filter(i => i.status === 'error').length;

  return (
    <div className="min-h-screen p-6 space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={onBack} className="p-2">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">통합 연동 관리</h1>
            <p className="text-muted-foreground">외부 서비스와의 연동 설정 및 관리</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={onLogout}>
            로그아웃
          </Button>
        </div>
      </div>

      {/* 통합 요약 카드들 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="glass-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">전체 통합</CardTitle>
            <Link className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{integrations.length}</div>
            <p className="text-xs text-muted-foreground">사용 가능한 서비스</p>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">연결된 서비스</CardTitle>
            <Check className="w-4 h-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{connectedIntegrations}</div>
            <p className="text-xs text-muted-foreground">정상 작동 중</p>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">오류 상태</CardTitle>
            <AlertTriangle className="w-4 h-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{errorIntegrations}</div>
            <p className="text-xs text-muted-foreground">수정 필요</p>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">최근 동기화</CardTitle>
            <RefreshCw className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2분 전</div>
            <p className="text-xs text-muted-foreground">GitHub 커밋 추적</p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">전체 현황</TabsTrigger>
          <TabsTrigger value="categories">카테고리별</TabsTrigger>
          <TabsTrigger value="logs">연동 로그</TabsTrigger>
        </TabsList>

        {/* 전체 현황 탭 */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {integrations.map(integration => (
              <Card key={integration.id} className="glass-card">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 rounded-lg bg-muted">
                        {integration.icon}
                      </div>
                      <div>
                        <CardTitle className="text-base">{integration.name}</CardTitle>
                        <CardDescription className="text-sm">
                          {getCategoryText(integration.category)}
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(integration.status)}
                      <Switch 
                        checked={integration.isEnabled}
                        onCheckedChange={(checked) => handleToggleIntegration(integration.id, checked)}
                        disabled={integration.status !== 'connected'}
                      />
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    {integration.description}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <Badge className={getStatusColor(integration.status)}>
                      {getStatusText(integration.status)}
                    </Badge>
                    {integration.lastSync && (
                      <span className="text-xs text-muted-foreground">
                        마지막 동기화: {new Date(integration.lastSync).toLocaleString('ko-KR')}
                      </span>
                    )}
                  </div>

                  <div className="space-y-2">
                    <div className="text-xs font-medium text-muted-foreground">주요 기능:</div>
                    <div className="flex flex-wrap gap-1">
                      {integration.features.slice(0, 3).map((feature, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {feature}
                        </Badge>
                      ))}
                      {integration.features.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{integration.features.length - 3}개 더
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    {integration.status === 'connected' ? (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1"
                        onClick={() => handleConnectIntegration(integration)}
                      >
                        <Settings className="w-4 h-4 mr-2" />
                        설정
                      </Button>
                    ) : (
                      <Button 
                        size="sm" 
                        className="flex-1"
                        onClick={() => handleConnectIntegration(integration)}
                      >
                        <Link className="w-4 h-4 mr-2" />
                        연결
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* 카테고리별 탭 */}
        <TabsContent value="categories" className="space-y-6">
          {(['communication', 'development', 'documentation'] as const).map(category => {
            const categoryIntegrations = integrations.filter(i => i.category === category);
            if (categoryIntegrations.length === 0) return null;

            return (
              <Card key={category} className="glass-card">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    {getCategoryIcon(category)}
                    <span>{getCategoryText(category)}</span>
                    <Badge variant="outline">{categoryIntegrations.length}개</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {categoryIntegrations.map(integration => (
                      <div key={integration.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center space-x-3">
                          {integration.icon}
                          <div>
                            <div className="font-medium">{integration.name}</div>
                            <div className="text-sm text-muted-foreground">{integration.description}</div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(integration.status)}
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleConnectIntegration(integration)}
                          >
                            설정
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </TabsContent>

        {/* 연동 로그 탭 */}
        <TabsContent value="logs" className="space-y-6">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle>연동 활동 로그</CardTitle>
              <CardDescription>최근 통합 서비스 활동 내역</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {integrationLogs.map(log => {
                  const integration = integrations.find(i => i.id === log.integrationId);
                  return (
                    <div key={log.id} className="flex items-start space-x-3 p-3 border rounded-lg">
                      <div className="flex-shrink-0 mt-1">
                        {integration?.icon || <Settings className="w-4 h-4" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2">
                          <span className="font-medium">{integration?.name}</span>
                          <Badge variant="outline" className="text-xs">
                            {log.type.replace('_', ' ')}
                          </Badge>
                          <span className={`text-xs ${getLogStatusColor(log.status)}`}>
                            {log.status}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">{log.message}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(log.timestamp).toLocaleString('ko-KR')}
                        </p>
                        {log.details && (
                          <details className="mt-2">
                            <summary className="text-xs cursor-pointer text-muted-foreground hover:text-foreground">
                              상세 정보
                            </summary>
                            <pre className="text-xs mt-1 p-2 bg-muted rounded text-muted-foreground">
                              {JSON.stringify(log.details, null, 2)}
                            </pre>
                          </details>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* 통합 설정 모달 */}
      <Dialog open={showConfigDialog} onOpenChange={setShowConfigDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              {selectedIntegration?.icon}
              <span>{selectedIntegration?.name} 연동 설정</span>
            </DialogTitle>
            <DialogDescription>
              {selectedIntegration?.description}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6">
            {renderConfigForm()}
            
            <Separator />
            
            <div className="space-y-3">
              <div className="text-sm font-medium">기능 목록</div>
              <div className="space-y-2">
                {selectedIntegration?.features.map((feature, index) => (
                  <div key={index} className="flex items-center space-x-2 text-sm">
                    <Check className="w-4 h-4 text-green-500" />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowConfigDialog(false)}>
                취소
              </Button>
              <Button onClick={handleSaveConfig}>
                {selectedIntegration?.status === 'connected' ? '설정 저장' : '연결하기'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}