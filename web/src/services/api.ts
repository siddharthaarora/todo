import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_URL,
});

// Add request interceptor to include auth token
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

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

export interface User {
  id: string;
  email: string;
  name: string;
  displayName?: string;
  picture?: string;
  bio?: string;
  timezone?: string;
  language?: string;
  preferences?: {
    theme: 'light' | 'dark' | 'auto';
    notifications: {
      email: boolean;
      push: boolean;
      taskReminders: boolean;
    };
    defaultCategories: string[];
    reminderFrequency: 'daily' | 'weekly' | 'monthly';
  };
  isNewUser: boolean;
}

export interface ProfileSetupData {
  displayName: string;
  bio: string;
  timezone: string;
  language: string;
  preferences: {
    theme: 'light' | 'dark' | 'auto';
    notifications: {
      email: boolean;
      push: boolean;
      taskReminders: boolean;
    };
    defaultCategories: string[];
    reminderFrequency: 'daily' | 'weekly' | 'monthly';
  };
}

const api = {
  // Google authentication
  googleAuth: async (credential: string, isSignUp: boolean = false) => {
    const response = await apiClient.post('/auth/google', { credential, isSignUp });
    return response.data;
  },

  // Setup user profile
  setupProfile: async (profileData: ProfileSetupData) => {
    const response = await apiClient.post('/auth/setup-profile', profileData);
    return response.data;
  },

  // Get all tasks
  getTasks: async () => {
    const response = await apiClient.get('/tasks');
    return response.data;
  },

  // Create a new task
  createTask: async (task: CreateTaskInput) => {
    const response = await apiClient.post('/tasks', task);
    return response.data;
  },

  // Update a task
  updateTask: async (taskId: string, updates: UpdateTaskInput) => {
    const response = await apiClient.put(`/tasks/${taskId}`, updates);
    return response.data;
  },

  // Delete a task
  deleteTask: async (taskId: string) => {
    await apiClient.delete(`/tasks/${taskId}`);
  },

  // Toggle task completion
  toggleTaskCompletion: async (taskId: string) => {
    const response = await apiClient.patch(`/tasks/${taskId}/toggle`);
    return response.data;
  },

  // Get current user profile
  getCurrentUser: async () => {
    const response = await apiClient.get('/auth/me');
    return response.data;
  },
};

export default api; 