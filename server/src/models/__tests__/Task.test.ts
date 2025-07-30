import mongoose from 'mongoose';
import { Task, ITask } from '../Task';

describe('Task Model', () => {
  describe('Schema Validation', () => {
    it('should create a valid task with required fields', async () => {
      const validTask = {
        userId: 'user123',
        title: 'Test Task',
      };

      const task = new Task(validTask);
      const savedTask = await task.save();

      expect(savedTask.userId).toBe(validTask.userId);
      expect(savedTask.title).toBe(validTask.title);
      expect(savedTask.completed).toBe(false); // Default value
      expect(savedTask._id).toBeDefined();
      expect(savedTask.createdAt).toBeDefined();
      expect(savedTask.updatedAt).toBeDefined();
    });

    it('should create a task with all optional fields', async () => {
      const completeTask = {
        userId: 'user456',
        title: 'Complete Task',
        description: 'This is a complete task description',
        completed: true,
        dueDate: new Date('2024-12-31'),
        category: 'work',
      };

      const task = new Task(completeTask);
      const savedTask = await task.save();

      expect(savedTask.userId).toBe(completeTask.userId);
      expect(savedTask.title).toBe(completeTask.title);
      expect(savedTask.description).toBe(completeTask.description);
      expect(savedTask.completed).toBe(completeTask.completed);
      expect(savedTask.dueDate).toEqual(completeTask.dueDate);
      expect(savedTask.category).toBe(completeTask.category);
    });

    it('should require userId field', async () => {
      const taskWithoutUserId = {
        title: 'Test Task',
      };

      const task = new Task(taskWithoutUserId);
      let error: any;
      
      try {
        await task.save();
      } catch (err) {
        error = err;
      }

      expect(error).toBeDefined();
      expect(error.errors.userId).toBeDefined();
    });

    it('should require title field', async () => {
      const taskWithoutTitle = {
        userId: 'user123',
      };

      const task = new Task(taskWithoutTitle);
      let error: any;
      
      try {
        await task.save();
      } catch (err) {
        error = err;
      }

      expect(error).toBeDefined();
      expect(error.errors.title).toBeDefined();
    });

    it('should trim title and description', async () => {
      const taskWithWhitespace = {
        userId: 'user123',
        title: '  Trimmed Title  ',
        description: '  Trimmed Description  ',
      };

      const task = new Task(taskWithWhitespace);
      const savedTask = await task.save();

      expect(savedTask.title).toBe('Trimmed Title');
      expect(savedTask.description).toBe('Trimmed Description');
    });

    it('should set completed to false by default', async () => {
      const task = new Task({
        userId: 'user123',
        title: 'Default Task',
      });

      const savedTask = await task.save();
      expect(savedTask.completed).toBe(false);
    });

    it('should accept boolean for completed field', async () => {
      const completedTask = new Task({
        userId: 'user123',
        title: 'Completed Task',
        completed: true,
      });

      const savedTask = await completedTask.save();
      expect(savedTask.completed).toBe(true);
    });

    it('should accept Date object for dueDate', async () => {
      const dueDate = new Date('2024-12-31');
      const task = new Task({
        userId: 'user123',
        title: 'Task with Due Date',
        dueDate,
      });

      const savedTask = await task.save();
      expect(savedTask.dueDate).toEqual(dueDate);
    });

    it('should accept string for dueDate and convert to Date', async () => {
      const task = new Task({
        userId: 'user123',
        title: 'Task with String Due Date',
        dueDate: '2024-12-31',
      });

      const savedTask = await task.save();
      expect(savedTask.dueDate).toBeInstanceOf(Date);
      expect(savedTask.dueDate?.toISOString().split('T')[0]).toBe('2024-12-31');
    });
  });

  describe('Indexes and Queries', () => {
    it('should find tasks by userId', async () => {
      const user1Tasks = [
        { userId: 'user1', title: 'Task 1' },
        { userId: 'user1', title: 'Task 2' },
      ];

      const user2Tasks = [
        { userId: 'user2', title: 'Task 3' },
      ];

      await Task.create([...user1Tasks, ...user2Tasks]);
      const user1FoundTasks = await Task.find({ userId: 'user1' });

      expect(user1FoundTasks).toHaveLength(2);
      expect(user1FoundTasks.every(task => task.userId === 'user1')).toBe(true);
    });

    it('should find tasks by completion status', async () => {
      const tasks = [
        { userId: 'user1', title: 'Completed Task', completed: true },
        { userId: 'user1', title: 'Pending Task', completed: false },
        { userId: 'user1', title: 'Another Pending Task', completed: false },
      ];

      await Task.create(tasks);
      const completedTasks = await Task.find({ completed: true });
      const pendingTasks = await Task.find({ completed: false });

      expect(completedTasks).toHaveLength(1);
      expect(pendingTasks).toHaveLength(2);
    });

    it('should find tasks by category', async () => {
      const tasks = [
        { userId: 'user1', title: 'Work Task', category: 'work' },
        { userId: 'user1', title: 'Personal Task', category: 'personal' },
        { userId: 'user1', title: 'Another Work Task', category: 'work' },
      ];

      await Task.create(tasks);
      const workTasks = await Task.find({ category: 'work' });
      const personalTasks = await Task.find({ category: 'personal' });

      expect(workTasks).toHaveLength(2);
      expect(personalTasks).toHaveLength(1);
    });

    it('should find tasks by due date range', async () => {
      const tasks = [
        { userId: 'user1', title: 'Past Task', dueDate: new Date('2024-01-01') },
        { userId: 'user1', title: 'Current Task', dueDate: new Date('2024-06-15') },
        { userId: 'user1', title: 'Future Task', dueDate: new Date('2024-12-31') },
      ];

      await Task.create(tasks);
      const futureTasks = await Task.find({
        dueDate: { $gte: new Date('2024-06-01') }
      });

      expect(futureTasks).toHaveLength(2);
    });

    it('should use compound index for userId and completed', async () => {
      const tasks = [
        { userId: 'user1', title: 'User1 Completed', completed: true },
        { userId: 'user1', title: 'User1 Pending', completed: false },
        { userId: 'user2', title: 'User2 Completed', completed: true },
        { userId: 'user2', title: 'User2 Pending', completed: false },
      ];

      await Task.create(tasks);
      const user1PendingTasks = await Task.find({ userId: 'user1', completed: false });

      expect(user1PendingTasks).toHaveLength(1);
      expect(user1PendingTasks[0].title).toBe('User1 Pending');
    });
  });

  describe('Text Search', () => {
    it('should perform text search on title and description', async () => {
      // Create text index for testing
      await Task.collection.createIndex({ title: 'text', description: 'text' });
      
      const tasks = [
        { userId: 'user1', title: 'JavaScript Task', description: 'Learn JavaScript' },
        { userId: 'user1', title: 'React Task', description: 'Build React app' },
        { userId: 'user1', title: 'Database Task', description: 'Setup MongoDB' },
      ];

      await Task.create(tasks);
      const searchResults = await Task.find({ $text: { $search: 'JavaScript' } });

      expect(searchResults).toHaveLength(1);
      expect(searchResults[0].title).toBe('JavaScript Task');
    });
  });

  describe('Model Methods', () => {
    it('should update task', async () => {
      const task = await Task.create({
        userId: 'user123',
        title: 'Original Title',
        description: 'Original Description',
      });

      const updatedTask = await Task.findByIdAndUpdate(
        task._id,
        { title: 'Updated Title', description: 'Updated Description' },
        { new: true }
      );

      expect(updatedTask?.title).toBe('Updated Title');
      expect(updatedTask?.description).toBe('Updated Description');
      expect(updatedTask?.userId).toBe('user123'); // Should remain unchanged
    });

    it('should delete task', async () => {
      const task = await Task.create({
        userId: 'user123',
        title: 'Delete Me',
      });

      await Task.findByIdAndDelete(task._id);
      const deletedTask = await Task.findById(task._id);

      expect(deletedTask).toBeNull();
    });

    it('should count tasks by user', async () => {
      const tasks = [
        { userId: 'user1', title: 'Task 1' },
        { userId: 'user1', title: 'Task 2' },
        { userId: 'user2', title: 'Task 3' },
      ];

      await Task.create(tasks);
      const user1Count = await Task.countDocuments({ userId: 'user1' });
      const user2Count = await Task.countDocuments({ userId: 'user2' });

      expect(user1Count).toBe(2);
      expect(user2Count).toBe(1);
    });
  });

  describe('Pre-save Hook', () => {
    it('should log when saving a task', async () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      
      const task = new Task({
        userId: 'user123',
        title: 'Logged Task',
      });

      await task.save();

      expect(consoleSpy).toHaveBeenCalled();
      expect(consoleSpy).toHaveBeenCalledWith(
        'Saving task:',
        expect.objectContaining({
          userId: 'user123',
          title: 'Logged Task',
        })
      );

      consoleSpy.mockRestore();
    });
  });
}); 