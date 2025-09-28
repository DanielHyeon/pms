import React, { useEffect, useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import type { Task, TaskUpdatePayload } from '../api/types';

interface TaskDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: Task | null;
  onSave: (updates: TaskUpdatePayload) => void;
  onDelete: () => void;
}

const statusOptions: Task['status'][] = ['todo', 'in-progress', 'done'];
const priorityOptions: Task['priority'][] = ['low', 'medium', 'high', 'critical'];

export function TaskDetailModal({ isOpen, onClose, task, onSave, onDelete }: TaskDetailModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<Task['status']>('todo');
  const [assignee, setAssignee] = useState('');
  const [priority, setPriority] = useState<Task['priority']>('medium');

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description);
      setStatus(task.status);
      setAssignee(task.assignee || '');
      setPriority(task.priority);
    }
  }, [task]);

  if (!task) {
    return null;
  }

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    onSave({
      title: title.trim(),
      description: description.trim(),
      status,
      assignee: assignee.trim() || undefined,
      priority,
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto glass-card">
        <DialogHeader className="pb-4">
          <DialogTitle>태스크 상세 정보</DialogTitle>
          <DialogDescription>필요하다면 태스크 정보를 수정할 수 있습니다.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="task-title">제목</Label>
            <Input
              id="task-title"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="task-description">설명</Label>
            <Textarea
              id="task-description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              rows={4}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="task-status">상태</Label>
              <Select value={status} onValueChange={(value: Task['status']) => setStatus(value)}>
                <SelectTrigger id="task-status">
                  <SelectValue placeholder="상태" />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option === 'todo' ? '할 일' : option === 'in-progress' ? '진행중' : '완료'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="task-priority">우선순위</Label>
              <Select value={priority} onValueChange={(value: Task['priority']) => setPriority(value)}>
                <SelectTrigger id="task-priority">
                  <SelectValue placeholder="우선순위" />
                </SelectTrigger>
                <SelectContent>
                  {priorityOptions.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option === 'critical'
                        ? '긴급'
                        : option === 'high'
                        ? '높음'
                        : option === 'medium'
                        ? '보통'
                        : '낮음'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="task-assignee">담당자</Label>
            <Input
              id="task-assignee"
              value={assignee}
              onChange={(event) => setAssignee(event.target.value)}
              placeholder="담당자를 입력하세요"
            />
          </div>

          <div className="flex justify-between pt-4">
            <Button type="button" variant="destructive" onClick={onDelete}>
              삭제
            </Button>
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={onClose}>
                취소
              </Button>
              <Button type="submit">저장</Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
