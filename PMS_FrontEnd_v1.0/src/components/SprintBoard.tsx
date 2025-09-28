import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from './ui/dropdown-menu';
import { MoreHorizontal, Eye, Edit, Copy, Trash, Plus, Target, Calendar, Users, Clock } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  useDroppable,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { CreateTaskModal } from './CreateTaskModal';

// 스프린트 태스크 타입
interface SprintTask {
  id: string;
  title: string;
  description: string;
  status: 'todo' | 'in-progress' | 'review' | 'done';
  assignee?: string;
  priority: 'low' | 'medium' | 'high';
  storyPoints: number;
  type: 'user-story' | 'task' | 'bug';
  backlogItemId: string;
  sprintId: string;
  estimatedHours?: number;
  loggedHours?: number;
  createdAt: string;
}

// 스프린트 정보 타입
interface Sprint {
  id: string;
  name: string;
  goal: string;
  startDate: string;
  endDate: string;
  status: 'planning' | 'active' | 'completed';
  commitment: number; // 스토리 포인트
  completed: number;  // 완료된 스토리 포인트
}

interface SprintBoardProps {
  sprint: Sprint;
  onTaskStatusChange?: (taskId: string, newStatus: SprintTask['status']) => void;
}

const COLUMNS = [
  { id: 'todo', title: 'To Do', color: 'bg-gray-100' },
  { id: 'in-progress', title: 'In Progress', color: 'bg-blue-100' },
  { id: 'review', title: 'Review', color: 'bg-yellow-100' },
  { id: 'done', title: 'Done', color: 'bg-green-100' }
] as const;

// 드래그 가능한 태스크 카드 컴포넌트
function SortableTaskCard({ task, onAction }: { task: SprintTask; onAction: (action: string, task: SprintTask) => void }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const getPriorityColor = (priority: SprintTask['priority']) => {
    switch (priority) {
      case 'high': return 'border-l-red-500';
      case 'medium': return 'border-l-yellow-500';
      case 'low': return 'border-l-green-500';
      default: return 'border-l-gray-500';
    }
  };

  const getTypeIcon = (type: SprintTask['type']) => {
    switch (type) {
      case 'user-story': return '📖';
      case 'task': return '⚙️';
      case 'bug': return '🐛';
      default: return '📝';
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="cursor-grab active:cursor-grabbing"
    >
      <Card className={`${getPriorityColor(task.priority)} border-l-4 hover:shadow-md transition-shadow`}>
        <CardContent className="p-3">
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="text-sm">{getTypeIcon(task.type)}</span>
              <span className="text-xs text-muted-foreground">#{task.id}</span>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onAction('view', task)}>
                  <Eye className="w-4 h-4 mr-2" />
                  상세 보기
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onAction('edit', task)}>
                  <Edit className="w-4 h-4 mr-2" />
                  수정
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onAction('duplicate', task)}>
                  <Copy className="w-4 h-4 mr-2" />
                  복사
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={() => onAction('delete', task)}
                  className="text-destructive"
                >
                  <Trash className="w-4 h-4 mr-2" />
                  삭제
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <h4 className="font-medium text-sm mb-2 line-clamp-2">{task.title}</h4>
          
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
            <Badge variant="outline" className="text-xs">
              {task.storyPoints} SP
            </Badge>
            <span>{task.assignee}</span>
          </div>

          {task.estimatedHours && (
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">
                예상: {task.estimatedHours}h
              </span>
              {task.loggedHours && (
                <span className="text-muted-foreground">
                  실제: {task.loggedHours}h
                </span>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// 드롭 가능한 컬럼 컴포넌트
function DroppableColumn({ 
  columnId, 
  children, 
  className 
}: { 
  columnId: string; 
  children: React.ReactNode; 
  className?: string;
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: columnId,
  });

  return (
    <div
      ref={setNodeRef}
      className={`${className} space-y-3 min-h-[400px] p-2 rounded-lg transition-all duration-200 ${
        isOver ? 'bg-muted/50 ring-2 ring-primary/20' : ''
      }`}
    >
      {children}
    </div>
  );
}

export function SprintBoard({ sprint, onTaskStatusChange }: SprintBoardProps) {
  const [tasks, setTasks] = useState<SprintTask[]>([]);
  const [isCreateTaskModalOpen, setIsCreateTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<SprintTask | null>(null);
  const [viewingTask, setViewingTask] = useState<SprintTask | null>(null);

  // DnD 센서 설정
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Mock data initialization
  React.useEffect(() => {
    const mockTasks: SprintTask[] = [
      {
        id: '1',
        title: '로그인 페이지 UI 구현',
        description: '이메일, 비밀번호 입력 필드와 로그인 버튼이 있는 페이지 구현',
        status: 'in-progress',
        assignee: '김개발',
        priority: 'high',
        storyPoints: 5,
        type: 'user-story',
        backlogItemId: '1',
        sprintId: sprint.id,
        estimatedHours: 16,
        loggedHours: 8,
        createdAt: new Date().toISOString().split('T')[0]
      },
      {
        id: '2',
        title: 'API 엔드포인트 구현',
        description: '사용자 인증 관련 REST API 구현',
        status: 'todo',
        assignee: '박백엔드',
        priority: 'high',
        storyPoints: 8,
        type: 'task',
        backlogItemId: '2',
        sprintId: sprint.id,
        estimatedHours: 24,
        loggedHours: 0,
        createdAt: new Date().toISOString().split('T')[0]
      },
      {
        id: '3',
        title: '로그인 버튼 클릭 안됨',
        description: '특정 브라우저에서 로그인 버튼이 작동하지 않는 이슈',
        status: 'review',
        assignee: '이테스터',
        priority: 'medium',
        storyPoints: 3,
        type: 'bug',
        backlogItemId: '3',
        sprintId: sprint.id,
        estimatedHours: 4,
        loggedHours: 3,
        createdAt: new Date().toISOString().split('T')[0]
      },
      {
        id: '4',
        title: '데이터베이스 스키마 설계',
        description: '사용자 및 권한 관리를 위한 데이터베이스 테이블 설계',
        status: 'done',
        assignee: '최디비',
        priority: 'high',
        storyPoints: 5,
        type: 'task',
        backlogItemId: '4',
        sprintId: sprint.id,
        estimatedHours: 12,
        loggedHours: 10,
        createdAt: new Date().toISOString().split('T')[0]
      }
    ];

    setTasks(mockTasks);
  }, [sprint.id]);

  const getTasksByStatus = (status: SprintTask['status']) => {
    return tasks.filter(task => task.status === status);
  };

  const sprintProgress = (sprint.completed / sprint.commitment) * 100;
  const totalLoggedHours = tasks.reduce((sum, task) => sum + (task.loggedHours || 0), 0);
  const totalEstimatedHours = tasks.reduce((sum, task) => sum + (task.estimatedHours || 0), 0);

  // 드래그 앤 드롭 핸들러
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    // 태스크가 다른 컬럼으로 이동되는 경우
    const activeTask = tasks.find(task => task.id === activeId);
    if (!activeTask) return;

    // 컬럼 ID가 overId인지 확인하고, 해당 status로 변경
    const statusMapping: { [key: string]: SprintTask['status'] } = {
      'todo': 'todo',
      'in-progress': 'in-progress', 
      'review': 'review',
      'done': 'done'
    };

    if (statusMapping[overId]) {
      setTasks(prev => prev.map(task => 
        task.id === activeId 
          ? { ...task, status: statusMapping[overId] }
          : task
      ));
      toast.success(`태스크가 ${overId === 'todo' ? '할 일' : overId === 'in-progress' ? '진행 중' : overId === 'review' ? '리뷰' : '완료'}로 이동되었습니다.`);
      
      // 부모 컴포넌트에 상태 변경 알림
      if (onTaskStatusChange) {
        onTaskStatusChange(activeId, statusMapping[overId]);
      }
    }
  };

  const handleTaskAction = (action: string, task: SprintTask) => {
    switch (action) {
      case 'edit':
        setEditingTask(task);
        break;
      case 'duplicate':
        const duplicatedTask: SprintTask = {
          ...task,
          id: Date.now().toString(),
          title: `${task.title} (복사본)`,
          status: 'todo',
          createdAt: new Date().toISOString().split('T')[0]
        };
        setTasks(prev => [...prev, duplicatedTask]);
        toast.success('태스크가 복사되었습니다.');
        break;
      case 'delete':
        setTasks(prev => prev.filter(t => t.id !== task.id));
        toast.success('태스크가 삭제되었습니다.');
        break;
      case 'view':
        setViewingTask(task);
        break;
      default:
        break;
    }
  };

  return (
    <div className="space-y-6">
      {/* Sprint Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5" />
                {sprint.name}
                <Badge variant="default">Active</Badge>
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                {sprint.goal}
              </p>
            </div>
            <Button onClick={() => setIsCreateTaskModalOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              태스크 추가
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <div className="text-sm text-muted-foreground">기간</div>
              <div className="text-2xl font-semibold">
                {Math.ceil((new Date(sprint.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))}
              </div>
              <div className="text-xs text-muted-foreground">일</div>
            </div>
            <div className="space-y-2">
              <div className="text-sm text-muted-foreground">작업 시간</div>
              <div className="text-2xl font-semibold">
                {totalLoggedHours} / {totalEstimatedHours}
              </div>
              <div className="text-xs text-muted-foreground">시간</div>
            </div>
            <div className="space-y-2">
              <div className="text-sm text-muted-foreground">완료율</div>
              <div className="text-2xl font-semibold">
                {Math.round((tasks.filter(t => t.status === 'done').length / tasks.length) * 100)}%
              </div>
              <div className="text-xs text-muted-foreground">
                {tasks.filter(t => t.status === 'done').length} / {tasks.length} 태스크
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sprint Board */}
      <DndContext 
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {COLUMNS.map(column => {
            const columnTasks = getTasksByStatus(column.id as SprintTask['status']);
            const columnPoints = columnTasks.reduce((sum, task) => sum + task.storyPoints, 0);

            return (
              <Card key={column.id} className={`${column.color} border-t-4`}>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center justify-between text-sm">
                    <span>{column.title}</span>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        {columnTasks.length}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {columnPoints} SP
                      </Badge>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <SortableContext 
                    items={columnTasks.map(task => task.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    <DroppableColumn columnId={column.id}>
                      {columnTasks.map((task) => (
                        <SortableTaskCard 
                          key={task.id}
                          task={task} 
                          onAction={handleTaskAction}
                        />
                      ))}
                      
                      {/* Empty State */}
                      {columnTasks.length === 0 && (
                        <div className="text-center py-8 text-muted-foreground text-sm">
                          태스크를 여기로 드래그하세요
                        </div>
                      )}
                    </DroppableColumn>
                  </SortableContext>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </DndContext>

      {/* Create Task Modal */}
      <CreateTaskModal
        isOpen={isCreateTaskModalOpen}
        onClose={() => setIsCreateTaskModalOpen(false)}
        onCreateTask={(taskData) => {
          const newTask: SprintTask = {
            id: Date.now().toString(),
            title: taskData.title,
            description: taskData.description,
            status: taskData.status as SprintTask['status'],
            assignee: taskData.assignee,
            priority: taskData.priority as SprintTask['priority'],
            storyPoints: taskData.storyPoints || 0,
            type: 'task',
            backlogItemId: '',
            sprintId: sprint.id,
            estimatedHours: 8,
            loggedHours: 0,
            createdAt: new Date().toISOString().split('T')[0]
          };

          setTasks(prev => [...prev, newTask]);
          toast.success('새로운 스프린트 태스크가 생성되었습니다.');
        }}
        allTasks={[]}
      />

      {/* Edit Task Modal */}
      {editingTask && (
        <CreateTaskModal
          isOpen={true}
          onClose={() => setEditingTask(null)}
          onCreateTask={(taskData) => {
            setTasks(prev => prev.map(t => 
              t.id === editingTask.id 
                ? {
                    ...t,
                    title: taskData.title,
                    description: taskData.description,
                    status: taskData.status as SprintTask['status'],
                    assignee: taskData.assignee,
                    priority: taskData.priority
                  }
                : t
            ));
            setEditingTask(null);
            toast.success('태스크가 업데이트되었습니다.');
          }}
          allTasks={[]}
          initialData={editingTask}
        />
      )}
    </div>
  );
}