import type { TaskRequest, TaskPriority, TaskStatus } from "../api/models/Task";

type CreateTaskRequestOptions = {
  title?: string;
  description?: string;
  priority?: TaskPriority;
  status?: TaskStatus;
};

type CreateInvalidTaskRequestOptions = CreateTaskRequestOptions & {
  missingFields?: (keyof TaskRequest)[];
};

export function createTask(
  options: CreateTaskRequestOptions = {},
): TaskRequest {
  const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

  return {
    title: options.title ?? `taskTitle_${id}`,
    description: options.description ?? `taskDescription_${id}`,
    priority: options.priority ?? "low",
    status: options.status ?? "done",
  };
}

export function createInvalidTask(
  options: CreateInvalidTaskRequestOptions = {},
): Partial<TaskRequest> {
  const user: Partial<TaskRequest> = createTask(options);

  for (const field of options.missingFields ?? []) {
    delete user[field];
  }

  return user;
}
