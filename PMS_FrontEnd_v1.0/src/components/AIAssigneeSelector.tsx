import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Skeleton } from './ui/skeleton';
import { Sparkles, User, TrendingUp, Clock, Award } from 'lucide-react';

interface AssigneeRecommendation {
  id: string;
  name: string;
  matchScore: number;
  currentWorkload: number;
  relevantExperience: string[];
  avgCompletionTime: number;
  successRate: number;
  department: string;
  reasons: string[];
}

interface AIAssigneeSelectorProps {
  taskTitle: string;
  taskDescription: string;
  onSelectAssignee: (assigneeName: string) => void;
  selectedAssignee?: string;
  disabled?: boolean;
}

const mockTeamMembers = [
  { id: '1', name: '김AI개발', department: 'AI사업부' },
  { id: '2', name: '이RPA엔지니어', department: 'AI사업부' },
  { id: '3', name: '박ML엔지니어', department: 'AI사업부' },
  { id: '4', name: '최풀스택', department: 'AI사업부' },
  { id: '5', name: '정DB관리자', department: 'AI사업부' },
  { id: '6', name: '한보안전문가', department: 'AI사업부' },
  { id: '7', name: '송QA엔지니어', department: 'AI사업부' }
];

const generateRecommendations = (title: string, description: string): AssigneeRecommendation[] => {
  const combinedText = `${title} ${description}`.toLowerCase();
  
  // AI-based matching logic simulation
  const recommendations: AssigneeRecommendation[] = [];
  
  // OCR/AI/ML related keywords
  if (combinedText.includes('ocr') || combinedText.includes('모델') || combinedText.includes('ai') || combinedText.includes('머신러닝')) {
    recommendations.push({
      id: '1',
      name: '김AI개발',
      matchScore: 95,
      currentWorkload: 82,
      relevantExperience: ['TensorFlow', 'OpenCV', 'OCR 모델링', 'Computer Vision'],
      avgCompletionTime: 7.2,
      successRate: 89,
      department: 'AI사업부',
      reasons: [
        'OCR 및 Computer Vision 관련 프로젝트 5회 경험',
        'TensorFlow 모델 개발 전문성 보유',
        '유사 작업 평균 완료 시간: 7.2일'
      ]
    });
    
    recommendations.push({
      id: '3',
      name: '박ML엔지니어',
      matchScore: 88,
      currentWorkload: 65,
      relevantExperience: ['Scikit-learn', 'PyTorch', '자연어처리', '데이터 전처리'],
      avgCompletionTime: 6.8,
      successRate: 92,
      department: 'AI사업부',
      reasons: [
        '머신러닝 모델 개발 및 최적화 경험 다수',
        '현재 업무 부하 상대적으로 낮음 (65%)',
        '프로젝트 성공률 92%로 높은 신뢰도'
      ]
    });
  }
  
  // RPA/자동화 related keywords
  if (combinedText.includes('rpa') || combinedText.includes('자동화') || combinedText.includes('워크플로우')) {
    recommendations.push({
      id: '2',
      name: '이RPA엔지니어',
      matchScore: 94,
      currentWorkload: 58,
      relevantExperience: ['UiPath', 'Blue Prism', '프로세스 자동화', '워크플로우 설계'],
      avgCompletionTime: 5.5,
      successRate: 87,
      department: 'AI사업부',
      reasons: [
        'RPA 구축 전문가로 관련 프로젝트 8회 완료',
        '프로세스 자동화 설계 경험 풍부',
        '현재 업무 부하 낮음 (58%)'
      ]
    });
  }
  
  // 데이터베이스 related keywords
  if (combinedText.includes('데이터베이스') || combinedText.includes('스키마') || combinedText.includes('db')) {
    recommendations.push({
      id: '5',
      name: '정DB관리자',
      matchScore: 92,
      currentWorkload: 45,
      relevantExperience: ['PostgreSQL', 'MongoDB', '스키마 설계', '데이터 모델링'],
      avgCompletionTime: 4.2,
      successRate: 95,
      department: 'AI사업부',
      reasons: [
        '데이터베이스 설계 및 최적화 전문가',
        '현재 업무 부하 가장 낮음 (45%)',
        '프로젝트 성공률 95%로 최고 수준'
      ]
    });
  }
  
  // 보안 related keywords
  if (combinedText.includes('보안') || combinedText.includes('개인정보') || combinedText.includes('gdpr')) {
    recommendations.push({
      id: '6',
      name: '한보안전문가',
      matchScore: 96,
      currentWorkload: 72,
      relevantExperience: ['GDPR 컴플라이언스', '데이터 보안', '암호화', '보안 감사'],
      avgCompletionTime: 8.1,
      successRate: 91,
      department: 'AI사업부',
      reasons: [
        'GDPR 및 개인정보보호법 전문가',
        '보안 감사 및 컴플라이언스 경험 다수',
        '금융권 보안 프로젝트 경험 보유'
      ]
    });
  }
  
  // 대시보드/UI related keywords
  if (combinedText.includes('대시보드') || combinedText.includes('ui') || combinedText.includes('인터페이스')) {
    recommendations.push({
      id: '4',
      name: '최풀스택',
      matchScore: 85,
      currentWorkload: 55,
      relevantExperience: ['React', 'Node.js', 'UI/UX 설계', '대시보드 개발'],
      avgCompletionTime: 6.5,
      successRate: 88,
      department: 'AI사업부',
      reasons: [
        '대시보드 및 관리 시스템 개발 전문',
        'React 기반 UI 개발 경험 풍부',
        '현재 업무 부하 적정 수준 (55%)'
      ]
    });
  }
  
  // 테스트 related keywords
  if (combinedText.includes('테스트') || combinedText.includes('qa') || combinedText.includes('성능')) {
    recommendations.push({
      id: '7',
      name: '송QA엔지니어',
      matchScore: 89,
      currentWorkload: 48,
      relevantExperience: ['성능 테스트', 'JMeter', '자동화 테스트', '품질 관리'],
      avgCompletionTime: 5.8,
      successRate: 93,
      department: 'AI사업부',
      reasons: [
        '성능 테스트 및 최적화 전문가',
        '대용량 시스템 테스트 경험 보유',
        '현재 업무 부하 낮음 (48%)'
      ]
    });
  }
  
  // Always add some general recommendations if no specific match
  if (recommendations.length === 0) {
    // 업무 부하가 낮은 순으로 추천
    recommendations.push({
      id: '5',
      name: '정DB관리자',
      matchScore: 65,
      currentWorkload: 45,
      relevantExperience: ['PostgreSQL', 'MongoDB', '스키마 설계'],
      avgCompletionTime: 4.2,
      successRate: 95,
      department: 'AI사업부',
      reasons: ['현재 업무 부하 가장 낮음', '높은 프로젝트 성공률']
    });
    
    recommendations.push({
      id: '7',
      name: '송QA엔지니어',
      matchScore: 62,
      currentWorkload: 48,
      relevantExperience: ['성능 테스트', 'JMeter'],
      avgCompletionTime: 5.8,
      successRate: 93,
      department: 'AI사업부',
      reasons: ['업무 부하 낮음', '안정적인 작업 수행']
    });
  }
  
  // Sort by match score and limit to top 3
  return recommendations
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, 3);
};

export function AIAssigneeSelector({ 
  taskTitle, 
  taskDescription, 
  onSelectAssignee, 
  selectedAssignee,
  disabled = false 
}: AIAssigneeSelectorProps) {
  const [recommendations, setRecommendations] = useState<AssigneeRecommendation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showRecommendations, setShowRecommendations] = useState(false);

  useEffect(() => {
    if (taskTitle.trim() || taskDescription.trim()) {
      const loadRecommendations = async () => {
        setIsLoading(true);
        setShowRecommendations(true);
        
        // Simulate AI processing time
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        const recs = generateRecommendations(taskTitle, taskDescription);
        setRecommendations(recs);
        setIsLoading(false);
      };
      
      loadRecommendations();
    } else {
      setShowRecommendations(false);
      setRecommendations([]);
    }
  }, [taskTitle, taskDescription]);

  const getWorkloadColor = (workload: number) => {
    if (workload >= 80) return 'text-red-600 bg-red-50 border-red-200';
    if (workload >= 60) return 'text-orange-600 bg-orange-50 border-orange-200';
    return 'text-green-600 bg-green-50 border-green-200';
  };

  if (!showRecommendations) {
    return null;
  }

  return (
    <div className="mt-4">
      <Card className="glass-card border-purple-200 dark:border-purple-700">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-purple-600" />
            AI 담당자 추천
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-600"></div>
                <span>작업 내용을 분석하여 최적의 담당자를 찾고 있습니다...</span>
              </div>
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center space-x-3">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-48" />
                  </div>
                  <Skeleton className="h-6 w-16" />
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {recommendations.length > 0 ? (
                recommendations.map((rec, index) => (
                  <div 
                    key={rec.id}
                    className={`p-3 rounded-lg border-2 transition-all cursor-pointer hover:shadow-md ${
                      selectedAssignee === rec.name 
                        ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20' 
                        : 'border-gray-200 dark:border-gray-700 hover:border-purple-300'
                    }`}
                    onClick={() => onSelectAssignee(rec.name)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3 flex-1">
                        <div className="flex items-center gap-2">
                          <div className="text-lg font-bold text-purple-600 bg-purple-100 rounded-full w-6 h-6 flex items-center justify-center text-xs">
                            {index + 1}
                          </div>
                          <Avatar className="w-8 h-8">
                            <AvatarFallback className="text-xs">
                              {rec.name.slice(0, 2)}
                            </AvatarFallback>
                          </Avatar>
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-medium text-sm">{rec.name}</h4>
                            <Badge className={`text-xs px-2 py-0 ${getWorkloadColor(rec.currentWorkload)}`}>
                              부하 {rec.currentWorkload}%
                            </Badge>
                          </div>
                          
                          <div className="flex items-center gap-4 text-xs text-muted-foreground mb-2">
                            <div className="flex items-center gap-1">
                              <TrendingUp className="w-3 h-3" />
                              <span>매칭 {rec.matchScore}%</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              <span>평균 {rec.avgCompletionTime}일</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Award className="w-3 h-3" />
                              <span>성공률 {rec.successRate}%</span>
                            </div>
                          </div>
                          
                          <div className="mb-2">
                            <div className="flex flex-wrap gap-1">
                              {rec.relevantExperience.slice(0, 3).map((skill, idx) => (
                                <Badge key={idx} variant="secondary" className="text-xs py-0 px-1">
                                  {skill}
                                </Badge>
                              ))}
                              {rec.relevantExperience.length > 3 && (
                                <Badge variant="secondary" className="text-xs py-0 px-1">
                                  +{rec.relevantExperience.length - 3}
                                </Badge>
                              )}
                            </div>
                          </div>
                          
                          <ul className="text-xs text-muted-foreground space-y-0.5">
                            {rec.reasons.slice(0, 2).map((reason, idx) => (
                              <li key={idx} className="flex items-start">
                                <span className="inline-block w-1 h-1 bg-purple-400 rounded-full mt-1.5 mr-2 flex-shrink-0"></span>
                                <span className="leading-relaxed">{reason}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                      
                      <Button
                        size="sm"
                        variant={selectedAssignee === rec.name ? "default" : "outline"}
                        disabled={disabled}
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectAssignee(rec.name);
                        }}
                        className="ml-2"
                      >
                        {selectedAssignee === rec.name ? '선택됨' : '선택'}
                      </Button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-4">
                  <User className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">
                    작업 내용을 입력하면 AI가 최적의 담당자를 추천해드립니다.
                  </p>
                </div>
              )}
              
              <div className="border-t pt-3 mt-4">
                <p className="text-xs text-muted-foreground text-center">
                  💡 추천은 과거 작업 이력, 기술 스택, 현재 업무 부하를 종합하여 AI가 분석한 결과입니다.
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}