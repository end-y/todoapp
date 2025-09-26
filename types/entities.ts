import { tasks, lists } from '@/db/schema';

// Database entity types - Drizzle ORM'den infer edilmiş
export type Task = typeof tasks.$inferSelect;
export type List = typeof lists.$inferSelect;

// Task ile ilgili yardımcı types
export type TaskInsert = typeof tasks.$inferInsert;
export type ListInsert = typeof lists.$inferInsert;

// Task durumu için enum-like type
export type TaskStatus = TaskStatuses;

// Priority levels
export type TaskPriority = TaskPriorities;

export enum TaskPriorities {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent',
}

export enum TaskStatuses {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
}

export const DefaultListId = 9999999999;
