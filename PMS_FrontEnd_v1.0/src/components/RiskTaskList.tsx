import React from 'react';
import { RiskTaskItem } from './RiskTaskItem';

interface RiskTaskListProps {
  projectId: string;
}

interface RiskTask {
  id: string;
  title: string;
  description: string;
  assignee: string;
  riskScore: number;
  delayProbability: number;
  reasons: string[];
  estimatedDelay: number;
  priority: 'low' | 'medium' | 'high' | 'critical';
  dueDate: string;
}

const mockRiskTasks: Record<string, RiskTask[]> = {
  '4': [
    {
      id: '4-1-2',
      title: 'OCR 모델 훈련',
      description: '보험 서류 특화 OCR 모델 학습 및 최적화',
      assignee: '김AI개발',
      riskScore: 85,
      delayProbability: 85,
      reasons: [
        '유사 작업 대비 예상 공수 큼 (평균 120% 초과)',
        '담당자의 TensorFlow 경험 부족',
        '선행 작업(문서 전처리) 지연으로 인한 연쇄 효과',
        '데이터셋 품질 이슈로 인한 재학습 필요성'
      ],
      estimatedDelay: 7,
      priority: 'critical',
      dueDate: '2025-04-15'
    },
    {
      id: '4-3',
      title: 'AI 지급심사 모델 개발',
      description: '기계학습 기반 자동 심사 시스템 구축',
      assignee: '박ML엔지니어',
      riskScore: 72,
      delayProbability: 60,
      reasons: [
        '담당자 현재 업무 부하 높음 (85%)',
        '외부 API 연동 복잡도 예상보다 높음',
        '규제 요구사항 변경 가능성'
      ],
      estimatedDelay: 5,
      priority: 'critical',
      dueDate: '2025-05-20'
    },
    {
      id: '4-2',
      title: 'RPA 워크플로우 구축',
      description: '자동화 프로세스 설계 및 구현',
      assignee: '이RPA엔지니어',
      riskScore: 58,
      delayProbability: 45,
      reasons: [
        '기존 시스템과의 호환성 이슈',
        '업무 프로세스 정의 미완료'
      ],
      estimatedDelay: 3,
      priority: 'high',
      dueDate: '2025-04-30'
    },
    {
      id: '4-6',
      title: '보안 및 개인정보보호 시스템',
      description: 'GDPR 및 개인정보보호법 준수 보안 체계 구축',
      assignee: '한보안전문가',
      riskScore: 65,
      delayProbability: 55,
      reasons: [
        '법적 요구사항 복잡성',
        '보안 인증 절차 소요 시간',
        '외부 감사 일정 불확실성'
      ],
      estimatedDelay: 4,
      priority: 'critical',
      dueDate: '2025-06-10'
    },
    {
      id: '4-4',
      title: '통합 대시보드 개발',
      description: '심사 현황 모니터링 및 관리 인터페이스',
      assignee: '최풀스택',
      riskScore: 42,
      delayProbability: 35,
      reasons: [
        'UI/UX 요구사항 변경 가능성',
        '백엔드 API 의존성'
      ],
      estimatedDelay: 2,
      priority: 'medium',
      dueDate: '2025-05-15'
    },
    {
      id: '4-7',
      title: '성능 테스트 및 최적화',
      description: '대용량 처리 성능 검증 및 시스템 최적화',
      assignee: '송QA엔지니어',
      riskScore: 38,
      delayProbability: 30,
      reasons: [
        '테스트 환경 구축 지연 가능성',
        '성능 기준 미정의'
      ],
      estimatedDelay: 2,
      priority: 'medium',
      dueDate: '2025-06-30'
    }
  ],
  '1': [] // 완료된 프로젝트는 위험 작업 없음
};

export function RiskTaskList({ projectId }: RiskTaskListProps) {
  const riskTasks = mockRiskTasks[projectId] || [];

  if (riskTasks.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="text-green-600 mb-2">
          <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-1">
          고위험 작업 없음
        </h3>
        <p className="text-gray-500 dark:text-gray-400 text-sm">
          현재 지연 위험이 높은 작업이 없습니다.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3 max-h-96 overflow-y-auto">
      {riskTasks.map((task) => (
        <RiskTaskItem key={task.id} task={task} />
      ))}
    </div>
  );
}