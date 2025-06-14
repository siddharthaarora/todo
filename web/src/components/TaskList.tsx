import React, { useState } from 'react';
import styled from 'styled-components';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { Task, SortOption, FilterOption } from '../types';
import TaskItem from './TaskItem';

interface TaskListProps {
  tasks: Task[];
  onEditTask: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
  onToggleComplete: (taskId: string) => void;
}

const Container = styled.div`
  background-color: ${({ theme }) => theme.colors.white};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  box-shadow: ${({ theme }) => theme.shadows.md};
  padding: ${({ theme }) => theme.spacing.lg};
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

const Title = styled.h2`
  font-size: ${({ theme }) => theme.typography.fontSize.xl};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  color: ${({ theme }) => theme.colors.gray[900]};
`;

const Controls = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.md};
`;

const Select = styled.select`
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
  border: 1px solid ${({ theme }) => theme.colors.gray[300]};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  background-color: ${({ theme }) => theme.colors.white};
  color: ${({ theme }) => theme.colors.gray[700]};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  cursor: pointer;

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
  }
`;

const TaskList: React.FC<TaskListProps> = ({
  tasks,
  onEditTask,
  onDeleteTask,
  onToggleComplete,
}) => {
  const [sortBy, setSortBy] = useState<SortOption>('priority');
  const [filterBy, setFilterBy] = useState<FilterOption>('all');

  const sortTasks = (tasks: Task[]): Task[] => {
    return [...tasks].sort((a, b) => {
      switch (sortBy) {
        case 'priority':
          return getPriorityWeight(b.priority) - getPriorityWeight(a.priority);
        case 'dueDate':
          return (a.dueDate?.getTime() ?? 0) - (b.dueDate?.getTime() ?? 0);
        case 'category':
          return (a.category ?? '').localeCompare(b.category ?? '');
        case 'createdAt':
          return b.createdAt.getTime() - a.createdAt.getTime();
        default:
          return 0;
      }
    });
  };

  const filterTasks = (tasks: Task[]): Task[] => {
    switch (filterBy) {
      case 'active':
        return tasks.filter(task => !task.completed);
      case 'completed':
        return tasks.filter(task => task.completed);
      default:
        return tasks;
    }
  };

  const getPriorityWeight = (priority: Task['priority']): number => {
    switch (priority) {
      case 'high':
        return 3;
      case 'medium':
        return 2;
      case 'low':
        return 1;
      default:
        return 0;
    }
  };

  const handleDragEnd = (result: any) => {
    if (!result.destination) return;

    const items = Array.from(tasks);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    // Here you would typically update the tasks order in your state management
  };

  const sortedAndFilteredTasks = filterTasks(sortTasks(tasks));

  return (
    <Container>
      <Header>
        <Title>Tasks</Title>
        <Controls>
          <Select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
          >
            <option value="priority">Sort by Priority</option>
            <option value="dueDate">Sort by Due Date</option>
            <option value="category">Sort by Category</option>
            <option value="createdAt">Sort by Created Date</option>
          </Select>
          <Select
            value={filterBy}
            onChange={(e) => setFilterBy(e.target.value as FilterOption)}
          >
            <option value="all">All Tasks</option>
            <option value="active">Active Tasks</option>
            <option value="completed">Completed Tasks</option>
          </Select>
        </Controls>
      </Header>

      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="tasks">
          {(provided) => (
            <div {...provided.droppableProps} ref={provided.innerRef}>
              {sortedAndFilteredTasks.map((task, index) => (
                <Draggable key={task.id} draggableId={task.id} index={index}>
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                    >
                      <TaskItem
                        task={task}
                        onEdit={() => onEditTask(task)}
                        onDelete={() => onDeleteTask(task.id)}
                        onToggleComplete={() => onToggleComplete(task.id)}
                      />
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </Container>
  );
};

export default TaskList; 