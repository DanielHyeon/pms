import React, { useState, useMemo } from 'react';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
import { RequirementTag } from './RequirementTag';
import { CreateTaskModal } from './CreateTaskModal';
import { ChevronRight, ChevronDown, Calendar, Clock, User, Info, Edit, Plus } from 'lucide-react';
import { toast } from 'sonner@2.0.3';

interface Task {
  id: string;
  title: string;
  description: string;
  status: 'todo' | 'in-progress' | 'review' | 'done';
  assignee?: string;
  priority: 'low' | 'medium' | 'high';
  startDate?: string;
  endDate?: string;
  createdAt: string;
  projectId: string;
  requirementId?: string;
  parentTaskId?: string;
  dependencies?: string[];
}

interface Requirement {
  id: string;
  title: string;
  description: string;
  type: 'user-story' | 'feature' | 'bug' | 'epic';
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'draft' | 'active' | 'completed' | 'cancelled';
  trackingNumber: string;
  projectId: string;
}

interface GanttChartProps {
  projectId: string;
}

export function GanttChart({ projectId }: GanttChartProps) {
  const [expandedRequirements, setExpandedRequirements] = useState<Set<string>>(new Set());
  const [expandedTasks, setExpandedTasks] = useState<Set<string>>(new Set());
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'day'>('month');
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);

  // 프로젝트별 요구사항 데이터
  const getProjectRequirements = (projectId: string): Requirement[] => {
    const requirementsMap: { [key: string]: Requirement[] } = {
      '1': [ // AI 챗봇 개발
        {
          id: '1-1',
          title: 'AI 챗봇 시스템 아키텍처',
          description: '챗봇 핵심 시스템 설계 및 구축',
          type: 'epic',
          priority: 'critical',
          status: 'active',
          trackingNumber: 'REQ-001',
          projectId
        },
        {
          id: '1-2',
          title: '자연어 처리 엔진',
          description: 'NLP 기반 의도 파악 및 응답 생성',
          type: 'feature',
          priority: 'critical',
          status: 'active',
          trackingNumber: 'REQ-002',
          projectId
        },
        {
          id: '1-3',
          title: '대화 관리 시스템',
          description: '대화 컨텍스트 관리 및 세션 처리',
          type: 'feature',
          priority: 'high',
          status: 'active',
          trackingNumber: 'REQ-003',
          projectId
        },
        {
          id: '1-4',
          title: '고객 서비스 통합',
          description: '기존 고객 서비스 시스템과 연동',
          type: 'feature',
          priority: 'medium',
          status: 'active',
          trackingNumber: 'REQ-004',
          projectId
        }
      ],
      '2': [ // 모바일 앱 리뉴얼
        {
          id: '2-1',
          title: '모바일 앱 리뉴얼 프로젝트',
          description: 'UI/UX 개선 및 성능 최적화',
          type: 'epic',
          priority: 'high',
          status: 'active',
          trackingNumber: 'REQ-001',
          projectId
        },
        {
          id: '2-2',
          title: 'UI/UX 디자인 시스템',
          description: '새로운 디자인 시스템 구축',
          type: 'feature',
          priority: 'high',
          status: 'active',
          trackingNumber: 'REQ-002',
          projectId
        },
        {
          id: '2-3',
          title: '성능 최적화',
          description: '앱 로딩 속도 및 반응성 개선',
          type: 'feature',
          priority: 'high',
          status: 'active',
          trackingNumber: 'REQ-003',
          projectId
        },
        {
          id: '2-4',
          title: '새로운 기능 추가',
          description: '사용자 요청 기능 구현',
          type: 'feature',
          priority: 'medium',
          status: 'active',
          trackingNumber: 'REQ-004',
          projectId
        }
      ],
      '3': [ // 데이터 분석 플랫폼
        {
          id: '3-1',
          title: '데이터 분석 플랫폼 구축',
          description: 'BI를 위한 종합 데이터 분석 시스템',
          type: 'epic',
          priority: 'critical',
          status: 'active',
          trackingNumber: 'REQ-001',
          projectId
        },
        {
          id: '3-2',
          title: '데이터 파이프라인',
          description: 'ETL 프로세스 및 데이터 처리',
          type: 'feature',
          priority: 'critical',
          status: 'active',
          trackingNumber: 'REQ-002',
          projectId
        },
        {
          id: '3-3',
          title: '분석 대시보드',
          description: '실시간 데이터 시각화 대시보드',
          type: 'feature',
          priority: 'high',
          status: 'active',
          trackingNumber: 'REQ-003',
          projectId
        },
        {
          id: '3-4',
          title: '머신러닝 모델 통합',
          description: '예측 분석 및 ML 모델 연동',
          type: 'feature',
          priority: 'high',
          status: 'active',
          trackingNumber: 'REQ-004',
          projectId
        }
      ],
      '4': [ // 손해보험 지급심사 AI 자동화
        {
          id: '4-1',
          title: '프로젝트 기획 및 분석',
          description: '현행 프로세스 분석 및 AI 자동화 범위 정의',
          type: 'epic',
          priority: 'critical',
          status: 'active',
          trackingNumber: 'REQ-001',
          projectId
        },
        {
          id: '4-2',
          title: 'OCR 시스템 구축',
          description: '의료문서, 영수증, 신분증 OCR 인식 시스템',
          type: 'feature',
          priority: 'critical',
          status: 'active',
          trackingNumber: 'REQ-002',
          projectId
        },
        {
          id: '4-3',
          title: '지급심사 AI 모델',
          description: '신체손해, 재물손해, 배상책임 자동심사 AI',
          type: 'feature',
          priority: 'critical',
          status: 'active',
          trackingNumber: 'REQ-003',
          projectId
        },
        {
          id: '4-4',
          title: '사기탐지 AI 시스템',
          description: '이상패턴, 중복청구, 네트워크 분석 기반 사기탐지',
          type: 'feature',
          priority: 'high',
          status: 'active',
          trackingNumber: 'REQ-004',
          projectId
        },
        {
          id: '4-5',
          title: 'RPA 자동화 시스템',
          description: '데이터 입력, 심사결과 처리, 알림 발송 자동화',
          type: 'feature',
          priority: 'high',
          status: 'active',
          trackingNumber: 'REQ-005',
          projectId
        },
        {
          id: '4-6',
          title: '통합 관리 플랫폼',
          description: '심사자 대시보드, 고객 포털, 통계 리포팅',
          type: 'feature',
          priority: 'medium',
          status: 'active',
          trackingNumber: 'REQ-006',
          projectId
        }
      ],
      // 기본값으로 AI 프로젝트 관리 시스템 (현재 시스템)
      'default': [
        {
          id: 'def-1',
          title: 'AI 프로젝트 관리 시스템 MVP',
          description: 'Git/Jira 통합 AI 자동 보고서 생성 시스템',
          type: 'epic',
          priority: 'critical',
          status: 'active',
          trackingNumber: 'REQ-001',
          projectId
        },
        {
          id: 'def-2',
          title: '스크럼 관리 시스템',
          description: '칸반 보드, 스프린트, 메트릭스 관리',
          type: 'feature',
          priority: 'high',
          status: 'active',
          trackingNumber: 'REQ-002',
          projectId
        },
        {
          id: 'def-3',
          title: 'Git & Jira 통합',
          description: 'Git 레포지토리와 Jira 프로젝트 연동',
          type: 'feature',
          priority: 'high',
          status: 'active',
          trackingNumber: 'REQ-003',
          projectId
        }
      ]
    };

    return requirementsMap[projectId] || requirementsMap['default'];
  };

  const mockRequirements = getProjectRequirements(projectId);

  // 프로젝트별 태스크 데이터 생성
  const getProjectTasks = (projectId: string): Task[] => {
    const tasksMap: { [key: string]: Task[] } = {
      '1': [ // AI 챗봇 개발
        // Phase 1 - 분석 및 설계
        {
          id: '1-1',
          title: '챗봇 요구사항 분석',
          description: '고객 서비스 챗봇 핵심 요구사항 도출',
          status: 'done',
          assignee: '김분석가',
          priority: 'critical',
          startDate: '2024-01-15',
          endDate: '2024-01-31',
          createdAt: '2024-01-15',
          projectId,
          requirementId: '1-1'
        },
        {
          id: '1-2',
          title: '챗봇 아키텍처 설계',
          description: 'AI 챗봇 시스템 전체 아키텍처 설계',
          status: 'done',
          assignee: '이아키텍트',
          priority: 'critical',
          startDate: '2024-02-01',
          endDate: '2024-02-20',
          createdAt: '2024-02-01',
          projectId,
          requirementId: '1-1'
        },
        // Phase 2 - NLP 엔진 개발
        {
          id: '1-3',
          title: 'NLP 모델 선정 및 훈련',
          description: '의도 분류 및 개체명 인식 모델 개발',
          status: 'done',
          assignee: 'AI팀',
          priority: 'critical',
          startDate: '2024-02-15',
          endDate: '2024-04-15',
          createdAt: '2024-02-15',
          projectId,
          requirementId: '1-2'
        },
        {
          id: '1-3-1',
          title: '학습 데이터 수집 및 전처리',
          description: '고객 문의 데이터 수집 및 라벨링',
          status: 'done',
          assignee: '김데이터',
          priority: 'high',
          startDate: '2024-02-15',
          endDate: '2024-03-10',
          createdAt: '2024-02-15',
          projectId,
          requirementId: '1-2',
          parentTaskId: '1-3'
        },
        {
          id: '1-3-2',
          title: '의도 분류 모델 훈련',
          description: 'BERT 기반 의도 분류 모델 개발',
          status: 'done',
          assignee: '박NLP',
          priority: 'critical',
          startDate: '2024-03-01',
          endDate: '2024-03-31',
          createdAt: '2024-03-01',
          projectId,
          requirementId: '1-2',
          parentTaskId: '1-3'
        },
        {
          id: '1-3-3',
          title: '응답 생성 모델 구현',
          description: 'GPT 기반 자연스러운 응답 생성',
          status: 'done',
          assignee: '최GPT',
          priority: 'high',
          startDate: '2024-03-15',
          endDate: '2024-04-15',
          createdAt: '2024-03-15',
          projectId,
          requirementId: '1-2',
          parentTaskId: '1-3'
        },
        // Phase 3 - 대화 관리 시스템
        {
          id: '1-4',
          title: '대화 컨텍스트 관리자 개발',
          description: '멀티턴 대화 상태 관리 시스템',
          status: 'in-progress',
          assignee: '정백엔드',
          priority: 'high',
          startDate: '2024-04-01',
          endDate: '2024-05-15',
          createdAt: '2024-04-01',
          projectId,
          requirementId: '1-3'
        },
        {
          id: '1-5',
          title: '세션 관리 시스템',
          description: '사용자별 대화 세션 관리',
          status: 'in-progress',
          assignee: '한세션',
          priority: 'medium',
          startDate: '2024-04-15',
          endDate: '2024-05-30',
          createdAt: '2024-04-15',
          projectId,
          requirementId: '1-3'
        },
        // Phase 4 - 통합 및 테스트
        {
          id: '1-6',
          title: '고객 서비스 시스템 연동',
          description: '기존 CRM과 챗봇 연동',
          status: 'todo',
          assignee: '최통합',
          priority: 'medium',
          startDate: '2024-05-15',
          endDate: '2024-06-15',
          createdAt: '2024-05-15',
          projectId,
          requirementId: '1-4'
        },
        {
          id: '1-7',
          title: '챗봇 성능 테스트',
          description: '응답 정확도 및 속도 테스트',
          status: 'todo',
          assignee: 'QA팀',
          priority: 'high',
          startDate: '2024-06-01',
          endDate: '2024-06-30',
          createdAt: '2024-06-01',
          projectId,
          requirementId: '1-1'
        }
      ],
      '2': [ // 모바일 앱 리뉴얼
        // Phase 1 - 분석 및 기획
        {
          id: '2-1',
          title: '현재 앱 분석 및 사용자 피드백 수집',
          description: '기존 앱의 문제점 분석 및 개선 요구사항 도출',
          status: 'done',
          assignee: 'UX리서처',
          priority: 'high',
          startDate: '2024-02-01',
          endDate: '2024-02-20',
          createdAt: '2024-02-01',
          projectId,
          requirementId: '2-1'
        },
        {
          id: '2-2',
          title: 'UI/UX 개선 방향 설정',
          description: '새로운 디자인 컨셉 및 사용자 경험 설계',
          status: 'done',
          assignee: 'UX디자이너',
          priority: 'high',
          startDate: '2024-02-15',
          endDate: '2024-03-15',
          createdAt: '2024-02-15',
          projectId,
          requirementId: '2-2'
        },
        // Phase 2 - 디자인 시스템 구축
        {
          id: '2-3',
          title: '디자인 시스템 구축',
          description: '컴포넌트 라이브러리 및 스타일 가이드',
          status: 'done',
          assignee: 'UI디자이너',
          priority: 'high',
          startDate: '2024-03-01',
          endDate: '2024-04-15',
          createdAt: '2024-03-01',
          projectId,
          requirementId: '2-2'
        },
        {
          id: '2-3-1',
          title: '컬러 팔레트 및 타이포그래피',
          description: '브랜드에 맞는 색상 체계 및 폰트 시스템',
          status: 'done',
          assignee: '김디자인',
          priority: 'medium',
          startDate: '2024-03-01',
          endDate: '2024-03-15',
          createdAt: '2024-03-01',
          projectId,
          requirementId: '2-2',
          parentTaskId: '2-3'
        },
        {
          id: '2-3-2',
          title: 'UI 컴포넌트 라이브러리',
          description: '재사용 가능한 UI 컴포넌트 설계',
          status: 'done',
          assignee: '이컴포넌트',
          priority: 'high',
          startDate: '2024-03-10',
          endDate: '2024-04-15',
          createdAt: '2024-03-10',
          projectId,
          requirementId: '2-2',
          parentTaskId: '2-3'
        },
        // Phase 3 - 성능 최적화
        {
          id: '2-4',
          title: '앱 성능 최적화',
          description: '로딩 속도 개선 및 메모리 사용량 최적화',
          status: 'in-progress',
          assignee: '모바일개발팀',
          priority: 'high',
          startDate: '2024-04-01',
          endDate: '2024-06-15',
          createdAt: '2024-04-01',
          projectId,
          requirementId: '2-3'
        },
        {
          id: '2-4-1',
          title: '이미지 최적화 및 캐싱',
          description: '이미지 압축 및 효율적인 캐싱 전략',
          status: 'in-progress',
          assignee: '박성능',
          priority: 'medium',
          startDate: '2024-04-01',
          endDate: '2024-05-01',
          createdAt: '2024-04-01',
          projectId,
          requirementId: '2-3',
          parentTaskId: '2-4'
        },
        {
          id: '2-4-2',
          title: '코드 스플리팅 및 번들 최적화',
          description: '불필요한 코드 제거 및 번들 크기 최적화',
          status: 'todo',
          assignee: '최최적화',
          priority: 'medium',
          startDate: '2024-05-01',
          endDate: '2024-06-15',
          createdAt: '2024-05-01',
          projectId,
          requirementId: '2-3',
          parentTaskId: '2-4'
        },
        // Phase 4 - 새로운 기능
        {
          id: '2-5',
          title: '다크 모드 지원',
          description: '라이트/다크 테마 전환 기능',
          status: 'todo',
          assignee: 'UI개발자',
          priority: 'medium',
          startDate: '2024-06-01',
          endDate: '2024-07-15',
          createdAt: '2024-06-01',
          projectId,
          requirementId: '2-4'
        },
        {
          id: '2-6',
          title: '오프라인 지원 기능',
          description: '네트워크 연결 없이도 기본 기능 사용 가능',
          status: 'todo',
          assignee: '정오프라인',
          priority: 'low',
          startDate: '2024-07-01',
          endDate: '2024-08-15',
          createdAt: '2024-07-01',
          projectId,
          requirementId: '2-4'
        }
      ],
      '3': [ // 데이터 분석 플랫폼
        // Phase 1 - 플랫폼 설계
        {
          id: '3-1',
          title: '데이터 분석 요구사항 정의',
          description: 'BI 시스템 핵심 요구사항 및 KPI 설정',
          status: 'done',
          assignee: '데이터분석가',
          priority: 'critical',
          startDate: '2024-02-15',
          endDate: '2024-03-10',
          createdAt: '2024-02-15',
          projectId,
          requirementId: '3-1'
        },
        {
          id: '3-2',
          title: '데이터 아키텍처 설계',
          description: '데이터 웨어하우스 및 레이크 아키텍처',
          status: 'done',
          assignee: '데이터아키텍트',
          priority: 'critical',
          startDate: '2024-03-01',
          endDate: '2024-03-31',
          createdAt: '2024-03-01',
          projectId,
          requirementId: '3-1'
        },
        // Phase 2 - 데이터 파이프라인
        {
          id: '3-3',
          title: '데이터 수집 파이프라인 구축',
          description: '다양한 소스에서 데이터 수집 자동화',
          status: 'done',
          assignee: '데이터엔지니어',
          priority: 'critical',
          startDate: '2024-03-15',
          endDate: '2024-05-15',
          createdAt: '2024-03-15',
          projectId,
          requirementId: '3-2'
        },
        {
          id: '3-3-1',
          title: 'ETL 프로세스 개발',
          description: 'Extract, Transform, Load 자동화',
          status: 'done',
          assignee: '김ETL',
          priority: 'high',
          startDate: '2024-03-15',
          endDate: '2024-04-15',
          createdAt: '2024-03-15',
          projectId,
          requirementId: '3-2',
          parentTaskId: '3-3'
        },
        {
          id: '3-3-2',
          title: '데이터 품질 관리 시스템',
          description: '데이터 유효성 검증 및 품질 모니터링',
          status: 'done',
          assignee: '이품질',
          priority: 'high',
          startDate: '2024-04-01',
          endDate: '2024-05-15',
          createdAt: '2024-04-01',
          projectId,
          requirementId: '3-2',
          parentTaskId: '3-3'
        },
        // Phase 3 - 분석 대시보드
        {
          id: '3-4',
          title: '실시간 대시보드 개발',
          description: '핵심 비즈니스 메트릭 실시간 시각화',
          status: 'in-progress',
          assignee: '대시보드팀',
          priority: 'high',
          startDate: '2024-05-01',
          endDate: '2024-07-31',
          createdAt: '2024-05-01',
          projectId,
          requirementId: '3-3'
        },
        {
          id: '3-4-1',
          title: '차트 라이브러리 구현',
          description: '다양한 차트 및 그래프 컴포넌트',
          status: 'in-progress',
          assignee: '박차트',
          priority: 'medium',
          startDate: '2024-05-01',
          endDate: '2024-06-15',
          createdAt: '2024-05-01',
          projectId,
          requirementId: '3-3',
          parentTaskId: '3-4'
        },
        {
          id: '3-4-2',
          title: '인터랙티브 필터링',
          description: '동적 데이터 필터링 및 드릴다운',
          status: 'todo',
          assignee: '최인터랙션',
          priority: 'medium',
          startDate: '2024-06-01',
          endDate: '2024-07-31',
          createdAt: '2024-06-01',
          projectId,
          requirementId: '3-3',
          parentTaskId: '3-4'
        },
        // Phase 4 - 머신러닝 통합
        {
          id: '3-5',
          title: '예측 분석 모델 개발',
          description: '매출 예측 및 트렌드 분석 ML 모델',
          status: 'todo',
          assignee: 'ML팀',
          priority: 'high',
          startDate: '2024-07-01',
          endDate: '2024-09-15',
          createdAt: '2024-07-01',
          projectId,
          requirementId: '3-4'
        },
        {
          id: '3-5-1',
          title: '시계열 예측 모델',
          description: 'ARIMA/LSTM 기반 시계열 데이터 예측',
          status: 'todo',
          assignee: '김시계열',
          priority: 'high',
          startDate: '2024-07-01',
          endDate: '2024-08-15',
          createdAt: '2024-07-01',
          projectId,
          requirementId: '3-4',
          parentTaskId: '3-5'
        },
        {
          id: '3-5-2',
          title: '이상 탐지 시스템',
          description: '비정상 패턴 자동 탐지 및 알림',
          status: 'todo',
          assignee: '이이상탐지',
          priority: 'medium',
          startDate: '2024-08-01',
          endDate: '2024-09-15',
          createdAt: '2024-08-01',
          projectId,
          requirementId: '3-4',
          parentTaskId: '3-5'
        },
        {
          id: '3-6',
          title: '플랫폼 통합 테스트',
          description: '전체 시스템 성능 및 안정성 테스트',
          status: 'todo',
          assignee: 'QA팀',
          priority: 'critical',
          startDate: '2024-09-01',
          endDate: '2024-09-30',
          createdAt: '2024-09-01',
          projectId,
          requirementId: '3-1'
        }
      ],
      '4': [ // 손해보험 지급심사 AI 자동화
        // Phase 1 - 프로젝트 기획 및 분석 (2025-03-01 ~ 2025-04-30)
        {
          id: '4-1-1',
          title: '요구사항 분석 및 정의',
          description: '현행 지급심사 프로세스 분석 및 AI 자동화 범위 정의',
          status: 'done',
          assignee: '비즈니스분석가',
          priority: 'critical',
          startDate: '2025-03-01',
          endDate: '2025-03-21',
          createdAt: '2025-03-01',
          projectId,
          requirementId: '4-1'
        },
        {
          id: '4-1-1-1',
          title: '현행 지급심사 프로세스 분석',
          description: '보험금 청구부터 지급까지 전체 프로세스 상세 분석',
          status: 'done',
          assignee: '비즈니스분석가',
          priority: 'critical',
          startDate: '2025-03-01',
          endDate: '2025-03-21',
          createdAt: '2025-03-01',
          projectId,
          requirementId: '4-1',
          parentTaskId: '4-1-1'
        },
        {
          id: '4-1-1-2',
          title: '보험금 청구 유형별 분류 및 분석',
          description: '신체손해, 재물손해, 배상책임 등 청구 유형별 분석',
          status: 'done',
          assignee: '보험전문가',
          priority: 'critical',
          startDate: '2025-03-01',
          endDate: '2025-03-21',
          createdAt: '2025-03-01',
          projectId,
          requirementId: '4-1',
          parentTaskId: '4-1-1'
        },
        {
          id: '4-1-1-3',
          title: 'AI 자동화 적용 범위 정의',
          description: 'OCR, RPA, AI 심사 적용 범위 및 우선순위 설정',
          status: 'done',
          assignee: 'AI전문가',
          priority: 'critical',
          startDate: '2025-03-01',
          endDate: '2025-03-21',
          createdAt: '2025-03-01',
          projectId,
          requirementId: '4-1',
          parentTaskId: '4-1-1'
        },
        {
          id: '4-1-2',
          title: '시스템 현황 분석',
          description: '기존 보험 시스템 아키텍처 및 데이터베이스 현황 분석',
          status: 'done',
          assignee: '시스템분석가',
          priority: 'high',
          startDate: '2025-03-21',
          endDate: '2025-04-10',
          createdAt: '2025-03-21',
          projectId,
          requirementId: '4-1'
        },
        {
          id: '4-1-3',
          title: 'AI 기술 검토 및 선정',
          description: 'OCR 솔루션, AI 모델 아키텍처, RPA 도구 비교 선정',
          status: 'done',
          assignee: 'AI전문가',
          priority: 'high',
          startDate: '2025-04-10',
          endDate: '2025-04-30',
          createdAt: '2025-04-10',
          projectId,
          requirementId: '4-1'
        },
        
        // Phase 2 - 시스템 설계 (2025-05-01 ~ 2025-06-15)
        {
          id: '4-2-1',
          title: '전체 시스템 아키텍처 설계',
          description: '마이크로서비스 기반 AI 자동화 시스템 아키텍처',
          status: 'done',
          assignee: '시스템아키텍트',
          priority: 'critical',
          startDate: '2025-05-16',
          endDate: '2025-06-10',
          createdAt: '2025-05-16',
          projectId,
          requirementId: '4-1'
        },
        {
          id: '4-2-2',
          title: 'AI 모델 상세 설계',
          description: 'OCR, 지급심사, 사기탐지 AI 모델 아키텍처 설계',
          status: 'done',
          assignee: 'AI전문가',
          priority: 'critical',
          startDate: '2025-06-11',
          endDate: '2025-07-05',
          createdAt: '2025-06-11',
          projectId,
          requirementId: '4-2'
        },
        {
          id: '4-2-2-1',
          title: 'OCR 모델 상세 설계',
          description: '의료문서, 영수증, 신분증 OCR 모델 설계',
          status: 'done',
          assignee: 'AI전문가',
          priority: 'critical',
          startDate: '2025-06-11',
          endDate: '2025-06-20',
          createdAt: '2025-06-11',
          projectId,
          requirementId: '4-2',
          parentTaskId: '4-2-2'
        },
        {
          id: '4-2-2-2',
          title: '지급심사 AI 모델 설계',
          description: '신체손해, 재물손해, 배상책임 자동심사 모델 설계',
          status: 'done',
          assignee: '데이터사이언티스트',
          priority: 'critical',
          startDate: '2025-06-21',
          endDate: '2025-07-01',
          createdAt: '2025-06-21',
          projectId,
          requirementId: '4-3',
          parentTaskId: '4-2-2'
        },
        {
          id: '4-2-2-3',
          title: '사기탐지 AI 모델 설계',
          description: '이상패턴, 중복청구, 네트워크 분석 모델 설계',
          status: 'done',
          assignee: '데이터사이언티스트',
          priority: 'high',
          startDate: '2025-07-02',
          endDate: '2025-07-05',
          createdAt: '2025-07-02',
          projectId,
          requirementId: '4-4',
          parentTaskId: '4-2-2'
        },
        {
          id: '4-2-3',
          title: '데이터베이스 설계',
          description: 'AI 학습 데이터 및 심사 데이터베이스 설계',
          status: 'done',
          assignee: 'DB설계자',
          priority: 'high',
          startDate: '2025-05-20',
          endDate: '2025-06-05',
          createdAt: '2025-05-20',
          projectId,
          requirementId: '4-1'
        },

        // Phase 3 - 개발 (2025-06-16 ~ 2025-10-15)
        {
          id: '4-3-1',
          title: 'AI 모델 개발',
          description: 'OCR, 지급심사, 사기탐지 AI 모델 구현 및 학습',
          status: 'in-progress',
          assignee: 'AI엔지니어',
          priority: 'critical',
          startDate: '2025-06-16',
          endDate: '2025-08-15',
          createdAt: '2025-06-16',
          projectId,
          requirementId: '4-2'
        },
        {
          id: '4-3-1-1',
          title: 'OCR 모델 개발',
          description: '의료문서, 영수증, 신분증 인식 모델 개발',
          status: 'in-progress',
          assignee: 'AI엔지니어',
          priority: 'critical',
          startDate: '2025-06-16',
          endDate: '2025-07-15',
          createdAt: '2025-06-16',
          projectId,
          requirementId: '4-2',
          parentTaskId: '4-3-1'
        },
        {
          id: '4-3-1-2',
          title: '지급심사 AI 모델 개발',
          description: '자동 심사 결정 및 지급금액 산정 모델 개발',
          status: 'in-progress',
          assignee: '데이터사이언티스트',
          priority: 'critical',
          startDate: '2025-07-10',
          endDate: '2025-08-10',
          createdAt: '2025-07-10',
          projectId,
          requirementId: '4-3',
          parentTaskId: '4-3-1'
        },
        {
          id: '4-3-1-3',
          title: '사기탐지 AI 모델 개발',
          description: '이상패턴 탐지 및 사기 위험도 평가 모델 개발',
          status: 'todo',
          assignee: '데이터사이언티스트',
          priority: 'high',
          startDate: '2025-08-10',
          endDate: '2025-08-15',
          createdAt: '2025-08-10',
          projectId,
          requirementId: '4-4',
          parentTaskId: '4-3-1'
        },
        {
          id: '4-3-2',
          title: '백엔드 시스템 개발',
          description: 'API 서버, 데이터 처리 엔진, 보안 시스템 개발',
          status: 'in-progress',
          assignee: '백엔드개발자',
          priority: 'critical',
          startDate: '2025-08-15',
          endDate: '2025-09-30',
          createdAt: '2025-08-15',
          projectId,
          requirementId: '4-1'
        },
        {
          id: '4-3-2-1',
          title: 'API 서버 개발',
          description: '청구접수, 심사처리, 지급결정 API 개발',
          status: 'in-progress',
          assignee: '백엔드개발자',
          priority: 'critical',
          startDate: '2025-08-15',
          endDate: '2025-09-05',
          createdAt: '2025-08-15',
          projectId,
          requirementId: '4-1',
          parentTaskId: '4-3-2'
        },
        {
          id: '4-3-2-2',
          title: '데이터 처리 엔진 개발',
          description: 'OCR 결과 처리, AI 모델 연동, 배치 ��리',
          status: 'todo',
          assignee: '백엔드개발자',
          priority: 'high',
          startDate: '2025-09-05',
          endDate: '2025-09-20',
          createdAt: '2025-09-05',
          projectId,
          requirementId: '4-2',
          parentTaskId: '4-3-2'
        },
        {
          id: '4-3-2-3',
          title: '보안 및 인증 시스템 개발',
          description: '사용자 인증, 데이터 암호화, 보안 로그',
          status: 'todo',
          assignee: '보안개발자',
          priority: 'high',
          startDate: '2025-09-20',
          endDate: '2025-09-30',
          createdAt: '2025-09-20',
          projectId,
          requirementId: '4-1',
          parentTaskId: '4-3-2'
        },
        {
          id: '4-3-3',
          title: '프론트엔드 개발',
          description: '심사자 대시보드, 고객 포털 개발',
          status: 'todo',
          assignee: '프론트엔드개발자',
          priority: 'high',
          startDate: '2025-09-30',
          endDate: '2025-10-15',
          createdAt: '2025-09-30',
          projectId,
          requirementId: '4-6'
        },
        {
          id: '4-3-4',
          title: 'RPA 자동화 개발',
          description: '데이터 입력, 심사결과 처리, 알림 발송 자동화',
          status: 'todo',
          assignee: 'RPA개발자',
          priority: 'medium',
          startDate: '2025-10-01',
          endDate: '2025-10-15',
          createdAt: '2025-10-01',
          projectId,
          requirementId: '4-5'
        },

        // Phase 4 - 테스트 (2025-10-16 ~ 2025-11-30)
        {
          id: '4-4-1',
          title: '단위 테스트',
          description: 'AI 모델, API, UI 컴포넌트 단위 테스트',
          status: 'todo',
          assignee: 'QA엔지니어',
          priority: 'high',
          startDate: '2025-10-16',
          endDate: '2025-10-25',
          createdAt: '2025-10-16',
          projectId,
          requirementId: '4-1'
        },
        {
          id: '4-4-2',
          title: '통합 테스트',
          description: 'AI 모델 연동, 시스템 간 연동 테스트',
          status: 'todo',
          assignee: 'QA엔지니어',
          priority: 'high',
          startDate: '2025-10-25',
          endDate: '2025-11-05',
          createdAt: '2025-10-25',
          projectId,
          requirementId: '4-1'
        },
        {
          id: '4-4-3',
          title: '시스템 테스트',
          description: '기능, 성능, 보안 테스트',
          status: 'todo',
          assignee: 'QA엔지니어',
          priority: 'critical',
          startDate: '2025-11-05',
          endDate: '2025-11-15',
          createdAt: '2025-11-05',
          projectId,
          requirementId: '4-1'
        },
        {
          id: '4-4-4',
          title: '사용자 수용 테스트',
          description: '심사자, 고객 대상 사용성 검증',
          status: 'todo',
          assignee: '비즈니스사용자',
          priority: 'high',
          startDate: '2025-11-15',
          endDate: '2025-11-30',
          createdAt: '2025-11-15',
          projectId,
          requirementId: '4-6'
        },

        // Phase 5 - 배포 및 운영 (2025-12-01 ~ 2025-12-31)
        {
          id: '4-5-1',
          title: '배포 환경 구축',
          description: '운영 환경, CI/CD 파이프라인, 모니터링 시스템 구축',
          status: 'todo',
          assignee: 'DevOps엔지니어',
          priority: 'critical',
          startDate: '2025-12-01',
          endDate: '2025-12-10',
          createdAt: '2025-12-01',
          projectId,
          requirementId: '4-1'
        },
        {
          id: '4-5-2',
          title: '운영 준비',
          description: '운영 매뉴얼 작성, 사용자 교육, 데이터 마이그레이션',
          status: 'todo',
          assignee: '운영팀',
          priority: 'high',
          startDate: '2025-12-10',
          endDate: '2025-12-20',
          createdAt: '2025-12-10',
          projectId,
          requirementId: '4-6'
        },
        {
          id: '4-5-3',
          title: '서비스 오픈',
          description: '파일럿 운영, 전면 서비스 오픈, 프로젝트 완료',
          status: 'todo',
          assignee: '프로젝트매니저',
          priority: 'critical',
          startDate: '2025-12-20',
          endDate: '2025-12-31',
          createdAt: '2025-12-20',
          projectId,
          requirementId: '4-1'
        }
      ],
      // 기본값 (현재 AI 프로젝트 관리 시스템)
      'default': [
        {
          id: 'def-1',
          title: '프로젝트 요구사항 분석',
          description: 'AI 프로젝트 관리 시스템 핵심 요구사항 도출',
          status: 'done',
          assignee: '김프로젝트',
          priority: 'critical',
          startDate: '2024-01-01',
          endDate: '2024-01-15',
          createdAt: '2024-01-01',
          projectId,
          requirementId: 'def-1'
        },
        {
          id: 'def-2',
          title: '시스템 아키텍처 설계',
          description: 'Git/Jira 통합을 위한 전체 시스템 아키텍처 설계',
          status: 'done',
          assignee: '이아키텍트',
          priority: 'critical',
          startDate: '2024-01-10',
          endDate: '2024-01-25',
          createdAt: '2024-01-10',
          projectId,
          requirementId: 'def-1'
        },
        {
          id: 'def-3',
          title: '스크럼 관리 시스템 개발',
          description: '칸반 보드, 스프린트, 메트릭스 관리',
          status: 'in-progress',
          assignee: '개발팀',
          priority: 'high',
          startDate: '2024-02-01',
          endDate: '2024-04-30',
          createdAt: '2024-02-01',
          projectId,
          requirementId: 'def-2'
        }
      ]
    };

    return tasksMap[projectId] || tasksMap['default'];
  };

  const mockTasksData = getProjectTasks(projectId);

  // Initialize tasks from mock data
  React.useEffect(() => {
    setTasks(mockTasksData);
  }, []);

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setIsTaskModalOpen(true);
  };

  const handleUpdateTask = (taskId: string, updatedTask: Partial<Task>) => {
    setTasks(prevTasks => 
      prevTasks.map(task => 
        task.id === taskId ? { ...task, ...updatedTask } : task
      )
    );
    setIsTaskModalOpen(false);
    setEditingTask(null);
    toast.success('태스크가 성공적으로 수정되었습니다.');
  };

  const handleCreateTask = (newTask: Omit<Task, 'id' | 'createdAt' | 'projectId'>) => {
    const task: Task = {
      ...newTask,
      id: Date.now().toString(),
      createdAt: new Date().toISOString().split('T')[0],
      projectId
    };
    
    setTasks(prevTasks => [...prevTasks, task]);
    setIsTaskModalOpen(false);
    toast.success('새로운 태스크가 생성되었습니다.');
  };

  // Calculate timeline dates
  const timelineData = useMemo(() => {
    const allDates = tasks
      .filter(task => task.startDate && task.endDate)
      .flatMap(task => [task.startDate!, task.endDate!])
      .map(date => new Date(date))
      .sort((a, b) => a.getTime() - b.getTime());

    if (allDates.length === 0) {
      const today = new Date();
      const startDate = new Date(today);
      startDate.setDate(today.getDate() - 30);
      const endDate = new Date(today);
      endDate.setDate(today.getDate() + 30);
      return { startDate, endDate };
    }

    const startDate = new Date(allDates[0]);
    const endDate = new Date(allDates[allDates.length - 1]);
    
    // Add some padding
    startDate.setDate(startDate.getDate() - 7);
    endDate.setDate(endDate.getDate() + 7);

    return { startDate, endDate };
  }, [tasks]);

  // Generate timeline columns based on view mode
  const timelineColumns = useMemo(() => {
    const { startDate, endDate } = timelineData;
    const columns: { date: Date; label: string }[] = [];
    const current = new Date(startDate);

    while (current <= endDate) {
      if (viewMode === 'month') {
        columns.push({
          date: new Date(current),
          label: current.toLocaleDateString('ko-KR', { month: 'short', year: 'numeric' })
        });
        current.setMonth(current.getMonth() + 1);
      } else if (viewMode === 'week') {
        columns.push({
          date: new Date(current),
          label: `${current.getMonth() + 1}/${current.getDate()}`
        });
        current.setDate(current.getDate() + 7);
      } else {
        columns.push({
          date: new Date(current),
          label: current.toLocaleDateString('ko-KR', { day: 'numeric', month: 'numeric' })
        });
        current.setDate(current.getDate() + 1);
      }
    }

    return columns;
  }, [timelineData, viewMode]);

  const toggleRequirementExpansion = (reqId: string) => {
    const newExpanded = new Set(expandedRequirements);
    if (newExpanded.has(reqId)) {
      newExpanded.delete(reqId);
    } else {
      newExpanded.add(reqId);
    }
    setExpandedRequirements(newExpanded);
  };

  const toggleTaskExpansion = (taskId: string) => {
    const newExpanded = new Set(expandedTasks);
    if (newExpanded.has(taskId)) {
      newExpanded.delete(taskId);
    } else {
      newExpanded.add(taskId);
    }
    setExpandedTasks(newExpanded);
  };

  const getTasksByRequirement = (requirementId: string) => {
    return tasks.filter(task => task.requirementId === requirementId && !task.parentTaskId);
  };

  const getSubTasks = (parentTaskId: string) => {
    return tasks.filter(task => task.parentTaskId === parentTaskId);
  };

  const getTaskPosition = (task: Task) => {
    if (!task.startDate || !task.endDate) return { left: 0, width: 0 };

    const { startDate: timelineStart } = timelineData;
    const taskStart = new Date(task.startDate);
    const taskEnd = new Date(task.endDate);
    
    const totalDays = (timelineData.endDate.getTime() - timelineStart.getTime()) / (1000 * 60 * 60 * 24);
    const taskStartDays = (taskStart.getTime() - timelineStart.getTime()) / (1000 * 60 * 60 * 24);
    const taskDuration = (taskEnd.getTime() - taskStart.getTime()) / (1000 * 60 * 60 * 24);

    // Prevent division by zero
    if (totalDays <= 0) return { left: 0, width: 100 };

    const left = (taskStartDays / totalDays) * 100;
    const width = (taskDuration / totalDays) * 100;

    return { left: Math.max(0, left), width: Math.max(1, width) };
  };

  const getTodayPosition = () => {
    const { startDate: timelineStart } = timelineData;
    const today = new Date();
    const totalDays = (timelineData.endDate.getTime() - timelineStart.getTime()) / (1000 * 60 * 60 * 24);
    const todayDays = (today.getTime() - timelineStart.getTime()) / (1000 * 60 * 60 * 24);
    
    // Prevent division by zero
    if (totalDays <= 0) return 0;
    
    return (todayDays / totalDays) * 100;
  };

  const getProgressPercentage = (task: Task) => {
    switch (task.status) {
      case 'todo': return 0;
      case 'in-progress': return 50;
      case 'review': return 80;
      case 'done': return 100;
      default: return 0;
    }
  };

  const formatDateRange = (startDate?: string, endDate?: string) => {
    if (!startDate || !endDate) return '날짜 미정';
    const start = new Date(startDate).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' });
    const end = new Date(endDate).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' });
    return `${start} - ${end}`;
  };

  const getDurationInDays = (startDate?: string, endDate?: string) => {
    if (!startDate || !endDate) return 0;
    const start = new Date(startDate);
    const end = new Date(endDate);
    return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  };

  const getStatusColor = (status: Task['status']) => {
    switch (status) {
      case 'todo': return 'bg-gray-300';
      case 'in-progress': return 'bg-blue-500';
      case 'review': return 'bg-yellow-500';
      case 'done': return 'bg-green-500';
      default: return 'bg-gray-300';
    }
  };

  const getPriorityColor = (priority: Task['priority']) => {
    switch (priority) {
      case 'low': return 'text-green-600';
      case 'medium': return 'text-yellow-600';
      case 'high': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h2>간트 차트</h2>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-red-500 rounded-full" />
              오늘: {new Date().toLocaleDateString('ko-KR')}
            </div>
            <div>총 {tasks.length}개 작업</div>
            <div>
              완료: {tasks.filter(t => t.status === 'done').length}개
            </div>
            <div>
              진행 중: {tasks.filter(t => t.status === 'in-progress').length}개
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => {
              setEditingTask(null);
              setIsTaskModalOpen(true);
            }}
          >
            <Plus className="w-4 h-4 mr-2" />
            작업 추가
          </Button>
          <select 
            value={viewMode} 
            onChange={(e) => setViewMode(e.target.value as 'month' | 'week' | 'day')}
            className="px-3 py-1 border rounded-md text-sm"
          >
            <option value="month">월별</option>
            <option value="week">주별</option>
            <option value="day">일별</option>
          </select>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            {/* Header */}
            <div className="sticky top-0 bg-background border-b z-10">
              <div className="flex">
                <div className="w-80 p-4 border-r bg-background">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    작업 및 일정
                  </div>
                </div>
                <div className="flex-1 flex relative bg-background">
                  {timelineColumns.map((column, index) => (
                    <div 
                      key={index} 
                      className="flex-1 p-2 text-center text-sm border-r last:border-r-0 min-w-[100px]"
                    >
                      {column.label}
                    </div>
                  ))}
                  {/* Today line in header */}
                  <div 
                    className="absolute top-0 bottom-0 w-0.5 bg-red-500 z-20"
                    style={{ left: `${getTodayPosition()}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="relative">
              {mockRequirements.map((requirement) => {
                const isExpanded = expandedRequirements.has(requirement.id);
                const tasks = getTasksByRequirement(requirement.id);

                return (
                  <div key={requirement.id}>
                    {/* Requirement Row */}
                    <div className="flex items-center hover:bg-muted/50">
                      <div className="w-80 p-3 border-r">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => toggleRequirementExpansion(requirement.id)}
                            className="p-1 hover:bg-muted rounded"
                          >
                            {isExpanded ? (
                              <ChevronDown className="w-4 h-4" />
                            ) : (
                              <ChevronRight className="w-4 h-4" />
                            )}
                          </button>
                          <RequirementTag 
                            requirement={requirement}
                            showTitle={true}
                          />
                        </div>
                      </div>
                      <div className="flex-1 relative h-12 border-b">
                        {/* Requirement timeline background */}
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-50 to-purple-50 opacity-30" />
                      </div>
                    </div>

                    {/* Tasks under this requirement */}
                    {isExpanded && tasks.map((task) => {
                      const taskIsExpanded = expandedTasks.has(task.id);
                      const subTasks = getSubTasks(task.id);
                      const position = getTaskPosition(task);

                      return (
                        <div key={task.id}>
                          {/* Main Task Row */}
                          <div className="flex items-center hover:bg-muted/50">
                            <div className="w-80 p-3 border-r">
                              <div className="flex items-center gap-2 ml-6">
                                {subTasks.length > 0 && (
                                  <button
                                    onClick={() => toggleTaskExpansion(task.id)}
                                    className="p-1 hover:bg-muted rounded"
                                  >
                                    {taskIsExpanded ? (
                                      <ChevronDown className="w-3 h-3" />
                                    ) : (
                                      <ChevronRight className="w-3 h-3" />
                                    )}
                                  </button>
                                )}
                                <div className="flex-1">
                                  <div className="text-sm font-medium">{task.title}</div>
                                  <div className="flex items-center gap-2 mt-1">
                                    {task.assignee && (
                                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                        <User className="w-3 h-3" />
                                        {task.assignee}
                                      </div>
                                    )}
                                    {task.startDate && task.endDate && (
                                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                        <Clock className="w-3 h-3" />
                                        {getDurationInDays(task.startDate, task.endDate)}일
                                      </div>
                                    )}
                                    <Badge 
                                      variant="outline" 
                                      className={`text-xs ${getPriorityColor(task.priority)}`}
                                    >
                                      {task.priority}
                                    </Badge>
                                    <Badge variant="secondary" className="text-xs">
                                      {task.status}
                                    </Badge>
                                  </div>
                                </div>
                              </div>
                            </div>
                            <div className="flex-1 relative h-12 border-b">
                              {/* Today line */}
                              <div 
                                className="absolute top-0 bottom-0 w-0.5 bg-red-500 opacity-30"
                                style={{ left: `${getTodayPosition()}%` }}
                              />
                              {position.width > 0 && (
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <div
                                        className={`absolute top-2 h-6 rounded ${getStatusColor(task.status)} opacity-80 cursor-pointer hover:opacity-100 transition-opacity group`}
                                        style={{
                                          left: `${position.left}%`,
                                          width: `${position.width}%`
                                        }}
                                      >
                                        {/* Progress bar */}
                                        <div 
                                          className="h-full bg-white rounded opacity-30"
                                          style={{ width: `${getProgressPercentage(task)}%` }}
                                        />
                                        <div className="absolute inset-0 px-2 py-1 text-xs text-white truncate">
                                          {task.title}
                                        </div>
                                        {/* Edit button on hover */}
                                        <div className="absolute -top-1 -right-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                          <Button 
                                            size="sm" 
                                            variant="outline" 
                                            className="h-4 w-4 p-0"
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              handleEditTask(task);
                                            }}
                                          >
                                            <Edit className="w-2 h-2" />
                                          </Button>
                                        </div>
                                      </div>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <div className="p-2">
                                        <div className="font-medium">{task.title}</div>
                                        <div className="text-sm text-muted-foreground mt-1">
                                          {formatDateRange(task.startDate, task.endDate)}
                                        </div>
                                        <div className="text-sm text-muted-foreground">
                                          {getDurationInDays(task.startDate, task.endDate)}일 소요
                                        </div>
                                        <div className="text-sm text-muted-foreground">
                                          진행률: {getProgressPercentage(task)}%
                                        </div>
                                      </div>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              )}
                            </div>
                          </div>

                          {/* Sub Tasks */}
                          {taskIsExpanded && subTasks.map((subTask) => {
                            const subPosition = getTaskPosition(subTask);

                            return (
                              <div key={subTask.id} className="flex items-center hover:bg-muted/50">
                                <div className="w-80 p-3 border-r">
                                  <div className="flex items-center gap-2 ml-12">
                                    <div className="flex-1">
                                      <div className="text-sm">{subTask.title}</div>
                                      <div className="flex items-center gap-2 mt-1">
                                        {subTask.assignee && (
                                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                            <User className="w-3 h-3" />
                                            {subTask.assignee}
                                          </div>
                                        )}
                                        {subTask.startDate && subTask.endDate && (
                                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                            <Clock className="w-3 h-3" />
                                            {getDurationInDays(subTask.startDate, subTask.endDate)}일
                                          </div>
                                        )}
                                        <Badge 
                                          variant="outline" 
                                          className={`text-xs ${getPriorityColor(subTask.priority)}`}
                                        >
                                          {subTask.priority}
                                        </Badge>
                                        <Badge variant="secondary" className="text-xs">
                                          {subTask.status}
                                        </Badge>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                                <div className="flex-1 relative h-10 border-b">
                                  {/* Today line */}
                                  <div 
                                    className="absolute top-0 bottom-0 w-0.5 bg-red-500 opacity-30"
                                    style={{ left: `${getTodayPosition()}%` }}
                                  />
                                  {subPosition.width > 0 && (
                                    <TooltipProvider>
                                      <Tooltip>
                                        <TooltipTrigger asChild>
                                          <div
                                            className={`absolute top-1.5 h-4 rounded ${getStatusColor(subTask.status)} opacity-70 cursor-pointer hover:opacity-90 transition-opacity group`}
                                            style={{
                                              left: `${subPosition.left}%`,
                                              width: `${subPosition.width}%`
                                            }}
                                          >
                                            {/* Progress bar */}
                                            <div 
                                              className="h-full bg-white rounded opacity-30"
                                              style={{ width: `${getProgressPercentage(subTask)}%` }}
                                            />
                                            <div className="absolute inset-0 px-1 text-xs text-white truncate">
                                              {subTask.title}
                                            </div>
                                          </div>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                          <div className="p-2">
                                            <div className="font-medium">{subTask.title}</div>
                                            <div className="text-sm text-muted-foreground mt-1">
                                              {formatDateRange(subTask.startDate, subTask.endDate)}
                                            </div>
                                            <div className="text-sm text-muted-foreground">
                                              {getDurationInDays(subTask.startDate, subTask.endDate)}일 소요
                                            </div>
                                            <div className="text-sm text-muted-foreground">
                                              진행률: {getProgressPercentage(subTask)}%
                                            </div>
                                          </div>
                                        </TooltipContent>
                                      </Tooltip>
                                    </TooltipProvider>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      );
                    })}
                  </div>
                );
              })}

              {/* Tasks without requirements */}
              {tasks.filter(task => !task.requirementId && !task.parentTaskId).map((task) => {
                const position = getTaskPosition(task);
                const subTasks = getSubTasks(task.id);
                const taskIsExpanded = expandedTasks.has(task.id);

                return (
                  <div key={task.id}>
                    {/* Orphan Task Row */}
                    <div className="flex items-center hover:bg-muted/50">
                      <div className="w-80 p-3 border-r">
                        <div className="flex items-center gap-2">
                          {subTasks.length > 0 && (
                            <button
                              onClick={() => toggleTaskExpansion(task.id)}
                              className="p-1 hover:bg-muted rounded"
                            >
                              {taskIsExpanded ? (
                                <ChevronDown className="w-3 h-3" />
                              ) : (
                                <ChevronRight className="w-3 h-3" />
                              )}
                            </button>
                          )}
                          <div className="flex-1">
                            <div className="text-sm font-medium">{task.title}</div>
                            <div className="flex items-center gap-2 mt-1">
                              {task.assignee && (
                                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                  <User className="w-3 h-3" />
                                  {task.assignee}
                                </div>
                              )}
                              {task.startDate && task.endDate && (
                                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                  <Clock className="w-3 h-3" />
                                  {getDurationInDays(task.startDate, task.endDate)}일
                                </div>
                              )}
                              <Badge 
                                variant="outline" 
                                className={`text-xs ${getPriorityColor(task.priority)}`}
                              >
                                {task.priority}
                              </Badge>
                              <Badge variant="secondary" className="text-xs">
                                {task.status}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex-1 relative h-12 border-b">
                        {/* Today line */}
                        <div 
                          className="absolute top-0 bottom-0 w-0.5 bg-red-500 opacity-30"
                          style={{ left: `${getTodayPosition()}%` }}
                        />
                        {position.width > 0 && (
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div
                                  className={`absolute top-2 h-6 rounded ${getStatusColor(task.status)} opacity-80 cursor-pointer hover:opacity-100 transition-opacity group`}
                                  style={{
                                    left: `${position.left}%`,
                                    width: `${position.width}%`
                                  }}
                                >
                                  {/* Progress bar */}
                                  <div 
                                    className="h-full bg-white rounded opacity-30"
                                    style={{ width: `${getProgressPercentage(task)}%` }}
                                  />
                                  <div className="absolute inset-0 px-2 py-1 text-xs text-white truncate">
                                    {task.title}
                                  </div>
                                  {/* Edit button on hover */}
                                  <div className="absolute -top-1 -right-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Button 
                                      size="sm" 
                                      variant="outline" 
                                      className="h-4 w-4 p-0"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleEditTask(task);
                                      }}
                                    >
                                      <Edit className="w-2 h-2" />
                                    </Button>
                                  </div>
                                </div>
                              </TooltipTrigger>
                              <TooltipContent>
                                <div className="p-2">
                                  <div className="font-medium">{task.title}</div>
                                  <div className="text-sm text-muted-foreground mt-1">
                                    {formatDateRange(task.startDate, task.endDate)}
                                  </div>
                                  <div className="text-sm text-muted-foreground">
                                    {getDurationInDays(task.startDate, task.endDate)}일 소요
                                  </div>
                                  <div className="text-sm text-muted-foreground">
                                    진행률: {getProgressPercentage(task)}%
                                  </div>
                                </div>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        )}
                      </div>
                    </div>

                    {/* Sub Tasks */}
                    {taskIsExpanded && subTasks.map((subTask) => {
                      const subPosition = getTaskPosition(subTask);

                      return (
                        <div key={subTask.id} className="flex items-center hover:bg-muted/50">
                          <div className="w-80 p-3 border-r">
                            <div className="flex items-center gap-2 ml-6">
                              <div className="flex-1">
                                <div className="text-sm">{subTask.title}</div>
                                <div className="flex items-center gap-2 mt-1">
                                  {subTask.assignee && (
                                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                      <User className="w-3 h-3" />
                                      {subTask.assignee}
                                    </div>
                                  )}
                                  {subTask.startDate && subTask.endDate && (
                                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                      <Clock className="w-3 h-3" />
                                      {getDurationInDays(subTask.startDate, subTask.endDate)}일
                                    </div>
                                  )}
                                  <Badge 
                                    variant="outline" 
                                    className={`text-xs ${getPriorityColor(subTask.priority)}`}
                                  >
                                    {subTask.priority}
                                  </Badge>
                                  <Badge variant="secondary" className="text-xs">
                                    {subTask.status}
                                  </Badge>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="flex-1 relative h-10 border-b">
                            {/* Today line */}
                            <div 
                              className="absolute top-0 bottom-0 w-0.5 bg-red-500 opacity-30"
                              style={{ left: `${getTodayPosition()}%` }}
                            />
                            {subPosition.width > 0 && (
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <div
                                      className={`absolute top-1.5 h-4 rounded ${getStatusColor(subTask.status)} opacity-70 cursor-pointer hover:opacity-90 transition-opacity group`}
                                      style={{
                                        left: `${subPosition.left}%`,
                                        width: `${subPosition.width}%`
                                      }}
                                    >
                                      {/* Progress bar */}
                                      <div 
                                        className="h-full bg-white rounded opacity-30"
                                        style={{ width: `${getProgressPercentage(subTask)}%` }}
                                      />
                                      <div className="absolute inset-0 px-1 text-xs text-white truncate">
                                        {subTask.title}
                                      </div>
                                      {/* Edit button on hover */}
                                      <div className="absolute -top-1 -right-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Button 
                                          size="sm" 
                                          variant="outline" 
                                          className="h-3 w-3 p-0"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleEditTask(subTask);
                                          }}
                                        >
                                          <Edit className="w-1.5 h-1.5" />
                                        </Button>
                                      </div>
                                    </div>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <div className="p-2">
                                      <div className="font-medium">{subTask.title}</div>
                                      <div className="text-sm text-muted-foreground mt-1">
                                        {formatDateRange(subTask.startDate, subTask.endDate)}
                                      </div>
                                      <div className="text-sm text-muted-foreground">
                                        {getDurationInDays(subTask.startDate, subTask.endDate)}일 소요
                                      </div>
                                      <div className="text-sm text-muted-foreground">
                                        진행률: {getProgressPercentage(subTask)}%
                                      </div>
                                    </div>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Legend */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="text-sm font-medium">상태:</div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-gray-300 rounded" />
                  <span className="text-xs">할 일</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-blue-500 rounded" />
                  <span className="text-xs">진행 중</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-yellow-500 rounded" />
                  <span className="text-xs">검토</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-green-500 rounded" />
                  <span className="text-xs">완료</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Task Modal */}
      <div className={isTaskModalOpen ? 'gantt-modal-open' : ''}>
        <CreateTaskModal
          isOpen={isTaskModalOpen}
          onClose={() => {
            setIsTaskModalOpen(false);
            setEditingTask(null);
          }}
          onCreateTask={editingTask ? undefined : handleCreateTask}
          onUpdateTask={editingTask ? handleUpdateTask : undefined}
          allTasks={tasks}
          editingTask={editingTask || undefined}
          mode={editingTask ? 'edit' : 'create'}
        />
      </div>
    </div>
  );
}