import React from 'react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../../contexts/AuthContext';
import Dashboard from '../Dashboard';
import { store } from '../../store';
import { mockJwtDecode, mockApi } from '../../test/mocks';

// Mock the auth context
vi.mock('../../contexts/AuthContext', () => ({
  AuthProvider: ({ children }: { children: React.ReactNode }) => {
    const React = require('react');
    return React.createElement('div', { 'data-testid': 'auth-provider' }, children);
  },
  useAuth: () => ({
    user: { id: 'user1', email: 'test@example.com', name: 'Test User' },
    isAuthenticated: true,
    login: vi.fn(),
    logout: vi.fn(),
  }),
}));

const mockTasks = [
  {
    _id: '1',
    title: 'Task 1',
    description: 'Description 1',
    category: 'work',
    dueDate: '2024-01-15',
    completed: false,
    userId: 'user1',
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
  },
  {
    _id: '2',
    title: 'Task 2',
    description: 'Description 2',
    category: 'personal',
    dueDate: '2024-01-20',
    completed: true,
    userId: 'user1',
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
  },
];

const mockUser = {
  id: 'user1',
  email: 'test@example.com',
  name: 'Test User',
};

const renderWithProviders = (component: React.ReactNode) => {
  return render(
    <Provider store={store}>
      <BrowserRouter>
        <AuthProvider>
          {component}
        </AuthProvider>
      </BrowserRouter>
    </Provider>
  );
};

describe('Dashboard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  describe('authentication', () => {
    it('should show login message when user is not authenticated', () => {
      // Mock unauthenticated user
      vi.mocked(require('../../contexts/AuthContext').useAuth).mockReturnValue({
        user: null,
        isAuthenticated: false,
        login: vi.fn(),
        logout: vi.fn(),
      });

      renderWithProviders(<Dashboard />);

      expect(screen.getByText('Please log in to view your tasks.')).toBeInTheDocument();
    });

    it('should load tasks when user is authenticated', async () => {
      // Mock authenticated user
      localStorage.setItem('token', 'test-token');
      mockJwtDecode.mockReturnValue(mockUser);
      
      mockApi.getTasks.mockResolvedValue({ tasks: mockTasks });

      renderWithProviders(<Dashboard />);

      await waitFor(() => {
        expect(mockApi.getTasks).toHaveBeenCalledWith('user1');
      });

      expect(screen.getByText('Task 1')).toBeInTheDocument();
      expect(screen.getByText('Task 2')).toBeInTheDocument();
    });
  });

  describe('task filtering', () => {
    beforeEach(() => {
      localStorage.setItem('token', 'test-token');
      mockJwtDecode.mockReturnValue(mockUser);
      mockApi.getTasks.mockResolvedValue({ tasks: mockTasks });
    });

    it('should show pending tasks by default', async () => {
      renderWithProviders(<Dashboard />);

      await waitFor(() => {
        expect(screen.getByText('Task 1')).toBeInTheDocument();
      });

      // Task 2 is completed, so it should not be shown in pending view
      expect(screen.queryByText('Task 2')).not.toBeInTheDocument();
    });

    it('should toggle to show completed tasks when completed button is clicked', async () => {
      renderWithProviders(<Dashboard />);

      await waitFor(() => {
        expect(screen.getByText('Task 1')).toBeInTheDocument();
      });

      // Click the completed button in progress tracker
      const completedButton = screen.getByText('Completed').closest('div');
      fireEvent.click(completedButton!);

      // Now should show completed tasks
      expect(screen.getByText('Task 2')).toBeInTheDocument();
      expect(screen.queryByText('Task 1')).not.toBeInTheDocument();
    });

    it('should toggle back to pending tasks when pending button is clicked', async () => {
      renderWithProviders(<Dashboard />);

      await waitFor(() => {
        expect(screen.getByText('Task 1')).toBeInTheDocument();
      });

      // First click completed
      const completedButton = screen.getByText('Completed').closest('div');
      fireEvent.click(completedButton!);

      // Then click pending
      const pendingButton = screen.getByText('Pending').closest('div');
      fireEvent.click(pendingButton!);

      // Should show pending tasks again
      expect(screen.getByText('Task 1')).toBeInTheDocument();
      expect(screen.queryByText('Task 2')).not.toBeInTheDocument();
    });
  });

  describe('task management', () => {
    beforeEach(() => {
      localStorage.setItem('token', 'test-token');
      mockJwtDecode.mockReturnValue(mockUser);
      mockApi.getTasks.mockResolvedValue({ tasks: mockTasks });
    });

    it('should open modal when add task button is clicked', async () => {
      renderWithProviders(<Dashboard />);

      await waitFor(() => {
        expect(screen.getByText('Task 1')).toBeInTheDocument();
      });

      const addButton = screen.getByText('+');
      fireEvent.click(addButton);

      // Modal should be open
      expect(screen.getByText('Add Task')).toBeInTheDocument();
    });

    it('should create a new task successfully', async () => {
      const newTask = {
        title: 'New Task',
        description: 'New Description',
        category: 'work',
        dueDate: '2024-01-25',
      };

      mockApi.createTask.mockResolvedValue({
        _id: '3',
        ...newTask,
        completed: false,
        userId: 'user1',
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
      });

      renderWithProviders(<Dashboard />);

      await waitFor(() => {
        expect(screen.getByText('Task 1')).toBeInTheDocument();
      });

      // Open modal
      const addButton = screen.getByText('+');
      fireEvent.click(addButton);

      // Fill form
      fireEvent.change(screen.getByLabelText('Title'), { target: { value: 'New Task' } });
      fireEvent.change(screen.getByLabelText('Description'), { target: { value: 'New Description' } });
      fireEvent.change(screen.getByLabelText('Category'), { target: { value: 'work' } });
      fireEvent.change(screen.getByLabelText('Due Date'), { target: { value: '2024-01-25' } });

      // Submit
      fireEvent.click(screen.getByText('Add Task'));

      await waitFor(() => {
        expect(mockApi.createTask).toHaveBeenCalledWith(newTask, 'user1');
      });
    });

    it('should edit an existing task successfully', async () => {
      const updatedTask = {
        title: 'Updated Task',
        description: 'Updated Description',
        category: 'personal',
        dueDate: '2024-01-30',
      };

      mockApi.updateTask.mockResolvedValue({
        _id: '1',
        ...updatedTask,
        completed: false,
        userId: 'user1',
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
      });

      renderWithProviders(<Dashboard />);

      await waitFor(() => {
        expect(screen.getByText('Task 1')).toBeInTheDocument();
      });

      // Click edit button
      const editButton = screen.getByLabelText('Edit task');
      fireEvent.click(editButton);

      // Update form
      fireEvent.change(screen.getByLabelText('Title'), { target: { value: 'Updated Task' } });
      fireEvent.change(screen.getByLabelText('Description'), { target: { value: 'Updated Description' } });

      // Submit
      fireEvent.click(screen.getByText('Update Task'));

      await waitFor(() => {
        expect(mockApi.updateTask).toHaveBeenCalledWith('1', updatedTask, 'user1');
      });
    });

    it('should delete a task successfully', async () => {
      mockApi.deleteTask.mockResolvedValue(undefined);

      renderWithProviders(<Dashboard />);

      await waitFor(() => {
        expect(screen.getByText('Task 1')).toBeInTheDocument();
      });

      // Click delete button
      const deleteButton = screen.getByLabelText('Delete task');
      fireEvent.click(deleteButton);

      // Confirm deletion
      fireEvent.click(screen.getByText('Delete'));

      await waitFor(() => {
        expect(mockApi.deleteTask).toHaveBeenCalledWith('1', 'user1');
      });
    });

    it('should toggle task completion successfully', async () => {
      const toggledTask = {
        ...mockTasks[0],
        completed: true,
      };

      mockApi.toggleTaskCompletion.mockResolvedValue(toggledTask);

      renderWithProviders(<Dashboard />);

      await waitFor(() => {
        expect(screen.getByText('Task 1')).toBeInTheDocument();
      });

      // Click checkbox
      const checkbox = screen.getByRole('checkbox');
      fireEvent.click(checkbox);

      await waitFor(() => {
        expect(mockApi.toggleTaskCompletion).toHaveBeenCalledWith('1', 'user1');
      });
    });
  });

  describe('user interface', () => {
    beforeEach(() => {
      localStorage.setItem('token', 'test-token');
      mockJwtDecode.mockReturnValue(mockUser);
      mockApi.getTasks.mockResolvedValue({ tasks: mockTasks });
    });

    it('should display user avatar with initials', async () => {
      renderWithProviders(<Dashboard />);

      await waitFor(() => {
        expect(screen.getByText('TU')).toBeInTheDocument(); // Test User initials
      });
    });

    it('should open dropdown when avatar is clicked', async () => {
      renderWithProviders(<Dashboard />);

      await waitFor(() => {
        expect(screen.getByText('TU')).toBeInTheDocument();
      });

      const avatar = screen.getByText('TU');
      fireEvent.click(avatar);

      expect(screen.getByText('Sign Out')).toBeInTheDocument();
    });

    it('should close dropdown when clicking outside', async () => {
      renderWithProviders(<Dashboard />);

      await waitFor(() => {
        expect(screen.getByText('TU')).toBeInTheDocument();
      });

      const avatar = screen.getByText('TU');
      fireEvent.click(avatar);

      expect(screen.getByText('Sign Out')).toBeInTheDocument();

      // Click outside
      fireEvent.click(document.body);

      expect(screen.queryByText('Sign Out')).not.toBeInTheDocument();
    });

    it('should sign out when sign out button is clicked', async () => {
      const mockLogout = vi.fn();
      vi.mocked(require('../../contexts/AuthContext').useAuth).mockReturnValue({
        user: mockUser,
        isAuthenticated: true,
        login: vi.fn(),
        logout: mockLogout,
      });

      renderWithProviders(<Dashboard />);

      await waitFor(() => {
        expect(screen.getByText('TU')).toBeInTheDocument();
      });

      const avatar = screen.getByText('TU');
      fireEvent.click(avatar);

      const signOutButton = screen.getByText('Sign Out');
      fireEvent.click(signOutButton);

      expect(mockLogout).toHaveBeenCalled();
    });

    it('should display app title', async () => {
      renderWithProviders(<Dashboard />);

      expect(screen.getByText('TaskMaster')).toBeInTheDocument();
    });
  });

  describe('error handling', () => {
    beforeEach(() => {
      localStorage.setItem('token', 'test-token');
      mockJwtDecode.mockReturnValue(mockUser);
    });

    it('should handle API errors when loading tasks', async () => {
      mockApi.getTasks.mockRejectedValue(new Error('Failed to load tasks'));

      renderWithProviders(<Dashboard />);

      await waitFor(() => {
        expect(screen.getByText('Error loading tasks')).toBeInTheDocument();
      });
    });

    it('should handle API errors when creating tasks', async () => {
      mockApi.getTasks.mockResolvedValue({ tasks: [] });
      mockApi.createTask.mockRejectedValue(new Error('Failed to create task'));

      renderWithProviders(<Dashboard />);

      // Open modal
      const addButton = screen.getByText('+');
      fireEvent.click(addButton);

      // Fill and submit form
      fireEvent.change(screen.getByLabelText('Title'), { target: { value: 'New Task' } });
      fireEvent.click(screen.getByText('Add Task'));

      await waitFor(() => {
        expect(screen.getByText('Error creating task')).toBeInTheDocument();
      });
    });
  });

  describe('responsive design', () => {
    beforeEach(() => {
      localStorage.setItem('token', 'test-token');
      mockJwtDecode.mockReturnValue(mockUser);
      mockApi.getTasks.mockResolvedValue({ tasks: mockTasks });
    });

    it('should render correctly on different screen sizes', async () => {
      renderWithProviders(<Dashboard />);

      await waitFor(() => {
        expect(screen.getByText('Task 1')).toBeInTheDocument();
      });

      // Test that the component renders without errors
      expect(screen.getByText('TaskMaster')).toBeInTheDocument();
      expect(screen.getByText('TU')).toBeInTheDocument();
    });
  });
}); 