import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Calendar, CheckCircle2, Clock, Pause, XCircle, Users, AlertTriangle } from 'lucide-react';
import type { Project, UserRole } from '../api/types';

interface ProjectCardProps {
  project: Project;
  onSelect: () => void;
  userRole: UserRole;
}

export function ProjectCard({ project, onSelect, userRole }: ProjectCardProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR');
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'planning':
        return <Clock className="w-4 h-4" />;
      case 'active':
        return <CheckCircle2 className="w-4 h-4" />;
      case 'on_hold':
        return <Pause className="w-4 h-4" />;
      case 'completed':
        return <XCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'planning':
        return '기획중';
      case 'active':
        return '진행중';
      case 'on_hold':
        return '보류';
      case 'completed':
        return '완료';
      default:
        return '알 수 없음';
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'planning':
        return 'outline';
      case 'active':
        return 'default';
      case 'on_hold':
        return 'secondary';
      case 'completed':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const getPriorityBadgeVariant = (priority: string) => {
    switch (priority) {
      case 'low':
        return 'outline';
      case 'medium':
        return 'secondary';
      case 'high':
        return 'default';
      case 'critical':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'low':
        return '낮음';
      case 'medium':
        return '보통';
      case 'high':
        return '높음';
      case 'critical':
        return '긴급';
      default:
        return '알 수 없음';
    }
  };

  const isDeadlineNear = () => {
    if (!project.deadline) return false;
    const deadline = new Date(project.deadline);
    const now = new Date();
    const daysLeft = Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return daysLeft <= 7 && daysLeft > 0;
  };

  const isOverdue = () => {
    if (!project.deadline) return false;
    const deadline = new Date(project.deadline);
    const now = new Date();
    return deadline < now;
  };

  return (
    <Card 
      className="cursor-pointer hover:shadow-lg transition-all duration-300 glass-card hover:scale-105"
      onClick={onSelect}
    >
      <CardHeader>
        <div className="flex items-start justify-between mb-2">
          <CardTitle className="line-clamp-1 text-base">{project.name}</CardTitle>
          <div className="flex items-center gap-1">
            {(isOverdue() || isDeadlineNear()) && (
              <AlertTriangle className="w-4 h-4 text-destructive" />
            )}
            <Badge variant="secondary">{project.taskCount}개</Badge>
          </div>
        </div>
        
        <div className="flex items-center gap-2 mb-2">
          <Badge variant={getStatusBadgeVariant(project.status)}>
            {getStatusLabel(project.status)}
          </Badge>
          <Badge variant={getPriorityBadgeVariant(project.priority)}>
            {getPriorityLabel(project.priority)}
          </Badge>
          <Badge variant="outline">{project.department}</Badge>
        </div>
        
        <CardDescription className="line-clamp-2 text-sm">
          {project.description}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              <span>시작: {formatDate(project.createdAt)}</span>
            </div>
            {project.deadline && (
              <div className={`flex items-center gap-1 ${isOverdue() ? 'text-destructive' : isDeadlineNear() ? 'text-orange-500' : ''}`}>
                <Calendar className="w-3 h-3" />
                <span>마감: {formatDate(project.deadline)}</span>
              </div>
            )}
          </div>
          
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <Users className="w-3 h-3" />
              <span>팀원: {project.teamMembers.length}명</span>
            </div>
            <div className="flex items-center gap-1">
              {getStatusIcon(project.status)}
              <span>{getStatusLabel(project.status)}</span>
            </div>
          </div>
          
          {/* 역할별 추가 정보 표시 */}
          {userRole === 'system_admin' && (
            <div className="text-xs text-muted-foreground">
              <span>관리자 전체 접근</span>
            </div>
          )}
          
          {userRole === 'project_manager' && (
            <div className="text-xs text-muted-foreground">
              <span>프로젝트 관리 권한</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
