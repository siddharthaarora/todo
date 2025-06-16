import express from 'express';
import { TaskService } from '../services/taskService';

const router = express.Router();

// Get all tasks for a user
router.get('/', async (req, res) => {
  try {
    console.log('GET /tasks - Query params:', req.query);
    const userId = req.query.userId as string;
    const { tasks, total } = await TaskService.getTasks(userId, {
      page: Number(req.query.page) || 1,
      limit: Number(req.query.limit) || 10,
      completed: req.query.completed === 'true',
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
router.post('/', async (req, res) => {
  try {
    console.log('POST /tasks - Request body:', req.body);
    const { title, description, category, dueDate, userId } = req.body;
    
    if (!title || !userId) {
      console.error('Missing required fields:', { title, userId });
      return res.status(400).json({ message: 'Title and userId are required' });
    }

    const task = await TaskService.createTask({
      title,
      description,
      category,
      dueDate,
      userId,
    });
    console.log('Task created successfully:', task);
    res.status(201).json(task);
  } catch (error: any) {
    console.error('Error creating task:', error);
    res.status(500).json({ message: 'Error creating task', error: error.message });
  }
});

// Update a task
router.put('/:id', async (req, res) => {
  try {
    const userId = req.body.userId;
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
router.delete('/:id', async (req, res) => {
  try {
    const userId = req.query.userId as string;
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
router.patch('/:id/toggle', async (req, res) => {
  try {
    const userId = req.query.userId as string;
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