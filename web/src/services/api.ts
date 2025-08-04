import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

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

export interface CreateTaskInput {
  title: string;
  description: string;
  category: string;
  dueDate?: string;
}

export interface UpdateTaskInput {
  title?: string;
  description?: string;
  category?: string;
  dueDate?: string;
  completed?: boolean;
}

const api = {
  // Get all tasks
  getTasks: async (userId: string) => {
    const response = await axios.get(`${API_URL}/tasks?userId=${userId}`);
    return response.data;
  },

  // Create a new task
  createTask: async (task: CreateTaskInput, userId: string) => {
    const response = await axios.post(`${API_URL}/tasks`, { ...task, userId });
    return response.data;
  },

  // Update a task
  updateTask: async (taskId: string, updates: UpdateTaskInput, userId: string) => {
    const response = await axios.put(`${API_URL}/tasks/${taskId}`, { ...updates, userId });
    return response.data;
  },

  // Delete a task
  deleteTask: async (taskId: string, userId: string) => {
    await axios.delete(`${API_URL}/tasks/${taskId}?userId=${userId}`);
  },

  // Toggle task completion
  toggleTaskCompletion: async (taskId: string, userId: string) => {
    const response = await axios.patch(`${API_URL}/tasks/${taskId}/toggle?userId=${userId}`);
    return response.data;
  },
};

export default api; 