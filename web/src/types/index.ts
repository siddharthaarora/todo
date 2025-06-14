export interface Task {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  dueDate?: Date;
  priority: 'low' | 'medium' | 'high';
  category?: string;
  attachments?: Attachment[];
  reminders?: Reminder[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Attachment {
  id: string;
  name: string;
  url: string;
  type: string;
  size: number;
}

export interface Reminder {
  id: string;
  date: Date;
  type: 'email' | 'notification';
  message: string;
}

export interface Category {
  id: string;
  name: string;
  color: string;
}

export type SortOption = 'priority' | 'dueDate' | 'category' | 'createdAt';
export type FilterOption = 'all' | 'active' | 'completed'; 