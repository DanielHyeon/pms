import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { TaskCard } from './TaskCard';
import type { Task } from '../api/types';

interface KanbanColumnProps {
  title: string;
  status: Task['status'];
  tasks: Task[];
  onTaskStatusChange: (taskId: string, newStatus: Task['status']) => void;
  onDeleteTask: (taskId: string) => void;
  onCreateSubtask?: (parentTaskId: string) => void;
  onEditTask?: (task: Task) => void;
  allTasks?: Task[];
}

export function KanbanColumn({ title, status, tasks, onTaskStatusChange, onDeleteTask, onCreateSubtask, onEditTask, allTasks = [] }: KanbanColumnProps) {
  const getColumnColor = () => {
    switch (status) {
      case 'todo':
        return 'border-gray-200';
      case 'in-progress':
        return 'border-blue-200';
      case 'done':
        return 'border-green-200';
      default:
        return 'border-gray-200';
    }
  };

  const getBadgeVariant = () => {
    switch (status) {
      case 'todo':
        return 'secondary' as const;
      case 'in-progress':
        return 'default' as const;
      case 'done':
        return 'secondary' as const;
      default:
        return 'secondary' as const;
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('text/plain');
    onTaskStatusChange(taskId, status);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  return (
    <Card className={`${getColumnColor()} min-h-[400px]`}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>{title}</span>
          <Badge variant={getBadgeVariant()}>{tasks.length}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent
        className="space-y-3"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
      >
        {tasks
          .filter(task => !task.parentTaskId) // 최상위 작업만 표시
          .map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            onDelete={onDeleteTask}
            onCreateSubtask={onCreateSubtask}
            onEdit={onEditTask}
            allTasks={allTasks}
          />
        ))}
        {tasks.length === 0 && (
          <div className="text-center text-muted-foreground py-8">
            <p>태스크가 없습니다</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
