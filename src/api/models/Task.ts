export type TaskPriority = "low" | "medium" | "high";

export type TaskStatus = "backlog" | "in_progress" | "done";

export type TaskRequest = {
  title: string;
  description: string;
  priority: TaskPriority;
  status: TaskStatus;
};
export type TaskResponse = {
  id: string;
  userId: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  position: number;
  createdAt: string;
  updatedAt: string;
};
