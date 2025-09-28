import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Plus, RefreshCcw } from 'lucide-react';
import { RequirementForm } from './RequirementForm';
import { useProjectRequirements } from '../hooks/useProjectRequirements';
import type { Requirement } from '../api/types';

interface RequirementsPageProps {
  projectId: string;
}

type RequirementStatus = 'defined' | 'in-progress' | 'done';

const statusLabels: Record<RequirementStatus, string> = {
  defined: '정의됨',
  'in-progress': '진행 중',
  done: '완료',
};

const statusBadgeClasses: Record<RequirementStatus, string> = {
  defined: 'bg-blue-100 text-blue-800 border-blue-200',
  'in-progress': 'bg-yellow-100 text-yellow-800 border-yellow-200',
  done: 'bg-green-100 text-green-800 border-green-200',
};

export function RequirementsPage({ projectId }: RequirementsPageProps) {
  const { requirements, isLoading, error, refresh, createRequirement, updateRequirement } =
    useProjectRequirements(projectId);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingRequirement, setEditingRequirement] = useState<Requirement | null>(null);

  const handleCreate = async (payload: { title: string; description: string; trackingNumber?: string; status: RequirementStatus }) => {
    await createRequirement({
      title: payload.title,
      description: payload.description,
      trackingNumber: payload.trackingNumber,
      status: payload.status,
    });
    setIsFormOpen(false);
  };

  const handleUpdate = async (
    requirementId: string,
    payload: { title: string; description: string; trackingNumber?: string; status: RequirementStatus },
  ) => {
    await updateRequirement(requirementId, {
      title: payload.title,
      description: payload.description,
      trackingNumber: payload.trackingNumber,
      status: payload.status,
    });
    setEditingRequirement(null);
  };

  const openCreateForm = () => {
    setEditingRequirement(null);
    setIsFormOpen(true);
  };

  const closeForms = () => {
    setEditingRequirement(null);
    setIsFormOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-medium">요구사항 관리</h2>
          <p className="text-muted-foreground">프로젝트에 연결된 요구사항을 확인하고 업데이트하세요.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={refresh} disabled={isLoading}>
            <RefreshCcw className="w-4 h-4 mr-2" /> 새로고침
          </Button>
          <Button onClick={openCreateForm}>
            <Plus className="w-4 h-4 mr-2" /> 요구사항 추가
          </Button>
        </div>
      </div>

      {isLoading && (
        <Card className="border-dashed">
          <CardHeader>
            <CardTitle>불러오는 중...</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">요구사항 목록을 불러오는 중입니다.</p>
          </CardContent>
        </Card>
      )}

      {error && (
        <Card className="border-destructive/60 bg-destructive/10">
          <CardHeader>
            <CardTitle className="text-destructive">오류</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-destructive text-sm">{error}</p>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4">
        {requirements.map((requirement) => {
          const status = (requirement.status as RequirementStatus) || 'defined';
          return (
            <Card key={requirement.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="outline" className="font-mono text-xs">
                        {requirement.reqIdString}
                      </Badge>
                      {requirement.trackingNumber && (
                        <Badge variant="outline" className="font-mono text-xs bg-blue-50 text-blue-700 border-blue-200">
                          {requirement.trackingNumber}
                        </Badge>
                      )}
                      <Badge variant="outline" className={`text-xs ${statusBadgeClasses[status]}`}>
                        {statusLabels[status]}
                      </Badge>
                    </div>
                    <CardTitle className="text-base">{requirement.title}</CardTitle>
                    <CardDescription className="mt-1 line-clamp-3">
                      {requirement.description}
                    </CardDescription>
                  </div>
                  <Button size="sm" variant="outline" onClick={() => setEditingRequirement(requirement)}>
                    수정
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>생성: {new Date(requirement.createdAt).toLocaleDateString('ko-KR')}</span>
                  <span>수정: {new Date(requirement.updatedAt).toLocaleDateString('ko-KR')}</span>
                </div>
              </CardContent>
            </Card>
          );
        })}

        {requirements.length === 0 && !isLoading && !error && (
          <Card className="border-dashed">
            <CardContent className="py-10 text-center text-muted-foreground">
              등록된 요구사항이 없습니다. 새로운 요구사항을 추가해보세요.
            </CardContent>
          </Card>
        )}
      </div>

      <RequirementForm
        isOpen={isFormOpen}
        onClose={closeForms}
        onSubmit={handleCreate}
        mode="create"
      />

      {editingRequirement && (
        <RequirementForm
          isOpen={!!editingRequirement}
          onClose={closeForms}
          requirement={editingRequirement}
          onSubmit={(payload) => handleUpdate(editingRequirement.id, payload)}
          mode="edit"
        />
      )}
    </div>
  );
}
