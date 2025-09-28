import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { useProjectSprints } from '../hooks/useProjectSprints';
import type { SprintCreatePayload } from '../api/types';

interface SprintManagementPageProps {
  projectId: string;
}

export function SprintManagementPage({ projectId }: SprintManagementPageProps) {
  const { sprints, isLoading, error, createSprint, refresh } = useProjectSprints(projectId);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [form, setForm] = useState<SprintCreatePayload>({
    name: '',
    goal: '',
    status: 'planning',
    startDate: '',
    endDate: '',
    capacity: 0,
    commitment: 0,
    completed: 0,
  });

  const handleChange = (field: keyof SprintCreatePayload, value: string) => {
    setForm((prev) => ({
      ...prev,
      [field]:
        field === 'capacity' || field === 'commitment' || field === 'completed'
          ? Number(value)
          : value,
    }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    await createSprint({
      name: form.name,
      goal: form.goal,
      status: form.status,
      startDate: form.startDate,
      endDate: form.endDate,
      capacity: form.capacity,
      commitment: form.commitment,
      completed: form.completed,
    });
    setIsDialogOpen(false);
    setForm({
      name: '',
      goal: '',
      status: 'planning',
      startDate: '',
      endDate: '',
      capacity: 0,
      commitment: 0,
      completed: 0,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-medium">스프린트 관리</h2>
          <p className="text-muted-foreground">프로젝트 스프린트를 확인하고 새 스프린트를 생성하세요.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={refresh} disabled={isLoading}>
            새로고침
          </Button>
          <Button onClick={() => setIsDialogOpen(true)}>스프린트 생성</Button>
        </div>
      </div>

      {isLoading && <p className="text-sm text-muted-foreground">스프린트를 불러오는 중입니다...</p>}
      {error && <p className="text-sm text-destructive">스프린트 정보를 불러오는 중 오류가 발생했습니다.</p>}

      <div className="grid gap-4">
        {sprints.map((sprint) => (
          <Card key={sprint.id}>
            <CardHeader>
              <CardTitle className="text-base">{sprint.name}</CardTitle>
              <CardDescription>{sprint.goal}</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-2 text-sm text-muted-foreground md:grid-cols-2">
              <span>상태: {sprint.status}</span>
              <span>기간: {sprint.startDate || '-'} ~ {sprint.endDate || '-'}</span>
              <span>용량: {sprint.capacity}</span>
              <span>커밋: {sprint.commitment}</span>
              <span>완료: {sprint.completed}</span>
            </CardContent>
          </Card>
        ))}

        {!isLoading && sprints.length === 0 && (
          <Card className="border-dashed">
            <CardContent className="py-8 text-center text-muted-foreground">
              등록된 스프린트가 없습니다. 새 스프린트를 생성해보세요.
            </CardContent>
          </Card>
        )}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>새 스프린트 생성</DialogTitle>
            <DialogDescription>스프린트 목표와 기간을 설정하세요.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="sprint-name">스프린트 이름</Label>
              <Input
                id="sprint-name"
                value={form.name}
                onChange={(event) => handleChange('name', event.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sprint-goal">목표</Label>
              <Input
                id="sprint-goal"
                value={form.goal}
                onChange={(event) => handleChange('goal', event.target.value)}
              />
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="sprint-start">시작일</Label>
                <Input
                  id="sprint-start"
                  type="date"
                  value={form.startDate ?? ''}
                  onChange={(event) => handleChange('startDate', event.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sprint-end">종료일</Label>
                <Input
                  id="sprint-end"
                  type="date"
                  value={form.endDate ?? ''}
                  onChange={(event) => handleChange('endDate', event.target.value)}
                />
              </div>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="sprint-capacity">용량</Label>
                <Input
                  id="sprint-capacity"
                  type="number"
                  value={form.capacity ?? 0}
                  onChange={(event) => handleChange('capacity', event.target.value)}
                  min={0}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sprint-commitment">커밋</Label>
                <Input
                  id="sprint-commitment"
                  type="number"
                  value={form.commitment ?? 0}
                  onChange={(event) => handleChange('commitment', event.target.value)}
                  min={0}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sprint-completed">완료</Label>
                <Input
                  id="sprint-completed"
                  type="number"
                  value={form.completed ?? 0}
                  onChange={(event) => handleChange('completed', event.target.value)}
                  min={0}
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                취소
              </Button>
              <Button type="submit">생성</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
