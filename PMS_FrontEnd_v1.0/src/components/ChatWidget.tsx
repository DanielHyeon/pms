import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { ScrollArea } from './ui/scroll-area';
import { Badge } from './ui/badge';
import { Skeleton } from './ui/skeleton';
import { 
  MessageCircle, 
  X, 
  Send, 
  Bot, 
  User, 
  Sparkles, 
  TrendingUp, 
  AlertTriangle,
  Clock,
  Users,
  GitCommit,
  CheckCircle,
  XCircle,
  MinusCircle
} from 'lucide-react';

interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: string;
  suggestions?: string[];
  data?: any; // 구조화된 데이터 (차트, 테이블 등)
}

interface ChatWidgetProps {
  projectId: string;
  projectName: string;
  isOpen: boolean;
  onToggle: () => void;
}

// Mock RAG 데이터베이스 시뮬레이션
const mockProjectData: Record<string, any> = {
  '4': {
    name: '손해보험 지급심사 AI 자동화',
    totalTasks: 23,
    completedTasks: 8,
    inProgressTasks: 6,
    pendingTasks: 9,
    teamMembers: ['김AI개발', '박ML엔지니어', '이RPA엔지니어', '최풀스택', '정DB관리자', '한보안전문가', '송QA엔지니어'],
    recentRequirements: [
      { id: 'REQ-005', title: '카카오 소셜 로그인', assignee: '김AI개발', status: 'in-progress' },
      { id: 'REQ-006', title: '비밀번호 찾기 기능', assignee: '이RPA엔지니어', status: 'pending' }
    ],
    recentCommits: [
      { author: '김AI개발', message: 'feat: 카카오 API 연동 구현', files: 5, date: '어제' },
      { author: '박ML엔지니어', message: 'fix: OCR 모델 정확도 개선', files: 3, date: '2일 전' },
      { author: '최풀스택', message: 'ui: 대시보드 레이아웃 수정', files: 2, date: '3일 전' }
    ],
    currentSprint: {
      name: 'Sprint 3 - AI 모델 개발',
      progress: 65,
      daysLeft: 8
    },
    qualityMetrics: {
      codeComplexity: 7.2,
      testCoverage: 78,
      bugRate: 0.8,
      performanceScore: 85
    }
  },
  '1': {
    name: 'AI 챗봇 개발',
    totalTasks: 12,
    completedTasks: 12,
    inProgressTasks: 0,
    pendingTasks: 0,
    teamMembers: ['김분석가', '김데이터', '이개발자'],
    currentSprint: {
      name: '프로젝트 완료',
      progress: 100,
      daysLeft: 0
    }
  }
};

// AI 응답 생성 시뮬레이션
const generateAIResponse = async (userMessage: string, projectId: string): Promise<Message> => {
  // 시뮬레이션 지연
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  const projectData = mockProjectData[projectId];
  const message = userMessage.toLowerCase();
  
  let response = '';
  let suggestions: string[] = [];
  let data: any = null;

  // 키워드 기반 응답 생성
  if (message.includes('요구사항') || message.includes('requirement')) {
    response = `이번 주에 새로 추가된 요구사항은 총 ${projectData.recentRequirements?.length || 0}건입니다.\n\n`;
    
    if (projectData.recentRequirements) {
      projectData.recentRequirements.forEach((req: any) => {
        response += `• **${req.id}**: ${req.title} (담당자: ${req.assignee})\n`;
      });
    }
    
    response += '\n더 궁금한 점이 있으신가요?';
    suggestions = ['REQ-005 진행상황 요약해줘', '이번 스프린트 진행률은?', '팀원별 업무 현황'];
    
  } else if (message.includes('req-005') || message.includes('카카오')) {
    response = `**REQ-005: 카카오 소셜 로그인**은 현재 '진행 중'이며, 하위 작업 3개 중 1개가 완료되었습니다.\n\n`;
    response += `**최근 활동:**\n`;
    response += `• 어제 김AI개발님이 '카카오 API 연동' 관련하여 5개의 파일을 수정했습니다.\n`;
    response += `• 현재까지 식별된 블로커는 없습니다.\n`;
    response += `• 예상 완료일: 이번 주 금요일\n\n`;
    response += `**기술적 진행사항:**\n`;
    response += `• OAuth 2.0 인증 플로우 구현 완료\n`;
    response += `• 사용자 정보 매핑 API 개발 중\n`;
    response += `• 테스트 케이스 작성 예정`;
    
    suggestions = ['다른 요구사항 상태는?', '김AI개발님 업무 부하 확인', '카카오 API 테스트 일정'];
    
  } else if (message.includes('스프린트') || message.includes('진행') || message.includes('sprint')) {
    const sprint = projectData.currentSprint;
    response = `**${sprint.name}** 진행 현황을 알려드리겠습니다.\n\n`;
    response += `📊 **진행률**: ${sprint.progress}%\n`;
    response += `⏰ **남은 기간**: ${sprint.daysLeft}일\n`;
    response += `✅ **완료된 작업**: ${projectData.completedTasks}/${projectData.totalTasks}\n`;
    response += `🔄 **진행 중 작업**: ${projectData.inProgressTasks}개\n`;
    response += `⏳ **대기 중 작업**: ${projectData.pendingTasks}개\n\n`;
    
    if (sprint.progress >= 80) {
      response += `🎉 스프린트가 순조롭게 진행되고 있습니다!`;
    } else if (sprint.progress >= 60) {
      response += `👍 현재 진행률이 양호합니다.`;
    } else {
      response += `⚠️ 목표 달성을 위해 속도를 높일 필요가 있습니다.`;
    }
    
    suggestions = ['팀원별 작업 현황', '이번 주 완료 예정 작업', '스프린트 리스크 분석'];
    
  } else if (message.includes('팀') || message.includes('멤버') || message.includes('담당자')) {
    response = `**팀 구성 및 현재 상황**\n\n`;
    response += `👥 **팀 구성**: ${projectData.teamMembers.length}명\n`;
    projectData.teamMembers.forEach((member: string, index: number) => {
      const workload = [82, 65, 58, 55, 45, 72, 48][index] || 60;
      const status = workload > 80 ? '🔥 과부하' : workload > 60 ? '🟡 적정' : '🟢 여유';
      response += `• ${member}: ${workload}% ${status}\n`;
    });
    
    response += `\n**주의사항**: 김AI개발님의 업무 부하가 82%로 높습니다.`;
    suggestions = ['김AI개발님 작업 상세', '업무 재분배 제안', '팀 생산성 분석'];
    
  } else if (message.includes('커밋') || message.includes('git') || message.includes('코드')) {
    response = `**최근 Git 활동 현황**\n\n`;
    if (projectData.recentCommits) {
      projectData.recentCommits.forEach((commit: any) => {
        response += `• **${commit.author}** (${commit.date})\n`;
        response += `  "${commit.message}"\n`;
        response += `  수정된 파일: ${commit.files}개\n\n`;
      });
    }
    
    response += `📈 **코드 품질 지표**:\n`;
    const metrics = projectData.qualityMetrics;
    if (metrics) {
      response += `• 코드 복잡도: ${metrics.codeComplexity}/10\n`;
      response += `• 테스트 커버리지: ${metrics.testCoverage}%\n`;
      response += `• 버그 발생률: ${metrics.bugRate}%\n`;
      response += `• 성능 점수: ${metrics.performanceScore}/100`;
    }
    
    suggestions = ['코드 리뷰 현황', '테스트 커버리지 개선 방안', '성능 최적화 제안'];
    
  } else if (message.includes('안녕') || message.includes('도움') || message.includes('help')) {
    response = `안녕하세요! 저는 **${projectData.name}** 프로젝트의 AI 어시스턴트입니다. 🤖\n\n`;
    response += `다음과 같은 질문에 답변드릴 수 있습니다:\n\n`;
    response += `📋 **프로젝트 현황**\n`;
    response += `• 요구사항 및 작업 상태\n`;
    response += `• 스프린트 진행률\n`;
    response += `• 팀원별 업무 현황\n\n`;
    response += `💻 **개발 현황**\n`;
    response += `• Git 커밋 활동\n`;
    response += `• 코드 품질 지표\n`;
    response += `• 성능 및 테스트 현황\n\n`;
    response += `🔍 **분석 및 인사이트**\n`;
    response += `• 리스크 분석\n`;
    response += `• 생산성 분석\n`;
    response += `• 개선 제안`;
    
    suggestions = [
      '이번 주 새로운 요구사항 알려줘',
      '현재 스프린트 진행률은?',
      '팀원별 업무 현황 정리해줘',
      '최근 커밋 활동 요약해줘'
    ];
    
  } else if (message.includes('리스크') || message.includes('위험') || message.includes('문제')) {
    response = `**프로젝트 리스크 분석 결과**\n\n`;
    response += `⚠️ **감지된 리스크**:\n`;
    response += `• 김AI개발님 업무 과부하 (82%)\n`;
    response += `• OCR 모델 복잡도 임계치 근접\n`;
    response += `• 일부 기능 테스트 커버리지 부족\n\n`;
    response += `📊 **전체 리스크 점수**: 68/100 (MEDIUM)\n`;
    response += `🎯 **완료 확률**: 78%\n`;
    response += `📅 **예상 지연**: 5일\n\n`;
    response += `🔧 **권장 조치사항**:\n`;
    response += `• 김AI개발님 업무 일부 재분배\n`;
    response += `• OCR 모델 리팩토링 계획 수립\n`;
    response += `• 테스트 케이스 추가 작성`;
    
    suggestions = ['업무 재분배 계획', '테스트 커버리지 개선', '코드 품질 개선 방안'];
    
  } else {
    // 일반적인 응답
    response = `죄송합니다. "${userMessage}"에 대한 구체적인 정보를 찾지 못했습니다.\n\n`;
    response += `다음과 같은 키워드로 질문해보세요:\n`;
    response += `• 요구사항, 스프린트, 팀원, 커밋, 리스크\n`;
    response += `• 구체적인 작업 ID (예: REQ-005)\n`;
    response += `• 팀원 이름 (예: 김AI개발님)`;
    
    suggestions = [
      '프로젝트 전체 현황',
      '이번 주 진행 상황',
      '도움말'
    ];
  }

  return {
    id: Date.now().toString(),
    type: 'assistant',
    content: response,
    timestamp: new Date().toLocaleTimeString('ko-KR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    }),
    suggestions,
    data
  };
};

export function ChatWidget({ projectId, projectName, isOpen, onToggle }: ChatWidgetProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // 자동 스크롤
  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ 
        behavior: 'smooth',
        block: 'end'
      });
    }
  };

  useEffect(() => {
    // 메시지가 추가될 때마다 약간의 지연 후 스크롤
    const timer = setTimeout(() => {
      scrollToBottom();
    }, 100);
    
    return () => clearTimeout(timer);
  }, [messages]);

  // AI 응답 완료 시 포커스 관리
  useEffect(() => {
    if (!isLoading && messages.length > 0) {
      // AI 응답이 완료되면 입력창에 포커스
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 300);
      
      return () => clearTimeout(timer);
    }
  }, [isLoading, messages.length]);

  // 챗봇이 열릴 때 환영 메시지
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const welcomeMessage: Message = {
        id: 'welcome',
        type: 'assistant',
        content: `안녕하세요! **${projectName}** 프로젝트의 AI 어시스턴트입니다. 🤖\n\n프로젝트에 대해 무엇을 도와드릴까요?`,
        timestamp: new Date().toLocaleTimeString('ko-KR', { 
          hour: '2-digit', 
          minute: '2-digit' 
        }),
        suggestions: [
          '이번 주 새로운 요구사항 알려줘',
          '현재 스프린트 진행률은?',
          '팀원별 업무 현황 정리해줘'
        ]
      };
      setMessages([welcomeMessage]);
    }
  }, [isOpen, projectName, messages.length]);

  // 포커스 관리
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputValue,
      timestamp: new Date().toLocaleTimeString('ko-KR', { 
        hour: '2-digit', 
        minute: '2-digit' 
      })
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const aiResponse = await generateAIResponse(inputValue, projectId);
      setMessages(prev => [...prev, aiResponse]);
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: '죄송합니다. 일시적인 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
        timestamp: new Date().toLocaleTimeString('ko-KR', { 
          hour: '2-digit', 
          minute: '2-digit' 
        })
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      // AI 답변 완료 후 입력창에 포커스
      setTimeout(() => {
        inputRef.current?.focus();
      }, 200);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInputValue(suggestion);
    // 입력창에 포커스를 준 후 메시지 전송
    inputRef.current?.focus();
    setTimeout(() => {
      handleSendMessage();
    }, 100);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!isOpen) {
    return (
      <Button
        onClick={onToggle}
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full shadow-lg bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 z-50"
        size="icon"
      >
        <MessageCircle className="w-6 h-6" />
      </Button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 w-96 h-[600px] shadow-2xl z-50 glass-card border border-purple-200 dark:border-purple-700 rounded-lg overflow-hidden flex flex-col bg-card">
      {/* Header - 고정 높이 */}
      <div className="h-16 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-t-lg flex-shrink-0">
        <div className="flex items-center justify-between h-full px-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
              <Bot className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-medium">AI 어시스턴트</h3>
              <p className="text-xs opacity-90">{projectName}</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggle}
            className="text-white hover:bg-white/20 w-8 h-8 p-0"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Messages - 가변 높이 (전체 - 헤더 - 입력창) */}
      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full">
          <div className="p-4 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${
                  message.type === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                {message.type === 'assistant' && (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 flex items-center justify-center flex-shrink-0 mt-1">
                    <Sparkles className="w-4 h-4 text-white" />
                  </div>
                )}
                
                <div className={`max-w-[280px] ${
                  message.type === 'user' ? 'order-1' : ''
                }`}>
                  <div
                    className={`rounded-lg p-3 text-sm ${
                      message.type === 'user'
                        ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white ml-auto'
                        : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    <div className="whitespace-pre-wrap">{message.content}</div>
                  </div>
                  
                  <div className={`text-xs text-muted-foreground mt-1 ${
                    message.type === 'user' ? 'text-right' : 'text-left'
                  }`}>
                    {message.timestamp}
                  </div>

                  {/* Suggestions */}
                  {message.suggestions && message.suggestions.length > 0 && (
                    <div className="mt-2 space-y-1">
                      {message.suggestions.map((suggestion, index) => (
                        <Button
                          key={index}
                          variant="outline"
                          size="sm"
                          className="text-xs h-7 w-full justify-start"
                          onClick={() => handleSuggestionClick(suggestion)}
                        >
                          {suggestion}
                        </Button>
                      ))}
                    </div>
                  )}
                </div>

                {message.type === 'user' && (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-green-500 to-blue-500 flex items-center justify-center flex-shrink-0 mt-1">
                    <User className="w-4 h-4 text-white" />
                  </div>
                )}
              </div>
            ))}

            {/* Loading indicator */}
            {isLoading && (
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-4 h-4 text-white animate-pulse" />
                </div>
                <div className="bg-muted rounded-lg p-3 max-w-[280px]">
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                      <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                    </div>
                    <span className="text-xs text-muted-foreground">AI가 분석 중입니다...</span>
                  </div>
                </div>
              </div>
            )}
            
            {/* 스크롤 마커 */}
            <div ref={messagesEndRef} className="h-1" />
          </div>
        </ScrollArea>
      </div>

      {/* Input - 고정 높이 */}
      <div className="h-20 border-t border-border flex-shrink-0 bg-card">
        <div className="p-4">
          <div className="flex gap-2">
            <Input
              ref={inputRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="프로젝트에 대해 질문해보세요..."
              disabled={isLoading}
              className="flex-1"
            />
            <Button
              onClick={handleSendMessage}
              disabled={!inputValue.trim() || isLoading}
              size="icon"
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}