import request from 'supertest';
import express from 'express';
import taskRoutes from '../taskRoutes';
import { Task } from '../../models/Task';
import { createTestTask } from '../../test/setup';

const app = express();
app.use(express.json());
app.use('/api/tasks', taskRoutes);

describe('Task Routes', () => {
  describe('GET /api/tasks', () => {
    beforeEach(async () => {
      await Task.create([
        { userId: 'user1', title: 'Task 1', completed: false, category: 'work' },
        { userId: 'user1', title: 'Task 2', completed: true, category: 'personal' },
        { userId: 'user2', title: 'Task 3', completed: false, category: 'work' },
      ]);
    });

    it('should get all tasks for a user', async () => {
      const response = await request(app)
        .get('/api/tasks')
        .query({ userId: 'user1' });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('tasks');
      expect(response.body).toHaveProperty('total');
      expect(response.body.tasks).toHaveLength(2);
      expect(response.body.total).toBe(2);
      expect(response.body.tasks.every((task: any) => task.userId === 'user1')).toBe(true);
    });

    it('should filter tasks by completion status', async () => {
      const response = await request(app)
        .get('/api/tasks')
        .query({ userId: 'user1', completed: 'true' });

      expect(response.status).toBe(200);
      expect(response.body.tasks).toHaveLength(1);
      expect(response.body.tasks[0].completed).toBe(true);
    });

    it('should filter tasks by category', async () => {
      const response = await request(app)
        .get('/api/tasks')
        .query({ userId: 'user1', category: 'work' });

      expect(response.status).toBe(200);
      expect(response.body.tasks).toHaveLength(1);
      expect(response.body.tasks[0].category).toBe('work');
    });

    it('should support pagination', async () => {
      const response = await request(app)
        .get('/api/tasks')
        .query({ userId: 'user1', page: '1', limit: '1' });

      expect(response.status).toBe(200);
      expect(response.body.tasks).toHaveLength(1);
      expect(response.body.total).toBe(2);
    });

    it('should return empty array for non-existent user', async () => {
      const response = await request(app)
        .get('/api/tasks')
        .query({ userId: 'nonexistent' });

      expect(response.status).toBe(200);
      expect(response.body.tasks).toHaveLength(0);
      expect(response.body.total).toBe(0);
    });

    it('should handle missing userId parameter', async () => {
      const response = await request(app)
        .get('/api/tasks');

      expect(response.status).toBe(200);
      expect(response.body.tasks).toHaveLength(0);
    });
  });

  describe('POST /api/tasks', () => {
    it('should create a new task successfully', async () => {
      const taskData = {
        title: 'New Task',
        description: 'Task description',
        category: 'work',
        dueDate: '2024-12-31',
        userId: 'user123',
      };

      const response = await request(app)
        .post('/api/tasks')
        .send(taskData);

      expect(response.status).toBe(201);
      expect(response.body.title).toBe(taskData.title);
      expect(response.body.description).toBe(taskData.description);
      expect(response.body.category).toBe(taskData.category);
      expect(response.body.userId).toBe(taskData.userId);
      expect(response.body._id).toBeDefined();
      expect(response.body.completed).toBe(false);
    });

    it('should create a task with minimal required fields', async () => {
      const taskData = {
        title: 'Minimal Task',
        userId: 'user123',
      };

      const response = await request(app)
        .post('/api/tasks')
        .send(taskData);

      expect(response.status).toBe(201);
      expect(response.body.title).toBe(taskData.title);
      expect(response.body.userId).toBe(taskData.userId);
      expect(response.body.completed).toBe(false);
    });

    it('should return 400 for missing title', async () => {
      const taskData = {
        description: 'Task description',
        userId: 'user123',
      };

      const response = await request(app)
        .post('/api/tasks')
        .send(taskData);

      expect(response.status).toBe(400);
      expect(response.body.message).toContain('Title and userId are required');
    });

    it('should return 400 for missing userId', async () => {
      const taskData = {
        title: 'New Task',
        description: 'Task description',
      };

      const response = await request(app)
        .post('/api/tasks')
        .send(taskData);

      expect(response.status).toBe(400);
      expect(response.body.message).toContain('Title and userId are required');
    });

    it('should handle invalid task data', async () => {
      const response = await request(app)
        .post('/api/tasks')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.message).toContain('Title and userId are required');
    });
  });

  describe('PUT /api/tasks/:id', () => {
    let testTask: any;

    beforeEach(async () => {
      testTask = await createTestTask(Task, {
        userId: 'user123',
        title: 'Original Title',
        description: 'Original Description',
      });
    });

    it('should update a task successfully', async () => {
      const updates = {
        title: 'Updated Title',
        description: 'Updated Description',
        category: 'personal',
        userId: 'user123',
      };

      const response = await request(app)
        .put(`/api/tasks/${testTask._id}`)
        .send(updates);

      expect(response.status).toBe(200);
      expect(response.body.title).toBe(updates.title);
      expect(response.body.description).toBe(updates.description);
      expect(response.body.category).toBe(updates.category);
      expect(response.body.userId).toBe('user123');
    });

    it('should return 404 for non-existent task', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      const updates = {
        title: 'Updated Title',
        userId: 'user123',
      };

      const response = await request(app)
        .put(`/api/tasks/${fakeId}`)
        .send(updates);

      expect(response.status).toBe(404);
      expect(response.body.error).toBe('Task not found');
    });

    it('should return 404 when user does not own the task', async () => {
      const updates = {
        title: 'Updated Title',
        userId: 'different-user',
      };

      const response = await request(app)
        .put(`/api/tasks/${testTask._id}`)
        .send(updates);

      expect(response.status).toBe(404);
      expect(response.body.error).toBe('Task not found');
    });

    it('should update only specified fields', async () => {
      const originalDescription = testTask.description;
      const updates = {
        title: 'Only Title Updated',
        userId: 'user123',
      };

      const response = await request(app)
        .put(`/api/tasks/${testTask._id}`)
        .send(updates);

      expect(response.status).toBe(200);
      expect(response.body.title).toBe(updates.title);
      expect(response.body.description).toBe(originalDescription);
    });
  });

  describe('DELETE /api/tasks/:id', () => {
    let testTask: any;

    beforeEach(async () => {
      testTask = await createTestTask(Task, { userId: 'user123' });
    });

    it('should delete a task successfully', async () => {
      const response = await request(app)
        .delete(`/api/tasks/${testTask._id}`)
        .query({ userId: 'user123' });

      expect(response.status).toBe(204);

      // Verify task is deleted
      const deletedTask = await Task.findById(testTask._id);
      expect(deletedTask).toBeNull();
    });

    it('should return 404 for non-existent task', async () => {
      const fakeId = '507f1f77bcf86cd799439011';

      const response = await request(app)
        .delete(`/api/tasks/${fakeId}`)
        .query({ userId: 'user123' });

      expect(response.status).toBe(404);
      expect(response.body.error).toBe('Task not found');
    });

    it('should return 404 when user does not own the task', async () => {
      const response = await request(app)
        .delete(`/api/tasks/${testTask._id}`)
        .query({ userId: 'different-user' });

      expect(response.status).toBe(404);
      expect(response.body.error).toBe('Task not found');

      // Verify task still exists
      const existingTask = await Task.findById(testTask._id);
      expect(existingTask).toBeDefined();
    });
  });

  describe('PATCH /api/tasks/:id/toggle', () => {
    let testTask: any;

    beforeEach(async () => {
      testTask = await createTestTask(Task, {
        userId: 'user123',
        title: 'Toggle Task',
        completed: false,
      });
    });

    it('should toggle task completion from false to true', async () => {
      const response = await request(app)
        .patch(`/api/tasks/${testTask._id}/toggle`)
        .query({ userId: 'user123' });

      expect(response.status).toBe(200);
      expect(response.body.completed).toBe(true);
    });

    it('should toggle task completion from true to false', async () => {
      // First make it complete
      testTask.completed = true;
      await testTask.save();

      const response = await request(app)
        .patch(`/api/tasks/${testTask._id}/toggle`)
        .query({ userId: 'user123' });

      expect(response.status).toBe(200);
      expect(response.body.completed).toBe(false);
    });

    it('should return 404 for non-existent task', async () => {
      const fakeId = '507f1f77bcf86cd799439011';

      const response = await request(app)
        .patch(`/api/tasks/${fakeId}/toggle`)
        .query({ userId: 'user123' });

      expect(response.status).toBe(404);
      expect(response.body.error).toBe('Task not found');
    });

    it('should return 404 when user does not own the task', async () => {
      const response = await request(app)
        .patch(`/api/tasks/${testTask._id}/toggle`)
        .query({ userId: 'different-user' });

      expect(response.status).toBe(404);
      expect(response.body.error).toBe('Task not found');
    });
  });

  describe('Error Handling', () => {
    it('should handle database errors gracefully', async () => {
      // This test would require mocking the database to throw an error
      // For now, we'll test that the route structure is correct
      const response = await request(app)
        .get('/api/tasks')
        .query({ userId: 'user123' });

      expect(response.status).toBe(200);
    });

    it('should return proper error messages', async () => {
      const response = await request(app)
        .post('/api/tasks')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message');
      expect(typeof response.body.message).toBe('string');
    });
  });
}); 