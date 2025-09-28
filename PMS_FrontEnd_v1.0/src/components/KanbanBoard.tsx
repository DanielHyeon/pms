import React, { useCallback, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Plus } from 'lucide-react';
import { KanbanColumn } from './KanbanColumn';
import { CreateTaskModal } from './CreateTaskModal';
import { TaskDetailModal } from './TaskDetailModal';
import type { Task, TaskCreatePayload, TaskUpdatePayload } from '../api/types';
import { useProjectTasks } from '../hooks/useProjectTasks';
import { useProjectRequirements } from '../hooks/useProjectRequirements';

interface KanbanBoardProps {
  projectId: string;
}

const columns = [
  { id: 'todo', title: 'To Do', status: 'todo' as Task['status'] },
  { id: 'in-progress', title: 'In Progress', status: 'in-progress' as Task['status'] },
  { id: 'done', title: 'Done', status: 'done' as Task['status'] },
];

export function KanbanBoard({ projectId }: KanbanBoardProps) {
  const { tasks, isLoading, error, createTask, updateTask, deleteTask } = useProjectTasks(projectId);
  const { requirements } = useProjectRequirements(projectId);
  const [isCreateTaskModalOpen, setIsCreateTaskModalOpen] = useState(false);
  const [subtaskModalData, setSubtaskModalData] = useState<{
    parentTaskId: string;
    parentTaskTitle: string;
  } | null>(null);
  const [activeTask, setActiveTask] = useState<Task | null>(null);

  const tasksByStatus = useMemo(() => {
    const base: Record<string, Task[]> = {
      todo: [],
      'in-progress': [],
      done: [],
    };

    tasks.forEach((task) => {
      const list = base[task.status] ?? base.todo;
      list.push(task);
    });

    return base;
  }, [tasks]);

  const topLevelTasks = useMemo(() => tasks.filter((task) => !task.parentTaskId), [tasks]);

  const handleTaskStatusChange = useCallback(
    (taskId: string, newStatus: Task['status']) => {
      const task = tasks.find((item) => item.id === taskId);
      if (!task || task.status === newStatus) {
        return;
      }
      const payload: TaskUpdatePayload = { status: newStatus };
      void updateTask(taskId, payload);
    },
    [tasks, updateTask],
  );

  const handleCreateTask = useCallback(
    async (payload: TaskCreatePayload) => {
      await createTask(payload);
    },
    [createTask],
  );

  const handleUpdateTask = useCallback(
    async (taskId: string, payload: TaskUpdatePayload) => {
      const updated = await updateTask(taskId, payload);
      if (updated) {
        setActiveTask(updated);
      }
    },
    [updateTask],
  );

  const handleDeleteTask = useCallback(
    async (taskId: string) => {
      await deleteTask(taskId);
    },
    [deleteTask],
  );

  const openCreateModal = () => setIsCreateTaskModalOpen(true);
  const closeCreateModal = () => setIsCreateTaskModalOpen(false);

  const openSubtaskModal = (parentTaskId: string) => {
    const parentTask = tasks.find((task) => task.id === parentTaskId);
    if (parentTask) {
      setSubtaskModalData({ parentTaskId, parentTaskTitle: parentTask.title });
    }
  };

  const closeSubtaskModal = () => setSubtaskModalData(null);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-medium">프로젝트 보드</h2>
          <p className="text-muted-foreground">팀의 작업을 관리하고 진행 상황을 추적하세요.</p>
        </div>
        <Button onClick={openCreateModal} disabled={isLoading}>
          <Plus className="w-4 h-4 mr-2" />
          새 태스크
        </Button>
      </div>

      {isLoading && (
        <Card className="border-dashed">
          <CardHeader>
            <CardTitle>로딩 중...</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">태스크 데이터를 불러오는 중입니다.</p>
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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {columns.map((column) => (
          <KanbanColumn
            key={column.id}
            title={column.title}
            status={column.status}
            tasks={tasksByStatus[column.status] || []}
            onTaskStatusChange={handleTaskStatusChange}
            onDeleteTask={handleDeleteTask}
            onCreateSubtask={openSubtaskModal}
            onEditTask={setActiveTask}
            allTasks={tasks}
          />
        ))}
      </div>

      <CreateTaskModal
        isOpen={isCreateTaskModalOpen}
        onClose={closeCreateModal}
        onSubmit={async (task) => {
          await handleCreateTask(task);
          closeCreateModal();
        }}
        requirements={requirements}
      />

      {subtaskModalData && (
        <CreateTaskModal
          isOpen={true}
          onClose={closeSubtaskModal}
          onSubmit={async (task) => {
            await handleCreateTask({ ...task, parentTaskId: subtaskModalData.parentTaskId });
            closeSubtaskModal();
          }}
          parentTaskTitle={subtaskModalData.parentTaskTitle}
          requirements={requirements}
        />
      )}

      <TaskDetailModal
        isOpen={!!activeTask}
        onClose={() => setActiveTask(null)}
        task={activeTask}
        onSave={(updates) => {
          if (!activeTask) return;
          void handleUpdateTask(activeTask.id, updates);
        }}
        onDelete={() => {
          if (!activeTask) return;
          void handleDeleteTask(activeTask.id);
          setActiveTask(null);
        }}
      />
    </div>
  );
}
