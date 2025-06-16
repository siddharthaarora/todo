import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import TaskList from '../components/TaskList';
import AddTaskButton from '../components/AddTaskButton';
import TaskModal from '../components/TaskModal';
import ProgressTracker from '../components/ProgressTracker';
import { Task } from '../types';
import api from '../services/api';

const DashboardContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: ${({ theme }) => theme.spacing.lg};
`;

const Header = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${({ theme }) => theme.spacing.xl};
`;

const Title = styled.h1`
  font-size: ${({ theme }) => theme.typography.fontSize['3xl']};
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  color: ${({ theme }) => theme.colors.gray[900]};
`;

const MainContent = styled.main`
  display: grid;
  grid-template-columns: 1fr;
  gap: ${({ theme }) => theme.spacing.xl};

  @media (min-width: ${({ theme }) => theme.breakpoints.lg}) {
    grid-template-columns: 2fr 1fr;
  }
`;

const Dashboard: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const userId = 'default-user'; // In a real app, this would come from auth

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    try {
      const response = await api.getTasks(userId);
      setTasks(response.tasks);
    } catch (error) {
      console.error('Error loading tasks:', error);
    }
  };

  const handleAddTask = () => {
    setSelectedTask(null);
    setIsModalOpen(true);
  };

  const handleEditTask = (task: Task) => {
    setSelectedTask(task);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedTask(null);
  };

  const handleSaveTask = async (task: Task) => {
    try {
      if (selectedTask) {
        // Update existing task
        const updatedTask = await api.updateTask(task.id, {
          title: task.title,
          description: task.description,
          category: task.category,
          dueDate: task.dueDate?.toISOString(),
          completed: task.completed,
        });
        setTasks(tasks.map(t => t.id === task.id ? updatedTask : t));
      } else {
        // Create new task
        const newTask = await api.createTask({
          title: task.title,
          description: task.description,
          category: task.category,
          dueDate: task.dueDate?.toISOString(),
        }, userId);
        setTasks([...tasks, newTask]);
      }
      handleCloseModal();
    } catch (error) {
      console.error('Error saving task:', error);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      await api.deleteTask(taskId);
      setTasks(tasks.filter(t => t.id !== taskId));
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  const handleToggleComplete = async (taskId: string) => {
    try {
      const updatedTask = await api.toggleTaskCompletion(taskId);
      setTasks(tasks.map(task =>
        task.id === taskId ? updatedTask : task
      ));
    } catch (error) {
      console.error('Error toggling task completion:', error);
    }
  };

  return (
    <DashboardContainer>
      <Header>
        <Title>Prodigy</Title>
        <AddTaskButton onClick={handleAddTask} />
      </Header>

      <MainContent>
        <TaskList
          tasks={tasks}
          onEditTask={handleEditTask}
          onDeleteTask={handleDeleteTask}
          onToggleComplete={handleToggleComplete}
          onAddTask={handleSaveTask}
        />
        <ProgressTracker tasks={tasks} />
      </MainContent>

      <TaskModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSaveTask}
        task={selectedTask}
      />
    </DashboardContainer>
  );
};

export default Dashboard; 