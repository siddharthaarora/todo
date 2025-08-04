import React from 'react';
import styled from 'styled-components';
import { Task } from '../services/api';

interface TaskItemProps {
  task: Task;
  onEdit: () => void;
  onDelete: () => void;
  onToggleComplete: () => void;
}

const Container = styled.div.withConfig({
  shouldForwardProp: (prop) => prop !== 'completed'
})<{ completed: boolean }>`
  display: flex;
  align-items: center;
  padding: ${({ theme }) => theme.spacing.md};
  background-color: ${({ theme }) => theme.colors.white};
  border: 1px solid ${({ theme }) => theme.colors.gray[200]};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  margin-bottom: ${({ theme }) => theme.spacing.sm};
  opacity: ${({ completed }) => (completed ? 0.6 : 1)};
  transition: all ${({ theme }) => theme.transitions.default};

  &:hover {
    box-shadow: ${({ theme }) => theme.shadows.sm};
  }
`;

const Checkbox = styled.input`
  margin-right: ${({ theme }) => theme.spacing.md};
  width: 20px;
  height: 20px;
  cursor: pointer;
`;

const Content = styled.div`
  flex: 1;
`;

const Title = styled.h3.withConfig({
  shouldForwardProp: (prop) => prop !== 'completed'
})<{ completed: boolean }>`
  font-size: ${({ theme }) => theme.typography.fontSize.base};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  color: ${({ theme, completed }) =>
    completed ? theme.colors.gray[500] : theme.colors.gray[900]};
  text-decoration: ${({ completed }) => (completed ? 'line-through' : 'none')};
  margin-bottom: ${({ theme }) => theme.spacing.xs};
`;

const Description = styled.p`
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  color: ${({ theme }) => theme.colors.gray[600]};
  margin-bottom: ${({ theme }) => theme.spacing.xs};
`;

const Meta = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.md};
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  color: ${({ theme }) => theme.colors.gray[500]};
`;

const Actions = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.sm};
  margin-left: ${({ theme }) => theme.spacing.md};
`;

const ActionButton = styled.button`
  padding: ${({ theme }) => theme.spacing.xs};
  color: ${({ theme }) => theme.colors.gray[500]};
  transition: color ${({ theme }) => theme.transitions.fast};

  &:hover {
    color: ${({ theme }) => theme.colors.primary};
  }
`;

const TaskItem: React.FC<TaskItemProps> = ({
  task,
  onEdit,
  onDelete,
  onToggleComplete,
}) => {
  const handleToggleComplete = (_e: React.ChangeEvent<HTMLInputElement>) => {
    console.log('Toggle complete clicked for task:', task._id);
    onToggleComplete();
  };

  const handleDelete = (_e: React.MouseEvent<HTMLButtonElement>) => {
    console.log('Delete clicked for task:', task._id);
    onDelete();
  };

  return (
    <Container completed={task.completed}>
      <Checkbox
        type="checkbox"
        checked={task.completed}
        onChange={handleToggleComplete}
      />
      <Content>
        <Title completed={task.completed}>{task.title}</Title>
        {task.description && (
          <Description>{task.description}</Description>
        )}
        <Meta>
          {task.dueDate && (
            <span>Due: {new Date(task.dueDate).toLocaleDateString()}</span>
          )}
          {task.category && <span>Category: {task.category}</span>}
        </Meta>
      </Content>
      <Actions>
        <ActionButton onClick={onEdit} aria-label="Edit task">
          ✏️
        </ActionButton>
        <ActionButton onClick={handleDelete} aria-label="Delete task">
          🗑️
        </ActionButton>
      </Actions>
    </Container>
  );
};

export default TaskItem; 