import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import type { Requirement } from '../api/types';

type RequirementStatus = 'defined' | 'in-progress' | 'done';

interface RequirementFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (requirementData: { title: string; description: string; trackingNumber?: string; status: RequirementStatus }) => void;
  requirement?: Requirement;
  mode?: 'create' | 'edit';
}

export function RequirementForm({ 
  isOpen, 
  onClose, 
  onSubmit, 
  requirement,
  mode = 'create'
}: RequirementFormProps) {
  const [formData, setFormData] = useState({
    title: requirement?.title || '',
    description: requirement?.description || '',
    trackingNumber: requirement?.trackingNumber || '',
    status: (requirement?.status as RequirementStatus) || 'defined'
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = '제목을 입력해주세요.';
    }

    if (!formData.description.trim()) {
      newErrors.description = '설명을 입력해주세요.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    onSubmit(formData);
    
    // Reset form
    setFormData({
      title: '',
      description: '',
      trackingNumber: '',
      status: 'defined'
    });
    setErrors({});
  };

  const handleClose = () => {
    setFormData({
      title: requirement?.title || '',
      description: requirement?.description || '',
      trackingNumber: requirement?.trackingNumber || '',
      status: (requirement?.status as RequirementStatus) || 'defined'
    });
    setErrors({});
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {mode === 'create' ? '새 요구사항 추가' : '요구사항 수정'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'create' 
              ? '고객의 요구사항을 명확하게 정의해주세요.'
              : '요구사항 정보를 수정해주세요.'
            }
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">제목</Label>
            <Input
              id="title"
              placeholder="예: 사용자는 이메일로 로그인할 수 있어야 한다"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              className={errors.title ? 'border-red-500' : ''}
            />
            {errors.title && (
              <p className="text-sm text-red-600">{errors.title}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="trackingNumber">추적 번호 (선택사항)</Label>
            <Input
              id="trackingNumber"
              placeholder="예: CUST-2024-001, BIZ-REQ-001"
              value={formData.trackingNumber}
              onChange={(e) => handleInputChange('trackingNumber', e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              고객이나 비즈니스에서 제공한 참조 번호를 입력하세요.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">상세 설명</Label>
            <Textarea
              id="description"
              placeholder="요구사항의 구체적인 내용과 기대사항을 설명해주세요..."
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              className={`min-h-[100px] ${errors.description ? 'border-red-500' : ''}`}
            />
            {errors.description && (
              <p className="text-sm text-red-600">{errors.description}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">상태</Label>
            <Select
              value={formData.status}
              onValueChange={(value: Requirement['status']) => handleInputChange('status', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="상태를 선택하세요" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="defined">정의됨</SelectItem>
                <SelectItem value="in-progress">진행 중</SelectItem>
                <SelectItem value="done">완료</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={handleClose}>
              취소
            </Button>
            <Button type="submit">
              {mode === 'create' ? '생성' : '수정'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
