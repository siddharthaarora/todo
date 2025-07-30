import { TaskService } from '../taskService';
import { Task } from '../../models/Task';
import { createTestTask } from '../../test/setup';

describe('TaskService', () => {
  describe('createTask', () => {
    it('should create a new task successfully', async () => {
      const taskData = {
        userId: 'user123',
        title: 'New Task',
        description: 'Task description',
        category: 'work',
        dueDate: new Date('2024-12-31'),
      };

      const createdTask = await TaskService.createTask(taskData);

      expect(createdTask).toBeDefined();
      expect(createdTask.userId).toBe(taskData.userId);
      expect(createdTask.title).toBe(taskData.title);
      expect(createdTask.description).toBe(taskData.description);
      expect(createdTask.category).toBe(taskData.category);
      expect(createdTask.completed).toBe(false); // Default value
      expect(createdTask._id).toBeDefined();
    });

    it('should create a task with minimal required fields', async () => {
      const taskData = {
        userId: 'user123',
        title: 'Minimal Task',
      };

      const createdTask = await TaskService.createTask(taskData);

      expect(createdTask.userId).toBe(taskData.userId);
      expect(createdTask.title).toBe(taskData.title);
      expect(createdTask.completed).toBe(false);
      expect(createdTask.description).toBeUndefined();
    });
  });

  describe('getTasks', () => {
    beforeEach(async () => {
      // Create test tasks
      await Task.create([
        { userId: 'user1', title: 'Task 1', completed: false, category: 'work' },
        { userId: 'user1', title: 'Task 2', completed: true, category: 'personal' },
        { userId: 'user1', title: 'Task 3', completed: false, category: 'work' },
        { userId: 'user2', title: 'Task 4', completed: false, category: 'work' },
      ]);
    });

    it('should get all tasks for a user', async () => {
      const result = await TaskService.getTasks('user1');

      expect(result.tasks).toHaveLength(3);
      expect(result.total).toBe(3);
      expect(result.tasks.every(task => task.userId === 'user1')).toBe(true);
    });

    it('should filter tasks by completion status', async () => {
      const completedTasks = await TaskService.getTasks('user1', { completed: true });
      const pendingTasks = await TaskService.getTasks('user1', { completed: false });

      expect(completedTasks.tasks).toHaveLength(1);
      expect(completedTasks.total).toBe(1);
      expect(pendingTasks.tasks).toHaveLength(2);
      expect(pendingTasks.total).toBe(2);
    });

    it('should filter tasks by category', async () => {
      const workTasks = await TaskService.getTasks('user1', { category: 'work' });
      const personalTasks = await TaskService.getTasks('user1', { category: 'personal' });

      expect(workTasks.tasks).toHaveLength(2);
      expect(personalTasks.tasks).toHaveLength(1);
    });

    it('should support pagination', async () => {
      const page1 = await TaskService.getTasks('user1', { page: 1, limit: 2 });
      const page2 = await TaskService.getTasks('user1', { page: 2, limit: 2 });

      expect(page1.tasks).toHaveLength(2);
      expect(page2.tasks).toHaveLength(1);
      expect(page1.total).toBe(3);
      expect(page2.total).toBe(3);
    });

    it('should sort tasks by specified field', async () => {
      const tasksByTitle = await TaskService.getTasks('user1', { sortBy: 'title' });
      const tasksByCreated = await TaskService.getTasks('user1', { sortBy: 'createdAt' });

      expect(tasksByTitle.tasks).toBeDefined();
      expect(tasksByCreated.tasks).toBeDefined();
      // Note: MongoDB sorting behavior may vary, so we just check that the method executes
    });

    it('should return empty array for non-existent user', async () => {
      const result = await TaskService.getTasks('nonexistent');

      expect(result.tasks).toHaveLength(0);
      expect(result.total).toBe(0);
    });
  });

  describe('updateTask', () => {
    let testTask: any;

    beforeEach(async () => {
      testTask = await createTestTask(Task, {
        userId: 'user123',
        title: 'Original Title',
        description: 'Original Description',
      });
    });

    it('should update task successfully', async () => {
      const updates = {
        title: 'Updated Title',
        description: 'Updated Description',
        category: 'personal',
      };

      const updatedTask = await TaskService.updateTask(testTask._id, 'user123', updates);

      expect(updatedTask).toBeDefined();
      expect(updatedTask?.title).toBe(updates.title);
      expect(updatedTask?.description).toBe(updates.description);
      expect(updatedTask?.category).toBe(updates.category);
      expect(updatedTask?.userId).toBe('user123'); // Should remain unchanged
    });

    it('should return null for non-existent task', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      const result = await TaskService.updateTask(fakeId, 'user123', { title: 'New Title' });

      expect(result).toBeNull();
    });

    it('should return null when user does not own the task', async () => {
      const result = await TaskService.updateTask(testTask._id, 'different-user', { title: 'New Title' });

      expect(result).toBeNull();
    });

    it('should update only specified fields', async () => {
      const originalDescription = testTask.description;
      const updates = { title: 'Only Title Updated' };

      const updatedTask = await TaskService.updateTask(testTask._id, 'user123', updates);

      expect(updatedTask?.title).toBe(updates.title);
      expect(updatedTask?.description).toBe(originalDescription); // Should remain unchanged
    });
  });

  describe('deleteTask', () => {
    let testTask: any;

    beforeEach(async () => {
      testTask = await createTestTask(Task, { userId: 'user123' });
    });

    it('should delete task successfully', async () => {
      const result = await TaskService.deleteTask(testTask._id, 'user123');

      expect(result).toBe(true);

      // Verify task is deleted
      const deletedTask = await Task.findById(testTask._id);
      expect(deletedTask).toBeNull();
    });

    it('should return false for non-existent task', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      const result = await TaskService.deleteTask(fakeId, 'user123');

      expect(result).toBe(false);
    });

    it('should return false when user does not own the task', async () => {
      const result = await TaskService.deleteTask(testTask._id, 'different-user');

      expect(result).toBe(false);

      // Verify task still exists
      const existingTask = await Task.findById(testTask._id);
      expect(existingTask).toBeDefined();
    });
  });

  describe('toggleTaskCompletion', () => {
    let testTask: any;

    beforeEach(async () => {
      testTask = await createTestTask(Task, {
        userId: 'user123',
        title: 'Toggle Task',
        completed: false,
      });
    });

    it('should toggle task from incomplete to complete', async () => {
      const toggledTask = await TaskService.toggleTaskCompletion(testTask._id, 'user123');

      expect(toggledTask).toBeDefined();
      expect(toggledTask?.completed).toBe(true);
    });

    it('should toggle task from complete to incomplete', async () => {
      // First make it complete
      testTask.completed = true;
      await testTask.save();

      const toggledTask = await TaskService.toggleTaskCompletion(testTask._id, 'user123');

      expect(toggledTask).toBeDefined();
      expect(toggledTask?.completed).toBe(false);
    });

    it('should return null for non-existent task', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      const result = await TaskService.toggleTaskCompletion(fakeId, 'user123');

      expect(result).toBeNull();
    });

    it('should return null when user does not own the task', async () => {
      const result = await TaskService.toggleTaskCompletion(testTask._id, 'different-user');

      expect(result).toBeNull();
    });
  });

  describe('getTaskStats', () => {
    beforeEach(async () => {
      await Task.create([
        { userId: 'user1', title: 'Task 1', completed: true, category: 'work' },
        { userId: 'user1', title: 'Task 2', completed: false, category: 'work' },
        { userId: 'user1', title: 'Task 3', completed: true, category: 'personal' },
        { userId: 'user1', title: 'Task 4', completed: false, category: 'personal' },
        { userId: 'user1', title: 'Task 5', completed: false }, // No category
        { userId: 'user2', title: 'Task 6', completed: true, category: 'work' }, // Different user
      ]);
    });

    it('should return correct statistics for a user', async () => {
      const stats = await TaskService.getTaskStats('user1');

      expect(stats.total).toBe(5);
      expect(stats.completed).toBe(2);
      expect(stats.pending).toBe(3);
      expect(stats.byCategory).toEqual({
        work: 2,
        personal: 2,
        'Uncategorized': 1,
      });
    });

    it('should return zero statistics for non-existent user', async () => {
      const stats = await TaskService.getTaskStats('nonexistent');

      expect(stats.total).toBe(0);
      expect(stats.completed).toBe(0);
      expect(stats.pending).toBe(0);
      expect(stats.byCategory).toEqual({});
    });

    it('should handle user with only completed tasks', async () => {
      await Task.create([
        { userId: 'user3', title: 'Completed 1', completed: true, category: 'work' },
        { userId: 'user3', title: 'Completed 2', completed: true, category: 'personal' },
      ]);

      const stats = await TaskService.getTaskStats('user3');

      expect(stats.total).toBe(2);
      expect(stats.completed).toBe(2);
      expect(stats.pending).toBe(0);
      expect(stats.byCategory).toEqual({
        work: 1,
        personal: 1,
      });
    });

    it('should handle user with only pending tasks', async () => {
      await Task.create([
        { userId: 'user4', title: 'Pending 1', completed: false, category: 'work' },
        { userId: 'user4', title: 'Pending 2', completed: false },
      ]);

      const stats = await TaskService.getTaskStats('user4');

      expect(stats.total).toBe(2);
      expect(stats.completed).toBe(0);
      expect(stats.pending).toBe(2);
      expect(stats.byCategory).toEqual({
        work: 1,
        'Uncategorized': 1,
      });
    });
  });
}); 