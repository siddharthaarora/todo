import express from 'express';
import { TaskService } from '../services/taskService';
import { Task } from '../models/Task';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// Get all tasks for a user
router.get('/', authenticateToken, async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'User not authenticated' });
    }
    const userId = (req.user as any)._id.toString();
    
    const { tasks, total } = await TaskService.getTasks(userId, {
      page: Number(req.query.page) || 1,
      limit: Number(req.query.limit) || 1000, // Use higher limit
      completed: req.query.completed !== undefined ? req.query.completed === 'true' : undefined,
      category: req.query.category as string,
      sortBy: req.query.sortBy as string,
      search: req.query.search as string,
    });
    
    res.json({ tasks, total });
  } catch (error: any) {
    console.error('Error fetching tasks:', error);
    res.status(500).json({ message: 'Error fetching tasks', error: error.message });
  }
});

// Create a new task
router.post('/', authenticateToken, async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'User not authenticated' });
    }
    const { title, description, category, dueDate } = req.body;
    const userId = (req.user as any)._id.toString();
    
    if (!title) {
      console.error('Missing required fields:', { title });
      return res.status(400).json({ message: 'Title is required' });
    }

    const task = await TaskService.createTask({
      title,
      description,
      category,
      dueDate,
      userId,
    });
    res.status(201).json(task);
  } catch (error: any) {
    console.error('Error creating task:', error);
    res.status(500).json({ message: 'Error creating task', error: error.message });
  }
});

// Update a task
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'User not authenticated' });
    }
    const userId = (req.user as any)._id.toString();
    const task = await TaskService.updateTask(req.params.id, userId, req.body);
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }
    res.json(task);
  } catch (error: any) {
    console.error('Error updating task:', error);
    res.status(500).json({ message: 'Error updating task', error: error.message });
  }
});

// Delete a task
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'User not authenticated' });
    }
    const userId = (req.user as any)._id.toString();
    const success = await TaskService.deleteTask(req.params.id, userId);
    if (!success) {
      return res.status(404).json({ error: 'Task not found' });
    }
    res.status(204).send();
  } catch (error: any) {
    console.error('Error deleting task:', error);
    res.status(500).json({ message: 'Error deleting task', error: error.message });
  }
});

// Toggle task completion
router.patch('/:id/toggle', authenticateToken, async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'User not authenticated' });
    }
    const userId = (req.user as any)._id.toString();
    const task = await TaskService.toggleTaskCompletion(req.params.id, userId);
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }
    res.json(task);
  } catch (error: any) {
    console.error('Error toggling task:', error);
    res.status(500).json({ message: 'Error toggling task', error: error.message });
  }
});

export default router; 