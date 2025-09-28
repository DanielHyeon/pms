import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { ArrowLeft, Edit, Plus, Link } from 'lucide-react';
import type { Requirement, Task } from '../api/types';
import { RequirementForm } from './RequirementForm';
import { CreateTaskModal } from './CreateTaskModal';
import { TaskCard } from './TaskCard';

interface RequirementDetailViewProps {
  requirement: Requirement;
  onBack: () => void;
  onUpdate: (requirement: Requirement) => void;
  projectId: string;
}

// Mock data - 요구사항과 연결된 태스크들
const mockLinkedTasks: Task[] = [
  {
    id: '1',
    title: '로그인 UI 페이지 개발',
    description: '이메일/비밀번호 입력 폼과 로그인 버튼이 포함된 페이지',
    status: 'in-progress',
    assignee: '박프론트',
    priority: 'high',
    createdAt: '2024-03-03',
    projectId: '1',
    requirementId: '1'
  },
  {
    id: '4',
    title: '로그인 기능 구현',
    description: 'JWT 기반 사용자 인증 시스템 구축',
    status: 'done',
    assignee: '김개발',
    priority: 'high',
    createdAt: '2024-02-25',
    projectId: '1',
    requirementId: '1'
  }
];

export function RequirementDetailView({ 
  requirement, 
  onBack, 
  onUpdate, 
  projectId 
}: RequirementDetailViewProps) {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isCreateTaskModalOpen, setIsCreateTaskModalOpen] = useState(false);
  const [linkedTasks, setLinkedTasks] = useState(
    mockLinkedTasks.filter(task => task.requirementId === requirement.id)
  );

  const getStatusColor = (status: Requirement['status']) => {
    switch (status) {
      case 'defined':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'in-progress':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'done':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusLabel = (status: Requirement['status']) => {
    switch (status) {
      case 'defined':
        return '정의됨';
      case 'in-progress':
        return '진행 중';
      case 'done':
        return '완료';
      default:
        return '정의됨';
    }
  };

  const handleUpdateRequirement = (requirementData: Omit<Requirement, 'id' | 'createdAt' | 'updatedAt' | 'projectId' | 'reqIdString'>) => {
    const updatedRequirement: Requirement = {
      ...requirement,
      ...requirementData,
      updatedAt: new Date().toISOString().split('T')[0]
    };
    onUpdate(updatedRequirement);
    setIsEditModalOpen(false);
  };

  const handleCreateLinkedTask = (taskData: Omit<Task, 'id' | 'createdAt' | 'projectId'>) => {
    const newTask: Task = {
      ...taskData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString().split('T')[0],
      projectId,
      requirementId: requirement.id
    };
    setLinkedTasks([...linkedTasks, newTask]);
    setIsCreateTaskModalOpen(false);
  };

  const handleDeleteTask = (taskId: string) => {
    setLinkedTasks(linkedTasks.filter(task => task.id !== taskId));
  };

  const getTaskStatusCounts = () => {
    const total = linkedTasks.length;
    const done = linkedTasks.filter(task => task.status === 'done').length;
    const inProgress = linkedTasks.filter(task => task.status === 'in-progress').length;
    const todo = linkedTasks.filter(task => task.status === 'todo').length;
    
    return { total, done, inProgress, todo };
  };

  const statusCounts = getTaskStatusCounts();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={onBack}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            요구사항 목록
          </Button>
        </div>
        <Button onClick={() => setIsEditModalOpen(true)} variant="outline">
          <Edit className="w-4 h-4 mr-2" />
          수정
        </Button>
      </div>

      {/* Requirement Details */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="outline" className="font-mono">
                  {requirement.reqIdString}
                </Badge>
                {requirement.trackingNumber && (
                  <Badge variant="outline" className="font-mono bg-blue-50 text-blue-700 border-blue-200">
                    {requirement.trackingNumber}
                  </Badge>
                )}
                <Badge 
                  variant="outline" 
                  className={getStatusColor(requirement.status)}
                >
                  {getStatusLabel(requirement.status)}
                </Badge>
              </div>
              <CardTitle className="text-xl">{requirement.title}</CardTitle>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {requirement.trackingNumber && (
              <div>
                <h4 className="font-medium mb-2">추적 번호</h4>
                <p className="text-muted-foreground font-mono">
                  {requirement.trackingNumber}
                </p>
              </div>
            )}

            <div>
              <h4 className="font-medium mb-2">상세 설명</h4>
              <p className="text-muted-foreground leading-relaxed">
                {requirement.description}
              </p>
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">생성일:</span>
                <span className="ml-2">{new Date(requirement.createdAt).toLocaleDateString('ko-KR')}</span>
              </div>
              <div>
                <span className="text-muted-foreground">수정일:</span>
                <span className="ml-2">{new Date(requirement.updatedAt).toLocaleDateString('ko-KR')}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Progress Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">진행 상황</CardTitle>
          <CardDescription>이 요구사항과 연결된 작업들의 진행 현황</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-semibold">{statusCounts.total}</div>
              <div className="text-sm text-muted-foreground">전체 작업</div>
            </div>
            <div>
              <div className="text-2xl font-semibold text-blue-600">{statusCounts.todo}</div>
              <div className="text-sm text-muted-foreground">대기</div>
            </div>
            <div>
              <div className="text-2xl font-semibold text-yellow-600">{statusCounts.inProgress}</div>
              <div className="text-sm text-muted-foreground">진행 중</div>
            </div>
            <div>
              <div className="text-2xl font-semibold text-green-600">{statusCounts.done}</div>
              <div className="text-sm text-muted-foreground">완료</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Linked Tasks */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium">연결된 작업</h3>
            <p className="text-sm text-muted-foreground">
              이 요구사항을 구현하기 위한 세부 작업들
            </p>
          </div>
          <Button onClick={() => setIsCreateTaskModalOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            연결된 작업 생성
          </Button>
        </div>

        {linkedTasks.length > 0 ? (
          <div className="grid gap-4">
            {linkedTasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onDelete={handleDeleteTask}
              />
            ))}
          </div>
        ) : (
          <Card className="py-8">
            <CardContent className="text-center">
              <Link className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h4 className="font-medium mb-2">연결된 작업이 없습니다</h4>
              <p className="text-sm text-muted-foreground mb-4">
                이 요구사항을 구현하기 위한 첫 번째 작업을 생성하세요.
              </p>
              <Button onClick={() => setIsCreateTaskModalOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                작업 생성
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Modals */}
      <RequirementForm
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSubmit={handleUpdateRequirement}
        requirement={requirement}
        mode="edit"
      />

      <CreateTaskModal
        isOpen={isCreateTaskModalOpen}
        onClose={() => setIsCreateTaskModalOpen(false)}
        onCreateTask={handleCreateLinkedTask}
        linkedRequirementId={requirement.id}
        linkedRequirementTitle={requirement.reqIdString}
      />
    </div>
  );
}
