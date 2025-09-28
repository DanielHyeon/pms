import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { MoreHorizontal, Trash2, User, Plus, ChevronRight, Edit, Copy, Eye, Clock } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import type { Task } from '../api/types';
import { RequirementTag } from './RequirementTag';
import { toast } from 'sonner@2.0.3';

interface TaskCardProps {
  task: Task;
  onDelete: (taskId: string) => void;
  onCreateSubtask?: (parentTaskId: string) => void;
  onEdit?: (task: Task) => void;
  allTasks?: Task[];
  level?: number;
}

export function TaskCard({ task, onDelete, onCreateSubtask, onEdit, allTasks = [], level = 0 }: TaskCardProps) {
  const [isDragging, setIsDragging] = useState(false);

  const handleTaskAction = (action: string) => {
    switch (action) {
      case 'view':
        if (onEdit) {
          onEdit(task);
        }
        break;
      case 'edit':
        if (onEdit) {
          onEdit(task);
        }
        break;
      case 'duplicate':
        toast.success('복제 기능은 아직 구현되지 않았습니다.');
        break;
      case 'time':
        toast.info('시간 기록 기능은 준비 중입니다.');
        break;
      default:
        break;
    }
  };

  const getPriorityColor = (priority: Task['priority']) => {
    switch (priority) {
      case 'critical':
        return 'bg-red-200 text-red-900 border-red-300';
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
      case 'critical':
        return '긴급';
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

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
    e.dataTransfer.setData('text/plain', task.id);
    setIsDragging(true);
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  const subtaskCount = allTasks.filter((t) => t.parentTaskId === task.id).length;

  return (
    <div className={level > 0 ? 'ml-6 border-l-2 border-border pl-2' : ''}>
      <Card
        className={`cursor-move hover:shadow-md transition-shadow ${isDragging ? 'opacity-50' : ''} ${level > 0 ? 'bg-muted/40' : ''}`}
        draggable
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <CardTitle className="text-sm line-clamp-2">{task.title}</CardTitle>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={() => handleTaskAction('view')}>
                  <Eye className="w-4 h-4 mr-2" />
                  상세 보기
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleTaskAction('edit')}>
                  <Edit className="w-4 h-4 mr-2" />
                  편집
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleTaskAction('duplicate')}>
                  <Copy className="w-4 h-4 mr-2" />
                  복제
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleTaskAction('time')}>
                  <Clock className="w-4 h-4 mr-2" />
                  시간 기록
                </DropdownMenuItem>
                {onCreateSubtask && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => onCreateSubtask(task.id)}>
                      <Plus className="w-4 h-4 mr-2" />
                      하위 작업 추가
                    </DropdownMenuItem>
                  </>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => onDelete(task.id)}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  삭제
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          {task.description && (
            <CardDescription className="text-xs line-clamp-2">
              {task.description}
            </CardDescription>
          )}
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-2">
            {task.requirementId && (
              <RequirementTag reqIdString={task.requirementId} className="mb-2" />
            )}
            <div className="flex items-center justify-between">
              <Badge variant="outline" className={`text-xs ${getPriorityColor(task.priority)}`}>
                {getPriorityLabel(task.priority)}
              </Badge>
              <span className="text-xs text-muted-foreground">
                {new Date(task.createdAt).toLocaleDateString('ko-KR')}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <User className="w-3 h-3" />
                <span>{task.assignee || '미배정'}</span>
              </div>
              {subtaskCount > 0 && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <ChevronRight className="w-3 h-3" />
                  <span>{subtaskCount}개 하위 작업</span>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
