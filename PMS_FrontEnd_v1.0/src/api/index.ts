import { apiFetch } from './client';
import {
  AuthToken,
  BacklogItem,
  BacklogItemCreatePayload,
  ExecutiveSnapshot,
  FileQuality,
  LoginResponse,
  Project,
  QualityMetrics,
  QualityOverview,
  QualityTrendPoint,
  Requirement,
  RequirementCreatePayload,
  RequirementUpdatePayload,
  RiskOverview,
  Sprint,
  SprintCreatePayload,
  Task,
  TaskCreatePayload,
  TaskUpdatePayload,
  User,
  Notification,
} from './types';

interface ProjectListResponse {
  items: Project[];
}

export async function login(email: string, password: string): Promise<LoginResponse> {
  return apiFetch<LoginResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

export async function fetchCurrentUser(token: string): Promise<User> {
  return apiFetch<User>('/auth/me', { token });
}

export async function fetchProjects(token: string): Promise<Project[]> {
  const response = await apiFetch<ProjectListResponse>('/projects/', { token });
  return response.items;
}

export async function fetchProject(projectId: string, token: string): Promise<Project> {
  return apiFetch<Project>(`/projects/${encodeURIComponent(projectId)}`, { token });
}

export async function fetchTasks(projectId: string, token: string): Promise<Task[]> {
  return apiFetch<Task[]>(`/projects/${encodeURIComponent(projectId)}/tasks`, { token });
}

export async function createTask(
  projectId: string,
  payload: TaskCreatePayload,
  token: string,
): Promise<Task> {
  return apiFetch<Task>(`/projects/${encodeURIComponent(projectId)}/tasks`, {
    method: 'POST',
    body: JSON.stringify(payload),
    token,
  });
}

export async function updateTask(
  projectId: string,
  taskId: string,
  payload: TaskUpdatePayload,
  token: string,
): Promise<Task> {
  return apiFetch<Task>(`/projects/${encodeURIComponent(projectId)}/tasks/${encodeURIComponent(taskId)}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
    token,
  });
}

export async function deleteTask(projectId: string, taskId: string, token: string): Promise<void> {
  await apiFetch(`/projects/${encodeURIComponent(projectId)}/tasks/${encodeURIComponent(taskId)}`, {
    method: 'DELETE',
    token,
    parseJson: false,
  });
}

export async function fetchRequirements(projectId: string, token: string): Promise<Requirement[]> {
  return apiFetch<Requirement[]>(`/projects/${encodeURIComponent(projectId)}/requirements`, { token });
}

export async function createRequirement(
  projectId: string,
  payload: RequirementCreatePayload,
  token: string,
): Promise<Requirement> {
  return apiFetch<Requirement>(`/projects/${encodeURIComponent(projectId)}/requirements`, {
    method: 'POST',
    body: JSON.stringify(payload),
    token,
  });
}

export async function updateRequirement(
  projectId: string,
  requirementId: string,
  payload: RequirementUpdatePayload,
  token: string,
): Promise<Requirement> {
  return apiFetch<Requirement>(
    `/projects/${encodeURIComponent(projectId)}/requirements/${encodeURIComponent(requirementId)}`,
    {
      method: 'PUT',
      body: JSON.stringify(payload),
      token,
    },
  );
}

export async function fetchSprints(projectId: string, token: string): Promise<Sprint[]> {
  return apiFetch<Sprint[]>(`/projects/${encodeURIComponent(projectId)}/sprints`, { token });
}

export async function createSprint(
  projectId: string,
  payload: SprintCreatePayload,
  token: string,
): Promise<Sprint> {
  return apiFetch<Sprint>(`/projects/${encodeURIComponent(projectId)}/sprints`, {
    method: 'POST',
    body: JSON.stringify(payload),
    token,
  });
}

export async function fetchBacklogItems(projectId: string, token: string): Promise<BacklogItem[]> {
  return apiFetch<BacklogItem[]>(`/projects/${encodeURIComponent(projectId)}/backlog-items`, { token });
}

export async function createBacklogItem(
  projectId: string,
  payload: BacklogItemCreatePayload,
  token: string,
): Promise<BacklogItem> {
  return apiFetch<BacklogItem>(`/projects/${encodeURIComponent(projectId)}/backlog-items`, {
    method: 'POST',
    body: JSON.stringify(payload),
    token,
  });
}

export async function fetchRiskOverview(projectId: string, token: string): Promise<RiskOverview> {
  return apiFetch<RiskOverview>(`/projects/${encodeURIComponent(projectId)}/risk`, { token });
}

export async function refreshRiskOverview(projectId: string, token: string): Promise<RiskOverview> {
  return apiFetch<RiskOverview>(`/projects/${encodeURIComponent(projectId)}/risk/refresh`, {
    method: 'POST',
    token,
  });
}

export async function fetchQualityOverview(projectId: string, token: string): Promise<QualityOverview> {
  return apiFetch<QualityOverview>(`/projects/${encodeURIComponent(projectId)}/quality`, { token });
}

export async function fetchExecutiveSnapshot(token: string): Promise<ExecutiveSnapshot> {
  return apiFetch<ExecutiveSnapshot>('/executive/', { token });
}

export async function fetchFileContent(url: string, token: string): Promise<string> {
  return apiFetch<string>(url, { token });
}

export async function fetchNotifications(projectId: string, token: string): Promise<Notification[]> {
  return apiFetch<Notification[]>(`/projects/${encodeURIComponent(projectId)}/notifications`, { token });
}

export async function markNotificationRead(projectId: string, notificationId: string, token: string): Promise<Notification> {
  return apiFetch<Notification>(`/projects/${encodeURIComponent(projectId)}/notifications/${encodeURIComponent(notificationId)}/read`, {
    method: 'POST',
    token,
  });
}

export type {
  AuthToken,
  BacklogItem,
  BacklogItemCreatePayload,
  ExecutiveSnapshot,
  FileQuality,
  Notification,
  QualityMetrics,
  QualityOverview,
  QualityTrendPoint,
  Requirement,
  RequirementCreatePayload,
  RequirementUpdatePayload,
  RiskOverview,
  Sprint,
  SprintCreatePayload,
  Task,
  User,
};
