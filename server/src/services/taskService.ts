import { Task, ITask } from '../models/Task';

export class TaskService {
  // Create a new task
  static async createTask(taskData: Partial<ITask>): Promise<ITask> {
    const task = new Task(taskData);
    return await task.save();
  }

  // Get tasks for a user with pagination and filters
  static async getTasks(
    userId: string,
    options: {
      page?: number;
      limit?: number;
      completed?: boolean;
      category?: string;
      sortBy?: string;
      search?: string;
    } = {}
  ): Promise<{ tasks: ITask[]; total: number }> {
    const {
      page = 1,
      limit = 1000, // Increased default limit to get all tasks
      completed,
      category,
      sortBy = 'createdAt',
      search,
    } = options;

    const query: any = { userId };

    // Add filters
    if (completed !== undefined) {
      query.completed = completed;
    }
    if (category) {
      query.category = category;
    }
    if (search) {
      query.$text = { $search: search };
    }

    // Calculate skip value for pagination
    const skip = (page - 1) * limit;

    // Execute query with pagination and sorting
    const [tasks, total] = await Promise.all([
      Task.find(query)
        .sort({ [sortBy]: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Task.countDocuments(query),
    ]);

    return { tasks, total };
  }

  // Update a task
  static async updateTask(taskId: string, userId: string, updates: Partial<ITask>): Promise<ITask | null> {
    return await Task.findOneAndUpdate(
      { _id: taskId, userId },
      { $set: updates },
      { new: true }
    );
  }

  // Delete a task
  static async deleteTask(taskId: string, userId: string): Promise<boolean> {
    const result = await Task.deleteOne({ _id: taskId, userId });
    return result.deletedCount > 0;
  }

  // Toggle task completion
  static async toggleTaskCompletion(taskId: string, userId: string): Promise<ITask | null> {
    const task = await Task.findOne({ _id: taskId, userId });
    if (!task) return null;

    task.completed = !task.completed;
    return await task.save();
  }

  // Get task statistics for a user
  static async getTaskStats(userId: string): Promise<{
    total: number;
    completed: number;
    pending: number;
    byCategory: { [key: string]: number };
  }> {
    const [total, completed, pending, categoryStats] = await Promise.all([
      Task.countDocuments({ userId }),
      Task.countDocuments({ userId, completed: true }),
      Task.countDocuments({ userId, completed: false }),
      Task.aggregate([
        { $match: { userId } },
        { $group: { _id: '$category', count: { $sum: 1 } } },
      ]),
    ]);

    const byCategory = categoryStats.reduce((acc: any, curr) => {
      acc[curr._id || 'Uncategorized'] = curr.count;
      return acc;
    }, {});

    return {
      total,
      completed,
      pending,
      byCategory,
    };
  }
} 