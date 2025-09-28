import React, { useState } from 'react';
import { Button } from './ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import {
  ArrowLeft,
  LogOut,
  Sparkles,
  Settings,
  Kanban,
  FileText,
  BarChart3,
  Target,
  Package,
  TrendingUp,
  AlertTriangle,
  Code2,
  MessageCircle,
} from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';
import { KanbanBoard } from './KanbanBoard';
import { RequirementsPage } from './RequirementsPage';
import { SprintManagementPage } from './SprintManagementPage';
import { ProductBacklogPage } from './ProductBacklogPage';
import { ScrumMetricsPage } from './ScrumMetricsPage';
import { RiskDashboardPage } from './RiskDashboardPage';
import { QualityDashboardPage } from './QualityDashboardPage';
import { NotificationCenter } from './NotificationCenter';
import { ChatWidget } from './ChatWidget';
import { AIReportModal } from './AIReportModal';
import type { User, Project } from '../api/types';

interface ProjectDetailPageProps {
  user: User;
  project: Project;
  onBack: () => void;
  onLogout: () => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
}

export function ProjectDetailPage({ user, project, onBack, onLogout, isDarkMode, onToggleDarkMode }: ProjectDetailPageProps) {
  const [isAIReportModalOpen, setIsAIReportModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('kanban');
  const [isChatOpen, setIsChatOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" onClick={onBack}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                대시보드로
              </Button>
              <div>
                <h1 className="text-xl font-medium">{project.name}</h1>
                <p className="text-sm text-muted-foreground">{project.description}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <NotificationCenter projectId={project.id} />
              <ThemeToggle isDarkMode={isDarkMode} onToggle={onToggleDarkMode} variant="compact" />
              <Button
                onClick={() => setIsAIReportModalOpen(true)}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                AI 보고서 생성
              </Button>
              <Button variant="outline" size="sm">
                <Settings className="w-4 h-4 mr-2" />
                설정
              </Button>
              <Button variant="outline" size="sm" onClick={onLogout}>
                <LogOut className="w-4 h-4 mr-2" />
                로그아웃
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full max-w-5xl grid-cols-7">
            <TabsTrigger value="kanban" className="flex items-center gap-2">
              <Kanban className="w-4 h-4" />
              칸반 보드
            </TabsTrigger>
            <TabsTrigger value="sprint" className="flex items-center gap-2">
              <Target className="w-4 h-4" />
              스프린트
            </TabsTrigger>
            <TabsTrigger value="backlog" className="flex items-center gap-2">
              <Package className="w-4 h-4" />
              백로그
            </TabsTrigger>
            <TabsTrigger value="metrics" className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              메트릭스
            </TabsTrigger>
            <TabsTrigger value="risk" className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              리스크 분석
            </TabsTrigger>
            <TabsTrigger value="quality" className="flex items-center gap-2">
              <Code2 className="w-4 h-4" />
              품질 분석
            </TabsTrigger>
            <TabsTrigger value="requirements" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              요구사항
            </TabsTrigger>
          </TabsList>

          <TabsContent value="kanban" className="mt-6">
            <KanbanBoard projectId={project.id} />
          </TabsContent>

          <TabsContent value="sprint" className="mt-6">
            <SprintManagementPage projectId={project.id} />
          </TabsContent>

          <TabsContent value="backlog" className="mt-6">
            <ProductBacklogPage projectId={project.id} />
          </TabsContent>

          <TabsContent value="metrics" className="mt-6">
            <ScrumMetricsPage projectId={project.id} user={user} />
          </TabsContent>

          <TabsContent value="risk" className="mt-6">
            <RiskDashboardPage projectId={project.id} />
          </TabsContent>

          <TabsContent value="quality" className="mt-6">
            <QualityDashboardPage projectId={project.id} />
          </TabsContent>

          <TabsContent value="requirements" className="mt-6">
            <RequirementsPage projectId={project.id} />
          </TabsContent>
        </Tabs>
      </main>

      <AIReportModal
        isOpen={isAIReportModalOpen}
        onClose={() => setIsAIReportModalOpen(false)}
        projectId={project.id}
      />

      <ChatWidget isOpen={isChatOpen} onToggle={() => setIsChatOpen(!isChatOpen)} projectId={project.id} />
    </div>
  );
}
