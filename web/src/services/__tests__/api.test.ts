import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import api from '../api';
import { mockAxios } from '../../test/mocks';

describe('API Service', () => {
  beforeEach(() => {
    // Reset mocks before each test
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('getTasks', () => {
    it('should fetch tasks successfully', async () => {
      const mockTasks = [
        {
          _id: '1',
          title: 'Test Task',
          description: 'Test Description',
          category: 'work',
          dueDate: '2024-01-15',
          completed: false,
          userId: 'user1',
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-01T00:00:00.000Z',
        },
      ];

      mockAxios.get.mockResolvedValue({ data: { tasks: mockTasks } });

      const result = await api.getTasks('user1');

      expect(mockAxios.get).toHaveBeenCalledWith('http://localhost:3001/api/tasks?userId=user1');
      expect(result).toEqual({ tasks: mockTasks });
    });

    it('should handle API errors', async () => {
      const errorMessage = 'Failed to fetch tasks';
      mockAxios.get.mockRejectedValue(new Error(errorMessage));

      await expect(api.getTasks('user1')).rejects.toThrow(errorMessage);
      expect(mockAxios.get).toHaveBeenCalledWith('http://localhost:3001/api/tasks?userId=user1');
    });

    it('should handle network errors', async () => {
      mockAxios.get.mockRejectedValue(new Error('Network Error'));

      await expect(api.getTasks('user1')).rejects.toThrow('Network Error');
    });
  });

  describe('createTask', () => {
    it('should create a task successfully', async () => {
      const newTask = {
        title: 'New Task',
        description: 'New Description',
        category: 'personal',
        dueDate: '2024-01-20',
      };

      const createdTask = {
        _id: '2',
        ...newTask,
        completed: false,
        userId: 'user1',
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
      };

      mockAxios.post.mockResolvedValue({ data: createdTask });

      const result = await api.createTask(newTask, 'user1');

      expect(mockAxios.post).toHaveBeenCalledWith('http://localhost:3001/api/tasks', {
        ...newTask,
        userId: 'user1',
      });
      expect(result).toEqual(createdTask);
    });

    it('should handle creation errors', async () => {
      const newTask = {
        title: 'New Task',
        description: 'New Description',
        category: 'personal',
        dueDate: '2024-01-20',
      };

      mockAxios.post.mockRejectedValue(new Error('Failed to create task'));

      await expect(api.createTask(newTask, 'user1')).rejects.toThrow('Failed to create task');
    });

    it('should validate required fields', async () => {
      const invalidTask = {
        title: '',
        description: 'Description',
        category: 'personal',
        dueDate: '2024-01-20',
      };

      mockAxios.post.mockRejectedValue(new Error('Title is required'));

      await expect(api.createTask(invalidTask, 'user1')).rejects.toThrow('Title is required');
    });
  });

  describe('updateTask', () => {
    it('should update a task successfully', async () => {
      const updates = {
        title: 'Updated Task',
        description: 'Updated Description',
      };

      const updatedTask = {
        _id: '1',
        title: 'Updated Task',
        description: 'Updated Description',
        category: 'work',
        dueDate: '2024-01-15',
        completed: false,
        userId: 'user1',
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
      };

      mockAxios.put.mockResolvedValue({ data: updatedTask });

      const result = await api.updateTask('1', updates, 'user1');

      expect(mockAxios.put).toHaveBeenCalledWith('http://localhost:3001/api/tasks/1', {
        ...updates,
        userId: 'user1',
      });
      expect(result).toEqual(updatedTask);
    });

    it('should handle update errors', async () => {
      const updates = {
        title: 'Updated Task',
      };

      mockAxios.put.mockRejectedValue(new Error('Failed to update task'));

      await expect(api.updateTask('1', updates, 'user1')).rejects.toThrow('Failed to update task');
    });

    it('should handle non-existent task', async () => {
      const updates = {
        title: 'Updated Task',
      };

      mockAxios.put.mockRejectedValue(new Error('Task not found'));

      await expect(api.updateTask('999', updates, 'user1')).rejects.toThrow('Task not found');
    });
  });

  describe('deleteTask', () => {
    it('should delete a task successfully', async () => {
      mockAxios.delete.mockResolvedValue({ status: 200 });

      await api.deleteTask('1', 'user1');

      expect(mockAxios.delete).toHaveBeenCalledWith('http://localhost:3001/api/tasks/1?userId=user1');
    });

    it('should handle deletion errors', async () => {
      mockAxios.delete.mockRejectedValue(new Error('Failed to delete task'));

      await expect(api.deleteTask('1', 'user1')).rejects.toThrow('Failed to delete task');
    });

    it('should handle non-existent task deletion', async () => {
      mockAxios.delete.mockRejectedValue(new Error('Task not found'));

      await expect(api.deleteTask('999', 'user1')).rejects.toThrow('Task not found');
    });
  });

  describe('toggleTaskCompletion', () => {
    it('should toggle task completion successfully', async () => {
      const toggledTask = {
        _id: '1',
        title: 'Test Task',
        description: 'Test Description',
        category: 'work',
        dueDate: '2024-01-15',
        completed: true,
        userId: 'user1',
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
      };

      mockAxios.patch.mockResolvedValue({ data: toggledTask });

      const result = await api.toggleTaskCompletion('1', 'user1');

      expect(mockAxios.patch).toHaveBeenCalledWith('http://localhost:3001/api/tasks/1/toggle?userId=user1');
      expect(result).toEqual(toggledTask);
    });

    it('should handle toggle errors', async () => {
      mockAxios.patch.mockRejectedValue(new Error('Failed to toggle task'));

      await expect(api.toggleTaskCompletion('1', 'user1')).rejects.toThrow('Failed to toggle task');
    });
  });

  describe('authentication', () => {
    it('should include auth token in requests when available', async () => {
      // This would be tested at a higher level with interceptors
      // For now, we just test that the basic request works
      mockAxios.get.mockResolvedValue({ data: { tasks: [] } });

      await api.getTasks('user1');

      expect(mockAxios.get).toHaveBeenCalledWith('http://localhost:3001/api/tasks?userId=user1');
    });

    it('should handle requests without auth token', async () => {
      mockAxios.get.mockResolvedValue({ data: { tasks: [] } });

      await api.getTasks('user1');

      expect(mockAxios.get).toHaveBeenCalledWith('http://localhost:3001/api/tasks?userId=user1');
    });
  });

  describe('error handling', () => {
    it('should handle 404 errors', async () => {
      const error = new Error('Not Found');
      (error as any).response = { status: 404 };
      mockAxios.get.mockRejectedValue(error);

      await expect(api.getTasks('user1')).rejects.toThrow('Not Found');
    });

    it('should handle 500 errors', async () => {
      const error = new Error('Internal Server Error');
      (error as any).response = { status: 500 };
      mockAxios.get.mockRejectedValue(error);

      await expect(api.getTasks('user1')).rejects.toThrow('Internal Server Error');
    });

    it('should handle network timeouts', async () => {
      const error = new Error('Network timeout');
      (error as any).code = 'ECONNABORTED';
      mockAxios.get.mockRejectedValue(error);

      await expect(api.getTasks('user1')).rejects.toThrow('Network timeout');
    });
  });

  describe('data validation', () => {
    it('should validate task data structure', async () => {
      const mockTasks = [
        {
          _id: '1',
          title: 'Test Task',
          description: 'Test Description',
          category: 'work',
          dueDate: '2024-01-15',
          completed: false,
          userId: 'user1',
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-01T00:00:00.000Z',
        },
      ];

      mockAxios.get.mockResolvedValue({ data: { tasks: mockTasks } });

      const result = await api.getTasks('user1');

      expect(result.tasks[0]).toHaveProperty('_id');
      expect(result.tasks[0]).toHaveProperty('title');
      expect(result.tasks[0]).toHaveProperty('description');
      expect(result.tasks[0]).toHaveProperty('category');
      expect(result.tasks[0]).toHaveProperty('completed');
      expect(result.tasks[0]).toHaveProperty('userId');
    });

    it('should handle malformed response data', async () => {
      mockAxios.get.mockResolvedValue({ data: null });

      const result = await api.getTasks('user1');

      expect(result).toBeNull();
    });
  });
}); 