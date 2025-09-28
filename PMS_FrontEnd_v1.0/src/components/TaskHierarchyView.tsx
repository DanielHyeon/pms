import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { ChevronDown, ChevronRight, Plus, User, MoreHorizontal, Trash2, Calendar, BarChart3 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { Progress } from './ui/progress';
import type { Task } from '../api/types';
import { RequirementTag } from './RequirementTag';

interface TaskHierarchyViewProps {
  tasks: Task[];
  onCreateSubtask: (parentTaskId: string) => void;
  onDeleteTask: (taskId: string) => void;
}

interface WBSPhase {
  id: string;
  code: string;
  name: string;
  description?: string;
  progress: number;
  weight: number;
  startDate: string;
  endDate: string;
  responsible?: string;
  deliverables?: string;
  children: WBSWorkPackage[];
}

interface WBSWorkPackage {
  id: string;
  code: string;
  name: string;
  description?: string;
  progress: number;
  weight: number;
  startDate: string;
  endDate: string;
  responsible?: string;
  deliverables?: string;
  children: WBSActivity[];
}

interface WBSActivity {
  id: string;
  code: string;
  name: string;
  description?: string;
  progress: number;
  weight: number;
  startDate: string;
  endDate: string;
  responsible?: string;
  deliverables?: string;
  tasks: Task[];
}

interface TaskTreeNode {
  task: Task;
  children: TaskTreeNode[];
  isExpanded: boolean;
}

// Mock requirement mapping
const requirementMapping: Record<string, string> = {
  '1': 'REQ-001',
  '2': 'REQ-002',
  '3': 'REQ-003'
};

// 제공된 데이터 기반 WBS 구조
const wbsStructure: WBSPhase[] = [
  {
    id: 'A1',
    code: 'A.1',
    name: '분석',
    description: '요구사항 분석 및 정의 단계',
    progress: 13.58,
    weight: 5,
    startDate: '2020-07-01',
    endDate: '2020-08-28',
    responsible: '분석팀',
    deliverables: '요구사항정의서, 요구사항추적표',
    children: [
      {
        id: 'A1.1',
        code: 'A.1.1',
        name: '요구사항 분석 및 정의',
        description: '시스템 요구사항 분석 및 정의',
        progress: 13.58,
        weight: 100,
        startDate: '2020-07-01',
        endDate: '2020-08-28',
        responsible: '업무분석팀',
        deliverables: '요구사항정의서',
        children: [
          {
            id: 'A1.1.1',
            code: 'A.1.1.1',
            name: '웹 요구사항 분석',
            description: '웹 어플리케이션 요구사항 분석',
            progress: 19.4,
            weight: 70,
            startDate: '2020-07-01',
            endDate: '2020-07-31',
            responsible: '박승현, 이한찬, 에디앤스타일',
            deliverables: '화면설계서',
            tasks: []
          },
          {
            id: 'A1.1.2',
            code: 'A.1.1.2',
            name: '모바일 요구사항 분석',
            description: '모바일 어플리케이션 요구사항 분석',
            progress: 0,
            weight: 30,
            startDate: '2020-08-03',
            endDate: '2020-08-28',
            responsible: '모바일개발팀',
            deliverables: '모바일 요구사항정의서',
            tasks: []
          }
        ]
      }
    ]
  },
  {
    id: 'A2',
    code: 'A.2',
    name: '도입',
    description: '시스템 도입 및 구축 단계',
    progress: 0.6,
    weight: 5,
    startDate: '2020-07-06',
    endDate: '2020-11-20',
    responsible: '인프라팀',
    deliverables: '설치확인서, 운영자매뉴얼',
    children: [
      {
        id: 'A2.1',
        code: 'A.2.1',
        name: '클라우드 구성',
        description: '클라우드 인프라 및 개발환경 구성',
        progress: 0,
        weight: 80,
        startDate: '2020-07-13',
        endDate: '2020-11-20',
        responsible: '클라우드팀',
        deliverables: 'NBP 클라우드 서비스 계약서, 설치확인서',
        children: [
          {
            id: 'A2.1.1',
            code: 'A.2.1.1',
            name: '개발환경 구성',
            description: '개발환경 설정 및 구성',
            progress: 0,
            weight: 30,
            startDate: '2020-07-13',
            endDate: '2020-09-18',
            responsible: '한광규, 박건휘, 전제현',
            deliverables: '개발가이드',
            tasks: []
          },
          {
            id: 'A2.1.2',
            code: 'A.2.1.2',
            name: 'QA환경 구성',
            description: 'QA 테스트 환경 설정',
            progress: 0,
            weight: 30,
            startDate: '2020-10-05',
            endDate: '2020-10-23',
            responsible: 'QA팀',
            deliverables: 'QA환경 구성 문서',
            tasks: []
          },
          {
            id: 'A2.1.3',
            code: 'A.2.1.3',
            name: '운영환경 구성',
            description: '운영환경 설정 및 구성',
            progress: 0,
            weight: 40,
            startDate: '2020-08-03',
            endDate: '2020-11-20',
            responsible: '운영팀',
            deliverables: '운영자매뉴얼',
            tasks: []
          }
        ]
      },
      {
        id: 'A2.2',
        code: 'A.2.2',
        name: 'H/W 및 S/W 도입 및 설치',
        description: '필요한 하드웨어 및 소프트웨어 설치 및 구성',
        progress: 3.0,
        weight: 20,
        startDate: '2020-07-06',
        endDate: '2020-10-16',
        responsible: '설치팀',
        deliverables: '납품/설치확인서',
        children: [
          {
            id: 'A2.2.1',
            code: 'A.2.2.1',
            name: '그룹웨어 DMZ 외부접속용 웹서버 발주',
            description: '외부 접속용 웹서버 조달 및 설치',
            progress: 0,
            weight: 20,
            startDate: '2020-08-03',
            endDate: '2020-08-07',
            responsible: '조달팀',
            deliverables: '납품/설치확인서',
            tasks: []
          },
          {
            id: 'A2.2.2',
            code: 'A.2.2.2',
            name: '방화벽 도입 및 전용선 구성',
            description: '방화벽 설정 및 전용 네트워크 연결 구성',
            progress: 2.0,
            weight: 30,
            startDate: '2020-07-06',
            endDate: '2020-10-09',
            responsible: '네트워크팀',
            deliverables: '네트워크 구성 문서',
            tasks: []
          }
        ]
      }
    ]
  },
  {
    id: 'A3',
    code: 'A.3',
    name: '기획 및 디자인',
    description: 'UI/UX 기획 및 디자인 단계',
    progress: 7.32,
    weight: 25,
    startDate: '2020-07-03',
    endDate: '2020-10-09',
    responsible: '디자인팀',
    deliverables: '화면 시안, 화면설계서',
    children: [
      {
        id: 'A3.1',
        code: 'A.3.1',
        name: '웹 화면 시안 작성',
        description: '웹 어플리케이션 화면 디자인 작성',
        progress: 24.4,
        weight: 30,
        startDate: '2020-07-03',
        endDate: '2020-07-31',
        responsible: '에이디앤스타일 디자인팀',
        deliverables: '화면 시안',
        children: [
          {
            id: 'A3.1.1',
            code: 'A.3.1.1',
            name: '와이어 프레임 설계',
            description: '주요 화면의 와이어프레임 작성',
            progress: 74.0,
            weight: 20,
            startDate: '2020-07-03',
            endDate: '2020-07-15',
            responsible: '에이디앤스타일 기획',
            deliverables: '와이어프레임 디자인',
            tasks: []
          },
          {
            id: 'A3.1.2',
            code: 'A.3.1.2',
            name: '화면설계',
            description: '상세 화면 설계 작성',
            progress: 40.0,
            weight: 20,
            startDate: '2020-07-03',
            endDate: '2020-07-15',
            responsible: '에이디앤스타일 기획',
            deliverables: '화면설계 명세서',
            tasks: []
          },
          {
            id: 'A3.1.3',
            code: 'A.3.1.3',
            name: '프로토타이핑',
            description: '인터랙티브 프로토타입 작성',
            progress: 8.0,
            weight: 20,
            startDate: '2020-07-03',
            endDate: '2020-07-23',
            responsible: '에이디앤스타일 기획, 디자인',
            deliverables: '인터랙티브 프로토타입',
            tasks: []
          }
        ]
      },
      {
        id: 'A3.2',
        code: 'A.3.2',
        name: '웹 화면설계서 작성 및 구현',
        description: '상세 웹 화면설계 문서 작성',
        progress: 0,
        weight: 50,
        startDate: '2020-07-30',
        endDate: '2020-09-22',
        responsible: '문서화팀',
        deliverables: '화면설계서',
        children: []
      },
      {
        id: 'A3.3',
        code: 'A.3.3',
        name: '모바일 화면설계서 작성 및 구현',
        description: '상세 모바일 화면설계 문서 작성',
        progress: 0,
        weight: 20,
        startDate: '2020-08-03',
        endDate: '2020-10-09',
        responsible: '모바일 디자인팀',
        deliverables: '모바일 디자인 문서',
        children: []
      }
    ]
  },
  {
    id: 'A4',
    code: 'A.4',
    name: '설계 및 구현',
    description: '시스템 설계 및 개발 단계',
    progress: 5.76,
    weight: 50,
    startDate: '2020-06-22',
    endDate: '2020-12-11',
    responsible: '개발팀',
    deliverables: '어플리케이션 시스템, 테스트 결과서',
    children: [
      {
        id: 'A4.1',
        code: 'A.4.1',
        name: '권한 설계 및 소스 배포 설계',
        description: '권한 시스템 및 소스 배포 설계',
        progress: 60.0,
        weight: 5,
        startDate: '2020-06-22',
        endDate: '2020-08-07',
        responsible: '아키텍처팀',
        deliverables: '권한 설계서, 프로그램 설계서',
        children: []
      },
      {
        id: 'A4.2',
        code: 'A.4.2',
        name: '웹 어플리케이션 개발 1차',
        description: '웹 어플리케이션 1차 개발',
        progress: 13.8,
        weight: 20,
        startDate: '2020-06-22',
        endDate: '2020-07-31',
        responsible: '웹개발팀',
        deliverables: '핵심 어플리케이션 기능',
        children: []
      },
      {
        id: 'A4.3',
        code: 'A.4.3',
        name: '웹 어플리케이션 개발 2차',
        description: '웹 어플리케이션 2차 개발',
        progress: 0,
        weight: 10,
        startDate: '2020-07-27',
        endDate: '2020-08-28',
        responsible: '웹개발팀',
        deliverables: '고급 기능',
        children: []
      },
      {
        id: 'A4.4',
        code: 'A.4.4',
        name: '웹 어플리케이션 개발 3차',
        description: '웹 어플리케이션 3차 개발',
        progress: 0,
        weight: 35,
        startDate: '2020-08-17',
        endDate: '2020-10-23',
        responsible: '웹개발팀',
        deliverables: '완전한 웹 어플리케이션',
        children: []
      },
      {
        id: 'A4.5',
        code: 'A.4.5',
        name: '모바일 어플리케이션 기능 개발',
        description: '모바일 어플리케이션 기능 개발',
        progress: 0,
        weight: 15,
        startDate: '2020-08-24',
        endDate: '2020-10-23',
        responsible: '모바일개발팀',
        deliverables: '모바일 어플리케이션',
        children: []
      },
      {
        id: 'A4.6',
        code: 'A.4.6',
        name: '외부 연계',
        description: '외부 시스템과의 연동',
        progress: 0,
        weight: 10,
        startDate: '2020-08-31',
        endDate: '2020-12-11',
        responsible: '연동팀',
        deliverables: '연동 문서',
        children: []
      },
      {
        id: 'A4.7',
        code: 'A.4.7',
        name: '보안취약점 진단',
        description: '보안 테스트 및 취약점 진단',
        progress: 0,
        weight: 5,
        startDate: '2020-11-02',
        endDate: '2020-11-27',
        responsible: '보안팀',
        deliverables: '웹취약점진단결과서',
        children: []
      }
    ]
  },
  {
    id: 'A5',
    code: 'A.5',
    name: '테스트',
    description: '시스템 테스트 및 품질보증',
    progress: 0,
    weight: 10,
    startDate: '2020-10-19',
    endDate: '2020-12-11',
    responsible: 'QA팀',
    deliverables: '테스트 계획서, 테스트 결과서',
    children: [
      {
        id: 'A5.1',
        code: 'A.5.1',
        name: '통합 테스트 계획',
        description: '통합 테스트 계획 및 실행',
        progress: 0,
        weight: 20,
        startDate: '2020-10-19',
        endDate: '2020-10-30',
        responsible: 'QA팀',
        deliverables: '통합 테스트 계획서',
        children: []
      }
    ]
  }
];

export function TaskHierarchyView({ tasks, onCreateSubtask, onDeleteTask }: TaskHierarchyViewProps) {
  const [expandedPhases, setExpandedPhases] = useState<Set<string>>(new Set(['A1', 'A3', 'A4'])); // Default expanded
  const [expandedWorkPackages, setExpandedWorkPackages] = useState<Set<string>>(new Set());
  const [expandedActivities, setExpandedActivities] = useState<Set<string>>(new Set());
  const [expandedTasks, setExpandedTasks] = useState<Set<string>>(new Set());

  const buildTaskTree = (tasks: Task[]): TaskTreeNode[] => {
    const taskMap = new Map<string, TaskTreeNode>();
    const rootTasks: TaskTreeNode[] = [];

    // 모든 작업을 맵에 추가
    tasks.forEach(task => {
      taskMap.set(task.id, {
        task,
        children: [],
        isExpanded: expandedTasks.has(task.id)
      });
    });

    // 계층 구조 구성
    tasks.forEach(task => {
      const node = taskMap.get(task.id)!;
      
      if (task.parentTaskId) {
        const parentNode = taskMap.get(task.parentTaskId);
        if (parentNode) {
          parentNode.children.push(node);
        }
      } else {
        rootTasks.push(node);
      }
    });

    return rootTasks;
  };

  const toggleExpanded = (type: 'phase' | 'workpackage' | 'activity' | 'task', id: string) => {
    let currentSet: Set<string>;
    let setFunction: (set: Set<string>) => void;

    switch (type) {
      case 'phase':
        currentSet = expandedPhases;
        setFunction = setExpandedPhases;
        break;
      case 'workpackage':
        currentSet = expandedWorkPackages;
        setFunction = setExpandedWorkPackages;
        break;
      case 'activity':
        currentSet = expandedActivities;
        setFunction = setExpandedActivities;
        break;
      case 'task':
        currentSet = expandedTasks;
        setFunction = setExpandedTasks;
        break;
    }

    const newExpanded = new Set(currentSet);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setFunction(newExpanded);
  };

  const getPriorityColor = (priority: Task['priority']) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityLabel = (priority: Task['priority']) => {
    switch (priority) {
      case 'high':
        return '높음';
      case 'medium':
        return '보통';
      case 'low':
        return '낮음';
      default:
        return '보통';
    }
  };

  const getStatusColor = (status: Task['status']) => {
    switch (status) {
      case 'todo':
        return 'bg-slate-100 text-slate-800 border-slate-200';
      case 'in-progress':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'done':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusLabel = (status: Task['status']) => {
    switch (status) {
      case 'todo':
        return '할 일';
      case 'in-progress':
        return '진행 중';
      case 'done':
        return '완료';
      default:
        return '할 일';
    }
  };

  const renderWBSPhase = (phase: WBSPhase) => {
    const isExpanded = expandedPhases.has(phase.id);
    const hasWorkPackages = phase.children.length > 0;

    return (
      <div key={phase.id} className="mb-4">
        <Card className="border-2 border-primary/20 bg-primary/5">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3 flex-1">
                {hasWorkPackages && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 mt-0.5"
                    onClick={() => toggleExpanded('phase', phase.id)}
                  >
                    {isExpanded ? (
                      <ChevronDown className="w-4 h-4" />
                    ) : (
                      <ChevronRight className="w-4 h-4" />
                    )}
                  </Button>
                )}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="default" className="bg-primary text-primary-foreground">
                      {phase.code}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      가중치: {phase.weight}%
                    </Badge>
                    {hasWorkPackages && (
                      <Badge variant="outline" className="text-xs">
                        {phase.children.length}개 작업패키지
                      </Badge>
                    )}
                  </div>
                  <CardTitle className="text-lg">{phase.name}</CardTitle>
                  {phase.description && (
                    <CardDescription className="text-sm mt-1">
                      {phase.description}
                    </CardDescription>
                  )}
                  <div className="mt-3">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                      <BarChart3 className="w-3 h-3" />
                      <span>진행률: {phase.progress.toFixed(1)}%</span>
                    </div>
                    <Progress value={phase.progress} className="h-2" />
                  </div>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Calendar className="w-3 h-3" />
                  <span>{phase.startDate} ~ {phase.endDate}</span>
                </div>
                {phase.responsible && (
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <User className="w-3 h-3" />
                    <span>{phase.responsible}</span>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Work Packages */}
        {hasWorkPackages && isExpanded && (
          <div className="mt-3 ml-6">
            {phase.children.map(workPackage => renderWBSWorkPackage(workPackage))}
          </div>
        )}
      </div>
    );
  };

  const renderWBSWorkPackage = (workPackage: WBSWorkPackage) => {
    const isExpanded = expandedWorkPackages.has(workPackage.id);
    const hasActivities = workPackage.children.length > 0;

    return (
      <div key={workPackage.id} className="mb-3">
        <Card className="border-l-4 border-l-blue-400 bg-blue-50/50">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3 flex-1">
                {hasActivities && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 mt-0.5"
                    onClick={() => toggleExpanded('workpackage', workPackage.id)}
                  >
                    {isExpanded ? (
                      <ChevronDown className="w-4 h-4" />
                    ) : (
                      <ChevronRight className="w-4 h-4" />
                    )}
                  </Button>
                )}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                      {workPackage.code}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      가중치: {workPackage.weight}%
                    </Badge>
                    {hasActivities && (
                      <Badge variant="outline" className="text-xs">
                        {workPackage.children.length}개 활동
                      </Badge>
                    )}
                  </div>
                  <CardTitle className="text-base">{workPackage.name}</CardTitle>
                  {workPackage.description && (
                    <CardDescription className="text-sm mt-1">
                      {workPackage.description}
                    </CardDescription>
                  )}
                  <div className="mt-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                      <BarChart3 className="w-3 h-3" />
                      <span>진행률: {workPackage.progress.toFixed(1)}%</span>
                    </div>
                    <Progress value={workPackage.progress} className="h-1.5" />
                  </div>
                </div>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onCreateSubtask(workPackage.id)}>
                    <Plus className="w-4 h-4 mr-2" />
                    활동 추가
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Calendar className="w-3 h-3" />
                  <span>{workPackage.startDate} ~ {workPackage.endDate}</span>
                </div>
                {workPackage.responsible && (
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <User className="w-3 h-3" />
                    <span>{workPackage.responsible}</span>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Activities */}
        {hasActivities && isExpanded && (
          <div className="mt-2 ml-6">
            {workPackage.children.map(activity => renderWBSActivity(activity))}
          </div>
        )}
      </div>
    );
  };

  const renderWBSActivity = (activity: WBSActivity) => {
    const isExpanded = expandedActivities.has(activity.id);
    const hasTasks = activity.tasks.length > 0;

    return (
      <div key={activity.id} className="mb-2">
        <Card className="border-l-4 border-l-green-400 bg-green-50/50">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3 flex-1">
                {hasTasks && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 mt-0.5"
                    onClick={() => toggleExpanded('activity', activity.id)}
                  >
                    {isExpanded ? (
                      <ChevronDown className="w-4 h-4" />
                    ) : (
                      <ChevronRight className="w-4 h-4" />
                    )}
                  </Button>
                )}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      {activity.code}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      가중치: {activity.weight}%
                    </Badge>
                    {hasTasks && (
                      <Badge variant="outline" className="text-xs">
                        {activity.tasks.length}개 작업
                      </Badge>
                    )}
                  </div>
                  <CardTitle className="text-sm">{activity.name}</CardTitle>
                  {activity.description && (
                    <CardDescription className="text-xs mt-1">
                      {activity.description}
                    </CardDescription>
                  )}
                  <div className="mt-2">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                      <BarChart3 className="w-3 h-3" />
                      <span>진행률: {activity.progress.toFixed(1)}%</span>
                    </div>
                    <Progress value={activity.progress} className="h-1" />
                  </div>
                </div>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onCreateSubtask(activity.id)}>
                    <Plus className="w-4 h-4 mr-2" />
                    작업 추가
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Calendar className="w-3 h-3" />
                  <span>{activity.startDate} ~ {activity.endDate}</span>
                </div>
                {activity.responsible && (
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <User className="w-3 h-3" />
                    <span>{activity.responsible}</span>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Individual Tasks */}
        {hasTasks && isExpanded && (
          <div className="mt-2 ml-6">
            {activity.tasks.map(task => renderTaskNode({
              task,
              children: [],
              isExpanded: false
            }, 0))}
          </div>
        )}
      </div>
    );
  };

  const renderTaskNode = (node: TaskTreeNode, level: number = 0) => {
    const { task, children } = node;
    const hasChildren = children.length > 0;
    const isExpanded = expandedTasks.has(task.id);

    return (
      <div key={task.id} className="mb-2">
        <Card className="border-l-4 border-l-orange-400 bg-orange-50/50">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-2 flex-1">
                {hasChildren && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 mt-0.5"
                    onClick={() => toggleExpanded('task', task.id)}
                  >
                    {isExpanded ? (
                      <ChevronDown className="w-4 h-4" />
                    ) : (
                      <ChevronRight className="w-4 h-4" />
                    )}
                  </Button>
                )}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge 
                      variant="outline" 
                      className={getStatusColor(task.status)}
                    >
                      {getStatusLabel(task.status)}
                    </Badge>
                    <Badge 
                      variant="outline" 
                      className={getPriorityColor(task.priority)}
                    >
                      {getPriorityLabel(task.priority)}
                    </Badge>
                    {hasChildren && (
                      <Badge variant="outline" className="text-xs">
                        {children.length}개 하위작업
                      </Badge>
                    )}
                  </div>
                  <CardTitle className="text-sm">{task.title}</CardTitle>
                  {task.description && (
                    <CardDescription className="text-xs mt-1">
                      {task.description}
                    </CardDescription>
                  )}
                </div>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onCreateSubtask(task.id)}>
                    <Plus className="w-4 h-4 mr-2" />
                    하위 작업 추가
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => onDeleteTask(task.id)}
                    className="text-destructive"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    삭제
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1 text-muted-foreground">
                  <User className="w-3 h-3" />
                  <span>{task.assignee}</span>
                </div>
                <span className="text-muted-foreground">
                  {new Date(task.createdAt).toLocaleDateString('ko-KR')}
                </span>
              </div>
              {task.requirementId && (
                <RequirementTag 
                  reqIdString={requirementMapping[task.requirementId] || `REQ-${task.requirementId}`}
                />
              )}
            </div>
          </CardContent>
        </Card>

        {/* Subtasks */}
        {hasChildren && isExpanded && (
          <div className="mt-2 ml-6">
            {children.map(childNode => renderTaskNode(childNode, level + 1))}
          </div>
        )}
      </div>
    );
  };

  const taskTree = buildTaskTree(tasks);
  const totalPhases = wbsStructure.length;
  const totalWorkPackages = wbsStructure.reduce((sum, phase) => sum + phase.children.length, 0);
  const totalActivities = wbsStructure.reduce((sum, phase) => 
    sum + phase.children.reduce((wpSum, wp) => wpSum + wp.children.length, 0), 0);

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-semibold">작업 분할 구조 (WBS)</h3>
          <p className="text-sm text-muted-foreground">
            단계, 작업패키지, 활동으로 구성된 구조화된 작업 분할 기반 프로젝트 계층구조
          </p>
        </div>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span>{totalPhases}개 단계</span>
          <span>•</span>
          <span>{totalWorkPackages}개 작업패키지</span>
          <span>•</span>
          <span>{totalActivities}개 활동</span>
          <span>•</span>
          <span>{tasks.length}개 작업</span>
        </div>
      </div>

      {/* Overall Project Progress */}
      <Card className="bg-gradient-to-r from-primary/10 to-secondary/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            업무공유시스템 - 협업 플랫폼
          </CardTitle>
          <CardDescription>
            Git과 Jira를 통합하여 자동화된 주간 보고서를 생성하는 AI 기반 프로젝트 관리 시스템
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>전체 프로젝트 진행률</span>
              <span>5.42%</span>
            </div>
            <Progress value={5.42} className="h-3" />
          </div>
        </CardContent>
      </Card>
      
      {/* WBS Structure */}
      <div className="space-y-4">
        {wbsStructure.map(phase => renderWBSPhase(phase))}
      </div>

      {/* Additional Tasks (not part of WBS) */}
      {tasks.length > 0 && (
        <div className="space-y-4">
          <div className="border-t pt-6">
            <h4 className="text-lg font-medium mb-4">추가 프로젝트 작업</h4>
            <div className="space-y-2">
              {taskTree.map(node => renderTaskNode(node))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
