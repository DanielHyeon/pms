import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { useProjectBacklog } from '../hooks/useProjectBacklog';
import type { BacklogItemCreatePayload } from '../api/types';

interface ProductBacklogPageProps {
  projectId: string;
}

type BacklogStatus = 'backlog' | 'selected' | 'in-progress' | 'done';

const statusLabels: Record<BacklogStatus, string> = {
  backlog: '백로그',
  selected: '선택됨',
  'in-progress': '진행 중',
  done: '완료',
};

const priorityLabels: Record<string, string> = {
  low: '낮음',
  medium: '보통',
  high: '높음',
  critical: '긴급',
};

export function ProductBacklogPage({ projectId }: ProductBacklogPageProps) {
  const { backlogItems, isLoading, error, createBacklogItem, refresh } = useProjectBacklog(projectId);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [form, setForm] = useState<BacklogItemCreatePayload>({
    title: '',
    description: '',
    storyPoints: 0,
    priority: 'medium',
    status: 'backlog',
    type: 'task',
  });

  const handleChange = (field: keyof BacklogItemCreatePayload, value: string) => {
    setForm((prev) => ({
      ...prev,
      [field]: field === 'storyPoints' ? Number(value) : value,
    }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    await createBacklogItem({
      title: form.title,
      description: form.description,
      storyPoints: form.storyPoints,
      priority: form.priority,
      status: form.status,
      type: form.type,
      acceptance_criteria: form.acceptance_criteria,
    });
    setIsDialogOpen(false);
    setForm({
      title: '',
      description: '',
      storyPoints: 0,
      priority: 'medium',
      status: 'backlog',
      type: 'task',
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-medium">프로덕트 백로그</h2>
          <p className="text-muted-foreground">백로그 아이템을 확인하고 새 항목을 추가하세요.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={refresh} disabled={isLoading}>
            새로고침
          </Button>
          <Button onClick={() => setIsDialogOpen(true)}>백로그 추가</Button>
        </div>
      </div>

      {isLoading && <p className="text-sm text-muted-foreground">백로그를 불러오는 중입니다...</p>}
      {error && <p className="text-sm text-destructive">백로그 데이터를 불러오는 중 오류가 발생했습니다.</p>}

      <div className="grid gap-4">
        {backlogItems.map((item) => (
          <Card key={item.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">{item.title}</CardTitle>
                <span className="text-xs text-muted-foreground">{statusLabels[item.status as BacklogStatus] ?? item.status}</span>
              </div>
              <CardDescription>{item.description}</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-2 text-xs text-muted-foreground md:grid-cols-2">
              <span>스토리 포인트: {item.storyPoints}</span>
              <span>우선순위: {priorityLabels[item.priority] ?? item.priority}</span>
              {item.requirementId && <span>요구사항: {item.requirementId}</span>}
              <span>생성일: {new Date(item.createdAt).toLocaleDateString('ko-KR')}</span>
            </CardContent>
          </Card>
        ))}

        {!isLoading && backlogItems.length === 0 && (
          <Card className="border-dashed">
            <CardContent className="py-8 text-center text-muted-foreground">
              등록된 백로그 아이템이 없습니다. 새 아이템을 추가해보세요.
            </CardContent>
          </Card>
        )}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>백로그 아이템 추가</DialogTitle>
            <DialogDescription>새로운 백로그 아이템을 정의하세요.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="backlog-title">제목</Label>
              <Input
                id="backlog-title"
                value={form.title}
                onChange={(event) => handleChange('title', event.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="backlog-description">설명</Label>
              <Textarea
                id="backlog-description"
                value={form.description}
                onChange={(event) => handleChange('description', event.target.value)}
                rows={3}
              />
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="backlog-storyPoints">스토리 포인트</Label>
                <Input
                  id="backlog-storyPoints"
                  type="number"
                  value={form.storyPoints ?? 0}
                  onChange={(event) => handleChange('storyPoints', event.target.value)}
                  min={0}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="backlog-priority">우선순위</Label>
                <Input
                  id="backlog-priority"
                  value={form.priority ?? 'medium'}
                  onChange={(event) => handleChange('priority', event.target.value)}
                  placeholder="low / medium / high / critical"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="backlog-status">상태</Label>
              <Input
                id="backlog-status"
                value={form.status ?? 'backlog'}
                onChange={(event) => handleChange('status', event.target.value)}
                placeholder="backlog / selected / in-progress / done"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="backlog-criteria">인수 조건 (쉼표로 구분)</Label>
              <Input
                id="backlog-criteria"
                value={(form.acceptance_criteria ?? []).join(', ')}
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
                    acceptance_criteria: event.target.value
                      .split(',')
                      .map((item) => item.trim())
                      .filter((item) => item.length > 0),
                  }))
                }
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                취소
              </Button>
              <Button type="submit">추가</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
