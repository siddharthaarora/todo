import React, { useState } from 'react';
import styled from 'styled-components';
import TaskList from '../components/TaskList';
import AddTaskButton from '../components/AddTaskButton';
import TaskModal from '../components/TaskModal';
import ProgressTracker from '../components/ProgressTracker';
import { Task } from '../types';

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

  const handleSaveTask = (task: Task) => {
    if (selectedTask) {
      setTasks(tasks.map(t => t.id === task.id ? task : t));
    } else {
      setTasks([...tasks, { ...task, id: Date.now().toString() }]);
    }
    handleCloseModal();
  };

  const handleDeleteTask = (taskId: string) => {
    setTasks(tasks.filter(t => t.id !== taskId));
  };

  const handleToggleComplete = (taskId: string) => {
    setTasks(tasks.map(task =>
      task.id === taskId
        ? { ...task, completed: !task.completed }
        : task
    ));
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