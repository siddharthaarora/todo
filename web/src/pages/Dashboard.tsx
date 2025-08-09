import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Link, useNavigate } from 'react-router-dom';
import TaskList from '../components/TaskList';
import AddTaskButton from '../components/AddTaskButton';
import TaskModal from '../components/TaskModal';
import ProgressTracker from '../components/ProgressTracker';
import { Task } from '../services/api';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const DashboardContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: ${({ theme }) => theme.colors.white};
`;

const DashboardContent = styled.div`
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

const Title = styled(Link)`
  font-size: ${({ theme }) => theme.typography.fontSize['3xl']};
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  color: ${({ theme }) => theme.colors.white};
  text-decoration: none;
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  
  &:hover {
    opacity: 0.9;
  }
`;

const LogoIcon = styled.img`
  width: 32px;
  height: 32px;
`;

// const UserName = styled.span`
//   font-size: ${({ theme }) => theme.typography.fontSize.lg};
//   font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
//   color: ${({ theme }) => theme.colors.gray[600]};
// `;

const UserAvatar = styled.button`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: ${({ theme }) => theme.colors.white};
  color: ${({ theme }) => theme.colors.primary};
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  font-size: ${({ theme }) => theme.typography.fontSize.base};
  transition: all ${({ theme }) => theme.transitions.fast};
  position: relative;

  &:hover {
    background-color: ${({ theme }) => theme.colors.gray[100]};
    transform: scale(1.05);
  }
`;

const DropdownMenu = styled.div.withConfig({
  shouldForwardProp: (prop) => prop !== 'isOpen'
})<{ isOpen: boolean }>`
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 8px;
  background-color: white;
  border-radius: ${({ theme }) => theme.borderRadius.md};
  box-shadow: ${({ theme }) => theme.shadows.lg};
  border: 1px solid ${({ theme }) => theme.colors.gray[200]};
  min-width: 150px;
  z-index: 1000;
  opacity: ${({ isOpen }) => (isOpen ? 1 : 0)};
  visibility: ${({ isOpen }) => (isOpen ? 'visible' : 'hidden')};
  transform: ${({ isOpen }) => (isOpen ? 'translateY(0)' : 'translateY(-10px)')};
  transition: all ${({ theme }) => theme.transitions.fast};
`;

const DropdownItem = styled.button`
  width: 100%;
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
  background: none;
  border: none;
  text-align: left;
  cursor: pointer;
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  color: ${({ theme }) => theme.colors.gray[700]};
  transition: background-color ${({ theme }) => theme.transitions.fast};

  &:hover {
    background-color: ${({ theme }) => theme.colors.gray[100]};
  }

  &:first-child {
    border-radius: ${({ theme }) => theme.borderRadius.md} ${({ theme }) => theme.borderRadius.md} 0 0;
  }

  &:last-child {
    border-radius: 0 0 ${({ theme }) => theme.borderRadius.md} ${({ theme }) => theme.borderRadius.md};
  }
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
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [showCompleted, setShowCompleted] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      loadTasks();
    }
  }, [user]);

  const loadTasks = async () => {
    if (!user) return;
    
    try {
      const response = await api.getTasks();
      setTasks(response.tasks || []);
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
    if (!user) return;
    
    console.log('Dashboard received task to save:', task);
    try {
      if (selectedTask) {
        console.log('Updating existing task:', task._id);
        // Update existing task
        const updatedTask = await api.updateTask(task._id, {
          title: task.title,
          description: task.description,
          category: task.category,
          dueDate: task.dueDate,
          completed: task.completed,
        });
        console.log('Task updated successfully:', updatedTask);
        setTasks(tasks.map(t => t._id === task._id ? updatedTask : t));
      } else {
        console.log('Creating new task');
        // Create new task
        const newTask = await api.createTask({
          title: task.title,
          description: task.description,
          category: task.category,
          dueDate: task.dueDate,
        });
        console.log('Task created successfully:', newTask);
        setTasks([...tasks, newTask]);
      }
      handleCloseModal();
    } catch (error) {
      console.error('Error saving task:', error);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!user) return;
    
    console.log('Attempting to delete task:', taskId);
    try {
      await api.deleteTask(taskId);
      console.log('Task deleted successfully');
      setTasks(tasks.filter(t => t._id !== taskId));
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  const handleToggleComplete = async (taskId: string) => {
    if (!user) return;
    
    console.log('Attempting to toggle task completion:', taskId);
    try {
      const updatedTask = await api.toggleTaskCompletion(taskId);
      console.log('Task completion toggled successfully:', updatedTask);
      setTasks(tasks.map(task =>
        task._id === taskId ? updatedTask : task
      ));
    } catch (error) {
      console.error('Error toggling task completion:', error);
    }
  };

  const getUserInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const handleAvatarClick = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handleSignOut = () => {
    logout();
    setIsDropdownOpen(false);
    navigate('/', { replace: true });
  };

  const handleSettings = () => {
    // TODO: Implement settings functionality
    console.log('Settings clicked');
    setIsDropdownOpen(false);
  };

  const handleToggleCompleted = () => {
    setShowCompleted(!showCompleted);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('[data-dropdown]')) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!user) {
    return <div>Please log in to view your tasks.</div>;
  }

  return (
    <DashboardContainer>
      <DashboardContent>
        <Header>
          <Title to="/">
            <LogoIcon src="/logo.svg" alt="proxyc logo" />
            proxyc
          </Title>
          <div data-dropdown style={{ position: 'relative' }}>
            <UserAvatar onClick={handleAvatarClick}>
              {getUserInitials(user?.name || 'User')}
            </UserAvatar>
            <DropdownMenu isOpen={isDropdownOpen}>
              <DropdownItem onClick={handleSignOut}>
                Sign Out
              </DropdownItem>
              <DropdownItem onClick={handleSettings}>
                Settings
              </DropdownItem>
            </DropdownMenu>
          </div>
        </Header>

        <MainContent>
          <div>
            <TaskList
              tasks={tasks.filter(task => showCompleted ? task.completed : !task.completed)}
              onEditTask={handleEditTask}
              onDeleteTask={handleDeleteTask}
              onToggleComplete={handleToggleComplete}
              onAddTask={handleSaveTask}
            />
            <AddTaskButton onClick={handleAddTask} />
          </div>
          <ProgressTracker 
            tasks={tasks} 
            showCompleted={showCompleted}
            onToggleCompleted={handleToggleCompleted}
          />
        </MainContent>

        <TaskModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onSave={handleSaveTask}
          task={selectedTask}
        />
      </DashboardContent>
    </DashboardContainer>
  );
};

export default Dashboard; 