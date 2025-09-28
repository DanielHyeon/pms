export type UserRole = 'system_admin' | 'project_manager' | 'part_leader' | 'user';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  department?: string | null;
  projects?: string[] | null;
  is_active?: boolean;
}

export interface AuthToken {
  accessToken: string;
  tokenType: string;
  expiresIn: number;
}

export interface LoginResponse {
  token: AuthToken;
  user: User;
}

type ProjectStatus = 'planning' | 'active' | 'on_hold' | 'completed';
type ProjectPriority = 'low' | 'medium' | 'high' | 'critical';

export interface ProjectBudget {
  planned: number;
  actual: number;
  currency: string;
}

export interface ProjectKpis {
  onTimeDelivery: number;
  budgetAdherence: number;
  qualityScore: number;
  teamSatisfaction: number;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  ownerId: string;
  managerId: string;
  teamMembers: string[];
  department: string;
  status: ProjectStatus;
  priority: ProjectPriority;
  createdAt: string;
  deadline?: string;
  taskCount: number;
  budget?: ProjectBudget;
  kpis?: ProjectKpis;
}

export type TaskStatus = 'todo' | 'in-progress' | 'done';
export type TaskPriority = 'low' | 'medium' | 'high' | 'critical';

export interface Task {
  id: string;
  projectId: string;
  title: string;
  description: string;
  status: TaskStatus;
  assignee?: string | null;
  priority: TaskPriority;
  createdAt: string;
  requirementId?: string | null;
  parentTaskId?: string | null;
}

export interface TaskCreatePayload {
  title: string;
  description?: string;
  status?: TaskStatus;
  assignee?: string | null;
  priority?: TaskPriority;
  requirementId?: string | null;
  parentTaskId?: string | null;
  createdAt?: string;
}

export interface TaskUpdatePayload {
  title?: string;
  description?: string;
  status?: TaskStatus;
  assignee?: string | null;
  priority?: TaskPriority;
  requirementId?: string | null;
  parentTaskId?: string | null;
}

export interface Requirement {
  id: string;
  reqIdString: string;
  trackingNumber?: string | null;
  title: string;
  description: string;
  status: string;
  projectId: string;
  createdAt: string;
  updatedAt: string;
}

export interface RequirementCreatePayload {
  title: string;
  description: string;
  status?: string;
  trackingNumber?: string | null;
}

export interface RequirementUpdatePayload {
  title?: string;
  description?: string;
  status?: string;
  trackingNumber?: string | null;
}

export interface Sprint {
  id: string;
  projectId: string;
  name: string;
  goal: string;
  status: string;
  startDate: string;
  endDate: string;
  capacity: number;
  commitment: number;
  completed: number;
  createdAt: string;
}

export interface SprintCreatePayload {
  name: string;
  goal: string;
  status?: string;
  startDate?: string | null;
  endDate?: string | null;
  capacity?: number;
  commitment?: number;
  completed?: number;
}

export interface BacklogItem {
  id: string;
  projectId: string;
  title: string;
  description: string;
  storyPoints: number;
  priority: string;
  status: string;
  assignee?: string | null;
  requirementId?: string | null;
  sprintId?: string | null;
  type: string;
  acceptance_criteria: string[];
  createdAt: string;
}

export interface Notification {
  id: string;
  type: string;
  category: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  actionable: boolean;
  priority: string;
  data?: Record<string, unknown> | null;
}

export interface BacklogItemCreatePayload {
  title: string;
  description: string;
  storyPoints?: number;
  priority?: string;
  status?: string;
  assignee?: string | null;
  requirementId?: string | null;
  sprintId?: string | null;
  type?: string;
  acceptance_criteria?: string[];
  createdAt?: string;
}

export interface RiskSnapshot {
  predictedCompletionDate: string;
  delayDays: number;
  overallRiskScore: number;
  completionProbability: number;
  totalTasks: number;
  completedTasks: number;
  highRiskTasks: number;
  teamUtilization: number;
}

export interface RiskInsight {
  id: string;
  type: string;
  title: string;
  description: string;
  impact: string;
  actionable: boolean;
}

export interface RiskOverview {
  snapshot: RiskSnapshot;
  insights: RiskInsight[];
}

export interface QualityMetrics {
  codeComplexity: number;
  testCoverage: number;
  bugDensity: number;
  duplicateCodeRate: number;
  codeSmells: number;
  technicalDebt: number;
  performanceScore: number;
  securityScore: number;
  maintainabilityIndex: number;
}

export interface QualityTrendPoint {
  date: string;
  complexity: number;
  coverage: number;
  bugs: number;
  performance: number;
}

export interface FileQuality {
  file: string;
  complexity: number;
  coverage: number;
  issues: number;
  size: number;
  risk: string;
}

export interface CodeAnalysisSummary {
  totalLines: number;
  productionLines: number;
  testLines: number;
  commentLines: number;
  filesAnalyzed: number;
  lastAnalysis: string;
}

export interface QualityOverview {
  metrics: QualityMetrics;
  trend: QualityTrendPoint[];
  files: FileQuality[];
  analysis: CodeAnalysisSummary;
}

export interface ExecutiveKpi {
  id: string;
  name: string;
  description: string;
  value: number;
  target: number;
  status: 'good' | 'warning' | 'critical';
}

export interface ExecutivePortfolioHealth {
  id: string;
  name: string;
  health: 'green' | 'yellow' | 'red';
  progress: number;
  budgetStatus: 'under' | 'on-track' | 'over';
}

export interface ExecutiveSnapshot {
  summary: {
    activeProjects: number;
    upcomingMilestones: number;
    overallHealth: 'healthy' | 'at-risk' | 'critical';
    budgetUtilization: number;
  };
  financials: {
    plannedBudget: number;
    actualSpend: number;
    forecastedSpend: number;
    variance: number;
  };
  kpis: ExecutiveKpi[];
  portfolioHealth: ExecutivePortfolioHealth[];
}
