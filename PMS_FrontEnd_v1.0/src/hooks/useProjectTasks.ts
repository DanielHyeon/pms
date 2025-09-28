import { useCallback, useEffect, useState } from 'react';
import { createTask, deleteTask, fetchTasks, updateTask } from '../api';
import type { Task, TaskCreatePayload, TaskUpdatePayload } from '../api/types';
import { useAuth } from '../context/AuthContext';

interface UseProjectTasksResult {
  tasks: Task[];
  isLoading: boolean;
  error: string | null;
  refresh: () => void;
  createTask: (payload: TaskCreatePayload) => Promise<Task | null>;
  updateTask: (taskId: string, payload: TaskUpdatePayload) => Promise<Task | null>;
  deleteTask: (taskId: string) => Promise<boolean>;
}

export function useProjectTasks(projectId: string): UseProjectTasksResult {
  const { token } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadTasks = useCallback(() => {
    if (!token) {
      setTasks([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    fetchTasks(projectId, token)
      .then((data) => setTasks(data))
      .catch((err) => {
        console.error('Failed to fetch tasks', err);
        setError('태스크 정보를 불러오는 중 문제가 발생했습니다.');
        setTasks([]);
      })
      .finally(() => setIsLoading(false));
  }, [projectId, token]);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  const handleCreate = useCallback(
    async (payload: TaskCreatePayload) => {
      if (!token) {
        return null;
      }
      try {
        const newTask = await createTask(projectId, payload, token);
        setTasks((prev) => [...prev, newTask]);
        return newTask;
      } catch (err) {
        console.error('Failed to create task', err);
        setError('태스크 생성 중 문제가 발생했습니다.');
        return null;
      }
    },
    [projectId, token],
  );

  const handleUpdate = useCallback(
    async (taskId: string, payload: TaskUpdatePayload) => {
      if (!token) {
        return null;
      }
      try {
        const updated = await updateTask(projectId, taskId, payload, token);
        setTasks((prev) => prev.map((task) => (task.id === taskId ? updated : task)));
        return updated;
      } catch (err) {
        console.error('Failed to update task', err);
        setError('태스크 업데이트 중 문제가 발생했습니다.');
        return null;
      }
    },
    [projectId, token],
  );

  const handleDelete = useCallback(
    async (taskId: string) => {
      if (!token) {
        return false;
      }
      try {
        await deleteTask(projectId, taskId, token);
        setTasks((prev) => prev.filter((task) => task.id !== taskId && task.parentTaskId !== taskId));
        return true;
      } catch (err) {
        console.error('Failed to delete task', err);
        setError('태스크 삭제 중 문제가 발생했습니다.');
        return false;
      }
    },
    [projectId, token],
  );

  return {
    tasks,
    isLoading,
    error,
    refresh: loadTasks,
    createTask: handleCreate,
    updateTask: handleUpdate,
    deleteTask: handleDelete,
  };
}
