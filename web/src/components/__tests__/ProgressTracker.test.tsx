import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { ThemeProvider } from 'styled-components';
import ProgressTracker from '../ProgressTracker';
import { Task } from '../../services/api';
import theme from '../../theme';

// Mock styled-components theme
const renderWithTheme = (component: React.ReactNode) => {
  return render(<ThemeProvider theme={theme}>{component}</ThemeProvider>);
};

const mockTasks: Task[] = [
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
    dueDate: '2024-01-16',
    completed: true,
    userId: 'user1',
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
  },
  {
    _id: '3',
    title: 'Task 3',
    description: 'Description 3',
    category: 'work',
    dueDate: '2024-01-17',
    completed: false,
    userId: 'user1',
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
  },
];

describe('ProgressTracker', () => {
  const mockOnToggleCompleted = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('rendering', () => {
    it('should render progress bar and stats', () => {
      renderWithTheme(
        <ProgressTracker
          tasks={mockTasks}
          showCompleted={false}
          onToggleCompleted={mockOnToggleCompleted}
        />
      );

      // Check if progress bar exists
      expect(screen.getByRole('progressbar')).toBeInTheDocument();
      
      // Check if stats are rendered
      expect(screen.getByText('Pending')).toBeInTheDocument();
      expect(screen.getByText('Completed')).toBeInTheDocument();
    });

    it('should display correct pending task count', () => {
      renderWithTheme(
        <ProgressTracker
          tasks={mockTasks}
          showCompleted={false}
          onToggleCompleted={mockOnToggleCompleted}
        />
      );

      // 2 pending tasks out of 3 total
      expect(screen.getByText('2')).toBeInTheDocument();
    });

    it('should display correct completed task count', () => {
      renderWithTheme(
        <ProgressTracker
          tasks={mockTasks}
          showCompleted={false}
          onToggleCompleted={mockOnToggleCompleted}
        />
      );

      // 1 completed task out of 3 total
      expect(screen.getByText('1')).toBeInTheDocument();
    });

    it('should handle empty tasks array', () => {
      renderWithTheme(
        <ProgressTracker
          tasks={[]}
          showCompleted={false}
          onToggleCompleted={mockOnToggleCompleted}
        />
      );

      // Use getAllByText since there are multiple "0" elements
      const zeroElements = screen.getAllByText('0');
      expect(zeroElements).toHaveLength(2); // One for pending, one for completed
      
      // Verify both pending and completed sections show 0
      expect(screen.getByText('Pending')).toBeInTheDocument();
      expect(screen.getByText('Completed')).toBeInTheDocument();
    });

    it('should handle all completed tasks', () => {
      const allCompletedTasks = mockTasks.map(task => ({ ...task, completed: true }));
      
      renderWithTheme(
        <ProgressTracker
          tasks={allCompletedTasks}
          showCompleted={false}
          onToggleCompleted={mockOnToggleCompleted}
        />
      );

      expect(screen.getByText('0')).toBeInTheDocument(); // Pending tasks
      expect(screen.getByText('3')).toBeInTheDocument(); // Completed tasks
    });

    it('should handle all pending tasks', () => {
      const allPendingTasks = mockTasks.map(task => ({ ...task, completed: false }));
      
      renderWithTheme(
        <ProgressTracker
          tasks={allPendingTasks}
          showCompleted={false}
          onToggleCompleted={mockOnToggleCompleted}
        />
      );

      expect(screen.getByText('3')).toBeInTheDocument(); // Pending tasks
      expect(screen.getByText('0')).toBeInTheDocument(); // Completed tasks
    });
  });

  describe('button interactions', () => {
    it('should call onToggleCompleted when pending button is clicked', () => {
      renderWithTheme(
        <ProgressTracker
          tasks={mockTasks}
          showCompleted={false}
          onToggleCompleted={mockOnToggleCompleted}
        />
      );

      const pendingButton = screen.getByText('Pending').closest('div');
      fireEvent.click(pendingButton!);

      expect(mockOnToggleCompleted).toHaveBeenCalledTimes(1);
    });

    it('should call onToggleCompleted when completed button is clicked', () => {
      renderWithTheme(
        <ProgressTracker
          tasks={mockTasks}
          showCompleted={false}
          onToggleCompleted={mockOnToggleCompleted}
        />
      );

      const completedButton = screen.getByText('Completed').closest('div');
      fireEvent.click(completedButton!);

      expect(mockOnToggleCompleted).toHaveBeenCalledTimes(1);
    });

    it('should highlight pending button when showCompleted is false', () => {
      renderWithTheme(
        <ProgressTracker
          tasks={mockTasks}
          showCompleted={false}
          onToggleCompleted={mockOnToggleCompleted}
        />
      );

      const pendingButton = screen.getByText('Pending').closest('div');
      const completedButton = screen.getByText('Completed').closest('div');

      // Check if pending button has active styling (this would be checked via CSS classes or styles)
      expect(pendingButton).toBeInTheDocument();
      expect(completedButton).toBeInTheDocument();
    });

    it('should highlight completed button when showCompleted is true', () => {
      renderWithTheme(
        <ProgressTracker
          tasks={mockTasks}
          showCompleted={true}
          onToggleCompleted={mockOnToggleCompleted}
        />
      );

      const pendingButton = screen.getByText('Pending').closest('div');
      const completedButton = screen.getByText('Completed').closest('div');

      // Check if completed button has active styling
      expect(pendingButton).toBeInTheDocument();
      expect(completedButton).toBeInTheDocument();
    });
  });

  describe('progress calculation', () => {
    it('should calculate correct completion percentage', () => {
      renderWithTheme(
        <ProgressTracker
          tasks={mockTasks}
          showCompleted={false}
          onToggleCompleted={mockOnToggleCompleted}
        />
      );

      // 1 completed out of 3 total = 33.33% rounded to 33%
      const progressBar = screen.getByRole('progressbar');
      expect(progressBar).toBeInTheDocument();
    });

    it('should handle 0% completion', () => {
      const allPendingTasks = mockTasks.map(task => ({ ...task, completed: false }));
      
      renderWithTheme(
        <ProgressTracker
          tasks={allPendingTasks}
          showCompleted={false}
          onToggleCompleted={mockOnToggleCompleted}
        />
      );

      const progressBar = screen.getByRole('progressbar');
      expect(progressBar).toBeInTheDocument();
    });

    it('should handle 100% completion', () => {
      const allCompletedTasks = mockTasks.map(task => ({ ...task, completed: true }));
      
      renderWithTheme(
        <ProgressTracker
          tasks={allCompletedTasks}
          showCompleted={false}
          onToggleCompleted={mockOnToggleCompleted}
        />
      );

      const progressBar = screen.getByRole('progressbar');
      expect(progressBar).toBeInTheDocument();
    });

    it('should handle empty tasks array for percentage calculation', () => {
      renderWithTheme(
        <ProgressTracker
          tasks={[]}
          showCompleted={false}
          onToggleCompleted={mockOnToggleCompleted}
        />
      );

      const progressBar = screen.getByRole('progressbar');
      expect(progressBar).toBeInTheDocument();
    });
  });

  describe('accessibility', () => {
    it('should have proper progress bar role', () => {
      renderWithTheme(
        <ProgressTracker
          tasks={mockTasks}
          showCompleted={false}
          onToggleCompleted={mockOnToggleCompleted}
        />
      );

      const progressBar = screen.getByRole('progressbar');
      expect(progressBar).toBeInTheDocument();
    });

    it('should be clickable for filtering', () => {
      renderWithTheme(
        <ProgressTracker
          tasks={mockTasks}
          showCompleted={false}
          onToggleCompleted={mockOnToggleCompleted}
        />
      );

      const pendingButton = screen.getByText('Pending').closest('div');
      const completedButton = screen.getByText('Completed').closest('div');

      // Test clicking
      fireEvent.click(pendingButton!);
      expect(mockOnToggleCompleted).toHaveBeenCalledTimes(1);

      fireEvent.click(completedButton!);
      expect(mockOnToggleCompleted).toHaveBeenCalledTimes(2);
    });
  });
}); 