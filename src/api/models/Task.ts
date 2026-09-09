export const TASK_PRIORITIES = ["low", "medium", "high"] as const;

export const TASK_STATUSES = ["backlog", "in_progress", "done"] as const;

export type TaskPriority = (typeof TASK_PRIORITIES)[number];

export type TaskStatus = (typeof TASK_STATUSES)[number];

export type TaskRequest = {
  title: string;
  description?: string;
  priority?: TaskPriority;
  status?: TaskStatus;
};

export type TaskResponse = {
  id: string;
  userId: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  position: number;
  createdAt: string;
  updatedAt: string;
};
