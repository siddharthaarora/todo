export interface Task {
  _id: string;
  title: string;
  description: string;
  completed: boolean;
  category: string;
  dueDate?: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export type SortOption = 'dueDate' | 'category' | 'createdAt';
export type FilterOption = 'all' | 'active' | 'completed'; 