import React, { useEffect, useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { AIAssigneeSelector } from './AIAssigneeSelector';
import type { Requirement, TaskCreatePayload, Task } from '../api/types';

interface CreateTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (payload: TaskCreatePayload) => Promise<void> | void;
  requirements?: Requirement[];
  parentTaskTitle?: string;
  initialTask?: Task;
}

const statusOptions: Task['status'][] = ['todo', 'in-progress', 'done'];
const priorityOptions: Task['priority'][] = ['low', 'medium', 'high', 'critical'];

export function CreateTaskModal({
  isOpen,
  onClose,
  onSubmit,
  requirements = [],
  parentTaskTitle,
  initialTask,
}: CreateTaskModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<Task['status']>('todo');
  const [assignee, setAssignee] = useState('');
  const [priority, setPriority] = useState<Task['priority']>('medium');
  const [requirementId, setRequirementId] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialTask) {
      setTitle(initialTask.title);
      setDescription(initialTask.description);
      setStatus(initialTask.status);
      setAssignee(initialTask.assignee || '');
      setPriority(initialTask.priority);
      setRequirementId(initialTask.requirementId || '');
    } else {
      resetForm();
    }
  }, [initialTask, isOpen]);

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setStatus('todo');
    setAssignee('');
    setPriority('medium');
    setRequirementId('');
    setError(null);
  };

  const handleClose = () => {
    if (!isLoading) {
      resetForm();
      onClose();
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!title.trim()) {
      setError('제목을 입력하세요.');
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      await onSubmit({
        title: title.trim(),
        description: description.trim(),
        status,
        assignee: assignee.trim() || undefined,
        priority,
        requirementId: requirementId || undefined,
      });
      resetForm();
    } catch (submissionError) {
      console.error('Task submission failed', submissionError);
      setError('태스크 저장 중 문제가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto glass-card">
        <DialogHeader className="pb-4">
          <DialogTitle className="text-lg">
            {initialTask ? '태스크 수정' : parentTaskTitle ? `${parentTaskTitle} 하위 작업` : '새 태스크 생성'}
          </DialogTitle>
          <DialogDescription>
            새 작업을 생성하고 팀원에게 할당하세요.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="task-title">제목</Label>
            <Input
              id="task-title"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="태스크 제목을 입력하세요"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="task-description">설명</Label>
            <Textarea
              id="task-description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="업무 내용을 설명해주세요"
              rows={4}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="task-status">상태</Label>
              <Select value={status} onValueChange={(value: Task['status']) => setStatus(value)}>
                <SelectTrigger id="task-status">
                  <SelectValue placeholder="상태를 선택하세요" />
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
                  <SelectValue placeholder="우선순위를 선택하세요" />
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
            <AIAssigneeSelector
              id="task-assignee"
              value={assignee}
              onSelect={(value) => setAssignee(value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="task-requirement">연결된 요구사항</Label>
            <Select
              value={requirementId}
              onValueChange={(value) => setRequirementId(value === 'none' ? '' : value)}
            >
              <SelectTrigger id="task-requirement">
                <SelectValue placeholder="연결할 요구사항을 선택하세요" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">연결 안 함</SelectItem>
                {requirements.map((requirement) => (
                  <SelectItem key={requirement.id} value={requirement.id}>
                    {requirement.reqIdString} · {requirement.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={handleClose} disabled={isLoading}>
              취소
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? '저장 중...' : initialTask ? '저장' : '생성'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
