import { Task } from '../types';

const STORAGE_KEY = 'prodigy_tasks';

export const taskService = {
  getTasks: (): Task[] => {
    const tasksJson = localStorage.getItem(STORAGE_KEY);
    return tasksJson ? JSON.parse(tasksJson) : [];
  },

  saveTasks: (tasks: Task[]): void => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  },

  addTask: (task: Task): Task[] => {
    const tasks = taskService.getTasks();
    const newTasks = [...tasks, task];
    taskService.saveTasks(newTasks);
    return newTasks;
  },

  updateTask: (updatedTask: Task): Task[] => {
    const tasks = taskService.getTasks();
    const newTasks = tasks.map(task => 
      task.id === updatedTask.id ? updatedTask : task
    );
    taskService.saveTasks(newTasks);
    return newTasks;
  },

  deleteTask: (taskId: string): Task[] => {
    const tasks = taskService.getTasks();
    const newTasks = tasks.filter(task => task.id !== taskId);
    taskService.saveTasks(newTasks);
    return newTasks;
  },

  reorderTasks: (tasks: Task[]): void => {
    taskService.saveTasks(tasks);
  }
}; 